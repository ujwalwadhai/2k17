const CACHE_NAME = 'offline-cache-v1';
const OFFLINE_URL = '/offline.html';
const OFFLINE_ASSETS = [OFFLINE_URL, '/favicon.ico'];

self.addEventListener('install', event => {
    console.log('[Service Worker] Installing Service Worker ...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(OFFLINE_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating Service Worker ...');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request).catch(() => {
            if (event.request.mode === 'navigate') {
                // For page navigations, return offline fallback
                return caches.match(OFFLINE_URL);
            } else if (event.request.url.endsWith('/favicon.ico')) {
                // Fallback for favicon
                return caches.match('/favicon.ico');
            }

            // Default fallback: return empty response (to prevent TypeError)
            return new Response('', { status: 204 });
        })
    );
});

// === Push Notification Handling ===
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
            console.error('[Service Worker] Push event data is not JSON', e);
            data.body = event.data.text();
        }
    }

    const title = data.title;
    const options = {
        body: data.body,
        icon: data.icon || '/images/web_logo.png',
        badge: data.badge || '/images/web_logo.png',
        tag: data.tag || 'general-notification',
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
