// Router minimo basato sull'hash (#/feed, #/t/lidar …): funziona anche offline e su hosting statico.
import { signal } from '@preact/signals'

const parse = () => {
  const h = location.hash.replace(/^#\/?/, '')
  const [name = 'feed', ...rest] = h.split('/')
  return { name: name || 'feed', params: rest.map(decodeURIComponent) }
}
export const current = signal(parse())
window.addEventListener('hashchange', () => { current.value = parse() })
export const route = (path) => { location.hash = '#/' + path }
// Cambia schermata senza aggiungere un passo alla cronologia (es. selezione sulla mappa)
export const routeReplace = (path) => { history.replaceState(null, '', '#/' + path); current.value = parse() }
