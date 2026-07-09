// @ts-nocheck
const CACHE_NAME = 'store-v1.0.3'; 

      const assetsToStore = [
        '/',
        // '/index.html',
        '/https://fonts.googleapis.com',
        '/https://fonts.gstatic.com',
        '/https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap',     
      ];


// Listen for the user's permission message from brain.js
self.addEventListener('install',(e)=>{
  console.log("yes")
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache)=>{
      cache.addAll(assetsToStore)
    })
  )
})

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      const fetchRequest = e.request.clone();
      
      // NOTICE: We handle network errors with a .catch() at the end of the fetch chain
      return fetch(fetchRequest)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });

          return response;
        })
        .catch((err) => {
          console.warn("Network fetch failed; serving offline fallback or failing gracefully:", err);
          
          // OPTIONAL: If the request is a web page, you can serve a cached offline page instead:
          // if (e.request.mode === 'navigate') {
          //   return caches.match('/offline.html');
          // }
          
          // Or just let it fail without throwing unhandled exceptions in the console
          return Object.assign(new Response("Network error occurred"), { status: 503 });
        });
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});