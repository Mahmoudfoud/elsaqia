// ═══════════════════════════════════════════
// ELSAQIA SERVICE WORKER v4
// ═══════════════════════════════════════════
const CACHE = 'elsaqia-v4';
const CORE = [
  './elsaqia_v4.html',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
];

// تثبيت — نحفظ الملفات الأساسية في الـ cache
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      return Promise.allSettled(
        CORE.map(url => c.add(url).catch(() => {}))
      );
    })
  );
  self.skipWaiting();
});

// تفعيل — نمسح الـ cache القديم
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — نحاول من الإنترنت الأول، لو فشل نرجع من الـ cache
self.addEventListener('fetch', e => {
  // Firebase calls دايماً من الإنترنت
  if (e.request.url.includes('firebase') ||
      e.request.url.includes('googleapis.com/identitytoolkit') ||
      e.request.url.includes('firestore.googleapis.com')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // نحفظ نسخة في الـ cache
        if (res.ok && e.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
