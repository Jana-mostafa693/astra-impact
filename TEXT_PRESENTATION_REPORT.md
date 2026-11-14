# TerraTwin: strictly text-only presentation update

## Backup created first

The complete working source/runtime/build/assets/tests/documentation backup was created before any project edits: `TerraTwin_BEFORE_Text_Only_Backup_20261114_0924.zip`, based on commit `a6c73e5`. Its ZIP integrity passed and SHA-256 is `3c2624e396600c45273adb8cb3f94c86827b86819e226fb6ec94bb0a96d8bd49`. Only dependency caches, Git metadata, private environment files and redundant extracted import copies were excluded; all scientific runtime data, original frontend, five-page source, textures and production build are included.

## Only retained website change

Only the text inside the existing **Missing variables** chips in `ScientificEvidence.tsx` is formatted. For example, `snow_cover_frequency` is displayed as **Snow cover frequency**. Underscores become non-breaking spaces and an initial lowercase letter is capitalized. This retains the existing monospace character count and wrapping. React keys still use the original raw identifier; the backend/datasets receive no substituted identifier.

The pure formatter and one existing child-text expression are the only runtime-source differences. No tags, components, sections, pages, elements, icons, class/style strings, props, handlers, conditions, state, routes, controls, chart code, scientific values/units/IDs, QA flags or calculations change. Measurement titles remain exactly as they were. All UNVERIFIED/status badge text and existing explanations remain intact.

## Skipped rather than redesigning

Proposed restructuring of raw QA objects, readable QA-status sentences, source coverage formatting and additional MISSING/UNVERIFIED explanations changed wrapping or component geometry in tested layouts. They were not retained. Broader measurement-title formatting also produced inconsistent whole-component geometry checks, despite some focused checks passing; it was reverted instead of relaxing the preservation requirement.

Existing statuses already have scientific caveats. No new tooltip, section, badge, icon, line, container or interaction was added to accommodate more text. No CSS/layout adjustment was made to force a new explanation to fit.

## Verification

The retained chip-only change passed **68 before/after chip/container/ancestor rectangle checks**, covering all17site records at1280,768,390and360pixelviewportwidths. These checks compared the displayed labels to their original MASTER identifiers while preserving existing components. The rejected broader candidates and their mixed results remain in `validation/text_only/`; none is reported as an accepted pass.

**69 frontend tests passed**, including6strict-preservation tests; **79 backend tests passed** during this change. TypeScript checking and the final production build passed. The preservation tests compare every JSX opening/self-closing tag and attribute, including classes, styles, icons, keys and event handlers, to the backup. They also enforce an exact source diff: the formatter plus one missing-chip text substitution only. Existing numeric formatting, quality rendering and explanation strings remain identical.

The backup-based audit confirms **173 existing non-target runtime/source/data/asset files** are byte-identical. This includes all backend/data files, globe/control code, other page/component sources, CSS and textures. The generated production CSS is byte-identical to the backup. Rebuilt JavaScript and its generated HTML asset reference necessarily change to compile the permitted text substitution; they do not constitute a new UI/layout or interaction. Planning/test/validation documents do not render in the website.

Allfivepage navigation paths remain unchanged, and the same FastAPI production service serves the rebuilt frontend with the unchanged backend. No publication or new scientific acquisition was performed. Existing animation performance, physical-device coverage and previously unverified scientific/operational requirements are not upgraded or certified by this text update.

## Restore

The safest rollback is the preserved pre-change ZIP. Extract it into a separate folder to inspect it first; its root is `TerraTwin_Backup/`. It contains the exact original component, original built frontend and immutable runtime data. Do not replace the scientific inputs with regenerated data. The current narrow version is supplied separately as `TerraTwin_Text_Presentation_Only.zip`.
