# Scientific Limitations and Interpretation Boundaries

This register is part of the data, not an afterthought. The package is suitable for transparent screening, method demonstration, and evidence-linked comparison. It is not sufficient by itself to certify an Earth analog, select a landing polygon, infer a resource, or establish a local planetary material composition.

## 1. Scope and status limits

- The 14 Earth points retain their original statuses: **3 `EXISTING_ANALYZED` and 11 `PROPOSED_SCREENING`**. Downloading a value at a coordinate does not promote a proposed point to a confirmed analog.
- The lunar set contains two targets, Orientale and Mons Mouton; the Martian set contains Hellas. Expansion to other candidate targets was not performed.
- `420` current category comparisons and `210` purpose evidence/rank rows are evidence products, not overall similarity scores. The older `378`-row Phase4 comparison remains archived for provenance.
- The six inherited crater-profile RMSE values are normalized morphology experiments only. They do not measure absolute scale, material composition, habitability, or mission suitability.
- Inherited Phase4.5 reporting records 57 prior-output hash passes. Those are preservation results from earlier scopes. They must not be described as a newly completed Phase5 audit until the parent confirms the independent audit and final checksum scope.

## 2. Source and measurement limitations

| Source or variable family | Limitation | Consequence |
|---|---|---|
| ERA5-Land/ERA5 through Open-Meteo | Gridded reanalysis/model output; ERA5-Land and ERA5 came from separate explicit requests; grid spacing is not site-scale accuracy; returned fields are API-derived rather than unmodified CDS files | Use as modeled climate context, not station truth or fine-scale terrain meteorology |
| NASA POWER | MERRA-2/CERES-based modeled/satellite-informed monthly series with different grid and local-solar-time conventions from the primary UTC series | Differences from ERA5 are expected and are not direct observational disagreement |
| MODIS MOD11A2 | 8-day radiometric LST point pixels, cloud/QA/snow/darkness/view effects, incomplete acquisition, seasonal sampling bias; MOD11C3 was not obtained | Do not substitute for 2 m air temperature, daily all-weather temperature, or official MOD11C3 |
| SoilGrids 2.0 | Machine-learning spatial predictions, masks, depth layers, and incomplete uncertainty support; some WCS rows are footprint means | Do not call them field samples, laboratory measurements, or planetary regolith values |
| Copernicus DEM | Digital surface model, including possible vegetation/buildings; local metrics depend on footprint, resolution, reprojection, and vertical datum | Do not interpret as bare-earth geology or centimetre-scale roughness |
| WorldCover/NDVI | Static or annual reflectance/class proxies with different footprints; no temporal snow series or glacier intersection | Do not infer species abundance, glacier identity, snow frequency, or chemical bare rock |
| Macrostrat and regional maps | Map-unit interpretations with variable source scale; point-in-polygon applies to the downloaded map polygon, not necessarily the intended named feature | Do not call map text a local assay, exact crater membership, or mineral abundance |
| Diviner | Multi-year local-time brightness-temperature bins in coarse sampled cells | Do not call these exact-point kinetic temperatures or seasonal extremes |
| Lunar Prospector special products | Preliminary, non-peer-reviewed regional inversions without per-cell error matrices; nominal map sampling is not an independently established footprint | Treat FeO/Ti/H as regional estimates with substantial interpretation caution |
| Mars Climate Database 6.2 | Interpolated climatology under one fixed dust/EUV and average-solar configuration; sampled extrema are not observed natural extremes | Do not treat model ranges as weather records, forecasts, or confidence intervals |
| TES thermal inertia | Thermophysical retrieval, not temperature; does not independently determine grain size, density, porosity, or thickness | Keep thermal inertia separate from temperature and regolith-property claims |

## 3. Explicit missing or unconfirmed science

The following remain unavailable, null, or unverified in the final dataset:

1. Physical lunar and Martian regolith properties, including validated grain size, bulk density, thickness, porosity, and local material mechanics.
2. Exact-point M³/CRISM mineral phases and exact-point spectral mineral abundances.
3. New accepted exact-point Mars mineral values: the requested Hellas TES cells returned nodata, so the count is **0**. Nearby valid pixels were not transferred to the target.
4. Confirmed accessible water ice at any exact target. A PSR label is a shadow-model result; lunar hydrogen is an inversion; MCD H2O frost is a model prediction; regional ancient-ice interpretations are not point detections.
5. Membership of the Mons Mouton reference coordinate in the NASA candidate landing polygon. The feature reference is retained, but landing-polygon membership is unverified.
6. A complete temporal snow/glacier record for Earth sites, PET-based aridity, mineralogical analytical evidence, and direct field validation.
7. Earth thermal-inertia measurements matched to Hellas. Earth LST and air temperature are not numerically matched to Martian or lunar thermal quantities.
8. A full-scenario or measured Martian atmosphere. The MCD output is one selected climatology scenario, with vertical profiles at one season only.

