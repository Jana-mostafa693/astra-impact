# Planetary Analog API

## Final five-page delivery

Current version: Home `/`, Explore `/explore`, Compare `/compare`, Test Planner `/test-planner`, About `/about`. Final executed results are63frontend/79backendtests plus TypeScript and the production build. See `FINAL_QUALITY_REPORT.md`, `TEST_RESULTS.md`, `RUN_AND_DEPLOY.md` and `screenshots/final/`. The current Preview runs compiled React and FastAPI together; actual private publication and exact user-reference-image comparison remain pending. Earlier integration/correction counts below are historical, not the final test run.

Read-only FastAPI service over the validated, file-backed master dataset. Start it with `scripts/start_backend.sh` (default `PORT=8000`) or `PYTHONPATH=backend python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000`. Interactive OpenAPI documentation is available at `/docs`; the machine-readable contract is `/openapi.json`.

## Envelope contract

Every successful endpoint returns `{ "data": ... }`; paginated arrays additionally return `{ "meta": { "total", "limit", "offset" } }`. A single resource is `{ "data": object }`. Errors are JSON `{ "error": string, "detail": string }` without tracebacks or local paths. Typed `null` values are preserved; no null is converted to zero. Public responses recursively redact credential-like values and local filesystem paths.

## Endpoints

- `GET /api/health`, `/api/ready`, `/api/summary`, `/api/worlds`
- `GET /api/sites` with `body`, `status`, `research_purpose`, `available_variable`, `quality_status`, `search`, `limit<=500`, `offset`, `sort`; `GET /api/sites/{site_id}`
- Frontend-compatible aliases are also available at `GET /api/sites/{site_id}/measurements`, `/quality`, `/timeseries`, and `/timeseries/{series_type}`. They use the same envelopes and filters; the nested series resource is the object containing `records` after the client unwraps `data`.
- `GET /api/measurements` with `source_id`, `data_class`, `variable`, `limit`, `offset`
- `GET /api/quality` with pagination
- `GET /api/timeseries` returns the allowlisted series index
- `GET /api/timeseries/{series_type}` requires `site_id`; supports `limit` (default 500, max 5000), `offset`, `date_from`, `date_to`, `year`, `month`, `ls`, `localtime`, `height`, `profile_scope`, and comma-separated `variables`. The resource payload contains `records`, `kind`, `source`, `units`, `field_metadata`, and related source metadata.
- `GET /api/comparisons` with `earth_site_id`, `planetary_site_id`, `category`, pagination
- `GET /api/recommendations` with `earth_site_id`, `planetary_site_id`, `research_purpose`, `evidence_tier`, `sort=rank|-rank`, pagination. Rank sorting is documented nulls-last.
- `GET /api/sources` with `body`, `source_id`, `data_class`, pagination
- `GET /api/coverage`, `/api/limitations` (including `data.markdown`), `/api/earth/geojson`, `/api/planetary-regions?body=Moon|Mars`
- `GET /api/research-purposes`, `/api/comparison-categories`, `/api/crater-profile-scores`

Series filenames are resolved only from the validated startup allowlist under `data/website_timeseries`; unknown kinds and traversal attempts cannot select arbitrary files. The dataset contains 104 separate precomputed series files. There is intentionally no bulk entire-hourly-dataset endpoint; clients should use the precomputed index and selected series defaults.

Earth GeoJSON is the only map output and uses EPSG:4326. Moon and Mars retain body-specific planetocentric coordinates and are never presented as Earth GeoJSON. Summary/limitations explicitly retain scientific flags and do not expose an overall similarity percentage. MCD values are modeled scenario values, not overall percentages or observations.

CORS defaults to `http://localhost:3000`, `http://127.0.0.1:3000`, `http://localhost:5173`, and `http://127.0.0.1:5173`; override with comma-separated `ALLOWED_ORIGINS` (wildcard is not used).

## Preserved terrain-profile chart

`GET /api/crater-profiles?earth_site_id=EARTH-VREDEFORT&planetary_site_id=MOON-ORIENTALE` returns `{data:{records:[{r_over_R,earth_normalized_shape,planetary_normalized_shape}],source_id,data_class,unit,axis_unit,status,limitations}}`. The existing15normalizedCSVbins are pivoted for presentation only; normalization and RMSE are not recomputed. Unsupported pairs return emptyrecords and `DATA_UNAVAILABLE`. UnknownactiveIDsreturn404. This is a prior experiment, not an engineering-safety/elevation map.

Final coverage/summary counts are loaded from the saved validation/data, not illustrative responses. Invalidsite-sortfieldsreturn422; ranksortingpreservesnulls-lastinbothdirections. Monthlydatefiltersderiveactualyear/monthdateswhennoexplicitdatefieldexists. Productionservesonlyknownassetsandtherootfrontend; unknown/traversalpaths/missingassetsreturn404.
