const CACHE='soja-campo-v8-3';
const APP_ASSETS=['./','./index.html','./manifest.json','./icon.svg'];
const LEAFLET_ASSETS=['https://unpkg.com/leaflet@1.9.4/dist/leaflet.js','https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'];
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);for(const asset of APP_ASSETS){try{await cache.add(asset)}catch(e){}}await self.skipWaiting()})()));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('soja-campo-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin===self.location.origin){
    const isNavigation=event.request.mode==='navigate';
    if(isNavigation){event.respondWith((async()=>{try{const response=await fetch(event.request);if(response&&response.ok){const cache=await caches.open(CACHE);cache.put('./index.html',response.clone()).catch(()=>{})}return response}catch(error){return (await caches.match(event.request))||(await caches.match('./index.html'))}})());return}
    event.respondWith((async()=>{const cached=await caches.match(event.request);if(cached)return cached;try{const response=await fetch(event.request);if(response&&response.ok){const cache=await caches.open(CACHE);cache.put(event.request,response.clone()).catch(()=>{})}return response}catch(error){return cached||Response.error()}})());return;
  }
  if(LEAFLET_ASSETS.includes(url.href)){event.respondWith((async()=>{const cache=await caches.open(CACHE);const cached=await cache.match(event.request);try{const response=await fetch(event.request);if(response&&(response.ok||response.type==='opaque'))cache.put(event.request,response.clone()).catch(()=>{});return response}catch(error){if(cached)return cached;throw error}})())}
});
