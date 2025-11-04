// ============================================
// SERVICE WORKER - ConectaLab PWA
// ============================================

const CACHE_NAME = 'conectalab-v1.0.0';
const RUNTIME_CACHE = 'conectalab-runtime';

// Assets estáticos para cachear
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/main.js',
  '/manifest.json',
  '/img/favicon.png',
  '/pages/servicios.html',
  '/pages/sobre.html',
  '/pages/contacto.html',
  // Bootstrap CSS (cachear para offline)
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  // Bootstrap Icons
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css',
  // Google Fonts (cachear)
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'
];

// Estrategia: Cache First con fallback a Network
const CACHE_FIRST_PATTERNS = [
  /\.(?:jpg|jpeg|png|gif|webp|svg|ico)$/,
  /\.(?:css|js)$/,
  /fonts\.googleapis\.com/,
  /cdn\.jsdelivr\.net/
];

// Estrategia: Network First con fallback a Cache
const NETWORK_FIRST_PATTERNS = [
  /\.html$/,
  /\/api\//
];

// ============================================
// INSTALL - Cachear assets estáticos
// ============================================
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cacheando assets estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[Service Worker] Error al cachear:', error);
      })
  );
});

// ============================================
// ACTIVATE - Limpiar caches antiguos
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[Service Worker] Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// ============================================
// FETCH - Estrategias de cache
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests no GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar chrome-extension y otros protocolos
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determinar estrategia basada en el tipo de recurso
  if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname) || pattern.test(url.hostname))) {
    // Cache First para assets estáticos
    event.respondWith(cacheFirst(request));
  } else if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    // Network First para HTML y APIs
    event.respondWith(networkFirst(request));
  } else {
    // Default: Network First con fallback
    event.respondWith(networkFirst(request));
  }
});

// ============================================
// ESTRATEGIA: Cache First
// ============================================
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[Service Worker] Error en cacheFirst:', error);
    // Retornar página offline si es HTML
    if (request.headers.get('accept').includes('text/html')) {
      return cache.match('/index.html');
    }
    throw error;
  }
}

// ============================================
// ESTRATEGIA: Network First
// ============================================
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[Service Worker] Network falló, usando cache:', error);
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    // Fallback para HTML
    if (request.headers.get('accept').includes('text/html')) {
      const fallback = await caches.match('/index.html');
      if (fallback) return fallback;
    }
    throw error;
  }
}

// ============================================
// MESSAGE - Manejo de mensajes del cliente
// ============================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

