let state = {}

function initializeState(initial) {
  const saved = JSON.parse(localStorage.getItem('state'))
  state = saved || { ...initial }
}

function getState() {
  return state
} 

function setState(newState) {
  state = { ...state, ...newState }
  localStorage.setItem('state', JSON.stringify(state))
}

export { initializeState, getState, setState }
