// Self-destructing service worker v2: clears all caches, reloads clients, then unregisters
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.map((n) => caches.delete(n))))
      .then(() => self.clients.matchAll({ type: "window", includeUncontrolled: true }))
      .then((clients) => {
        clients.forEach((c) => {
          try { c.navigate(c.url); } catch (e) {}
        });
      })
      .then(() => self.registration.unregister())
  );
});
// Never serve from cache - always pass through to network
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
