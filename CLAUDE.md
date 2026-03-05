# CLAUDE.md

Claude and Claude-compatible coding agents should follow these project rules:

1. Read and follow `AGENTS.md` as the baseline policy.
2. For task workflows, use `.claude/skills/**`.
3. For DOM-heavy tasks use `dom-manipulation-safety`; for UI/CSS tasks use `ui-ux-userscript-enhancement`.
4. Treat `src/**` as source-of-truth and avoid direct edits to `linkedin-hide-viewed-jobs.user.js` unless explicitly requested.
5. Run `bun run lint` and `bun run build` after implementation changes when possible.
