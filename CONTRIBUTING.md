# Contributing to LinkedIn Hide Viewed Jobs

Thank you for your interest in contributing. This document is aimed at developers who want to build, modify, or publish the project. End-user documentation lives in [README.md](README.md).

## Table of Contents

- [Development Setup](#development-setup)
- [Project Layout](#project-layout)
- [Architecture](#architecture)
  - [Userscript Mode](#userscript-mode)
  - [Extension Mode](#extension-mode)
  - [Core Logic](#core-logic)
- [Detection Logic](#detection-logic)
- [Customization](#customization)
- [Build Commands](#build-commands)
- [GitHub Pages](#github-pages)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Release Process](#release-process)

## Development Setup

Requirements:

- [Bun](https://bun.sh) (recommended) or Node.js 20+
- A modern browser (Chrome 88+, Firefox 109+, Edge, or any browser supporting userscript managers)

Clone the repository and install dependencies:

```bash
git clone https://github.com/sametcn99/linkedin-hide-viewed-jobs.git
cd linkedin-hide-viewed-jobs
bun install
```

## Project Layout

```text
src/
  core/                 # Code shared by userscript and extension
    types/               # Shared TypeScript interfaces
    constants/           # Config, DOM_IDS, keywords, selectors
    core/                # App orchestrator
    services/            # DetectionService, KeywordMatcher, RouterService
    ui/                  # StyleManager (CSS injection) only
    storage/             # IStorageService interface only
  userscript/            # Userscript-only code
    main.ts              # Entry point
    storage/             # LocalStorageService implementation
    ui/                  # Badge (in-page draggable UI) + IBadge interface
  extension/             # Browser extension-only code
    content.ts           # Content script entry
    background.ts        # Service worker
    storage/             # ChromeStorageService implementation
    ui/
      popup/             # Popup UI (HTML, CSS, TS modules)
scripts/                 # Build, package, and release automation
icons/                   # Extension and PWA icons
```
The browser extension's `manifest.json` is generated at build time in `scripts/build-extension.ts` (see `getChromeManifest` / `getFirefoxManifest`); no source manifest is committed.

### Dependency Injection for Badge

`App` (in `src/core/`) needs the in-page badge to render its UI, but the concrete `Badge` class only exists in the userscript bundle. To keep `App` decoupled, `userscript/main.ts` injects the badge through a factory:

```ts
const app = new App(storage, {
  createBadge: (callbacks) => new Badge(storage, callbacks.onToggle, ...),
});
```

The extension entry point (`src/extension/content.ts`) calls `new App(storage, { showBadge: false })` instead, so the badge factory is never used and the Badge class is tree-shaken from the extension bundle.

## Architecture

### Userscript Mode

```text
main.ts → LocalStorageService → App → Badge / DetectionService / RouterService / StyleManager
```

- **Entry:** `src/userscript/main.ts`
- **Storage:** `window.localStorage` via `LocalStorageService` (`src/userscript/storage/LocalStorageService.ts`)
- **UI:** In-page draggable badge (`src/userscript/ui/Badge.ts`)
- **Bundle output:** `linkedin-hide-viewed-jobs.user.js` (single file, IIFE)

### Extension Mode

```text
content.ts → ChromeStorageService → App → Badge / DetectionService / RouterService / StyleManager
popup.ts ← chrome.storage.local → background.ts → chrome.storage.onChanged → content.ts
```

- **Entry (content):** `src/extension/content.ts` — injected into LinkedIn pages
- **Entry (background):** `src/extension/background.ts` — service worker relaying storage changes
- **Popup:** `src/extension/ui/popup/` — settings UI in browser toolbar
- **Storage:** `chrome.storage.local` via `ChromeStorageService` (`src/extension/storage/ChromeStorageService.ts`)
- **Sync:** Popup changes → `chrome.storage.local` → background relays → content script calls `app.refreshSettings()`

### Core Logic

Both modes share the same core business logic under `src/core/`:

- `src/core/App.ts` — orchestrator (accepts `IStorageService` and an optional `createBadge` factory via dependency injection)
- `src/core/services/DetectionService.ts` — viewed/applied/keyword detection
- `src/core/services/KeywordMatcher.ts` — multilingual keyword matching and custom keyword matching
- `src/core/services/RouterService.ts` — SPA route change detection
- `src/core/ui/StyleManager.ts` — CSS injection
- `src/core/storage/IStorageService.ts` — storage adapter interface
- `src/userscript/ui/Badge.ts` — in-page badge UI (userscript-only, injected into `App` via `createBadge`)

The storage adapter pattern (`IStorageService`) means `App` works identically whether backed by `localStorage` or `chrome.storage.local`.

## Detection Logic

The script performs detection in multiple layers:

- Card selectors: `li[data-occludable-job-id]` and related LinkedIn list item selectors
- Footer/marker-focused detection (`VIEWED_MARKER_SELECTORS`)
- Text, `aria-label`, and `title` checks inside each card
- Card-level fallback scan for missed cases

Text matching uses `normalize('NFD')` plus diacritic removal for more stable multilingual matching.

## Customization

Source-of-truth customization lives under `src/core/constants/` and the userscript bundle is generated from that source.

Common knobs (under `src/core/constants/`):

- `VIEWED_KEYWORDS` — add more viewed-language phrases
- `APPLIED_KEYWORDS` — add more applied-language phrases
- `JOB_CARD_SELECTORS` — card selection scope
- `VIEWED_MARKER_SELECTORS` — marker selection scope
- `DOM_IDS.STORAGE_KEY` — preference storage key
- `DOM_IDS.UI_POSITION_KEY` — badge position storage key
- `DOM_IDS.HIDDEN_CLASS` — CSS class used for hiding
- `CONFIG.HIGHLIGHT_*` — highlight color, opacity bounds, and defaults

## Build Commands

```bash
bun run build              # Build userscript only (.user.js)
bun run build:extension    # Build browser extension (dist/extension-chrome/ and dist/extension-firefox/)
bun run build:all          # Build both
bun run package:chrome     # Create Chrome zip
bun run package:firefox    # Create Firefox zip
bun run package:all        # Create both zips
bun run lint               # Check code quality
bun run lint:fix           # Auto-fix lint issues
bun run format             # Run Prettier
bun run check              # Lint + format
bun run release            # Create GitHub release (local)
```

### Testing the Userscript

1. Build with `bun run build`.
2. Drag the generated `linkedin-hide-viewed-jobs.user.js` into a Tampermonkey/Violentmonkey dashboard.
3. Visit any `linkedin.com/jobs/*` page.

### Testing the Browser Extension

1. Build with `bun run build:extension`.
2. Load the unpacked extension from `dist/extension-chrome/` (Chrome) or `dist/extension-firefox/` (Firefox).
3. See the README for browser-specific loading steps.

## GitHub Pages

This repository is configured to publish a Jekyll-based documentation site from the `master` branch root.

Included site assets:

- `manifest` via `icons/site.webmanifest`
- `robots.txt`
- `sitemap.xml`
- Favicon and Apple touch icon links from `icons/`
- Open Graph, Twitter, canonical, and JSON-LD metadata

To publish:

1. Open repository settings on GitHub.
2. Go to **Pages**.
3. Set **Build and deployment** to **Deploy from a branch**.
4. Select the `master` branch and `/(root)` folder.
5. Save.

The site is served at `https://sametcn99.github.io/linkedin-hide-viewed-jobs/`.

## Pull Request Guidelines

1. Fork the repository.
2. Create a feature branch (`feature/your-change`) or fix branch (`fix/your-change`).
3. Make source changes under `src/**` and update `README.md` if end-user behavior changes.
4. Run `bun run check` to verify lint and formatting.
5. Run `bun run build:all` to verify both userscript and extension build cleanly.
6. Test on LinkedIn Jobs pages to verify detection, badge UI, toggle behavior, and extension popup.
7. Open a pull request with a clear summary, before/after notes, and screenshots when UI is affected.

Additional guidelines:

- Keep changes focused and minimal.
- Avoid unrelated refactors in the same pull request.
- Preserve compatibility with Tampermonkey/Violentmonkey on Chrome, Edge, and Firefox.
- Preserve compatibility with the standalone browser extension (Manifest V3).
- If you add new language keywords, include only high-confidence terms to reduce false positives.
- If you change storage keys or settings, ensure both `LocalStorageService` and `ChromeStorageService` are updated.

## Release Process

Releases are created via GitHub Actions:

1. Update `version` in `package.json`.
2. Commit all changes.
3. Go to **Actions → Release → Run workflow**.
4. The workflow builds both the userscript and extension, packages ZIP files, generates release notes from conventional commits, and creates a GitHub Release with all artifacts attached.

For local testing before a release:

```bash
bun run build:all
bun run package:all
# Then sideload from dist/extension-chrome/ or dist/extension-firefox/
```
