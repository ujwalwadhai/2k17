self.addEventListener('install', event => {
    console.log('[Service Worker] Installing Service Worker ...');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating Service Worker ...');
    return self.clients.claim();
});

self.addEventListener('push', event => {
    console.log('[Service Worker] Push Received.');
    let data = { title: 'New Notification', body: 'Something new happened!', icon: '/images/web_logo.png', url: '/' };
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
        data: { // Custom data to pass to notification click event
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
            // If a window with the same URL is already open, focus it.
            if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
            }
        }
        // If no window is open, open a new one.
        if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
        }
        })
    );
});