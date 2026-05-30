# TACHIST

A tachistoscopic (RSVP) reader for EPUB files. Drop in a `.epub` and it
flashes one word at a time, pinned to a fixed point with the optimal
recognition point letter highlighted, so your eyes never have to travel
across the page.

Everything runs in the browser — EPUBs are unzipped and parsed locally
([JSZip](https://stuk.github.io/jszip/)), and nothing is ever uploaded.

## Features

- Drag-and-drop or browse for any `.epub` (EPUB 2 NCX and EPUB 3 nav tables of contents supported)
- Adjustable speed from 100–1000 WPM, with quick presets
- Smart pacing — longer words, clause breaks, sentence ends, and paragraph breaks each get extra dwell time
- Table of contents, progress scrubber, and a live session readout (% complete, time left, words read)
- Pause to reveal the surrounding sentence; tap any word to jump back to it
- Keyboard controls: `Space` play/pause · `⌫` back a sentence · `←`/`→` nudge · `↑`/`↓` speed · `,`/`.` chapters
- Try it without a file via the built-in sample passage
- **Resume where you left off** — the open book and your position, speed, and progress are saved locally and restored on reload (Eject to forget it)
- **Installable, offline-first PWA** — add it to your home screen and it runs with no network

## Install & offline use

TACHIST is a Progressive Web App. Once you've loaded it over HTTPS (e.g. the
GitHub Pages URL) the service worker (`sw.js`) caches the whole app shell, so it
keeps working with no connection.

- **iOS/iPadOS (Safari):** Share → **Add to Home Screen**.
- **Android (Chrome):** menu → **Install app** / **Add to Home Screen**.
- **Desktop (Chrome/Edge):** the install icon in the address bar.

JSZip is vendored locally (`vendor/jszip.min.js`), so EPUB parsing works fully
offline. The web fonts are loaded from Google Fonts and cached on first online
visit; until then (or if you're offline on the very first run) the app falls
back to system fonts and still functions normally.

The current build number shows in the footer (e.g. `v1.0.0`). When a new
version has been deployed, opening the app (while online) surfaces an
**"A new version is available — Reload"** notice; tap it to update in place,
and you'll see an **"Updated to vX ✓"** confirmation. To cut a new release,
bump `APP_VERSION` in both `index.html` and `sw.js`.

## Running locally

It's a single static file. Open `index.html` in a browser, or serve the
folder:

```sh
python3 -m http.server
```

then visit http://localhost:8000.

## Publishing with GitHub Pages

A workflow at `.github/workflows/pages.yml` deploys the site automatically.
To turn it on once:

1. Go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.

Every push to the default branch then publishes the site.
