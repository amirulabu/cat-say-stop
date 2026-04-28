# Cat Say Stop

A browser extension that forces you to take a break from social media — with a fat cat as your gatekeeper.

<p align="center">
  <img src=".output/chrome-mv3/icon/128.png" width="128" alt="Cat Say Stop icon" />
</p>

## Features

- **Active tab tracking** — Only counts time when a social media tab is actively focused. Timer pauses when you switch away or lose window focus.
- **Configurable usage limit** — Set how long you're allowed to browse (default: 60 minutes, range 1–120).
- **Configurable break duration** — Set how long your mandatory break lasts (default: 5 minutes, range 1–30).
- **Rotating fat cat GIFs** — When time's up, a fat cat GIF covers the screen with a countdown. A new GIF appears every 30 seconds.
- **Semi-transparent overlay** — The page content partially shows through so you know what you're missing.
- **Live countdown** — The popup and overlay both show a ticking countdown so you know exactly when you'll be free.
- **Fresh start after break** — The usage timer resets once the break is complete.
- **Supported platforms** — X (Twitter), Instagram, TikTok, YouTube.
- **Chrome + Firefox** — Builds for Chrome MV3 and Firefox MV2.
- **Privacy-first** — No data is collected or transmitted. All state lives in your browser's local storage. Giphy GIFs are loaded directly — no tracking or API key required.

## How It Works

1. You browse social media as usual.
2. The extension silently tracks active tab time on supported sites.
3. When your usage limit is reached, a fat cat overlay blocks the page.
4. The cat GIFs rotate every 30 seconds. A countdown begins — you can't dismiss it.
5. Once the countdown finishes, the cat disappears and the timer resets.

## Development

### Prerequisites

- Node.js 22+
- A Chromium-based browser (Chrome, Edge, Brave, etc.) or Firefox

### Setup

```bash
git clone https://github.com/amirulabu/cat-say-stop.git
cd cat-say-stop
npm install
```

### Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev mode with HMR (Chrome) |
| `npm run dev:firefox` | Start dev mode with HMR (Firefox) |
| `npm run build` | Production build → `.output/chrome-mv3/` |
| `npm run build:firefox` | Production build → `.output/firefox-mv2/` |
| `npm run zip` | Build + zip Chrome extension |
| `npm run zip:firefox` | Build + zip Firefox extension |
| `npm run sign:firefox` | Build + sign for Firefox self-distribution |
| `npm run compile` | TypeScript type-check only |

### Load the extension

**Chrome**
1. Run `npm run build` (or `npm run dev`)
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** and select `.output/chrome-mv3/`

**Firefox (temporary, for development)**
1. Run `npm run build:firefox` (or `npm run dev:firefox`)
2. Open `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on** and select `.output/firefox-mv2/manifest.json`

### Sign and install permanently in Firefox

Firefox requires all extensions to be signed by Mozilla before permanent installation.

1. Get API credentials at https://addons.mozilla.org/developers/addon/api/key/
2. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
3. Sign and download the signed `.xpi`:
   ```bash
   npm run sign:firefox
   ```
4. Install the `.xpi` from `web-ext-artifacts/`:
   - Open `about:addons`
   - Click the gear icon → **Install Add-on From File...**
   - Select the signed `.xpi`

> **Note:** First-time submissions go through manual review (may take hours). For instant self-distribution, use `--channel unlisted` (already the default in the script).

## Tech Stack

- [WXT](https://wxt.dev) — Browser extension framework
- [React 19](https://react.dev) — Popup UI
- [TypeScript](https://www.typescriptlang.org) — Type safety
- [Giphy](https://giphy.com) — Rotating fat cat GIFs (no API key needed)

## License

MIT
