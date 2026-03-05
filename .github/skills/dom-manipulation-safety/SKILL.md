---
name: dom-manipulation-safety
description: 'Use when working on DOM manipulation, selector matching, card state toggling, or performance-sensitive document scanning in this userscript.'
---

# DOM Manipulation Safety Skill

Use this skill for DOM-heavy changes in runtime detection paths.

## Goals

- Prevent regressions in hide/highlight behavior.
- Keep detection accurate across SPA and lazy-rendered content.
- Keep performance stable under large job lists.

## Workflow

1. Read and map current flow:

- `src/services/DetectionService.ts`
- `src/constants/selectors.ts`
- `src/constants/keywords.ts`
- `src/core/App.ts`

2. Define read/write surfaces:

- Reads: selector scans, text extraction, visibility checks
- Writes: class/attribute toggles (`data-lhvj-*`)

3. Prefer additive fallback changes over replacing working paths.
4. Keep scan limits explicit and conservative.
5. Re-verify state cleanup paths for route changes and OFF mode.
6. Run checks:

- `bun run lint`
- `bun run build`

## Risk Checklist

- Selector specificity too broad
- False positives from ambiguous words
- Stale hidden/highlighted state
- Hot-path DOM scan cost
