# Astra Impact — TerraTwin planetary analog explorer

## Final five-page delivery

Current version: Home `/`, Explore `/explore`, Compare `/compare`, Test Planner `/test-planner`, About `/about`. Final executed results are69frontend/79backendtests plus TypeScript and the production build. See `FINAL_QUALITY_REPORT.md`, `TEST_RESULTS.md`, `RUN_AND_DEPLOY.md` and `screenshots/final/`. The application was verified with compiled React and FastAPI served together; actual private publication and exact user-reference-image comparison remain pending. Earlier integration/correction counts below are historical, not the final test run.

## Latest correction delivery

The in-place TerraTwin correction is documented in `CORRECTION_REPORT.md`. It retains the original design and real science while correcting world-texture transitions, pin horizon/tip/focus, filter synchronization, stale async records, and registry-color consistency. The corrected build passes 53 frontend and 69 backend tests. Actual screenshots are in `screenshots/`. Exact comparison against the requested user design images is blocked because those images have not been supplied; no exact-reference-match claim is made.

A working React/TypeScript/Three.js frontend, preserving the supplied original globe and visual components, connected to a read-only FastAPI/Pydantic backend over the validated MASTER data. Runtime coverage: **17 sites (14 Earth / 2 Moon / 1 Mars), 104 chart files, 420 current category comparisons and 210 purpose-specific recommendation rows**. No arbitrary similarity percentages or fictional scientific fallback values are used.

## Start locally

Use Python3.12 and Node22 (Node20.19+ also meets the frontend tool requirements). Install the pinned package manager once:

```bash
npm install -g pnpm@10.18.0
```

Clone the authorized `astra-impact` repository, or extract `Astra_Impact_GitHub_Ready.zip`, and enter its `astra-impact` directory:

```bash
bash scripts/setup.sh
bash scripts/start_dev.sh
```

Open **http://localhost:3000**. The launcher starts FastAPI at **http://127.0.0.1:8000** and Vite on3000, proxying `/api` to the backend. OpenAPI docs are at **http://127.0.0.1:8000/docs**. No database, API keys, NASA login or further scientific download is required. The setup script creates `.venv` and installs pinned Python dependencies plus the locked frontend dependencies.

Alternatively run separate terminals from the project root:

```bash
# Terminal1
PYTHONPATH=backend .venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
# Terminal2
pnpm --dir frontend dev
```

`.env.example` documents optional settings; it is not automatically loaded. For a separately hosted API, put `VITE_API_BASE_URL=https://your-api.example/api` in `frontend/.env.local` and rebuild. Set `ALLOWED_ORIGINS` in the backend process environment to a comma-separated allowlist for the real frontend origins. Same-origin development and production need no custom CORS setup.

## Production, one origin

The ZIP includes a compiled `frontend/dist`; rebuild it after code changes:

```bash
pnpm --dir frontend build
PORT=3000 bash scripts/start_production.sh
```

FastAPI serves the built root page/assets and `/api` on the same origin. Missing assets and unknown API/traversal routes return404, not success-page HTML. Production defaults to localhost for safety; use `HOST=0.0.0.0` only when intentionally exposing it. Supply HTTPS/reverse-proxy configuration appropriate to your deployment host.

A Docker deployment definition is prepared:

```bash
docker build -t planetary-analog .
docker run --rm -p 3000:3000 -e PORT=3000 planetary-analog
```

The image compiles React, installs Python dependencies, copies authoritative runtime JSON/reports/catalogs, and runs FastAPI on `PORT`. Its health endpoint is `/api/health`. **The Docker image build and public deployment were not executed in this task**; local Python production serving and frontend production compilation were tested. Manus build/deploy and API-first hybrid routing are configured; publication remains user-controlled. Use the project's Preview to inspect the running integration.

## Test

```bash
PYTHONPATH=backend .venv/bin/python -m pytest backend/tests -q
pnpm --dir frontend check
pnpm --dir frontend test
pnpm --dir frontend build
```

The latest repository-preparation results are in `GITHUB_DELIVERY.md`. Earlier `TEST_RESULTS.md` is retained as historical evidence; local console/build logs are excluded from this source delivery. Tests verify active IDs/counts, real values/provenance, all104 series references, body coordinates, missing values, unchanged experiment scores, original class/motion constants, CORS, errors, path safety, date/rank filtering and production assets. Browser evidence includes real selections, controls, charts, comparison/finder actions and a390pxCSS viewport. A complete-original visual baseline cannot exist from the truncated upload.

## Short judge demo

Start with Hellas: rotate/zoom/pause the globe and inspect MOLA terrain beside clearly modeled MCD temperature and pressure. Change the chart to seasonal/local-time and vertical slices; show that TES thermal inertia is not temperature. Switch to the Moon and select Mons Mouton to show its unverified landing-polygon boundary and Diviner brightness-temperature qualifier. Switch to Earth and select Vredefort to show air climate, mapped soil/geology, sources and QA.

Open **Compare Locations**, explicitly choose Orientale and Vredefort, and show the existing normalized crater profiles and experiment-only RMSE; do not claim an overall match. Open **Earth Analog Finder**, choose a purpose, inspect the actual tier/reason/limits, then open an Earth record or compare the selected pair. Finish in **Scientific Evidence** with the proposed-site, partial-MODIS, model, source-resolution and accessible-ice limitations.

## Project organization

`frontend/src/components` contains the retained globe/UI/card components and data-driven workflows; `services`, `hooks`, `types` and `charts` isolate API handling, typed adapters and scientific chart logic. `backend/app` contains the application, router, repository, services, validation models and response sanitizer. `data` holds all actual website JSON/series, source catalogs and scientific registers outside public assets. `frontend/public` contains only presentation images and the page-route manifest. `scripts` provides setup/dev/production launchers. `original_frontend` preserves the exact upload. `validation` and the six requested reports document what was executed and what remains limited.

See `INTEGRATION_REPORT.md`, `FRONTEND_DATA_REPLACEMENT_AUDIT.md`, `API_DOCUMENTATION.md`, `SCIENTIFIC_DATA_MAPPING.md`, `TEST_RESULTS.md`, `KNOWN_LIMITATIONS.md` and `ASSET_ATTRIBUTION.md`. Current package member checksums are supplied in `REPOSITORY_INVENTORY.csv` and `REPOSITORY_MANIFEST.json`.

## Repository-preparation status

The visible Header is **ASTRA IMPACT**; the Home title and internal names remain TerraTwin as explicitly requested. Only the previously approved missing-variable chip labels and the Header wordmark differ from the earlier final ZIP. No new scientific values, UI change, refactor or runtime-file relocation was performed. See `GITHUB_DELIVERY.md` for current execution results, licensing caveats, exclusions and upload status. Pushing source to GitHub does not deploy FastAPI.
