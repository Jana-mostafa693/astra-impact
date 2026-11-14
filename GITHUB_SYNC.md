# Astra Impact repository synchronization

This source delivery targets the user's **existing private repository**:

- Repository: https://github.com/Jana-mostafa693/astra-impact
- Owner: `Jana-mostafa693`
- Default branch: `main`
- Source archive: `Astra_Impact_GitHub_Ready.zip`
- Archive SHA-256: `91db85ed62c1c725b7db2685ea59f8707f84c4a73c95560e5815aadec036849f`

The repository was inspected before synchronization: it was private and empty, with no existing branches, committed files or history to overwrite. Verified access included administrative and push permissions. No new repository or public release was requested. All241files from the archive are copied byte-for-byte into the repository root; this synchronization note is the only additional file. No application source, scientific data, visual assets, interaction, backend calculation or configuration was changed.

## Historical preparation reports

`GITHUB_DELIVERY.md`, `REPOSITORY_MANIFEST.json` and `REDISTRIBUTION_REVIEW.md` were produced before GitHub access became available. Their statements that upload/authorization was pending are historical preparation status, not an instruction to recreate this repository. They are retained unchanged to preserve the verified archive. The inventory covers the241originalpackagefiles; this note is additional repository documentation.

## Executed verification

After extraction into the repository clone, the existing setup script installed the locked frontend and pinned backend dependencies. TypeScript checking passed; **69frontendtests** and **79backendtests** passed. One existing backend dependency deprecation warning remains. The production build was already executed successfully for this exact verified package; it was not regenerated to perform this source upload. Package checksums and the existing compiled frontend were verified unchanged.

Runtime data includes **17sites (14Earth,2Moon,1Mars),104chart-seriesfiles,420activecomparisonrecords and210recommendationrecords**. The backend source, JSON, data catalogs, compact crater-profile CSV, coordinate frames, model/observation distinctions, missing-data flags and original Header `ASTRA IMPACT` are preserved. Frontend tests check these counts, science guardrails, real value mappings, chart references, globe geometry and original interaction constants.

## Clone and run

For this private repository, authenticate through your normal GitHub account before cloning:

```bash
git clone https://github.com/Jana-mostafa693/astra-impact.git
cd astra-impact
npm install -g pnpm@10.18.0
bash scripts/setup.sh
bash scripts/start_dev.sh
```

Open http://localhost:3000. Setup requires Python3.12 and a compatible Node release as described in `README.md`. No NASA download, API key or database is needed to run the bundled read-only scientific application.

Tests and single-origin production:

```bash
source .venv/bin/activate
PYTHONPATH=backend python -m pytest backend/tests -q
pnpm --dir frontend check
pnpm --dir frontend test
# Rebuild only when needed after future source changes:
pnpm --dir frontend build
PORT=3000 bash scripts/start_production.sh
```

See `RUN_AND_DEPLOY.md`, `API_DOCUMENTATION.md`, `.env.example` and `Dockerfile` for deployment guidance. **Uploading to GitHub does not deploy FastAPI or start hosting.**

## Exclusions and redistribution

No dependencies, virtual environments, caches, temporary test logs, actual environment files, tokens, duplicate archives or unnecessary raw satellite archives are committed. The archive's exclusions are recorded in `EXCLUDED_FILES.csv`; all required runtime data/images/configuration and original preservation-test fixtures remain.

The repository remains **private**. Existing source-specific license/attribution uncertainties are documented in `REDISTRIBUTION_REVIEW.md`; this private source upload is not a blanket license certification or permission to make those files public. Review the documented21runtimecataloglicensegaps and per-image terms before a future public release. No credential values or new whole-project license claims are introduced.
