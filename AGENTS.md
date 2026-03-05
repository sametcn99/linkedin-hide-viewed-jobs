# AGENTS.md

Project-wide agent rules for Copilot, Claude, and other coding agents.

## Scope

Applies to all AI agents that modify this repository.

## Non-Negotiable Rules

1. Treat `src/**` as editable source; treat `linkedin-hide-viewed-jobs.user.js` as generated output.
2. Preserve privacy-first behavior (no telemetry, no external API calls).
3. Keep LinkedIn Jobs SPA compatibility and route-refresh stability.
4. Maintain current feature contract:

- ON/OFF runtime toggle
- Scroll Guard and cooldown protections
- Hide/Highlight detection modes
- Draggable badge and persistent preferences

5. Do not remove fallback detection layers unless explicitly requested.
6. Keep TypeScript strict and avoid introducing lint debt.
7. Update docs (`README.md`) for user-visible behavior changes.

## Required Workflow

1. Read `README.md`, `vite.config.ts`, and touched files before editing.
2. Make minimal, focused changes.
3. Run `bun run lint` and `bun run build` after edits.
4. Summarize changed files, behavior impact, and test results.

## Agent-Specific Notes

- GitHub Copilot: follow `.github/copilot-instructions.md` and `.github/instructions/*.instructions.md`.
- GitHub Copilot DOM/UI tasks: prefer skills `dom-manipulation-safety` and `ui-ux-userscript-enhancement`.
- Claude-compatible setups: can rely on this `AGENTS.md` and `.claude/skills/**`.
- Other agents: follow this file as the baseline policy.
