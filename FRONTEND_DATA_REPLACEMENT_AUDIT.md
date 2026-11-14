# Frontend data replacement audit

## Final five-page delivery

Current version: Home `/`, Explore `/explore`, Compare `/compare`, Test Planner `/test-planner`, About `/about`. Final executed results are63frontend/79backendtests plus TypeScript and the production build. See `FINAL_QUALITY_REPORT.md`, `TEST_RESULTS.md`, `RUN_AND_DEPLOY.md` and `screenshots/final/`. The current Preview runs compiled React and FastAPI together; actual private publication and exact user-reference-image comparison remain pending. Earlier integration/correction counts below are historical, not the final test run.

## Latest correction delivery

The in-place TerraTwin correction is documented in `CORRECTION_REPORT.md`. It retains the original design and real science while correcting world-texture transitions, pin horizon/tip/focus, filter synchronization, stale async records, and registry-color consistency. The corrected build passes 53 frontend and 69 backend tests. Actual screenshots are in `screenshots/`. Exact comparison against the requested user design images is blocked because those images have not been supplied; no exact-reference-match claim is made.

The original uploaded ZIP and `original_frontend/frontend.txt` are preserved; original checksums are in `validation/original_upload_hashes.json`. The original source ends at line1,613 mid-Earth-card JSX and cannot compile by itself. Scientific demonstration data remain only in that explicitly labeled original audit snapshot and requirements, never in the active UI.

## Removed demonstration science

The original Jezero, Arcadia, Elysium, Gale, Valles Marineris, Shackleton, Tranquillitatis, Malapert, Aristarchus, Tycho, Meteor Crater, Sahara, Lanzarote, incorrectly located HI-SEAS and other demo entries are not active dataset records. Exact active IDs come from `data/website_json/website_sites.json`; no demo ID survives active components.

Original `safetyStatus` categories such as `Optimal Safe Zone`, `High Hazard / Steep` and `Prime Earth Analog` are replaced by registry verification/evidence labels. Original pin artwork and colors remain presentation mechanics; analyzed/proposed/reference legend meanings do not assert safety or probabilities. Proposed labels use amber rather than a uniformly green badge.

Original `confidence`, `similarityScores.temperature/terrain/geology/landingSafety/overall`, fixed `matchingSiteId`, preselected “prime” analogs and fixed 94-percent matches are removed from the active view model. Pair selection is explicit. Six original normalized crater-profile RMSE values are served unchanged, described as experiment-specific lower-is-closer indices, never converted into percentages.

Original hardcoded temperature, slope, elevation, pressure and composition strings are replaced by `services/adapters.ts` lookups in the actual detail record. Every numerical adapter field records its original source-field name, source ID, unit, data class and exact input value. Display rounding changes presentation only. Unavailable lunar pressure and planetary exact-point composition remain unavailable; a zero is displayed only when an actual source value is zero.

Original latitude/longitude demo constants are replaced by body-qualified coordinates. WGS84 Earth sites remain separate from lunar and Martian reference frames. Longitude normalization is applied only if necessary; already supported -180…180 values retain their exact precision. Moon/Mars never become Earth GeoJSON locations.

The generated thermal gradient, sinusoidal terrain contours and colored “safe landing corridor” compositor were removed. No global spatial heatmap is available from the point/profile data. Original globe surface/cloud/bump imagery is decorative and explicitly labeled; source measurement arrays never use those colors.

Original generic comparison temperature labels now distinguish Earth 2m air, lunar brightness and Martian modeled surface temperature. Pressure values retain Earth hPa versus modeled Mars Pa. Diviner invalid-channel artifacts stay null. MODIS surface temperature is not substituted for air temperature.

## Preserved visual and interaction code

`InteractivePlanetGlobe.tsx` reuses the supplied scene/camera/mesh/lighting, shader, graticule, pin projection, resize handling, touch/mouse handlers, orbit rings, controls, glow, tooltips and sizing classes. `OriginalUI.tsx` retains the original `GlassPanel` and `PlanetMiniThumb` implementations. `CompareView.tsx` retains the supplied target-card structure and completes the missing Earth card from that same structure. Automated tests compare original class blocks after line-ending normalization and exact motion constants. Original upload bytes themselves are untouched.

The absent application shell, routes/views, chart/finder actions and package setup had to be reconstructed. Their unknown original arrangement or behavior cannot be described as exact preservation. Documentation and screenshots distinguish original source, intermediate integration and final app; no fictional before screenshot is supplied.

## Technical changes, not redesign

The fractional atmosphere-shader power is clamped to avoid undefined fragments; old scene/maps are disposed; wrong-world pin rendering is guarded. Original broken Mars image URLs are documented and replaced by a local licensed presentation texture, with all original fallback chains retained. Existing original Earth/Moon images are locally cached to improve reliability. Actual source URLs, licenses, hashes and attribution are in `ASSET_ATTRIBUTION.md` and `validation/decorative_assets.json`.

The final FastAPI sanitizer removes local-path/credential disclosures from public responses but never changes scientific source files. API error/loading states explicitly report failure, with retry; there is no demonstration-data fallback. API unknown routes and traversal probes return errors rather than successful HTML. The retained original file and MASTER data-copy hashes can be independently checked before using the app.
