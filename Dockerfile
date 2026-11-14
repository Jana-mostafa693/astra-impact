FROM node:22-bookworm-slim AS frontend-build
WORKDIR /build/frontend
RUN corepack enable && corepack prepare pnpm@10.18.0 --activate
COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend/ ./
RUN pnpm build

FROM python:3.12-slim
WORKDIR /app
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt
COPY backend/ ./backend/
COPY data/ ./data/
COPY --from=frontend-build /build/frontend/dist ./frontend/dist
ENV PYTHONPATH=/app/backend
ENV PORT=3000
EXPOSE 3000
CMD ["sh", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-3000}"]
