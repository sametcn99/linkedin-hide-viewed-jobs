# LinkedIn Hide Viewed Jobs

A privacy-first browser tool that hides or highlights the job postings you have already viewed on LinkedIn — so you can focus on what is new.

Available as a **userscript** (Tampermonkey / Violentmonkey) or a **standalone browser extension** for Chrome and Firefox. No account. No tracking. No external requests.

![Userscript badge](https://raw.githubusercontent.com/sametcn99/linkedin-hide-viewed-jobs/refs/heads/master//screenshots/userscript.png)
![Extension popup](https://raw.githubusercontent.com/sametcn99/linkedin-hide-viewed-jobs/refs/heads/master//screenshots/extension.png)

## What It Does

LinkedIn remembers every job you open, but its interface does not make it easy to skip the ones you have already seen. This tool scans each job card, detects whether you have viewed it or applied to it, and either removes it from your feed or paints it with a subtle color overlay.

It works with LinkedIn's single-page app routing, so detection stays accurate as you switch between search results, collections, and recommended jobs.

## Features

- **Hide or Highlight mode** — choose between removing viewed jobs entirely or keeping them visible with a color overlay.
- **Smart detection** — separate colors for `viewed`, `applied`, `active`, and keyword-matched cards so you can read your feed at a glance.
- **Active card accent** — the currently selected job on search and listings pages gets its own color so it never gets lost.
- **Custom keywords** — add your own keywords to highlight or hide cards by company name, title, or any text on the card. Matches take priority over viewed/applied detection.
- **Scroll Guard** — slows down rapid scrolling through hidden items to reduce the risk of hitting LinkedIn's rate limits.
- **Draggable badge** — reposition the on-page control anywhere on the screen.
- **Live counter** — see how many cards have been detected and how many are keyword matches.
- **SPA-aware** — automatically rescans when you navigate between search results or collections.
- **Multilingual** — works out of the box on 15+ languages including English, Turkish, Spanish, Portuguese, French, German, Italian, Dutch, Russian, Polish, Swedish, Chinese, Japanese, Korean, Arabic, and Hindi.
- **Customizable colors and opacity** — tune the overlay to your taste with native color pickers and an opacity slider.
- **Import / export** — back up and restore your settings as a JSON file. You can replace everything or merge on top of existing settings.
- **Persistent window** — the extension remembers your window size and position between sessions.

## Installation

### Option 1 — Userscript (Tampermonkey / Violentmonkey)

Works on Chrome, Edge, and Firefox.

1. Install a userscript manager:
   - Chrome / Edge: [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/)
   - Firefox: [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/)
2. Install the userscript from the latest release:
   - [Download `linkedin-hide-viewed-jobs.user.js`](https://github.com/sametcn99/linkedin-hide-viewed-jobs/releases/latest/download/linkedin-hide-viewed-jobs.user.js)
3. Confirm the install prompt in your userscript manager.
4. Open any LinkedIn Jobs page — the badge will appear in the bottom-left corner.

### Option 2 (Recommended) — Browser Extension (Chrome)

1. Download `linkedin-hide-viewed-jobs-chrome.zip` from the [latest release](https://github.com/sametcn99/linkedin-hide-viewed-jobs/releases).
2. Unzip the file to a permanent folder on your computer.
3. Open `chrome://extensions` in Chrome.
4. Enable **Developer mode** (toggle in the top-right corner).
5. Click **Load unpacked** and select the unzipped folder.
6. Open any LinkedIn Jobs page.

### Option 3 — Browser Extension (Firefox)

1. Download `linkedin-hide-viewed-jobs-firefox.zip` from the [latest release](https://github.com/sametcn99/linkedin-hide-viewed-jobs/releases).
2. Unzip the file to a permanent folder on your computer.
3. Open `about:debugging` in Firefox.
4. Click **This Firefox** → **Load Temporary Add-on**.
5. Select the `manifest.json` file from the unzipped folder.
6. Open any LinkedIn Jobs page.

> **Note:** Firefox temporary add-ons are removed when the browser closes. For a permanent install, the extension needs to be signed by Mozilla.

## How to Use

1. Visit a LinkedIn Jobs page.
2. Open the badge (userscript) or click the extension icon in your toolbar to open the settings window.
3. Use the **ON / OFF** switch to toggle the extension.
4. Switch between **Hide** and **Highlight** modes depending on whether you want viewed jobs to disappear or stay visible.
5. (Optional) Add custom keywords in the **Custom Keywords** field — separate by pressing Enter. Cards matching your keywords will be highlighted or hidden just like viewed jobs.
6. (Optional) Drag the badge to your preferred position. Your position is remembered.
7. When you scroll, the **Scroll Guard** may trigger a short cooldown to slow things down — this is normal and protects your account from rate limits.

## Supported Languages

Detection works out of the box for: English, Turkish, Spanish, Portuguese, French, German, Italian, Dutch, Russian, Polish, Swedish, Chinese, Japanese, Korean, Arabic, and Hindi.

## Privacy

- The script runs entirely on your device.
- It makes no external network requests.
- It does not collect, store, or transmit any data.
- Your settings live in your browser's local storage and stay there.

## Links

- [Repository](https://github.com/sametcn99/linkedin-hide-viewed-jobs)
- [Issue tracker](https://github.com/sametcn99/linkedin-hide-viewed-jobs/issues)
- [Greasy Fork](https://greasyfork.org/scripts/567795-linkedin-hide-viewed-jobs)
- [OpenUserJS](https://openuserjs.org/scripts/sametcn99/LinkedIn_Hide_Viewed_Jobs)
- [GitHub Gist](https://gist.github.com/sametcn99/66cf2c0da5c793d6f56763ece2b9027a)

## Contributing

Want to help? See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, architecture, and pull request guidelines.

## License

MIT — see [LICENSE](LICENSE).
