/**
 * Service Worker untuk PWA Offline-First
 * Cache seluruh App Shell dan aset agar aplikasi tetap terbuka tanpa sinyal internet.
 */

const CACHE_NAME = "parking-bay-klb-v2";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/icons/icon.svg",
  "./assets/icons/wbw-logo.svg",
  "./css/main.css",
  "./css/components.css",
  "./css/screens.css",
  "./css/responsive.css",
  "./js/app.js",
  "./js/db.js",
  "./js/geo.js",
  "./js/camera.js",
  "./js/sync.js",
  "./js/data/mock-users.js",
  "./js/screens/login.js",
  "./js/screens/dashboard.js",
  "./js/screens/attendance.js",
  "./js/screens/patrol.js",
  "./js/screens/occupancy.js",
  "./js/screens/cleaning.js",
  "./js/screens/defect.js",
  "./js/screens/handover.js",
  "./js/screens/vehicle-guide.js",
  "./js/screens/analytics.js",
  "./js/screens/sos.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching App Shell assets...");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Strategi: Network First dengan fallback ke Cache jika offline
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
