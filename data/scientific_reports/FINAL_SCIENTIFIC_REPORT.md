# NASA Space Apps Planetary Analog Data — Final Scientific Report

**Phase 5 integration status:** validated offline master release, 2026-11-14  
**Scope:** offline integration of the preserved Phase 2, Phase 3, Phase 4, and Phase 4.5 evidence packages.  
**Validation status:** PASS_WITH_SCIENTIFIC_LIMITATIONS. Site-grain joins, source identity, current coordinate/status rules, all website JSON files, and selected independent numerical summaries pass. All 1,956 successful-response/artifact/preservation entries match; 12 historical failed HTTP response hashes are classified separately. This establishes file identity and numerical reproduction, not universal scientific comparability or complete observation coverage.

## Executive interpretation

This package is a traceable, source-qualified screening dataset for terrestrial environments and selected lunar/Martian target references. It is **not** a catalog of confirmed planetary analogs, landing sites, resource deposits, or point observations. The Earth records combine reanalysis, a modeled/satellite-informed comparison series, satellite retrievals, machine-learning soil predictions, digital-surface-model metrics, land-cover/reflectance products, and regional geological interpretations. The planetary records combine local terrain extracts, lunar brightness-temperature retrievals, preliminary lunar regional inversions, Martian GCM output, and Martian thermal-inertia products. These source classes are kept distinct because they do not have the same observational status, spatial support, or uncertainty meaning.

The package preserves the original Earth registry and its screening labels: **14 Earth points, of which 3 are `EXISTING_ANALYZED` and 11 are `PROPOSED_SCREENING`**. It adds **2 lunar targets**—Orientale and the Mons Mouton feature reference—and **1 Martian target**, Hellas. A comparison row or purpose rank is evidence for a defined use case, not a probability of analogy or an overall similarity score.

## Integrated inventory

| Scope or product | Final integrated quantity | Scientific reading |
|---|---:|---|
| Earth registry points | 14 (3 analyzed; 11 proposed screening) | Planning/screening points, not confirmed analog sites |
| Lunar targets | 2 | Orientale and Mons Mouton feature reference |
| Martian targets | 1 | Hellas |
| Primary Earth hourly climate records | 1,227,408 | 14 × 87,672 hourly UTC records for 2015–2024 |
| Earth monthly climate records | 1,680 | 14 sites × 120 calendar months |
| Earth annual climate records | 140 | 14 sites × 10 years |
| MODIS 8-day records | 5,542 | MOD11A2 point subsets and QA; not MOD11C3 |
| MODIS accepted day composites | 3,211 | QA-screened retrieval records |
| MODIS accepted night composites | 3,220 | QA-screened retrieval records |
| Diviner local-time rows | 192 | 96 rows per lunar target; coarse sampled cells |
| Valid Diviner bolometric rows | 144 | 48 Orientale + 96 Mons Mouton; brightness temperature |
| MCD 6.2 raw scalar cells | 11,000 | Parsed source cells across compact returned matrices |
| MCD unique variable-coordinate records | 10,176 | Model records, **not 10,176 independent time states** |
| MCD independent seasonal coordinate states | 576 | Closure endpoints excluded from independent-state count |
| MCD exported seasonal states | 625 | Includes Ls 360 and local-time 24 closure rows |
| MCD vertical/profile height-time states | 875 | 35 heights × 25 local-time nodes at Ls 180° |
| New Lunar Prospector estimates | 5 | Regional FeO, Ti, and H estimates; preliminary special products |
| New exact-point Mars mineral values | 0 | Requested TES cells returned nodata |
| Current category comparisons | 420 | 14 Earth sites × 3 planetary targets × 10 categories |
| Purpose evidence rows | 210 | Evidence matrix; qualitative/proxy evidence is not a probability |
| Purpose rank/evidence rows | 210 | Purpose-ranking rows; ranking file is byte-identical to Phase4 |
| Archived Phase4 comparisons | 378 | Prior 14 × 3 × 9-category table retained separately |

