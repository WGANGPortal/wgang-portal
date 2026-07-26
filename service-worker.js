const CACHE_NAME = "wgang-v0.18.0.45-weekly-derby-transition";
const APP_SHELL = [
  "/", "/index.html", "/main.css", "/app.js", "/backend.js", "/config.js",
  "/manifest.webmanifest", "/icon-192.png", "/icon-512.png", "/apple-touch-icon.png",
  "/wgang-icon-cream.webp", "/wgang-icon-pink.webp", "/hero-farm-desktop.webp", "/hero-farm-mobile.webp",
  "/01-gjester-i-matbutikk.png",
  "/02-kake-med-rode-baer.png",
  "/03-soyabonner.png",
  "/04-innbygger.png",
  "/05-gulrotter.png",
  "/18-bacon.png",
  "/07-gulrotkake.png",
  "/19-eplejuice.png",
  "/09-egg.png",
  "/10-frutti-di-mare-pizza.png",
  "/11-gresskar.png",
  "/12-hvete.png",
  "/13-cowboy.png",
  "/14-bla-ullue.png",
  "/15-kino.png",
  "/16-bomullsskjorte.png",
  "/17-sesam-is.png",
  "/20-mat-dyr.png",
  "/21-sesamkrokan.png",
  "/22-sushirull.png",
  "/23-salat.png",
  "/24-tofupolse.png",
  "/25-bomull.png",
  "/26-stekte-tomater.png",
  "/27-gresskarpai.png",
  "/28-stormester.png",
  "/29-bringebaermuffins.png",
  "/task-bacon.webp",
  "/task-bla-ullue.webp",
  "/task-bomull.webp",
  "/task-bomullsskjorte.webp",
  "/task-bringebaermuffins.webp",
  "/task-cowboy.webp",
  "/task-egg.webp",
  "/task-eplejuice.webp",
  "/task-frutti-di-mare-pizza.webp",
  "/task-gjester-i-matbutikk.webp",
  "/task-gresskar.webp",
  "/task-gresskarpai.webp",
  "/task-gulrotkake.webp",
  "/task-gulrotter.webp",
  "/task-hvete.webp",
  "/task-innbygger.webp",
  "/task-kake-med-rode-baer.webp",
  "/task-kino.webp",
  "/task-mat-dyr.webp",
  "/task-salat.webp",
  "/task-sesam-is.webp",
  "/task-sesamkrokan.webp",
  "/task-soyabonner.webp",
  "/task-stekte-tomater.webp",
  "/task-stormester.webp",
  "/task-sushirull.webp",
  "/task-tofupolse.webp",
  "/task-melk.webp",
  "/task-ananas.webp",
  "/task-skuespillerinne.webp",
  "/task-lastebilleveranser.webp",
  "/task-indigo.webp",
  "/task-toffee.webp",
  "/task-ananasjus.webp",
  "/task-malm.webp",
  "/task-chilipepper.webp",
  "/task-fisk-med-sluk.webp",
  "/task-sukkerror.png",
  "/task-rustikk-bukett.png",
  "/task-dame.png",
  "/task-danser.png",
  "/task-ris.png",
  "/task-popkorn-med-smor.png",
  "/task-genser.png",
  "/task-bygjester-kafe.png",
  "/task-bjornebaer-muffins.png",
  "/task-olivenolje.png"
];
self.addEventListener("install", event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))); self.skipWaiting(); });
self.addEventListener("activate", event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(fetch(event.request).then(response => { const copy=response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)); return response; }).catch(() => caches.match(event.request).then(hit => hit || caches.match("/index.html"))));
});


// v0.18.0.39 – Web Push / PWA foundation (iOS + Android)
self.addEventListener("push", event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch(e) {
    data = { body: event.data ? event.data.text() : "Nytt varsel fra WGANG Portal" };
  }

  const title = data.title || "WGANG Portal";
  const options = {
    body: data.body || "Du har et nytt varsel.",
    icon: data.icon || "/icon-192.png",
    badge: data.badge || "/icon-192.png",
    tag: data.tag || "wgang-notification",
    renotify: true,
    data: {
      url: data.url || "/",
      route: data.route || null,
      entryId: data.entryId || null,
      commentId: data.commentId || null
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const d = event.notification.data || {};
  const url = new URL(d.url || "/", self.location.origin);
  if (d.route) url.hash = d.route;
  if (d.entryId) url.searchParams.set("focusEntry", d.entryId);
  if (d.commentId) url.searchParams.set("focusComment", d.commentId);

  event.waitUntil((async()=>{
    const all = await clients.matchAll({type:"window", includeUncontrolled:true});
    for (const client of all) {
      if ("focus" in client) {
        await client.focus();
        client.postMessage({
          type:"WGANG_NOTIFICATION_FOCUS",
          route:d.route,
          entryId:d.entryId,
          commentId:d.commentId
        });
        return;
      }
    }
    if (clients.openWindow) await clients.openWindow(url.toString());
  })());
});
