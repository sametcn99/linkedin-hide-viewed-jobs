# LinkedIn Hide Viewed Jobs

Hide or highlight viewed job postings on LinkedIn Jobs with a privacy-first userscript built for Tampermonkey and Violentmonkey — **or install as a standalone browser extension for Chrome and Firefox**.

This project focuses on three things: stable LinkedIn SPA behavior, high-confidence multilingual viewed/applied detection, and safer scrolling with guard and cooldown protections.

## Quick Links

- [Screenshot](#screenshot)
- [Project Links](#project-links)
- [Features](#features)
- [Supported Pages](#supported-pages)
- [Browser Compatibility](#browser-compatibility)
  - [Userscript](#userscript)
  - [Browser Extension](#browser-extension)
- [Installation](#installation)
  - [Installation of Userscript](#installation-of-userscript)
  - [Installation of Browser Extension](#installation-of-browser-extension)
- [GitHub Pages](#github-pages)
- [Supported Languages](#supported-languages)
- [Usage](#usage)
- [Detection Logic](#detection-logic)
- [Customization](#customization)
- [Architecture](#architecture)
  - [Userscript Mode](#userscript-mode)
  - [Extension Mode](#extension-mode)
  - [Shared Code](#shared-code)
  - [Build Commands](#build-commands)
- [Limitations](#limitations)
- [Privacy](#privacy)
- [Contributing](#contributing)
- [Releasing](#releasing)

## Screenshot

![Screenshot of the userscript badge](https://raw.githubusercontent.com/sametcn99/linkedin-hide-viewed-jobs/refs/heads/master//screenshots/userscript.png)
![Screenshot of the extension popup](https://raw.githubusercontent.com/sametcn99/linkedin-hide-viewed-jobs/refs/heads/master//screenshots/extension.png)

## Project Links

- Repository: [https://github.com/sametcn99/linkedin-hide-viewed-jobs](https://github.com/sametcn99/linkedin-hide-viewed-jobs)
- Issues: [https://github.com/sametcn99/linkedin-hide-viewed-jobs/issues](https://github.com/sametcn99/linkedin-hide-viewed-jobs/issues)
- Greasy Fork: [https://greasyfork.org/scripts/567795-linkedin-hide-viewed-jobs](https://greasyfork.org/scripts/567795-linkedin-hide-viewed-jobs)
- Github Gist: [https://gist.github.com/sametcn99/66cf2c0da5c793d6f56763ece2b9027a](https://gist.github.com/sametcn99/66cf2c0da5c793d6f56763ece2b9027a)
- OpenUserJS: [https://openuserjs.org/scripts/sametcn99/LinkedIn_Hide_Viewed_Jobs](https://openuserjs.org/scripts/sametcn99/LinkedIn_Hide_Viewed_Jobs)

## Features

- **Dynamic Control**:
  - `ON/OFF` status toggle.
  - `Guard (ON/OFF)`: Scroll protection to prevent LinkedIn rate-limits. This is especially important when hiding jobs, as rapid scrolling through hundreds of hidden items can trigger bot-detection filters.
- **Two-Layer Detection**:
  - `Hide Mode`: Automatically vanishes viewed jobs.
  - `Highlight Mode`: Keeps jobs visible but adds separate low-opacity full-card color filters for `viewed` and `applied` cards.
- **Active Card Accent**: On `jobs` and `jobs/search` views, the currently open job card gets its own configurable highlight filter color so the selected row stays easy to spot.
- **Draggable Handle**: Reposition the badge anywhere on the screen.
- **Dynamic Settings Panel**: Expandable menu to switch between `Hide` and `Highlight` modes, tune `viewed`, `applied`, and `active` card colors, adjust filter opacity, and open the GitHub repository.
- **Navigation Reload Toggle**: Choose whether SPA path changes should trigger a full page reload or stay on soft refresh.
- **Live Counter**: Track `N viewed` or `N hidden` items in real-time.
- **Persistence**: Remembers your preferences for `ON/OFF`, `Scroll Guard`, `Detection Mode`, `Navigation Reload`, `Viewed/Applied/Active Colors`, `Filter Opacity`, and `Badge Position`.
- **Robust Navigation**: Full support for LinkedIn's SPA routing; automatically restarts scanning when you switch pages or collections.
- **Multilingual**: Intelligent keyword detection across 15+ languages.

## Supported Pages

- `https://www.linkedin.com/jobs/*`
- `https://www.linkedin.com/jobs/search/*`
- `https://www.linkedin.com/jobs/collections/*`

## Browser Compatibility

### Userscript

- Chrome + Violentmonkey/Tampermonkey
- Edge + Violentmonkey/Tampermonkey
- Firefox + Violentmonkey/Tampermonkey

### Browser Extension

- Chrome 88+ (Manifest V3)
- Firefox 109+ (Manifest V3)

## Installation

### Installation of Userscript

1. Install a userscript extension in your browser:
1. Chrome/Edge: Tampermonkey or Violentmonkey
1. Firefox: Tampermonkey or Violentmonkey
1. Import `linkedin-hide-viewed-jobs.user.js` into the extension.
1. Save and enable the script.
1. Refresh a LinkedIn Jobs page.

Alternative:

- Install directly from the latest release:
- [https://github.com/sametcn99/linkedin-hide-viewed-jobs/releases/latest/download/linkedin-hide-viewed-jobs.user.js](https://github.com/sametcn99/linkedin-hide-viewed-jobs/releases/latest/download/linkedin-hide-viewed-jobs.user.js)

### Installation of Browser Extension

The browser extension provides the same functionality as the userscript in a standalone package — no Tampermonkey/Violentmonkey needed.

**Chrome:**

1. Download `linkedin-hide-viewed-jobs-chrome.zip` from the [latest release](https://github.com/sametcn99/linkedin-hide-viewed-jobs/releases).
1. Unzip the file to a permanent folder on your computer.
1. Open `chrome://extensions` in Chrome.
1. Enable **Developer mode** (toggle in the top-right corner).
1. Click **Load unpacked** and select the unzipped folder.
1. Navigate to any LinkedIn Jobs page.

**Firefox:**

1. Download `linkedin-hide-viewed-jobs-firefox.zip` from the [latest release](https://github.com/sametcn99/linkedin-hide-viewed-jobs/releases).
1. Unzip the file to a permanent folder on your computer.
1. Open `about:debugging` in Firefox.
1. Click **This Firefox** → **Load Temporary Add-on**.
1. Select the `manifest.json` file from the unzipped folder.
1. Navigate to any LinkedIn Jobs page.

> **Note:** Firefox temporary add-ons are removed when the browser closes. For persistent installation, the extension needs to be signed by Mozilla.

## GitHub Pages

This repository includes a GitHub Pages setup that renders this README through Jekyll with a polished dark editorial layout, a branded hero section, and responsive documentation styling.

Included site assets:

- `manifest` via `icons/site.webmanifest`
- `robots.txt`
- `sitemap.xml`
- favicon and Apple touch icon links from `icons/`
- Open Graph, Twitter, canonical, and JSON-LD metadata

Publish flow:

1. Open repository settings on GitHub.
1. Go to `Pages`.
1. Set `Build and deployment` to `Deploy from a branch`.
1. Select the `master` branch and `/(root)` folder.
1. Save.

Published site URL:

- `https://sametcn99.github.io/linkedin-hide-viewed-jobs/`

## Supported Languages

The script supports detection for the following languages:

- English (Viewed, Seen, Applied)
- Turkish (Görüntülenen, Görüntülendi, Başvurulan, Başvurulanlar, Başvuruldu)
- Spanish (Visto, Vistos, Aplicado, Postulado)
- Portuguese (Visualizado, Visualizados, Candidatado, Candidatura)
- French (Vu, Vue, Postulé, Postulée, Candidature)
- German (Angesehen, Gesehen, Beworben)
- Italian (Visualizzato, Visto, Candidata, Candidati, Candidatura)
- Dutch (Bekeken, Solliciteerd)
- Russian (Просмотрено, Откликнулся)
- Polish (Wyświetlono, Aplikowano)
- Swedish (Visad, Sedd, Sökt)
- Chinese (已查看, 已申请, 已檢視, 已申請)
- Japanese (閲覧済み, 応募済み)
- Korean (조회됨, 지원함, 지원 완료)
- Arabic (تمت المشاهدة, تم التقديم)
- Hindi (देखा गया, आवेदन किया गया)

## Usage

1. Open a LinkedIn Jobs listing page.
1. The script scans for viewed cards.
1. When `OFF`, viewed jobs are not hidden; they are only counted.
1. When `ON`, viewed jobs are hidden.
1. In settings, `Reload OFF` is the default. SPA navigation stays on soft refresh unless you explicitly enable `Reload ON`.
1. In `Highlight` mode, `Viewed` and `Applied` cards use different colors so you can distinguish them at a glance.
1. On `jobs` and `jobs/search` pages, the currently selected card also gets its own full highlight filter color.
1. In settings, use the native color pickers to adjust `Viewed`, `Applied`, and `Active` card colors, and use the opacity slider to make the highlight filter lighter or stronger.
1. The settings panel includes a direct `GitHub Repo` shortcut for the project source and issue tracker.
1. If rapid downward scrolling is detected while most cards are viewed/hidden, the guard can enter a random cooldown (`5-15s`) and slow scroll steps to reduce LinkedIn rate-limit risk.
1. If guard is triggered again while a cooldown is already active, the new cooldown is added on top of the remaining time (stacked), instead of restarting as separate back-to-back cooldowns.
1. During cooldown, pagination controls inside `div.jobs-search-pagination` are temporarily disabled (including collections/search pagination buttons).
1. Drag the badge using the handle on the left to reposition it.

## Detection Logic

The script performs detection in multiple layers:

- Card selectors: `li[data-occludable-job-id]` and related LinkedIn list item selectors
- Footer/marker-focused detection (`VIEWED_MARKER_SELECTORS`)
- Text, `aria-label`, and `title` checks inside each card
- Card-level fallback scan for missed cases

Text matching uses `normalize('NFD')` plus diacritic removal for more stable multilingual matching.

## Customization

Source-of-truth customization lives under `src/**` and the userscript bundle is generated from that source.

Common knobs:

- `VIEWED_KEYWORDS`: Add more viewed-language phrases
- `APPLIED_KEYWORDS`: Add more applied-language phrases
- `JOB_CARD_SELECTORS`: Card selection scope
- `VIEWED_MARKER_SELECTORS`: Marker selection scope
- `STORAGE_KEY`: Preference storage key
- `UI_POSITION_KEY`: Badge position storage key
- `HIDDEN_CLASS`: CSS class used for hiding

## Architecture

### Userscript Mode

```text
main.ts → LocalStorageService → App → Badge / DetectionService / RouterService / StyleManager
```

- Entry: `src/main.ts`
- Storage: `window.localStorage` via `LocalStorageService`
- UI: In-page draggable badge

### Extension Mode

```text
content.ts → ChromeStorageService → App → Badge / DetectionService / RouterService / StyleManager
popup.ts ← chrome.storage.local → background.ts → chrome.storage.onChanged → content.ts
```

- Entry (content): `src/extension/content.ts` — injected into LinkedIn pages
- Entry (background): `src/extension/background.ts` — service worker relaying storage changes
- Popup: `src/popup/popup.html` + `popup.ts` + `popup.css` — settings UI in browser toolbar
- Storage: `chrome.storage.local` via `ChromeStorageService`
- Sync: Popup changes → `chrome.storage.local` → background relays → content script calls `app.refreshSettings()`

### Shared Code

Both modes share the same core business logic:

- `src/core/App.ts` — orchestrator (accepts `IStorageService` via dependency injection)
- `src/services/DetectionService.ts` — viewed/applied detection
- `src/services/KeywordMatcher.ts` — multilingual keyword matching
- `src/services/RouterService.ts` — SPA route change detection
- `src/ui/Badge.ts` — in-page badge UI
- `src/ui/StyleManager.ts` — CSS injection

The storage adapter pattern (`IStorageService`) means `App` works identically whether backed by `localStorage` or `chrome.storage.local`.

### Build Commands

```bash
bun run build              # Build userscript only (.user.js)
bun run build:extension    # Build browser extension only (dist/extension/)
bun run build:all          # Build both
bun run package:chrome     # Create Chrome zip
bun run package:firefox    # Create Firefox zip
bun run package:all        # Create both zips
bun run lint               # Check code quality
bun run check              # Lint + format
bun run release             # Create GitHub release (local)
```

## Limitations

- If LinkedIn changes its DOM structure, selectors may need updates.
- New phrasing variants in some languages may require additions to `VIEWED_KEYWORDS`.

## Privacy

- The script runs fully on the client side.
- It makes no external API calls.
- It does not send data anywhere.

## Contributing

Contributions are welcome.

1. Fork the repository.
1. Create a feature branch (`feature/your-change`) or fix branch (`fix/your-change`).
1. Make source changes under `src/**` and update `README.md` if behavior changes.
1. Run `bun run check` to verify lint and formatting.
1. Run `bun run build:all` to verify both userscript and extension build.
1. Test on LinkedIn Jobs pages to verify detection, badge UI, toggle behavior, and extension popup.
1. Open a pull request with a clear summary, before/after notes, and screenshots when UI is affected.

Guidelines:

- Keep changes focused and minimal.
- Avoid unrelated refactors in the same pull request.
- Preserve compatibility with Tampermonkey/Violentmonkey on Chrome, Edge, and Firefox.
- Preserve compatibility with the standalone browser extension (Manifest V3).
- If you add new language keywords, include only high-confidence terms to reduce false positives.
- If you change storage keys or settings, ensure both `LocalStorageService` and `ChromeStorageService` are updated.

## Releasing

Releases are created manually via GitHub Actions:

1. Update `version` in `package.json`.
1. Commit all changes.
1. Go to **Actions → Release → Run workflow**.
1. The workflow builds both the userscript and extension, packages ZIP files, generates release notes from conventional commits, and creates a GitHub Release with all artifacts attached.

For local testing:

```bash
bun run build:all
bun run package:all
# Then sideload from dist/extension/
```
