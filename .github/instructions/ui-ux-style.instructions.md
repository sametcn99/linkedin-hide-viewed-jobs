---
description: 'Use when editing badge UI, CSS generation, or UX behavior for the userscript interface.'
applyTo: 'src/ui/**/*.ts'
---

## UI UX and CSS Rules

1. Keep JS-generated CSS scoped under script root/classes only.
2. Preserve visual contract:

- Draggable badge
- ON/OFF status clarity
- Guard status clarity
- Hide/Highlight mode controls
- Cooldown visibility

3. Keep accessibility minimums:

- Keyboard activation for interactive non-button elements
- `aria-label` for controls
- Visible focus state (`:focus-visible`)

4. Avoid brittle UI assumptions:

- Support narrow screens and zoomed pages.
- Keep position clamped to viewport bounds.

5. Keep style performance safe:

- Use class/attribute toggles over inline style spam.
- Avoid unnecessary re-injection of style tag.

6. Maintain readable typography and contrast in badge controls.
7. Preserve existing CSS variable-driven styling pattern.

## Validation Focus

- Badge remains draggable and interactive after UI changes.
- Settings panel open/close semantics remain correct.
- Desktop/mobile rendering stays usable.
