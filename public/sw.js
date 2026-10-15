// Service Worker for Pizza Nova (مطعم بيتزا نوڤا)
// Handles browser push & recurring order reminder notifications

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/menu';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('push', (event) => {
  let data = {
    title: '🍕 اشتقنا لك في بيتزا نوڤا!',
    body: 'حان وقت وجبتك المفضلة! اطلب مسبقاً الآن واستلمها ساخنة وطازجة بدون انتظار.',
    url: '/menu',
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/favicon.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/menu',
      timestamp: Date.now(),
    },
    actions: [
      { action: 'order', title: '🍕 اطلب الآن' },
      { action: 'menu', title: '📋 القائمة' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});
