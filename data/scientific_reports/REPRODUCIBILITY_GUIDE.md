# Phase 5 Reproducibility Guide

## Purpose

This guide describes how to rebuild and validate the Phase 5 integrated package from saved local inputs. It is deliberately offline: no search, network retrieval, new acquisition, or website build is part of the workflow. The build preserves source distinctions, explicit missingness, earlier-phase status labels, and the distinction between observations, retrievals, predictions, models, and regional interpretations.

## Prerequisites

- Linux or another environment with `python3` available.
- The extracted master project directory, including `source_inputs/` and `timeseries/`. Earlier phase directories are not required for integration/validation; raw re-extraction requires the separately referenced original archives.
- The portable inputs supplied by the parent integration under `source_inputs/`.
- Compressed time series under `timeseries/`.
- The Phase5 scripts and their local dependencies. Do not substitute a newly downloaded source file for a saved input.

The scripts derive the project root from their own location. This makes the build portable when the complete project tree is moved, provided the relative directory structure is preserved.

## Required commands

Run from the Phase5 directory:

```bash
cd /path/to/extracted/NASA_SpaceApps_Planetary_Analog_MASTER
python3 scripts/build_master.py
python3 scripts/validate_master.py
```

`build_master.py` constructs the seven master CSVs and six user-data website JSON exports from the saved inputs. `validate_master.py` checks schemas, counts, keys, source/status fields, explicit null handling, and the package contracts after the build. Neither command should access the network or rerun Phase2, Phase3, Phase4, or Phase4.5 acquisition.

## Expected data contracts

| Contract | Expected value |
|---|---:|
| Earth sites | 14 |
| Earth analyzed/proposed statuses | 3 / 11 |
| Lunar targets | 2 |
| Mars targets | 1 |
| Earth hourly records | 1,227,408 |
| Earth monthly records | 1,680 |
| Earth annual records | 140 |
| MODIS rows/day/night valid | 5,542 / 3,211 / 3,220 |
| Diviner rows/valid bolometric rows | 192 / 144 |
| MCD raw scalar cells | 11,000 |
| MCD unique variable-coordinate records | 10,176 |
| MCD independent/exported seasonal states | 576 / 625 |
| MCD height/time states | 875 = 35 × 25 |
| New LP regional estimates | 5 |
| New accepted Mars exact-point mineral values | 0 |
| Current comparison/evidence/purpose rows | 420 / 210 / 210 |
| Phase4 archived comparison | 378 |
| Purpose ranking identity | Byte-identical to Phase4 |

The value `10,176` is a canonical unique-record count. It is explicitly **not** 10,176 independent time states. The 625 exported seasonal states include Ls 360/Ls 0 and local-time 24/local-time 0 closure rows; only 576 are independent coordinate states. The 875 vertical/profile states are 35 physical heights at 25 local-time nodes for one Ls season.

## Input organization

`source_inputs/` contains portable copies of original tables, manifests, compact evidence, and other build inputs. `timeseries/` contains the large compressed hourly/series payloads. Raw archives are not all bundled into the final master directory; the manifests/checksum records preserve their hashes and locations for traceability.

The preserved Phase2–Phase4.5 reports remain outside the Phase5 generated master tables and are the scientific authority for source definitions:

```text
source_inputs/Phase2/climate_methodology.md
source_inputs/Phase2/validation_summary.json
source_inputs/Phase3/environment_methodology.md
source_inputs/Phase3/environment_quality_report.md
source_inputs/Phase4/comparison_methodology.md
source_inputs/Phase4/planetary_quality_report.md
source_inputs/Phase45/phase45_scientific_methodology.md
source_inputs/Phase45/phase45_quality_report.md
```

## Validation interpretation

A successful structural validation means that the local integrated tables satisfy the declared schema/count/key contracts. It does not turn a model into an observation or establish source accuracy beyond the preserved provenance and product documentation.

