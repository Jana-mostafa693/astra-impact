# NASA Space Apps Planetary Analog Data — Phase 5 Package

This directory is the offline final-integration workspace for the Planetary Analog Data project. It combines preserved Earth climate/environment products from Phases 2–3 with the Moon/Mars comparison products from Phase 4 and the additional model and regional-evidence products from Phase 4.5.

The package is a **source-qualified screening dataset**, not a confirmed-analog registry, landing-site certification, resource assessment, or replacement for field/instrument validation. Read [`FINAL_SCIENTIFIC_REPORT.md`](FINAL_SCIENTIFIC_REPORT.md) for the integrated scientific narrative and [`SCIENTIFIC_LIMITATIONS.md`](SCIENTIFIC_LIMITATIONS.md) before interpreting any value.

## Scope at a glance

| Item | Quantity or status |
|---|---:|
| Earth points | 14: 3 analyzed, 11 proposed screening |
| Lunar targets | 2: Orientale and Mons Mouton feature reference |
| Martian targets | 1: Hellas |
| Earth hourly/monthly/annual records | 1,227,408 / 1,680 / 140 |
| MODIS 8-day/day/night | 5,542 / 3,211 / 3,220 |
| Diviner rows/valid bolometric rows | 192 / 144 |
| MCD raw scalar cells | 11,000 |
| MCD unique variable-coordinate records | 10,176; **not independent time states** |
| MCD independent/exported seasonal states | 576 / 625 |
| MCD vertical height-time states | 875 = 35 heights × 25 local-time nodes |
| New Lunar Prospector estimates | 5 regional values |
| New accepted exact-point Mars mineral values | 0 |
| Current comparisons/evidence/rank rows | 420 / 210 / 210 |
| Archived Phase4 comparison | 378 rows |

## Files and directories

The following products have been generated and validated:

- **Seven master CSVs:** integrated Earth, lunar, Martian, comparison, evidence, or registry tables created by the parent build. Their exact filenames and schema are authoritative in the generated checksums/manifests and validation output.
- **Six website JSON files:** user-data exports for the project interface. These are data artifacts only; no website build is included in this phase.
- **`timeseries/`:** compressed hourly and other series, including the large Earth time-series payloads.
- **`source_inputs/`:** portable original tables, manifests, and compact source inputs used by the offline master build.
- **`scripts/`:** offline build and validation scripts. The scripts derive the project root from their own location.
- **Checksums/manifests:** generated identity and provenance records for the final package.
- **The six documentation files in this directory:** this README, the final scientific report, the limitations register, and the reproducibility guide.

Large raw archives are not duplicated into every master output. They are referenced through saved hashes and locations in the source manifests and package checksum records.

The exact distribution archive name is:

```text
NASA_SpaceApps_Planetary_Analog_MASTER.zip
```

## How to read the values

1. Start with the relevant master CSV and its schema/manifest entry.
2. Preserve the source class: reanalysis, modeled/satellite-informed series, satellite retrieval, machine-learning prediction, GCM, thermophysical retrieval, or regional interpretation.
3. Check spatial support and temporal support before comparing records.
4. Treat `null` and explicit `MISSING` values as unavailable, never as zero.
5. Carry quality flags forward. In particular, retain the three NDVI percentile-order review flags and the Ries 75.05% texture-closure flag.
6. Do not call MCD records observations: 10,176 is a unique variable-coordinate count from 11,000 raw scalar cells, not a count of independent states.
7. Do not call the five Lunar Prospector values point measurements or TiO2. Do not treat 143.43 ppm Mons Mouton hydrogen as water ice.
8. Do not treat a PSR mask, MCD frost prediction, or regional ancient-ice interpretation as confirmed accessible ice.

## Source provenance

The authoritative preserved reports are:

- `source_inputs/Phase2/climate_methodology.md` and `source_inputs/Phase2/validation_summary.json`
- `source_inputs/Phase3/environment_methodology.md` and `source_inputs/Phase3/environment_quality_report.md`
- `source_inputs/Phase4/comparison_methodology.md` and `source_inputs/Phase4/planetary_quality_report.md`
- `source_inputs/Phase45/phase45_scientific_methodology.md` and `source_inputs/Phase45/phase45_quality_report.md`

