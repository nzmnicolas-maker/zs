const CACHE_NAME = "pontofacil-v2"; // Incrementado para limpar o cache antigo do modelo de 4 pontos
const ASSETS = [
  "./",
  "./index.html",
  "./script.js",
  "./manifest.json"
];

// Instalação e armazenamento em Cache
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Limpeza de caches antigos automaticamente
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia: Tenta Rede, se falhar ou estiver offline, busca no Cache imediatamente
self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});
