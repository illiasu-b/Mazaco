// ── MAZACO Service Worker ──────────────────────────────────
const CACHE_NAME = "mazaco-v1";

const STATIC_FILES = [
  "/",
  "/index.html",
  "/login.html",
  "/style.css",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// ── INSTALL ───────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching static files");
      return cache.addAll(STATIC_FILES);
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE — clean old caches ───────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── FETCH — cache first, fallback to network ──────────────
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Skip Firebase and Google API calls — always needs network
  const url = event.request.url;
  if (url.includes("firestore.googleapis.com")) return;
  if (url.includes("firebase")) return;
  if (url.includes("googleapis.com")) return;
  if (url.includes("gstatic.com")) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // Serve cached, update in background
        fetch(event.request)
          .then((response) => {
            if (response && response.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, response.clone());
              });
            }
          })
          .catch(() => {});
        return cached;
      }

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200) return response;
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, copy);
          });
          return response;
        })
        .catch(() => {
          // Offline fallback — serve login page for HTML requests
          if (event.request.destination === "document") {
            return caches.match("/login.html");
          }
        });
    })
  );
});