## Source classes and what they mean

| Evidence class | Products represented | Correct interpretation | Do not call it |
|---|---|---|---|
| Reanalysis/model retrieval | ERA5-Land and ERA5 requested through Open-Meteo | Gridded modeled climate fields sampled at registry coordinates; ERA5 and ERA5-Land are separate requests | A weather-station observation or direct CDS GRIB retrieval |
| Independent modeled/satellite-informed series | NASA POWER monthly output based on MERRA-2 meteorology and CERES SYN1deg radiation where applicable | Independent comparison series with its own grid, time convention, and conversions | Ground validation or a second direct observation of the same point |
| Satellite retrieval | Terra MODIS MOD11A2 Collection 6.1 8-day LST point subsets | Radiometric land-surface temperature with product QA and incomplete/seasonally biased clear-sky support | 2 m air temperature, a continuous daily record, or MOD11C3 |
| Machine-learning prediction | ISRIC SoilGrids 2.0 | Spatially predicted soil-property layers with depth and mask limitations | In-situ soil, laboratory grain size, or planetary regolith chemistry |
| Terrain/land-cover/reflectance | Copernicus DEM DSM, ESA WorldCover, ESA NDVI composites | Footprint-specific surface, class, and reflectance proxies | Bare-earth geology, species abundance, glacier identity, or exact local material composition |
| Regional qualitative interpretation | Macrostrat-returned map units and retained survey/gazetteer evidence | Map-unit and regional context with source-scale limitations | A point rock assay, mineral phase measurement, or verified named-feature boundary |
| Lunar thermal retrieval | PDS Diviner GCP calibrated channel/bolometric brightness-temperature tables | Multi-year local-time brightness-temperature retrievals from coarse sampled cells | Exact-point kinetic temperature or seasonal thermal extremes |
| Lunar special inversion | Lunar Prospector reduced special products | Regional FeO/Ti/H estimates at nominal map-cell support | Peer-reviewed point abundances; TiO2; water ice; mineral phase percentages |
| Martian GCM | Mars Climate Database v6.2 climatology interface/ASCII output | Interpolated model climatology under one fixed dust/EUV and average-solar configuration | A sensor observation, a forecast, or a complete natural-extreme distribution |
| Martian thermophysical retrieval | PDS TES day/night thermal-inertia maps | Retrieved thermal inertia at the Hellas cell | Temperature or a direct regolith grain-size/density measurement |

## Earth climate and environmental results

The primary Earth climate series contains 87,672 hourly UTC records per site from 2015-01-01 00:00 through 2024-12-31 23:00. Air temperature, relative humidity/dewpoint, soil temperature, soil moisture, wind, pressure, precipitation, and shortwave radiation retain their source and unit distinctions. ERA5-Land supplies the requested temperature, humidity/dewpoint, and soil fields through explicit Open-Meteo model requests. A separate explicit ERA5 request supplies precipitation, 10 m wind, surface pressure, and downward shortwave radiation because the tested ERA5-Land route returned nulls for those fields. NASA POWER monthly values remain a separate modeled/satellite-informed comparison series; it uses different grid, aggregation, and local-solar-time conventions.

The climate tables are modeled point-screening summaries rather than basin-area means or direct ground observations. A downloaded coordinate does not prove that the named crater, field site, summit, lake, or desert boundary is represented by the selected model cell. MODIS values are 8-day radiometric land-surface retrievals from a single point pixel. The requested monthly MOD11C3 granule was not acquired; MOD11A2 is not renamed to MOD11C3. Monthly LST values are overlap-weighted estimates from valid 8-day composites, with no interpolation into missing months.

