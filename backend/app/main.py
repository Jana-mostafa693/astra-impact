from __future__ import annotations

import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from .router import router
from .repository import DataValidationError

app = FastAPI(title="Planetary Analog API", version="1.0.0", description="Read-only API over the validated Planetary Analog master dataset.")
origins = [x.strip() for x in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173").split(",") if x.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=False, allow_methods=["GET", "OPTIONS"], allow_headers=["*"])
app.include_router(router)

@app.exception_handler(RequestValidationError)
async def validation_error(_: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"error": "validation_error", "detail": "Request parameters failed validation."})

@app.exception_handler(Exception)
async def generic_error(_: Request, __: Exception):
    return JSONResponse(status_code=500, content={"error": "internal_error", "detail": "The request could not be completed."})

# Optional production serving: API remains authoritative; absent assets are never SPA-fallback HTML.
DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"
if DIST.is_dir():
    @app.get("/{asset_path:path}", include_in_schema=False)
    async def frontend(asset_path: str):
        candidate = (DIST / asset_path).resolve()
        if candidate.is_file() and candidate.is_relative_to(DIST.resolve()):
            return FileResponse(candidate)
        index = DIST / "index.html"
        if index.is_file() and asset_path in {'', 'explore', 'compare', 'test-planner', 'about'}:
            return FileResponse(index)
        return JSONResponse(status_code=404, content={"error": "not_found", "detail": "Resource not found."})
else:
    @app.get("/", include_in_schema=False)
    async def root_without_frontend():
        return {"data": {"service": "planetary-analog-api", "status": "ok", "docs": "/docs"}}

@app.exception_handler(404)
async def not_found(_: Request, __):
    return JSONResponse(status_code=404, content={"error": "not_found", "detail": "Resource not found."})
