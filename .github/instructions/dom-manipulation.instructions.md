---
description: 'Use when editing DOM detection/manipulation logic for LinkedIn job cards and markers.'
applyTo: 'src/services/DetectionService.ts'
---

## DOM Manipulation Rules

1. Keep DOM writes minimal and idempotent:

- Only toggle classes/attributes when state actually changes.
- Reuse existing markers (`data-lhvj-*`) instead of creating new random attributes.

2. Keep DOM reads bounded:

- Limit broad descendant scans with explicit caps.
- Prefer selector-first narrowing before walking full subtrees.

3. Preserve multi-layer detection:

- Marker-based detection
- Card-level fallback detection
- Anchor-based fallback detection

4. Never remove visibility safety checks before text matching.
5. Avoid layout thrash:

- Batch reads before writes when adding new logic.
- Avoid repeated `getBoundingClientRect`/style reads in deep loops.

6. Keep selectors conservative and resilient to lazy rendering.
7. On cleanup paths, always restore classes/attributes introduced by this script.

## Validation Focus

- No false-positive spike after selector or text checks.
- No stale hidden/highlighted states after route transitions.
- No expensive full-page scans added to hot paths.
