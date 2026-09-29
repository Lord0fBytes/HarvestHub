# Next

## Finish compatible dependency maintenance

Branch: `chore/dependency-maintenance`

- [ ] Review and commit the compatible dependency refresh in `package-lock.json`.
- [ ] Keep `package.json` unchanged; the existing version ranges already accepted these updates.
- [x] Verify production build: `npm run build` passes.
- [ ] Decide how to address the 15 lint errors and 4 warnings separately from dependency maintenance.
- [ ] Review the 8 `npm audit` findings before attempting any audit fix. Do not use `npm audit fix --force` without a dedicated upgrade plan.

## Upgrade larger dependencies one group at a time

Create a focused branch for each item, update only that group, run the build, and manually test Planning, Shopping, All Items, Review, and database-backed item creation/editing before merging.

- [ ] `next` + `eslint-config-next`: 16.0.7 -> 16.3.6
- [ ] `react` + `react-dom`: 19.2.0 -> 19.3.0
- [ ] `sharp`: 0.34.5 -> 0.35.4; confirm its install script/native binary works in local and Docker builds.
- [ ] `eslint`: 9.39.5 -> 10.11.0; review config and rule changes.
- [ ] `@types/node`: 20.19.43 -> 26.6.3; confirm the supported Node runtime first.
- [ ] `typescript`: 5.9.3 -> 7.0.2; treat as a separate compatibility pass.

## Visual refresh for 1.1.0

Branch: `feature/visual-update-1.1.0`

Use UI/UX Pro Max for each focused UI task: start with a targeted UX query for the observed issue, then verify the change at desktop and mobile widths. Keep visual fixes separate from dependency work.

### Visual audit prompts (not yet confirmed bugs)

- [ ] Review Planning at 320px, 375px, tablet, and desktop widths for overflow, row density, and readable item names.
- [ ] Review Shopping with long item names, many tags, and multiple stores.
- [ ] Confirm all tap targets are comfortably touch-sized and neighboring controls have clear spacing.
- [ ] Check keyboard focus states, icon-only button labels, and dark-mode contrast.
- [ ] Compare headings, cards, pills, buttons, and empty states for consistent spacing, typography, and color treatment.
- [ ] Review add/edit modal spacing, labels, validation feedback, and mobile safe-area behavior.
- [ ] Record each confirmed visual bug here with its page, viewport, screenshot/reference, and intended outcome before implementing it.

## Before each merge

- [ ] Run `npm run build`.
- [ ] Test against the PostgreSQL SSH tunnel when the change touches live item data.
- [ ] Note any lint or audit findings separately unless the branch explicitly addresses them.
