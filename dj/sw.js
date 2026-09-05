const CACHE_NAME = "dj-ai-v3";
const APP_SHELL = [
  "./dj.html",
  "./dj-config.js",
  "./manifest.webmanifest",
  "./icons/dj-ai-192.svg",
  "./icons/dj-ai-512.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const networkFirst = request.destination === "document" || /\\/dj-(config|client|turnstile-client)\\.js$/i.test(url.pathname);
  event.respondWith(
    networkFirst
      ? fetch(request).then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        }).catch(() => caches.match(request).then(cached => cached || caches.match("./dj.html")))
      : caches.match(request).then(cached => cached || fetch(request).then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        }).catch(() => caches.match("./dj.html")))
  );
});