Phase 3 adds 84 soil site-depth rows, local DSM terrain metrics at all 14 sites, land-cover patch metrics at 13 sites, central land-cover classes at 12 sites, NDVI indicators at 13 sites, and regional geology records. Soil values are SoilGrids predictions with explicit depth and nulls. The terrain product is a digital **surface** model, not a bare-earth DTM. WorldCover class 60 is exported as a bare/sparse proxy, not chemically bare rock; static snow/ice class information is not a snow-frequency or glacier record. No PET-based aridity index, temporal snow series, confirmed glacier identity, mineralogical assay, or physical regolith property is supplied.

Two Earth quality flags are intentionally retained. Three NDVI source patches—Manicouagan, Atacama, and Icelandic Highlands—contain p90/p50/p10 ordering exceptions and are flagged for review without sorting or replacement. The Ries topsoil sand+silt+clay prediction sums to **75.05%**, a retained **24.95 percentage-point closure deficit**; it is not renormalized and must not be treated as a validated texture composition.

## Lunar results

Orientale and Mons Mouton each have a 96-row Diviner local-time profile from a coarse 0.5° sampled cell. The combined 192 rows contain 144 valid nonnegative bolometric brightness-temperature rows: 48 for Orientale and 96 for Mons Mouton. These are radiance-derived brightness temperatures aggregated over multi-year observations and local-time bins. They are not exact-point kinetic temperatures, seasonal extrema, or a direct Earth-air-temperature analogue.

The five new Lunar Prospector values are regional special-product estimates: Orientale FeO **10.311 wt%** and elemental Ti **1.7484 wt%**; Mons Mouton FeO **6.4893 wt%**, elemental Ti **0.10642 wt%**, and bulk neutron-derived hydrogen **143.43 ppm**. The special products are preliminary and non-peer-reviewed, lack per-cell error matrices, and have map-cell support rather than independently established point footprints. **Ti is elemental Ti, not TiO2.** The raw Orientale hydrogen value **−34.289 ppm** is invalid and is retained only as a diagnostic; the accepted Orientale H value is null. Mons Mouton H is a bulk hydrogen inversion, not a water-ice detection, depth estimate, or accessibility estimate.

Mons Mouton is a verified feature reference, but membership of its reference coordinate in the NASA candidate landing polygon is unverified. The available PSR product is a topographic shadow model; it does not establish hydrogen, water ice, extractability, or a safe landing site. M³ mineral phases and other exact-point lunar mineralogical evidence were not acquired.

## Martian results

The Hellas MCD 6.2 extraction contributes 11,000 raw scalar cells and 10,176 unique model variable-coordinate records after canonicalizing repeated boundary keys. These records are not 10,176 independent observations or time states. The seasonal matrix exports 25 Ls nodes from 0° to 360° and 25 local-time nodes from 0 to 24 Martian hours: 625 exported states, of which 576 are independent after Ls 360/Ls 0 and local-time 24/local-time 0 closure duplication. The vertical query contributes 35 heights from 10 to 30,000 m above local surface at Ls 180° and 25 local-time nodes, or 875 height-time states. Vertical coverage is one season only.

The sampled MCD surface-temperature model range is **157.373–300.375 K**. The sampled 10 m model air-temperature range is 156.882–272.700 K. The sampled model surface-pressure range is **947.293–1,363.080 Pa**. These are extrema of an interpolated climatology under one selected average-solar, climatological dust/EUV scenario—not measured extremes, forecasts, or an all-scenario uncertainty interval. Surface `tsurf` is distinct from 10 m atmospheric temperature; surface `ps` is distinct from pressure at profile heights. Observed brightness/kinetic temperature fields and MCS point retrievals remain null.

The requested Hellas exact-target TES mineral cells for hematite, K-feldspar, plagioclase, and high-Ca pyroxene returned nodata. Nearby valid pixels were not substituted. Consequently, there are **0 new accepted exact-point Mars mineral-abundance values**. Physical regolith grain size, density, thickness, porosity, and mineral phase percentages remain unavailable. Existing TES day/night thermal inertia values, 240/298 J m⁻² K⁻¹ s⁻¹ᐟ², are retained; MCD thermal inertia 229.505 and albedo 0.184901 are model-grid parameters and are not replacements for the TES retrieval.

