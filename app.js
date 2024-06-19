import { router } from './router.js'
import { initializeState } from './state.js'

window.addEventListener('hashchange', router)

initializeState({
  user: 'robi',
  age: 38
})

router()

