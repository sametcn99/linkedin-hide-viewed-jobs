---
name: linkedin-safe-change
description: 'Use when implementing bug fixes or features in this LinkedIn userscript with strict safety checks, especially for Copilot-driven code changes.'
---

# LinkedIn Safe Change Skill

Use this workflow for most implementation tasks in this repository.

## Goals

- Keep feature behavior stable while applying focused fixes.
- Avoid regressions in route handling, detection, and scroll guard.
- Keep changes small, typed, and lint-clean.

## Required Steps

1. Read context first:

- `README.md`
- `vite.config.ts`
- Touched files under `src/**`

2. Define impact area:

- Detection (`src/services/DetectionService.ts`, selectors/keywords)
- Routing/runtime (`src/core/App.ts`, `src/services/RouterService.ts`)
- UI (`src/ui/**`)
- Storage/state (`src/services/StorageService.ts`)

3. Implement minimal patch in the right module.
4. Run validation commands:

- `bun run lint`
- `bun run build`

5. If user-visible behavior changed, update `README.md`.
6. Summarize risk points:

- Selector fragility
- Route timing/lazy render timing
- Cooldown and pagination interactions

## Do Not

- Do not move logic across modules without strong reason.
- Do not replace multi-layer detection with single-path detection.
- Do not add telemetry or external dependencies for simple fixes.
