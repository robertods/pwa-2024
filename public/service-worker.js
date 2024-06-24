const BASIC_CACHE_NAME = 'basic-cache-v1';
const VIEWS_CACHE_NAME = 'views-cache-v1';
const API_EXPENSES_URL = 'http://localhost:3000/expenses';
const API_INCOMES_URL = 'http://localhost:3000/incomes';
const FALLBACK_URL = '/offline.html';

const BASIC_CACHE_FILES = [
  '/', '/index.html', 
  '/style.css', 
  '/app.js', 
  '/utils/request.js', 
  '/utils/router.js', 
  '/utils/state.js', 
  FALLBACK_URL
];

const VIEWS_CACHE_FILES = [
  '/views/expenses.js', 
  '/views/incomes.js'
];

// Install ------------------------

self.addEventListener('install', event => {
  event.waitUntil(Promise.all([
    filesToCache(BASIC_CACHE_NAME, BASIC_CACHE_FILES),
    filesToCache(VIEWS_CACHE_NAME, VIEWS_CACHE_FILES)
  ]));
});

const filesToCache = async (cacheName, cacheFiles) => {
  const cache = await caches.open(cacheName)
  await Promise.all(cacheFiles.map(async file => {
    try {
      await cache.add(file)
    } catch (error) {
      console.error(`Failed to cache ${file} in ${cacheName}: ${error}`)
    }
  }))
}

// Activate ------------------------

self.addEventListener('activate', event => {
  event.waitUntil(clearCache())
  self.clients.claim() // activar sw
})

async function clearCache() {
  const cacheList = [ BASIC_CACHE_NAME, VIEWS_CACHE_NAME ]
  const keys = await caches.keys()
  await Promise.all(keys.map(key => {
    if (!cacheList.includes(key)) { // solo borra cache de la lista
      return caches.delete(key)
    }
  }))
}

// FETCH -------------------------

self.addEventListener('fetch', event => {
  const req = async () => {
    const url = new URL(event.request.url)
    try {
      if (url.href.includes(API_EXPENSES_URL)) return await handleApiRequests(event, 'expenses')
      if (url.href.includes(API_INCOMES_URL)) return await handleApiRequests(event, 'incomes')
      
      if (BASIC_CACHE_FILES.includes(url.pathname)) {
        return await cacheFetchOrFetchAndCache(event, BASIC_CACHE_NAME)
      }
      if (VIEWS_CACHE_FILES.includes(url.pathname)) {
        return await cacheFetchOrFetchAndCache(event, VIEWS_CACHE_NAME)
      }

      const cachedResponse = await caches.match(event.request)
      return cachedResponse || await fetch(event.request)
    } catch {
      return caches.match(FALLBACK_URL)
    }
  }
  event.respondWith(req())
})

async function cacheFetchOrFetchAndCache(event, cacheName) {
  const cache = await caches.open(cacheName)
  const response = await cache.match(event.request)
  if (response) return response
  const fetchResponse = await fetch(event.request)
  await cache.put(event.request, fetchResponse.clone())
  return fetchResponse
}

async function handleApiRequests(event, storeName) {
  try {
    const response = await fetch(event.request)
    const data = await response.clone().json()
    await saveDataToIndexedDB(storeName, data)
    return response
  } catch {
    return await getDataFromIndexedDB(storeName)
  }
}

// Messages -----------------------

self.addEventListener('message', e => {
  if (e.data.action === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Push notifications ----------------

self.addEventListener('push', e => {
  const { title, message } = e.data.json()
  self.registration.showNotification(title, {
    body: message, icon: './images/icons/icon-72x72.png'
  })
  new BroadcastChannel('sw-push-messages').postMessage({ title, message })
})

// IndexedDB ----------------------

const saveDataToIndexedDB = (storeName, data) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('budgetDB', 1)

    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, { keyPath: 'id' })
        store.createIndex('by_id', 'id', { unique: true })
      }
    }

    request.onsuccess = event => {
      const db = event.target.result
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      data.forEach(item => store.put(item))

      transaction.oncomplete = () => resolve()
      transaction.onerror = event => reject(event.target.error)
    }

    request.onerror = event => reject(event.target.errorCode)
  })
};

const getDataFromIndexedDB = storeName => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('budgetDB', 1)

    request.onsuccess = event => {
      const db = event.target.result
      const transaction = db.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const getAllRequest = store.getAll()

      getAllRequest.onsuccess = () => {
        resolve(new Response(JSON.stringify(getAllRequest.result), {
          headers: { 'Content-Type': 'application/json' }
        }))
      }

      getAllRequest.onerror = () => {
        reject(new Response('Error fetching data from IndexedDB', { status: 500 }))
      }
    };

    request.onerror = () => {
      reject(new Response('Error opening IndexedDB', { status: 500 }))
    }
  })
}

