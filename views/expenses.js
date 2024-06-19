import { getState, setState } from '../state.js'

export function render() {
  return `
    <h1>Expenses!</h1>
    <a href="/incomes">Incomes</a>
    <form>
      <input name="name" />
      <input name="price" />
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
}

function procesarForm(e) {
  e.preventDefault()
  const form = new FormData(e.target)
  const newIncome = {
    name: form.get('name'),
    price: form.get('price'),
  }
  console.log(newIncome)
}