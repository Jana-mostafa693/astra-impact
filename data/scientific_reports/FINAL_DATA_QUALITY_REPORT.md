# Final data quality report

## Validation result

**PASS_WITH_SCIENTIFIC_LIMITATIONS**. No additional acquisition was performed. This means structural/provenance/numerical checks pass, not that every observation gap is closed.

| Check | Result |
|---|---|
| active site registry | PASS:14Earth+Orientale+MonsMouton+Hellas; legacyundefinedlunarplaceholderexcludedandarchived; no statuspromotion |
| joins and ranks | PASS:one-row-per-site anduniqueearth/planet/category;420latest/378archived;210originalrankingrowsbyte-identical;nooverallpercentage |
| six crater rmse | PASS:all6exactoriginalvalues preserved and independentlyrecomputed;maxabsoluteerror 0.0 |
| website json | PASS:111strictJSONfiles(6required+schema+104series);17siteforeignkeys;Earth-onlyGeoJSON;typednulls;body-specificcoordinates;persourceunits/classes |
| earth hourly and selected summary | PASS:all1,227,408rowscounted,87,672persite;January2015Vredefort744hoursrecomputed;pressurealreadyhPa |
| mcd model | PASS:6.2explicitmodel;625states576unique;rawK/Parangesexact;K-to-C;Ls/localtimebounds;periodicclosures |
| input snapshots | PASS:120copiedinputsbyte-identical; originalsourcesnotmodified |
| recorded source hashes | PASS |


## Numerical reproduction

All six original RMSE values were reproduced from15sourceprofilebins,maximum absolute error 0.0. The original full-precision values remain in `original_crater_profile_scores.csv`; rank CSV bytes remain unchanged. The selected Vredefort January2015 statistics were reproduced from744hourly rows; all1,227,408hourly rows were counted bysite. MCD surface K/Pa ranges were independently matched to original ASCII; Celsius conversions and cyclic endpoints pass.

## Preservation scope

120 input snapshots were checked against copied/source hashes. 1968 recorded source/preservation entries were evaluated; status counts: {'PASS': 1956, 'HISTORICAL_FAILED_HTTP_RESPONSE_NOT_SAVED_DATASET': 12}. 0 metadata-only hash entries have no bound filename and are listed separately,not falsely counted as checkedfiles. The independent earlier preservation audit additionally checked203entries/82unique paths with zero failures. Raw packages not included are referenced by1,076validated locations/hashes. The archived Phase1placeholderregistry is not the final current-site registry.

## Retained limitations

- PartialMODISacquisitionandclear-skyQA
- NDVIpercentileorderreview3sites
- Riestexturesum75.05percentunrenormalized
- LPspecialnon-peer-reviewedregionalestimates
- NegativeOrientaleHinvalid
- Moutonlandingpolygonunverified
- NoexactHellasmineralabundance
- Physicalregolithparametersmissing
- Noaccessiblewatericeconfirmed
- MCDoneinterpolatedclimatologyscenario,notobservations
- Legacycraterrawlineage/scale/coordinatequalifications

See `SCIENTIFIC_LIMITATIONS.md` and source-phase reports for scientific meaning. No negative/nodata value was substituted,renormalized or treated as inaccessibleiceproof. JSONmissing measurements are null; status MISSING remains a categorical flag. Moon/Mars coordinates are never included in EarthGeoJSON.
