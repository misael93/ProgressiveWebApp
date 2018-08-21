var dataCacheName = 'premierLeagueMatches';
var cacheName = 'pl-2018-2019-v0.0';

var filesToCache = [
  './',
  './scripts/app.js',
  './styles/myStyle.css',
  './images/afcbournemouth.svg',
  './images/arsenalfc.svg',
  './images/brightonhovealbionfc.svg',
  './images/burnleyfc.svg',
  './images/cardiffcityfc.svg',
  './images/chelseafc.svg',
  './images/crystalpalacefc.svg',
  './images/evertonfc.svg',
  './images/fulhamfc.svg',
  './images/huddersfieldtownafc.svg',
  './images/leicestercityfc.svg',
  './images/liverpoolfc.svg',
  './images/manchestercityfc.svg',
  './images/manchesterunitedfc.svg',
  './images/newcastleunitedfc.svg',
  './images/southamptonfc.svg',
  './images/tottenhamhotspurfc.svg',
  './images/watfordfc.svg',
  './images/westhamunitedfc.svg',
  './images/wolverhamptonwanderersfc.svg',
  './images/logo.png',
  './index.html',
];

self.addEventListener('install', function (e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function (cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function (e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  console.log('[Service Worker] Fetch', e.request.url);
  var dataUrl = 'https://api.football-data.org/v2/competitions/2021/matches';
  if (e.request.url.indexOf(dataUrl) > -1) {
    e.respondWith(
      caches.open(dataCacheName).then(function (cache) {
        return fetch(e.request).then(function (response) {
          cache.put(e.request.url, response.clone());
          return response;
        });
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(function (response) {
        return response || fetch(e.request);
      })
    );
  }
});
