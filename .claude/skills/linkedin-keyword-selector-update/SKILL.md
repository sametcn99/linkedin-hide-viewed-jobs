---
name: linkedin-keyword-selector-update
description: 'Use when updating multilingual keywords or LinkedIn selectors for viewed/applied detection.'
---

# Keyword and Selector Update Skill

1. Edit `src/constants/keywords.ts` and `src/constants/selectors.ts` conservatively.
2. Add only high-confidence terms.
3. Prefer fallback selector additions over replacing stable selectors.
4. Preserve normalization and low false-positive matching behavior.
5. Reflect user-visible language support changes in `README.md`.
