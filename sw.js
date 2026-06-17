const CACHE_NAME = 'pontofacil-ultra-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Instalação - Salva os arquivos essenciais de forma segura
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Mapeia os arquivos individualmente com tratamento de erro para evitar quebras no build
      return Promise.all(
        ASSETS_TO_CACHE.map((asset) => {
          return cache.add(asset).catch((err) => {
            console.warn(`Aviso de Cache: Não foi possível pré-carregar o recurso: ${asset}`, err);
          });
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// Ativação - Limpa caches antigos automaticamente ao atualizar o sistema
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de Requisições - Estratégia de Autocorreção Offline
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não sejam GET ou de protocolos estranhos (extensões, etc)
  if (event.request.method !== 'GET' || (!event.request.url.startsWith(self.location.origin) && !event.request.url.includes('cdnjs.cloudflare.com'))) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Se a resposta da rede for válida, clona e atualiza o cache em segundo plano
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Modo Offline ativo: Busca o recurso no banco de dados de cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback para a página inicial caso seja uma navegação principal perdida
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
