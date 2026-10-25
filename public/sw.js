// HarvestHub stays installable while shopping remains online-only.
// This worker removes the old cache-first pages and API responses.

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((name) => name.startsWith('harvesthub-'))
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});
