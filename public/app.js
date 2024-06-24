import { router } from './utils/router.js'
import { initializeState } from './utils/state.js'
import { createService, sendOfflineDataToServer } from './utils/request.js'

const expensesService = createService('http://localhost:3000/expenses')
const incomesService = createService('http://localhost:3000/incomes')

window.addEventListener('hashchange', router)

initializeState({
  user: 'robi',
  age: 38
})

router()


window.addEventListener('online', () => {
  sendOfflineDataToServer('offlineExpenses', expensesService)
  sendOfflineDataToServer('offlineIncomes', incomesService)
})


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
    }).catch(error => {
      console.error('Service Worker registration failed:', error);
    });
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('ServiceWorker registration successful with scope:', registration.scope);

      // Check for updates to the service worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            if(confirm('New content is available; please refresh.')) {
              newWorker.postMessage({ action: 'SKIP_WAITING' })
            }
          }
        })
      })

      navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload())
      
    } catch (error) {
      console.error('ServiceWorker registration failed:', error)
    }
  })
}
