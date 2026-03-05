---
description: 'Use when editing runtime event handling, route refresh, or scroll guard behavior in the App orchestrator.'
applyTo: 'src/core/App.ts'
---

## Runtime DOM and Event Rules

1. Keep listener behavior stable:

- Do not weaken passive/capture settings without reason.
- Do not register duplicate listeners across route refresh cycles.

2. Preserve safety-critical controls:

- Scroll Guard trigger and cooldown behavior
- Pagination cooldown class sync behavior
- OFF mode non-reload behavior

3. Keep refresh scheduling bounded:

- Prefer existing RAF/debounce/queue patterns.
- Avoid new tight polling loops.

4. Keep DOM mutation impact low:

- Do not force full-page reloads except existing explicit path.
- Avoid broad DOM writes outside detection/UI services.

5. Maintain deterministic UI state sync:

- Badge state and count must match current runtime mode.

## Validation Focus

- No regression in SPA route handling.
- No scroll lock or excessive preventDefault usage.
- Cooldown state and badge cooldown text remain consistent.
