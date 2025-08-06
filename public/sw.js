const CACHE_NAME = `2k17-06-08-2025`; // Add date when you are commiting so that cache of users will be updated on deployment
const URLS_TO_CACHE = [
  '/',
  '/fonts/Lato.ttf',
  '/icons/css/all.css',
  '/icons/webfonts/fa-brands-400.woff2',
  '/icons/webfonts/fa-light-300.woff2',
  '/icons/webfonts/fa-solid-900.woff2',
  '/icons/webfonts/fa-brands-400.ttf',
  '/icons/webfonts/fa-light-300.ttf',
  '/icons/webfonts/fa-solid-900.ttf',
  '/styles/css/theme.css',
  '/images/web_logo.png',
  '/images/icons/logo_72x72.png',
  '/images/icons/logo_96x96.png',
  '/images/icons/maskable_icon.png',
  '/favicon.ico',
  './offline.html'
];

self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[Service Worker] Caching App Shell');
            return cache.addAll(URLS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
                          .map(cacheName => caches.delete(cacheName))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    if (event.request.destination === 'style' || event.request.destination === 'script') {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(event.request).then(cachedResponse => {
                    const fetchPromise = fetch(event.request).then(networkResponse => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }

    if (['image', 'font', 'manifest'].includes(event.request.destination)) {
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request);
            })
        );
        return;
    }

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(OFFLINE_URL);
            })
        );
        return;
    }

    event.respondwith(
        fetch(event.request).catch(() => {
            if (event.request.url.endsWith('/favicon.ico')) {
                return caches.match('/favicon.ico');
            }
            return new Response('', { status: 204 });
        })
    );
});


self.addEventListener('push', event => {
    console.log('[Service Worker] Push Received.');
    let data = {
        title: 'New Notification',
        body: 'Something new happened!',
        icon: '/images/web_logo.png',
        url: '/'
    };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const title = data.title;
    const options = {
        body: data.body,
        icon: data.icon || '/images/web_logo.png',
        badge: '/images/icons/2k17.png',
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
    console.log('[Service Worker] Notification click Received.');
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            const urlToOpen = event.notification.data.url || '/';
            for (const client of clientList) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

self.addEventListener('message', event => {
  if (event.data && event.data.action === 'clear-notifications') {
    self.registration.getNotifications().then(notifications => {
      notifications.forEach(notification => {
        notification.close();
      });
    });
  }
});
