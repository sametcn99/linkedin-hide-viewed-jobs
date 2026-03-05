---
name: dom-manipulation-safety
description: 'Use when changing DOM scans, selector matching, or class/attribute toggling logic for viewed job detection.'
---

# DOM Manipulation Safety Skill

1. Keep multi-layer detection paths intact.
2. Keep visibility checks before text matching.
3. Keep DOM scans bounded and avoid hot-path full-tree scans.
4. Keep class/attribute toggles idempotent and reversible.
5. Run `bun run lint` and `bun run build`.
