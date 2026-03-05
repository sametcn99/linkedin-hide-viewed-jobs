---
description: 'Use when editing TypeScript source for LinkedIn Hide Viewed Jobs userscript behavior.'
applyTo: 'src/**/*.ts'
---

## TypeScript Source Rules

1. Keep strict typing. Do not introduce `any` unless there is no practical alternative.
2. Preserve service boundaries:

- App orchestration in `src/core/App.ts`
- Domain logic in `src/services/**`
- UI rendering/styling in `src/ui/**`
- Constants/selectors/keywords in `src/constants/**`

3. Prefer additive fixes over broad rewrites.
4. Keep LinkedIn DOM interactions resilient:

- Validate selectors against fallback paths.
- Do not remove marker and card-level detection fallbacks in the same change.

5. Keep performance safeguards:

- Avoid expensive full-document scans in tight loops.
- Reuse existing scheduling/debounce/observer patterns.

6. Do not introduce browser-incompatible APIs without fallback.
7. Keep comments short and only for non-obvious logic.

## Change Checklist

- Confirm behavior on Jobs pages and non-Jobs pages.
- Confirm OFF mode does not force reload on route changes.
- Confirm cooldown and pagination safety behavior still works.
- Confirm counter and badge state stay in sync.
