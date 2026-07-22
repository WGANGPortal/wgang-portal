const CACHE_NAME = "wgang-v0.18.0.23";
const APP_SHELL = [
  "/", "/index.html", "/main.css", "/app.js", "/backend.js", "/config.js", "/demo-data.js",
  "/manifest.webmanifest", "/icon-192.png", "/icon-512.png", "/apple-touch-icon.png",
  "/wgang-icon-cream.webp", "/wgang-icon-pink.webp", "/hero-farm-desktop.webp", "/hero-farm-mobile.webp",
  "/01-gjester-i-matbutikk.png", "/02-kake-med-rode-baer.png", "/03-soyabonner.png", "/04-innbygger.png",
  "/05-gulrotter.png", "/06-bacon.png", "/07-gulrotkake.png", "/08-eplejuice.png", "/09-egg.png",
  "/10-frutti-di-mare-pizza.png", "/11-gresskar.png", "/12-hvete.png"
];
self.addEventListener("install", event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))); self.skipWaiting(); });
self.addEventListener("activate", event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(fetch(event.request).then(response => { const copy=response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)); return response; }).catch(() => caches.match(event.request).then(hit => hit || caches.match("/index.html"))));
});
