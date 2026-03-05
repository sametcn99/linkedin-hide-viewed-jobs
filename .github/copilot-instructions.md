# Copilot Instructions for linkedin-hide-viewed-jobs

This repository builds a browser userscript from TypeScript source.

## Project Intent

- Keep the script privacy-first: no external network calls, no tracking, no telemetry.
- Keep behavior stable on LinkedIn Jobs SPA routes.
- Keep multilingual viewed/applied detection high-confidence and low false positives.

## Hard Rules

1. Source of truth is `src/**` and `vite.config.ts`.
2. Do not hand-edit `linkedin-hide-viewed-jobs.user.js` unless the user explicitly asks.
3. Preserve strict TypeScript (`tsconfig.json` has `strict: true`). Avoid `any` and unsafe casts.
4. Keep the existing architecture boundaries:

- `src/core/App.ts` orchestrates runtime lifecycle.
- `src/services/**` contains detection/routing/storage logic.
- `src/ui/**` contains badge and style concerns.
- `src/constants/**` contains selectors/config/keywords.

5. Keep guard behavior safe:

- Do not remove cooldown/randomization logic intended to reduce rate-limit risk.
- Do not disable pagination cooldown controls without explicit request.

6. UI changes must preserve:

- Draggable badge behavior.
- ON/OFF toggle semantics.
- Scroll Guard toggle semantics.
- Detection mode behavior (`hide` and `highlight`).

7. Keyword and selector changes must be conservative:

- Add only high-confidence terms.
- Prefer extending fallback layers over replacing existing detection paths.

8. Avoid large dependency additions for simple logic.
9. When behavior changes, update `README.md` in the same change.
10. Before finishing a coding task, run:

- `bun run lint`
- `bun run build`

## Editing Discipline

- Keep changes small and focused.
- Do not perform unrelated refactors in feature/fix tasks.
- Reuse existing utility/services instead of duplicating logic.
- Respect existing naming and file layout.

## DOM and UI Guidance

- For DOM-heavy changes, follow `.github/instructions/dom-manipulation.instructions.md` and use skill `dom-manipulation-safety`.
- For runtime event/route handling in `App`, follow `.github/instructions/runtime-dom-events.instructions.md`.
- For badge/CSS/UX work, follow `.github/instructions/ui-ux-style.instructions.md` and use skill `ui-ux-userscript-enhancement`.
- Preserve accessibility basics for UI interactions (keyboard activation, `aria-label`, visible focus styles).

## Output Expectations

When answering with code changes:

- Mention touched files explicitly.
- Call out behavior changes and risk areas (selectors, routing, cooldown logic).
- If checks fail, report exact command and failure summary.
