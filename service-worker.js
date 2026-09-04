const CACHE_NAME = "wgang-v0.18.0.72-private-wiki-video";
const APP_SHELL = [
  "/", "/index.html", "/privacy.html", "/rules.html", "/main.css?v=0.18.0.72",
  "/app.js?v=0.18.0.72", "/backend.js?v=0.18.0.72", "/config.js?v=0.18.0.60",
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


// v0.18.0.71 – numerisk appmerke for installert PWA (iOS + Android)
const BADGE_DB_NAME = "wgang-app-badge";
const BADGE_STORE_NAME = "state";

function openBadgeDatabase(){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(BADGE_DB_NAME,1);
    request.onupgradeneeded=()=>{
      if(!request.result.objectStoreNames.contains(BADGE_STORE_NAME)){
        request.result.createObjectStore(BADGE_STORE_NAME);
      }
    };
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
}

async function storeBadgeCount(nextCount){
  const safeCount=Math.max(0,Math.min(999,Number(nextCount)||0));
  const db=await openBadgeDatabase();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(BADGE_STORE_NAME,"readwrite");
    tx.objectStore(BADGE_STORE_NAME).put(safeCount,"count");
    tx.oncomplete=()=>{db.close();resolve(safeCount);};
    tx.onerror=()=>{db.close();reject(tx.error);};
    tx.onabort=()=>{db.close();reject(tx.error);};
  });
}

async function incrementBadgeCount(){
  const db=await openBadgeDatabase();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(BADGE_STORE_NAME,"readwrite");
    const store=tx.objectStore(BADGE_STORE_NAME);
    const request=store.get("count");
    let count=1;
    request.onsuccess=()=>{
      count=Math.max(1,Math.min(999,(Number(request.result)||0)+1));
      store.put(count,"count");
    };
    tx.oncomplete=()=>{db.close();resolve(count);};
    tx.onerror=()=>{db.close();reject(tx.error);};
    tx.onabort=()=>{db.close();reject(tx.error);};
  });
}

async function showBadgeCount(count){
  const safeCount=Math.max(0,Math.min(999,Number(count)||0));
  if(safeCount>0 && typeof self.navigator.setAppBadge==="function"){
    await self.navigator.setAppBadge(safeCount);
  }else if(safeCount===0 && typeof self.navigator.clearAppBadge==="function"){
    await self.navigator.clearAppBadge();
  }
}

async function receiveNewBadge(data){
  const supplied=Number(data?.badgeCount);
  const count=Number.isFinite(supplied)&&supplied>0
    ?await storeBadgeCount(supplied)
    :await incrementBadgeCount();
  await showBadgeCount(count);
}

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

  event.waitUntil(Promise.all([
    self.registration.showNotification(title, options),
    receiveNewBadge(data).catch(() => {})
  ]));
});

self.addEventListener("message",event=>{
  if(event.data?.type!=="WGANG_SYNC_APP_BADGE") return;
  event.waitUntil((async()=>{
    const count=await storeBadgeCount(event.data.count);
    await showBadgeCount(count);
  })().catch(()=>{}));
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
