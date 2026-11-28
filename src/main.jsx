import { render } from 'preact'
import './styles.css'
import { current } from './router'
import { loadData, index, loadError } from './data'
import { loadState, ready } from './store'
import { Nav } from './components/ui'
import { Feed } from './screens/Feed'
import { Detail } from './screens/Detail'
import { MapScreen } from './screens/MapScreen'
import { Quiz } from './screens/Quiz'
import { Saved } from './screens/Saved'
import { Settings } from './screens/Settings'
import { PathPage } from './screens/Paths'
import { state } from './store'
import { effect } from '@preact/signals'

function App () {
  if (loadError.value) return <div class="shell"><div class="empty">{loadError.value}<div style="margin-top:16px"><button class="btn primary" onClick={() => location.reload()}>Riprova</button></div></div></div>
  if (!index.value || !ready.value) return <div class="shell"><div class="empty mono">invenio…</div></div>
  const { name, params } = current.value
  const tab = name === 't' || name === 'percorso' ? 'feed' : name
  let screen
  if (name === 't') screen = <Detail id={params[0]} path={params[1]} />
  else if (name === 'mappa') screen = <MapScreen focus={params[0]} />
  else if (name === 'quiz') screen = <Quiz />
  else if (name === 'salvati') screen = <Saved />
  else if (name === 'impostazioni') screen = <Settings />
  else if (name === 'percorso') screen = <PathPage id={params[0]} />
  else screen = <Feed />
  return <div class="shell">{screen}<Nav current={tab} /></div>
}

// impostazione "riduci le animazioni"
effect(() => { document.documentElement.classList.toggle('calm', !!state.value.settings?.calm) })

render(<App />, document.getElementById('app'))
loadState()
loadData()
