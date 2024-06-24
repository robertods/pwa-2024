import { getState } from '../utils/state.js'

export function render() {
  return `
    <h1>Incomes!</h1>
    <a href="/expenses">Expenses</a>
     <a href="https://wikipedia.org" target="_blank">Wiki</a>
    <form>
      <input name="name" />
      <input name="price" />
      <button>OK</button>
    </form>
    <ul id="mi-lista"></ul>
  `
}

export function init() {
  const all = getState()
  console.log(all)
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