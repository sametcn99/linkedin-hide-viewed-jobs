---
name: ui-ux-userscript-enhancement
description: 'Use when improving badge UX, JavaScript-driven CSS, accessibility, responsiveness, and interaction semantics for the userscript UI.'
---

# UI UX Userscript Enhancement Skill

Use this skill for all visual and interaction changes in `src/ui/**`.

## Goals

- Keep the compact badge intuitive and accessible.
- Improve visual clarity without breaking existing behavior.
- Ensure stable interactions on desktop and mobile/zoom contexts.

## Workflow

1. Read current UI modules:

- `src/ui/Badge.ts`
- `src/ui/StyleManager.ts`
- relevant constants in `src/constants/config.ts`

2. Keep controls behaviorally stable:

- ON/OFF toggle semantics
- Guard toggle semantics
- Settings open/close semantics
- Hide/Highlight mode switching

3. Apply style updates via existing CSS variable pattern when possible.
4. Preserve keyboard and focus behavior.
5. Validate draggable behavior and viewport clamping.
6. Run checks:

- `bun run lint`
- `bun run build`

7. If user-visible behavior changed, update `README.md`.

## UX Quality Bar

- States are immediately understandable from labels and color cues.
- Focus styles are visible for keyboard users.
- No overlap/cutoff in narrow viewports.
- Cooldown and count information remain legible.
