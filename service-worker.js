const C='karada-dashboard-v11';
const AS=['./','index.html','styles.css','app.js','data.js','nl-recipes.js','training-data.js','training.js','manifest.webmanifest','Screenshot 2026-04-08 162514.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(C).then(cache=>cache.addAll(AS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==C).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{const copy=response.clone();caches.open(C).then(cache=>cache.put('index.html',copy));return response}).catch(()=>caches.match('index.html')));
    return;
  }
  event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{const copy=response.clone();caches.open(C).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request).then(hit=>hit||caches.match(url.pathname.split('/').pop()))));
});