Preservation hashes establish saved-file identity, not scientific truth. Final Phase5 numerical, source-identity, coordinate, JSON and key/grain checks have completed; the exact scope is recorded in `validation/final_validation.json`. Omitted raw archives are validated hash/location references, not newly claimed local files.

## Scientific checks that must remain visible

The validation and documentation must retain these flags rather than smoothing them away:

- MODIS is incomplete/QA-screened MOD11A2 8-day land-surface retrieval data, not MOD11C3 or air temperature.
- Three NDVI source patches (Manicouagan, Atacama, Icelandic Highlands) have percentile-order review flags; original values are retained.
- Ries sand+silt+clay closure is 75.05%, with a 24.95 percentage-point deficit; values are not renormalized.
- Mars MCD records are model climatology. Surface temperature is 157.373–300.375 K in the sampled configuration and surface pressure is 947.293–1,363.080 Pa.
- Lunar Prospector special-product values are preliminary regional inversions. Ti is elemental Ti, not TiO2.
- Orientale raw H of −34.289 ppm is invalid and must remain null as an accepted value.
- Mons Mouton H of 143.43 ppm is bulk hydrogen, not water ice.
- Exact-point Mars mineral values are zero accepted values because target cells returned nodata.
- Physical lunar/Martian regolith properties and M3/CRISM mineral phases remain missing.
- No accessible water ice is confirmed; Mons Mouton landing-polygon membership is unverified.
- Current comparison count is 420; the older 378-row Phase4 table is archived. Purpose rankings remain byte-identical to Phase4.

## Release packaging

After the parent confirms the build and validation outputs, the distribution archive must be named exactly:

```text
NASA_SpaceApps_Planetary_Analog_MASTER.zip
```

The archive should include the six Phase5 Markdown documents, seven master CSVs, six website JSON exports, `timeseries/`, `source_inputs/`, scripts, manifests, and checksums according to the parent integration layout. It should not silently omit the scientific limitations or replace raw-archive hash/location references with fabricated local raw data.

The website JSON files are user data only. This phase does not build, publish, or validate a website application.

## Troubleshooting principles

- If counts differ, inspect the source manifest and parent-generated schema before changing values.
- If a value is unavailable, preserve `null`/`MISSING`; do not fill with zero or a nearby pixel.
- If a current hash is absent, report the missing artifact to the parent; do not relabel the issue as a scientific pass.
- If a source URL would be needed to resolve an ambiguity, stop: this phase is offline and must use the saved reports/evidence only.
- If a comparison rank changes, verify whether a new matched measurement exists. The Phase4.5 result states that no such matched Earth mineral/atmospheric/regolith evidence was acquired, so purpose ranks remain byte-identical.

## Confirmed release validation

The final active registry contains 14 Earth sites, Orientale, Mons Mouton, and Hellas. The legacy undefined lunar-base placeholder remains archived and is excluded from the website map. All six required JSON files and 104 separate chart-series JSON files parse strictly; the additional schema JSON also parses (111 website JSON files total). The current 420-row comparison and 210 purpose rows retain original values/ranks. All six crater RMSE values were independently reproduced to floating-point precision.

The full validation checks 1,956 recorded successful-response/artifact/preservation checksum entries across 1,234 unique resolved files, with no mismatches; 12 historical HTTP 400/429 failed-response hashes are retained as request metadata, not incorrectly treated as hashes of later saved data files. The independent preservation audit also reports 203 entries over 82 unique paths, and all 120 portable copied inputs match their hashes. See `validation/final_validation.json`, `FINAL_DATA_QUALITY_REPORT.md`, and `CHECKSUMS.sha256`.

Dependencies for validation are Python 3.10+ with pandas and NumPy (`requirements.txt` records the versions used). `scripts/independent_audit.py` is a supplemental original-computer audit; the required portable active-site checks are in `scripts/validate_master.py`. The separate `scripts/prior_phase_reference/` tree is historical provenance: do not run acquisition scripts during offline reproduction.
