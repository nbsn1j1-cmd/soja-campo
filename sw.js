const CACHE='soja-campo-v8-1';
const APP_ASSETS=['./','./index.html','./manifest.json','./icon.svg'];
const LEAFLET_ASSETS=['https://unpkg.com/leaflet@1.9.4/dist/leaflet.js','https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('soja-campo-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin===self.location.origin){
    event.respondWith(caches.match(event.request).then(cached=>{
      const network=fetch(event.request).then(response=>{if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{})}return response}).catch(()=>cached||caches.match('./index.html'));
      return cached||network;
    }));
    return;
  }
  if(LEAFLET_ASSETS.includes(url.href)){
    event.respondWith(caches.open(CACHE).then(async cache=>{
      const cached=await cache.match(event.request);
      try{const response=await fetch(event.request);if(response&&(response.ok||response.type==='opaque'))cache.put(event.request,response.clone()).catch(()=>{});return response}catch(error){if(cached)return cached;throw error}
    }));
  }
});
