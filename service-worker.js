const CACHE='kak-uvidet-zapah-pwa-v2-fast';
const SHELL=['./','./index.html','./manifest.webmanifest','./offline.html','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
async function cacheFirst(req){const c=await caches.open(CACHE);const hit=await c.match(req);if(hit)return hit;const res=await fetch(req);if(res&&res.ok)c.put(req,res.clone());return res;}
async function networkFirst(req){const c=await caches.open(CACHE);try{const res=await fetch(req);if(res&&res.ok)c.put(req,res.clone());return res;}catch(e){return (await c.match(req))||(await c.match('./offline.html'));}}
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==self.location.origin)return;
  const path=url.pathname;
  if(req.mode==='navigate'){
    if(path.includes('/halls/')) event.respondWith(cacheFirst(req).catch(()=>caches.match('./offline.html')));
    else event.respondWith(networkFirst(req));
    return;
  }
  if(path.includes('/assets/')||path.includes('/icons/')){event.respondWith(cacheFirst(req));return;}
  event.respondWith(cacheFirst(req));
});
