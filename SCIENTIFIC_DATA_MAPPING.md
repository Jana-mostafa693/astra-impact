# Scientific data-to-interface mapping

## Final five-page delivery

Current version: Home `/`, Explore `/explore`, Compare `/compare`, Test Planner `/test-planner`, About `/about`. Final executed results are63frontend/79backendtests plus TypeScript and the production build. See `FINAL_QUALITY_REPORT.md`, `TEST_RESULTS.md`, `RUN_AND_DEPLOY.md` and `screenshots/final/`. The current Preview runs compiled React and FastAPI together; actual private publication and exact user-reference-image comparison remain pending. Earlier integration/correction counts below are historical, not the final test run.

## Registry and location identity

`data/website_json/website_sites.json` defines all17 activeIDs, statuses, body coordinates, EarthGeoJSON and planetary references. `/api/sites` and `/api/sites/{site_id}` power globe pins, world selection, filters and site panels. Earth uses WGS84; Moon and Mars retain their own coordinate reference text, body radius and east-longitude convention. The raw geospatial reference strings are not rewritten into Earth EPSG codes.

## Earth site values

`website_earth_details.json` supplies `site_level_values` and `environmental_measurements`. The original temperature position uses `climate__air_temperature_mean_c` in °C. Pressure uses `climate__surface_pressure_mean_hpa` in hPa. Slope uses `slope_mean_deg`; elevation uses `elevation_m`. Mapped rock type uses `mapped_rock_type`, while regional classification and `geological_unit` remain qualitative context. All soil fractions, pH, depth, land cover, NDVI, terrain and solar fields remain accessible in the evidence ledger. Source class, QA and footprint metadata accompany these records.

`/api/sites/{id}/timeseries/{kind}` serves the saved `monthly_climate`, `annual_climate`, `climatology_months`, `power_monthly`, `modis_8day`, `solar_monthly` and `soil_depth_profiles` documents. Chart axes use actual year/month/composite-start/depth fields, not inferred satellite observations. Air and MODIS land-surface fields remain separate. Nulls remain gaps; no interpolation fills missing satellite dates.

## Lunar site values

`website_moon_details.json` powers Orientale and Mons Mouton. The original temperature position displays `surface_temperature_min_k` through `surface_temperature_max_k` as a sampled Diviner bolometric **brightness-temperature** range in K. `diviner_local_time` charts use only qualified spectral/bolometric brightness fields, excluding raw negative-channel artifacts. Lunar atmospheric pressure and unmeasured exact-point composition remain unavailable.

LOLA terrain, geological context, lunar elemental/hydrogen estimates, PSR indicator, illumination and regolith missingness are retained in the ledger with source classes and spatial support. Regional elemental/hydrogen inversions are not presented as direct mineral/accessible-ice confirmation. Mons Mouton remains a feature point with landing-polygon boundary verification unresolved.

## Martian site values

`website_mars_details.json` powers Hellas. Elevation/slope are preserved MOLA patch values; sampled modeled surface-temperature bounds use `mcd__surface_temperature_sampled_model_min_k/max_k`, and modeled surface pressure uses `mcd__surface_pressure_sampled_model_min_pa/max_pa`. These are MCD6.2 model states, not observed weather. The unrelated unavailable observational `surface_temperature_*` fields are not backfilled with model values.

`tes_inertia` charts show thermal inertia in its original Jm^-2K^-1s^-1/2 units, not temperature or grain size. `mcd_seasonal` charts require a fixed Ls or local-time slice. `mcd_seasonal_summary` uses Ls with summary-over-local-time fields. `mcd_vertical_and_10m` isolates the35 height profiles atLs180 and a selected local time; it does not connect seasonal10m rows with vertical states. Solar longitude is not an Earth calendar date. One model scenario and source quality classes remain visible.

## Comparisons and recommendations

`website_comparisons.json` contains420 current category rows. `/api/comparisons?earth_site_id=…&planetary_site_id=…` supplies selected-pair definitions, source types, units, spatial/temporal support, validity and missingness. Qualitative or incompatible categories do not become numeric similarity scores.

`/api/crater-profile-scores` exposes the six exact `shape_rmse` values already in that file. `/api/crater-profiles` pivots the preserved `data/catalogs/retained_crater_profiles.csv` into15paired plot bins only; it does not recompute normalization, terrain or RMSE. Its legacy source identifiers have explicit stable-ID mapping for Vredefort, Sudbury, Manicouagan, Orientale and Hellas. Other pairs return no curve and `DATA_UNAVAILABLE`. This is a prior basin-scale experiment, not a local landing-terrain analysis.

`website_analog_recommendations.json` supplies210 purpose-specific evidence rows and supported research-purpose labels. `/api/recommendations` and `/api/research-purposes` power finder filters, documented ranks where present, reason/limitations and valid record actions. Neither probability nor overall percentage is inferred. Starting from an Earth site does not create a planetary match.

## Source and QA disclosure

`data/catalogs/planetary_source_catalog.csv` supplies the39catalog entries via `/api/sources`. `/api/coverage` loads the saved final-validation coverage instead of an illustrative response. `/api/limitations` exposes the preserved scientific register. `ScientificEvidence` shows every measurement's sourceID, class, unit, spatial support, QA and unavailable status; HTTP(S) sources become links, file-only provenance remains text. Public-path sanitization is a response-only security measure. Source data bytes remain unchanged.
