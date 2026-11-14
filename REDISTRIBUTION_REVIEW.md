# Public redistribution review

This source delivery preserves the user's existing runtime data and imagery. **Public release is not certified by this audit.** No image, measurement, source classification or scientific dataset was edited to resolve rights questions. GitHub upload is still incomplete, and a public/private repository decision has not been confirmed.

## Credential review

A read-only scan of315trackedtext/sourcefiles and354reachableGit-historyblobs found no actual credentials in the checked token/private-key/credential-URL categories. The only generic-secret pattern match was an intentional redaction test fixture in `backend/tests/test_final_guards.py`; that fixture is necessary for testing and is not a credential. This is a bounded pattern scan, not proof against every possible secret format. Actual environment files, authentication metadata and Git history are not included in this clean ZIP; `.env.example` contains nonsecret configuration values only.

## Decorative imagery

The Solar System Scope decorative Mars map is attributed under CC BY4.0 in the interface and `ASSET_ATTRIBUTION.md`. Its publisher/source and file checksum are preserved in `validation/decorative_assets.json`. It is not a scientific map.

Earth/Moon imagery retains the original Three.js example-source attribution, but the supplied documentation does not establish per-file copyright/license metadata for every upstream example image. Do not infer that the Three.js code license automatically resolves every image right.

The three existing thumbnails are unchanged copies of the original Unsplash URLs. Their source URLs and hashes are preserved in `validation/final/original_thumbnail_assets.json`. The current delivery does not provide photographer-specific attribution or a completed per-image license review. Public redistribution should review these upstream image terms; no new blanket image license is declared here.

## Scientific products

The catalog and scientific reports preserve provenance, product versions, resolution, evidence classes and limitations. However,21sourceIDs used by the runtime exports have blank `license_or_attribution` cells in `data/catalogs/planetary_source_catalog.csv`:

`EARTH_COPDEM`, `EARTH_ERA5_LAND_OPEN_METEO`, `EARTH_ERA5_OPEN_METEO`, `EARTH_GEOLOGY`, `EARTH_MODIS_ORNL`, `EARTH_NDVI`, `EARTH_POWER_MONTHLY`, `EARTH_SOILGRIDS`, `EARTH_WORLDCOVER`, `MOON_DIVINER`, `MOON_LOLA_GLOBAL`, `MOON_LOLA_POLAR`, `MOON_LP_FEO`, `MOON_LP_H`, `MOON_LP_TI`, `MARS_MCD_62`, `MARS_MOLA`, `MARS_TES_MINERAL`, `MARS_TES_TI`, `REGIONAL_GEOLOGICAL_CONTEXT`, `RETAINED_CRATER_PROFILES`.

These gaps do not prove restriction, but they prevent a blanket redistribution guarantee. Review the preserved official product links and provider terms before making the source/data public. The original MCD documentation distinguishes scientific use with citation/information obligations from commercial use requiring authorization. Copernicus/reanalysis, MODIS, mapped geology and third-party processing services can have release-specific attribution requirements. The catalog itself flags several products for upstream license checks. No entire-project MIT or public-domain license is assigned to mixed scientific inputs.

The complete original raw NASA archives are omitted because the application uses only compact runtime extracts/exports. Their omission does not remove any data actually required by the backend.

## Release decision

Keep the intended `astra-impact` destination private by default until the owner is authorized and public visibility is explicitly approved. Resolve these source-specific attribution questions before NASA submission via a public repository. No repository was made public and no deployment was performed by this preparation task.
