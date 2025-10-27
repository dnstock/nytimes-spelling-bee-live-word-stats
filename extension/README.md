# NYT Spelling Bee – Word Stats (Chrome Extension)

## Install (Developer Mode)
1. Clone this repository.
1. Visit `chrome://extensions` (Chrome) or `brave://extensions` (Brave).
1. Enable **Developer mode** (top-right).
1. Click **Load unpacked** and select the `\extension\` folder in this repository.
1. Open https://www.nytimes.com/puzzles/spelling-bee and you should see the overlay.
1. Enjoy enhanced gameplay with real-time statistics!

> Tip: If you don’t see the panel right away, wait 1–2 seconds while the game loads.

## Files
- `manifest.json` — MV3 manifest.
- `content.js` — logic that observes the Spelling Bee DOM and draws the stats.
- `styles.css` — scoped styles for the overlay and menu.
- `icons/icon128.png` — extension icon.

## Notes
- Runs only on NYTimes Spelling Bee URLs.
- No special permissions are required.
- Uses a `MutationObserver` to rebuild on changes (new words found, etc.).
