/* TACHIST service worker — offline app shell + runtime font caching.
   Bump APP_VERSION (here and in index.html) whenever a precached asset
   changes; that rolls users onto the new build and triggers the in-app
   "update available" notice. */
"use strict";

const APP_VERSION = "1.0.0";
const CACHE = "tachist-" + APP_VERSION;

// App shell — everything needed to run with no network. Relative URLs so the
// same worker functions whether the site is served from a domain root or a
// subpath (e.g. GitHub Pages /tachist/).
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./vendor/jszip.min.js",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png",
  "./apple-touch-icon.png",
  "./favicon-32.png",
  "./favicon-16.png"
];

// Origins whose responses we cache lazily (Google Fonts CSS + font files).
const RUNTIME_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      // Don't let one missing/optional asset abort the whole install.
      .then(cache => Promise.allSettled(SHELL.map(url => cache.add(url))))
    // Note: no skipWaiting() here — a new worker waits until the user accepts
    // the update (or all tabs close), so we never swap the app out underfoot.
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// The page posts this when the user taps "Reload" on the update notice.
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Navigations: serve cached shell first, fall back to network, then index.
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match("./index.html").then(cached => cached || fetch(req).catch(() => caches.match("./")))
    );
    return;
  }

  // Same-origin assets: cache-first (the shell is fully precached).
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetchAndCache(req))
    );
    return;
  }

  // Google Fonts (and other allowed CDNs): cache-first, populate on first online use.
  if (RUNTIME_HOSTS.includes(url.hostname)) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetchAndCache(req))
    );
    return;
  }
  // Everything else: straight through.
});

function fetchAndCache(req) {
  return fetch(req).then(res => {
    // Cache successful basic/cors/opaque responses for next time.
    if (res && (res.ok || res.type === "opaque")) {
      const copy = res.clone();
      caches.open(CACHE).then(cache => cache.put(req, copy));
    }
    return res;
  });
}
