export async function router() {
  const { hash } = window.location
  const route = hash ? hash.replace('#/', '') : '/incomes'
  const view = await import(`./views/${route}.js`)
  document.getElementById("root").innerHTML = view.render()
  view.init()

  // los enlaces internos los redirecciona el router
  document.querySelectorAll('a').forEach(link => link.addEventListener('click', e => {
    const { origin } = window.location
    if(e.target.href.includes(origin)) {
      e.preventDefault()
      navigate(e.target.href.replace(origin, ''))
    }
  }))
}

export function navigate(route) {
  window.location.hash = '#' + route
}
