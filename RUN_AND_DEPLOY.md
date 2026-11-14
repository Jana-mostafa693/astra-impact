# Run and deploy TerraTwin

## Prerequisites and setup

Use Node22, pnpm10.18.0 (via Corepack), and Python3.12. Unzip the full-stack project and open its root directory. The required scientific JSON, chart files and source tables are included; do not run acquisition scripts or replace missing scientific values.

```bash
bash scripts/setup.sh
source .venv/bin/activate
```

The script installs the pinned frontend dependencies and backend requirements in a local Python environment. Review `.env.example`; no API key, database or external scientific download is required. Never commit your `.env`.

## Development

```bash
bash scripts/start_dev.sh
```

Open `http://localhost:3000`. The Vite frontend proxies `/api` to FastAPI on8000. Stop withCtrl-C. The final delivered Preview differs: it runs the compiled frontend and backend together through FastAPI, not Vite.

## Single-origin production

```bash
pnpm --dir frontend build
bash scripts/start_production.sh
```

The production launcher uses `PORT` (default3000) and serves both built assets and `/api` from FastAPI. Open `/`, `/explore`, `/compare`, `/test-planner` or `/about`. API docs are at `/docs`; `/api/health` and `/api/ready` are unauthenticated health endpoints. `data/` must remain alongside `backend/` and `frontend/`.

For a manual launch with an already configured Python interpreter:

```bash
PYTHONPATH=backend python3 -m uvicorn app.main:app --host 0.0.0.0 --port 3000
```

Unknown pages, missing assets, API typos and private source-file paths deliberately return404. Same-origin production needs no browser-side external API URL. For intentionally split hosting, set a browser-safe `VITE_API_BASE_URL` before building and configure backend `ALLOWED_ORIGINS` with the exact HTTPS frontend origin; no wildcard credentials are required.

## Verify the build

```bash
pnpm --dir frontend check
pnpm --dir frontend test
pnpm --dir frontend build
PYTHONPATH=backend python3 -m pytest backend/tests -q
```

The final executed run passed63frontendtests and79backendtests. Complete logs are in `validation/final/`. The large-bundle and Starlette deprecation warnings are non-blocking, not application browser errors.

## Docker deployment

```bash
docker build -t terratwin .
docker run --rm -p 3000:3000 -e PORT=3000 terratwin
```

The multi-stage Dockerfile installs pinned Node dependencies, builds React, installs the Python requirements, copies immutable runtime data and serves the app on0.0.0.0. A local Docker image build was not executed in this sandbox; do not describe it as tested. The exact non-container production entry point and compiled assets were executed and verified.

Configure your host's health probe to `/api/health` and verify `/api/ready`, all five page URLs, JavaScript/image assets, API counts and real chart/recommendation flows after deployment. Use HTTPS for exposed hosting and avoid headers that forbid the authorized embedded Preview. The app is read-only and requires no database, writable persistent volume or scientific credentials.

## Manus hosting and visibility

The existing project has the frontend build declaration, FastAPI Docker deployment declaration and API-first hybrid routes prepared. Save the intended version to the canonical main branch before using Publish. A saved version and functioning Preview do not establish publication success. One-time private-publication authorization was requested and remains pending; public visibility has not been requested or enabled.

After authorized publication, use the actual successful result URL and verify its HTML/assets/API. Keep `/api/*` routed to the server before the static SPA catch-all. Do not infer success from a pending build or a local screenshot. Keep the private deployment private unless the user separately approves public visibility.

## Quick demonstration

Home shows real coverage and the Earth globe. Explore switches among actual registered bodies/sites and exposes charts/provenance. Compare requires a planetary target and Earth candidate; choose Orientale and Vredefort to see the preserved normalized profile experiment. Test Planner changes target/purpose, exposes real recommendation reasons and retains six explicit operational gaps. About exposes the source catalog, coverage and scientific limitation register.