## 4. Numerical and product-specific flags

### Earth climate and MODIS

- The primary Earth climate period contains 1,227,408 hourly records, 1,680 monthly records, and 140 annual records. These are modeled/retrieval-based summaries, not direct ground-station observations.
- MODIS contains 5,542 8-day records, with 3,211 accepted day and 3,220 accepted night composites. Missing acquisition and QA rejection are distinct. Partial months are not interpolated.
- The accepted MODIS records are MOD11A2 8-day LST point subsets. The requested MOD11C3 monthly product was not downloaded.
- `MODIS` LST is surface radiometric temperature; it is not 2 m air temperature. Composite-support days are not counts of clear-sky observation days.

### Earth environment

- Three NDVI patches—Manicouagan, Atacama, and Icelandic Highlands—contain p90/p50/p10 ordering exceptions. The original encoded pixels and derived values are retained and flagged for review; they were not sorted or replaced.
- Ries topsoil sand+silt+clay totals **75.05%**, i.e. a **24.95 percentage-point** closure deficit. Values are retained without renormalization. This is not a validated grain-size composition or USDA textural class.
- The 14 Earth geology polygons cover the registered points in the downloaded map, but this does not verify membership in each intended crater, park, field site, or other named feature.
- Static WorldCover snow/ice class is not a snow-frequency record. No accessible ice confirmation is derived from it.

### Moon

- The 192 Diviner rows contain 144 valid bolometric rows: 48 Orientale and 96 Mons Mouton. The remaining profile rows are not to be filled or interpreted as zero-temperature observations.
- Orientale FeO is 10.311 wt% and elemental Ti is 1.7484 wt%; Mons Mouton FeO is 6.4893 wt%, elemental Ti is 0.10642 wt%, and H is 143.43 ppm. These are regional special-product estimates.
- **Ti is not TiO2.** No unsupported oxide conversion was performed.
- The raw Orientale H value of **−34.289 ppm** is invalid and remains only as a diagnostic. It is not clipped to zero and not treated as a detection.
- Mons Mouton H is a bulk neutron-derived hydrogen inversion, not water ice, water phase, depth, or accessibility.
- The Mons Mouton PSR center is labeled 0 in the retained local mask. The mask is a shadow model, not ice evidence or a landing-safety result.

### Mars

- MCD 6.2 contributes **10,176 unique variable-coordinate model records** from **11,000 raw scalar cells**. The 10,176 value is not a count of independent time states.
- The 576 independent seasonal states become 625 exported states only because Ls 360 and local-time 24 closure rows remain available. These duplicate boundaries must not be counted as new seasons or sols.
- The 875 height/time states are 35 heights × 25 local-time nodes at Ls 180°; this is not all-season vertical coverage.
- MCD model surface temperature spans **157.373–300.375 K** and model surface pressure spans **947.293–1,363.080 Pa** in the sampled configuration. These are sampled climatology bounds, not measurements or forecasts.
- MCD surface thermal inertia 229.505 and albedo 0.184901 are model-grid parameters. They do not replace retained TES thermal inertia (240 day / 298 night J m⁻² K⁻¹ s⁻¹ᐟ²) and do not establish physical regolith properties.
- MCD modeled surface H2O frost-layer mass spans 0–0.0509151 kg/m² over the sampled cycle. It is not subsurface ice or an accessible resource.

## 5. Non-comparability rules

The following comparisons are scientifically disallowed or must remain explicitly qualified:

- Earth air temperature versus lunar Diviner brightness temperature.
- Earth SoilGrids soil fractions versus lunar or Martian regolith composition.
- Earth DSM roughness versus aerodynamic roughness length or centimetre-scale regolith roughness.
- Earth land-cover bare/sparse fraction versus chemically bare planetary rock.
- Absolute elevation across Earth, Moon, and Mars, because body datums, radii, and reference surfaces differ.
- MCD modeled atmospheric pressure/temperature versus a measured Martian weather record.
- Lunar H or a PSR label versus confirmed water ice or accessible resource volume.
- Regional geological context versus exact-point mineralogy.
- A qualitative purpose tier versus an overall probability, confidence, or percentage similarity.

## 6. Safe use statement

Use the tables to trace a question to a source, spatial footprint, temporal support, and validity flag. Carry nulls and review flags forward. Do not silently impute, renormalize, transfer nearby mineral values, or merge model and retrieval quantities solely because their units look compatible. The package supports an auditable screening narrative; it does not establish mission readiness or scientific confirmation of a planetary analog.
