const C='karada-dashboard-v10';
const AS=['./','index.html','styles.css','app.js','data.js','nl-recipes.js','training-data.js','training.js','manifest.webmanifest','Screenshot 2026-04-08 162514.png','coach-portal/','coach-portal/index.html','coach-portal/styles.css','coach-portal/app.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(C).then(cache=>cache.addAll(AS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==C).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(C).then(cache=>cache.put('index.html',copy));return response}).catch(()=>caches.match('index.html')));
    return;
  }
  event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(C).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request)));
});
