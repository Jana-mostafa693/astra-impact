# Data coverage report

## Active sites and record grains

| Dataset/coverage | Count |
|---|---:|
| earth sites | 14 |
| moon sites | 2 |
| mars sites | 1 |
| hourly rows | 1227408 |
| monthly rows | 1680 |
| annual rows | 140 |
| soil depth rows | 84 |
| solar monthly rows | 1680 |
| modis rows | 5542 |
| diviner rows | 192 |
| mcd seasonal rows | 625 |
| mcd independent seasonal coordinate states | 576 |
| mcd profile rows | 875 |
| mcd profile heights | 35 |
| mcd unique variable coordinate records | 10176 |
| mcd raw numeric scalar cells | 11000 |
| latest comparison rows | 420 |
| archived phase4 comparison rows | 378 |
| purpose rows | 210 |
| website json files | 111 |
| required website json files | 6 |
| separate website series files | 104 |
| source catalog rows | 39 |

## Source coverage and evidence type

Earth:14complete2015–2024 primary reanalysis streams; partialMODISacquisition and QA remains distinct from air temperature. SoilGrids has84depthrecords,with12sites having all7topsoilproperties and27complete depth rows. All14sites have local terrain patches and covering geological mapunits;13namedunit/rock classifications;13land-coverpatch statistics,12centerclassifications,13validNDVImeans and3sourceorderreview sites. Solar has1,680monthlyrecords fromreusedERA5/POWER. Noneofthesereanalysis/ML/map products is relabeled as an in-situ sample.

Moon:2targets,192Diviner local-time rows with144validbolometric bins. Four validregionalFeO/Ti estimates and onevalidMonsMouton bulkH estimate are preliminaryremote-sensinginversions. OrientaleHraw−34.289ppm is invalid. M³mineral phases/pointregolithphysicalproperties remain missing.

Mars:1Hellas target,localMOLApatch and2retainedTESthermal-inertia estimates. MCD6.2 has625seasonal states(576independent coordinates),35height profiles atLs180° and10,176uniquevariable-coordinate records across queries; not10,176independenttimes. ExacttargetTESmineral cells are nodata. No surfacebrightness/kinetic observation orMCSpointprofile was newlyacquired.

Comparisons:latest420categoryrows across10categories; original378rows across9categories retained in `source_inputs/Phase4/`. Purpose evidence/ranks:210rows each,without score or rankrevision. All six originalRMSE values retained.

## UI coverage

SixrequiredwebsiteJSON files and104separate series support Earthmap(14Earth-onlyfeatures),body-specificMoon/Marsselection,sitepanels,climate/temperature/terraincharts,purposefilters,per-fieldunits/sourceclasses andmissing/qualityindicators. ModelLs/localtime neverbecomeEarthdates. Per-fieldseriesmetadata keepsMODISretrievals separatefromERA5/ERA5-Land andPOWER. No website was built.

Accessible water ice at every exact target remains unconfirmed.