Those reports preserve the verified source URLs, request configurations, product names, returned units, hashes, failure records, and scientific caveats. Phase 5 does not perform network access, search, or new acquisition.

## Build and validation

From the Phase5 directory, run:

```bash
python3 scripts/build_master.py
python3 scripts/validate_master.py
```

The commands are intentionally offline. They use the portable inputs and preserved time-series files, and they must not restart a prior acquisition. See [`REPRODUCIBILITY_GUIDE.md`](REPRODUCIBILITY_GUIDE.md) for the expected record counts and audit interpretation.

## Scientific headline flags

- Earth climate values are modeled/reanalysis retrievals; NASA POWER is a separate comparison series.
- MODIS is MOD11A2 8-day land-surface temperature, not MOD11C3 and not air temperature.
- SoilGrids is machine-learning prediction, not in-situ soil.
- The terrain product is a surface model; geology is regional map interpretation.
- Mars MCD surface temperature spans 157.373–300.375 K in the sampled configuration; model surface pressure spans 947.293–1,363.080 Pa.
- Diviner values are lunar bolometric brightness temperatures from coarse sampled cells.
- No physical lunar/Martian regolith properties or exact-point M3/CRISM mineral phases were acquired.
- No accessible water ice is confirmed at any exact target.
- Mons Mouton landing-polygon membership is unverified.
- Current purpose ranks are byte-identical to Phase4; the 420-row comparison is the current table and the 378-row table is archived.

## Audit status wording

The 57 earlier prior-output hashes were preserved and independently checked in Phase5. The completed final audit results and their successful/failed-request scope classifications are in `validation/final_validation.json`. File hashes establish identity, not scientific accuracy or universal analog comparability.

## Confirmed release validation

The final active registry contains 14 Earth sites, Orientale, Mons Mouton, and Hellas. The legacy undefined lunar-base placeholder remains archived and is excluded from the website map. All six required JSON files and 104 separate chart-series JSON files parse strictly; the additional schema JSON also parses (111 website JSON files total). The current 420-row comparison and 210 purpose rows retain original values/ranks. All six crater RMSE values were independently reproduced to floating-point precision.

The full validation checks 1,956 recorded successful-response/artifact/preservation checksum entries across 1,234 unique resolved files, with no mismatches; 12 historical HTTP 400/429 failed-response hashes are retained as request metadata, not incorrectly treated as hashes of later saved data files. The independent preservation audit also reports 203 entries over 82 unique paths, and all 120 portable copied inputs match their hashes. See `validation/final_validation.json`, `FINAL_DATA_QUALITY_REPORT.md`, and `CHECKSUMS.sha256`.

Dependencies for validation are Python 3.10+ with pandas and NumPy (`requirements.txt` records the versions used). `scripts/independent_audit.py` is a supplemental original-computer audit; the required portable active-site checks are in `scripts/validate_master.py`. The separate `scripts/prior_phase_reference/` tree is historical provenance: do not run acquisition scripts during offline reproduction.

## Exact required output files

Master CSVs: `earth_master_dataset.csv`, `moon_master_dataset.csv`, `mars_master_dataset.csv`, `planetary_comparison_master.csv`, `analog_rankings_by_purpose.csv`, `planetary_source_catalog.csv`, `data_dictionary.csv`.

Website JSON: `website_sites.json`, `website_earth_details.json`, `website_moon_details.json`, `website_mars_details.json`, `website_comparisons.json`, `website_analog_recommendations.json`.

Reports: `FINAL_SCIENTIFIC_REPORT.md`, `FINAL_DATA_QUALITY_REPORT.md`, `DATA_COVERAGE_REPORT.md`, `SCIENTIFIC_LIMITATIONS.md`, `README.md`, `REPRODUCIBILITY_GUIDE.md`. The complete package listing is `FILE_INVENTORY.csv`.
