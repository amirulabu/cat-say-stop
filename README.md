# Cat Say Stop

A browser extension that forces you to take a 5-minute break from social media — with a cat as your gatekeeper.

## Features

- **Active tab tracking** — Only counts time when a social media tab is actively focused. Timer pauses when you switch away.
- **Configurable usage limit** — Set how long you're allowed to browse (default: 60 minutes).
- **Configurable break duration** — Set how long your mandatory break lasts (default: 5 minutes).
- **Cat overlay** — When time's up, a cat takes over your screen. You can't access social media until the countdown ends.
- **Fresh start after break** — The usage timer resets once the break is complete.
- **Supported platforms** — X (Twitter), Instagram, TikTok, YouTube.
- **Privacy-first** — No data is collected or transmitted. Page access permission is used solely to display the break overlay.

## How It Works

1. You browse social media as usual.
2. The extension silently tracks active tab time on supported sites.
3. When your usage limit is reached, a cat overlay blocks the page.
4. A countdown (default 5 minutes) begins. You can't dismiss it.
5. Once the countdown finishes, the cat disappears and the timer resets.

## Development

### Prerequisites

- A Chromium-based browser (Chrome, Edge, Brave, etc.)

### Load the extension

1. Clone this repository
2. Open `chrome://extensions` in your browser
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked** and select this project directory

## License

MIT