MCD non-perennial modeled surface H2O frost-layer mass spans 0–0.0509151 kg/m² over the sampled cycle. This is a climatological model prediction, not a subsurface ice deposit or accessible resource. Across the entire package, **accessible water ice at the exact target is not confirmed**.

## Comparisons and purpose-specific evidence

The current comparison table contains 420 rows across 10 defined categories. The 210-row evidence matrix carries forward original fields and appends scientific update notes. The 210-row purpose-ranking file is byte-identical to the Phase4 ranking file because the new evidence did not create matched Earth mineral, atmospheric, or regolith measurements that would justify revising prior purpose ranks. The earlier 378-row, nine-category Phase4 comparison remains archived and must not be silently conflated with the current 420-row table.

The six inherited crater-profile RMSE values remain exact and unchanged. They describe normalized radial morphology only, not absolute scale, material, habitability, or an overall analog probability. The purpose-specific selections use transparent screening rules and qualitative evidence tiers. They are not composite similarity scores, probabilities, confidence intervals, or claims that Earth reproduces lunar vacuum, lower gravity, radiation, or Martian atmospheric conditions.

## Reproducibility and provenance

The Phase 5 package is designed for offline reconstruction. The build command is:

```bash
python3 scripts/build_master.py
python3 scripts/validate_master.py
```

Both scripts derive the project root from their location. Portable original tables and manifests are kept under `source_inputs/`; compressed hourly and other series are kept under `timeseries/`; raw archives are referenced by recorded hashes and locations rather than being duplicated wholesale. The exact master archive name is **`NASA_SpaceApps_Planetary_Analog_MASTER.zip`**. Website JSON files, where present, are user-data exports only; no website was built as part of this phase.

The phase reports and source manifests under `Phase2/`, `Phase3/`, `Phase4/`, and `Phase45/` remain the authoritative provenance records for request configuration, source URLs, product definitions, returned metadata, hashes, and acquisition failures. Numeric unavailability is represented as `null` or the package's explicit `MISSING` convention; zero is never substituted for missing data. Confirmed final checksum and independent numerical-audit results are in `FINAL_DATA_QUALITY_REPORT.md` and `validation/final_validation.json`.

## Preserved quantitative morphology findings

The following values are the six original normalized-profile RMSE scores, not new overall similarities or analogy probabilities. Lower means a smaller mismatch in the inherited 15-bin shape experiment only.

| Planetary target | Earth structure | Original RMSE |
|---|---|---:|
| MARS-HELLAS | EARTH-VREDEFORT | 0.225446732949634 |
| MARS-HELLAS | EARTH-MANICOUAGAN | 1.0782779819185586 |
| MARS-HELLAS | EARTH-SUDBURY | 1.7128564141044667 |
| MOON-ORIENTALE | EARTH-VREDEFORT | 0.7107488909059236 |
| MOON-ORIENTALE | EARTH-MANICOUAGAN | 1.4024113807422527 |
| MOON-ORIENTALE | EARTH-SUDBURY | 1.485520933477032 |

Vredefort remains the first inherited profile candidate for both Hellas and Orientale among the three previously analyzed Earth structures. This does not establish the best material, thermal, atmospheric, operational, or resource analog. Other purpose rows use their original evidence tiers and may intentionally have no ordinal rank.

## Final website-data and preservation checks

All six requested website JSON exports and 104 separate series files are valid; a separate coordinate/schema guide is also valid. The Earth map contains only 14 Earth WGS84 features. Moon/Mars selections retain body-specific coordinates and do not enter Earth GeoJSON. Site-level CSVs remain 14/2/1 rows; long climate, height, local-time, and depth arrays are separate. The raw-source reference manifest has 1,076 locations/hashes; omitted raw archives are not falsely described as locally bundled. No additional data acquisition and no website construction occurred in Phase5.
