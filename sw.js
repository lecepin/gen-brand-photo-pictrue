const CACHE_NAME = "gen-brand-photo-pictrue-res";

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll([
          "./",
          "./index.html",
          "./index.js",
          "./index.css",
          "./simple.jpg",
          "./pkg/gen_brand_photo_pictrue.js",
          "./pkg/gen_brand_photo_pictrue_bg.wasm",
        ])
      )
  );
});

self.addEventListener("activate", (event) => {
  clients.claim();
});

self.addEventListener("fetch", (event) => {
  return event.respondWith(
    caches.match(event.request).then((cacheData) => {
      if (cacheData) {
        return cacheData;
      }

      return fetch(event.request);
    })
  );
});
