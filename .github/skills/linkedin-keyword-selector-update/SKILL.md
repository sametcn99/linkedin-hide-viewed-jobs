---
name: linkedin-keyword-selector-update
description: 'Use when adding languages, viewed/applied keywords, or LinkedIn selector updates for detection reliability.'
---

# Keyword and Selector Update Skill

Use this skill when detection quality needs updates due to new language terms or LinkedIn DOM changes.

## Workflow

1. Locate current constants:

- `src/constants/keywords.ts`
- `src/constants/selectors.ts`

2. Add narrow, high-confidence keyword terms only.
3. Prefer adding new selectors as fallback layers before replacing existing selectors.
4. Keep normalization behavior intact (diacritic-insensitive matching).
5. Verify hide/highlight parity with the updated detection set.
6. Document new language/term support in `README.md` if user-facing.

## Quality Gates

- Avoid broad terms that can match non-viewed labels.
- Keep false positives lower than recall gains.
- Ensure existing languages continue to match.
- Keep selector changes resilient to lazy-rendered cards.
