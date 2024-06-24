import { getState, setState } from '../utils/state.js'
import { createService } from '../utils/request.js'

const expensesService = createService('http://localhost:3000/expenses')

export function render() {
  return `
    <h1>Expenses!</h1>
    <a href="/incomes">Incomes</a>
    <form>
      <input name="name" />
      <input name="amount" />
      <button>OK</button>
    </form>
    <ul id="mi-lista"></ul>
  `
}

export function init() {
  const { user } = getState()
  console.log(user)
  setState({ address: 'CABA', age: 25 })
  const form = document.querySelector('form')
  form.addEventListener('submit', procesarForm)
  renderExpenses()
}

async function procesarForm(e) {
  e.preventDefault()
  const fd = new FormData(e.target)
  const newIncome = {
    name: fd.get('name'),
    amount: fd.get('amount'),
  }
  console.log(newIncome)
  
  if (navigator.onLine) {
    await expensesService.post(newIncome) // to server
  } else {
    saveDataOffline('offlineExpenses', newIncome)
    console.log('You are offline. The data will be sent when you are online.');
  }

  renderExpenses()
  e.target.reset()
}

async function renderExpenses() {
  const list = document.getElementById('mi-lista')
  let expenses = await expensesService.getAll()
  const offlines = JSON.parse(localStorage.getItem('offlineExpenses')) || []
  expenses = [ ...expenses, ...offlines ]
  list.innerHTML = expenses.map(exp => `<li>${exp.name} ... $${exp.amount}</li>`).join('')
}

function saveDataOffline(storageKey, data) {
  const items = JSON.parse(localStorage.getItem(storageKey)) || [];
  items.push(data);
  localStorage.setItem(storageKey, JSON.stringify(items));
}

