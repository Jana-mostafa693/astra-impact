# Astra Impact GitHub-ready source delivery

## Status and identity

**Upload is NOT complete.** No authorized GitHub owner/account or ready transfer target was returned in this session, and GitHub CLI is unauthenticated. The platform project remains on its Manus-managed repository. There is no verified GitHub URL, repository visibility, existing-repository inspection, default branch or remote commit to report. No repository was overwritten, force-pushed or made public.

Intended slug: `astra-impact`. Intended display name: **Astra Impact**. Requested description: “TerraTwin — An interactive Earth, Moon, and Mars planetary analog exploration platform powered by scientific datasets, 3D visualization, and evidence-based environmental comparisons.” A public repository needs explicit visibility approval after selecting the correct owner; otherwise use private visibility.

## Version

This export uses the current working project, based on the latest `TerraTwin_Text_Presentation_Only.zip` plus the user's later Header-only rename to ASTRA IMPACT. Header source: `frontend/src/App.tsx`, line112. All other application source, backend, data, interactions and assets remain unchanged. The necessary regenerated frontend bundle reflects that one visible Header change. The Home title and internal TerraTwin names deliberately remain untouched.

Documentation and ignore patterns in this delivery were adjusted only for correct archive/clone instructions and to omit local logs/caches; the running project was not refactored or reorganized. Relative runtime paths and all five pages are preserved.

## Executed checks

Frontend locked dependency install passed, TypeScript checking passed,69 frontend tests passed, and production build passed. A new isolated Python virtual environment installed all pinned backend requirements successfully;79 backend tests passed. That environment successfully started FastAPI independently. Health/readiness passed;17sites (14Earth/2Moon/1Mars),104series endpoints,420comparisonrows and210recommendationrows were checked. Allfiveproductionpage routes returned200. Browser navigation and existing Earth/Moon/Mars local texture URLs passed. Coordinate, null handling, model/brightness classes, exact crater-profile scores and no-invented-percentage checks are covered by the executed existing tests.

Warnings retained honestly: Vite reports a large bundle; pytest reports the existing dependency warning. No Docker build, hosted deployment, physical-device compatibility or universal redistribution certification is claimed. No source modification was made to address these warnings.

The clean exported folder was also verified using its own setup script, locked dependencies, TypeScript check,69frontendtests,79backendtests and production build; excluded logs are not needed to run these checks.

## Included and excluded

The package contains the complete React/TypeScript/Three.js frontend, compiled production frontend, pinned frontend lockfile, FastAPI/Pydantic backend and tests, all runtime website JSON,104chartseries, catalogs, scientific reports, compact crater-profile CSV, body coordinate metadata, source references, real quality flags, local textures/images, allfivepages, startup scripts, Dockerfile, environment placeholders and documentation.

Only source-test fixtures and asset/input preservation evidence are retained under `validation/`. `original_frontend/frontend.txt` and the pre-formatting component fixture are retained because tests require them; they are not alternate runnable backup projects. Historical raw browser/terminal/build logs, caches, virtual environments, node_modules, actual env files, duplicate ZIPs, redundant extracted imports and non-runtime historical packaging helpers are omitted. See `EXCLUDED_FILES.csv`. Original NASA raw archives are not included because the backend does not need them. Do not delete required runtime data to reduce size.

## Rights and attribution

Existing `ASSET_ATTRIBUTION.md`, product/source catalogs and scientific reports are retained. NASA/USGS-derived data, modeled/reanalysis inputs and third-party imagery are not assigned a blanket new license here. The decorative Mars map has Solar System Scope/CCBY4.0 attribution; Earth/Moon imagery comes from the original Three.js example sources. Public redistribution should retain all provider attribution and review source-specific terms (including Open-Meteo and other derived products). No new MIT/license claim is applied to the entire scientific dataset. See `REDISTRIBUTION_REVIEW.md` for the21runtimecataloglicensegaps and per-image review requirements. Scientific meanings, model/observation distinctions and missing-data limits remain intact.

## Clone, install, run and test

Once the authorized repository exists, use its actual URL—not an invented owner placeholder:

```bash
git clone <ACTUAL_AUTHORIZED_GITHUB_REPOSITORY_URL>
cd astra-impact
npm install -g pnpm@10.18.0
bash scripts/setup.sh
bash scripts/start_dev.sh
```

Open http://localhost:3000. For tests and production:

```bash
source .venv/bin/activate
PYTHONPATH=backend python -m pytest backend/tests -q
pnpm --dir frontend check
pnpm --dir frontend test
pnpm --dir frontend build
PORT=3000 bash scripts/start_production.sh
```

Existing `RUN_AND_DEPLOY.md`, `API_DOCUMENTATION.md`, `.env.example` and `Dockerfile` cover single-origin production serving and optional CORS/remote API settings. No API key/database/NASA download is needed to run the bundled app.

## Required action to finish upload

Connect/authorize the correct GitHub owner through the project's GitHub integration and select `astra-impact`. If the slug already exists, inspect it first and preserve its branches/history; do not force-push. Approve public visibility separately if needed. Then push this verified current source and confirm the actual remote files/branch/commit. GitHub source delivery does not start a hosted FastAPI backend; deployment is a separate action.
