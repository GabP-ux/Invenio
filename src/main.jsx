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

function App () {
  if (loadError.value) return <div class="shell"><div class="empty">{loadError.value}<div style="margin-top:16px"><button class="btn primary" onClick={() => location.reload()}>Riprova</button></div></div></div>
  if (!index.value || !ready.value) return <div class="shell"><div class="empty mono">invenio…</div></div>
  const { name, params } = current.value
  const tab = name === 't' ? 'feed' : name
  let screen
  if (name === 't') screen = <Detail id={params[0]} />
  else if (name === 'mappa') screen = <MapScreen focus={params[0]} />
  else if (name === 'quiz') screen = <Quiz />
  else if (name === 'salvati') screen = <Saved />
  else screen = <Feed />
  return <div class="shell">{screen}<Nav current={tab} /></div>
}

render(<App />, document.getElementById('app'))
loadState()
loadData()
