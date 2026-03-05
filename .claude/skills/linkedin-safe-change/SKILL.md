---
name: linkedin-safe-change
description: 'Use when implementing bug fixes or features in this LinkedIn userscript with strict safety checks.'
---

# LinkedIn Safe Change Skill

1. Read `README.md`, `vite.config.ts`, and target files before edits.
2. Keep changes minimal and module-aligned (`core`, `services`, `ui`, `constants`).
3. Preserve scroll guard cooldown and route stability behavior.
4. Keep TypeScript strict and avoid broad refactors.
5. Run `bun run lint` and `bun run build`.
6. Update `README.md` if behavior changed.
