import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { cards, breadcrumb, areaColor, levelOf } from '../data'
import { state, markSeen, toggleSave } from '../store'
import { VIS, Visual } from '../diagrams/registry'
import { Icon, WImg, Crumb } from '../components/ui'
import { PathList } from './Paths'

const PACK = 5

// Ordine del giorno: prima le schede mai viste, poi le altre.
// "percorso": le non viste seguono i livelli (Fondamenti → Strumenti → …), mescolate solo dentro lo stesso livello.
// "casuale": le non viste sono mescolate in modo stabile per la giornata.
function dailyOrder (list, seen, mode) {
  const day = new Date().toISOString().slice(0, 10)
  const h = (s) => { let x = 0; for (const ch of day + s) x = (x * 31 + ch.charCodeAt(0)) >>> 0; return x }
  const lv = mode === 'percorso' ? levelOf : () => 0
  const unseen = list.filter(c => !seen[c.id]).sort((a, b) => lv(a) - lv(b) || h(a.id) - h(b.id))
  const old = list.filter(c => seen[c.id]).sort((a, b) => seen[a.id] - seen[b.id])
  return [...unseen, ...old]
}

function FeedItem ({ c, next, onSaved }) {
  const ref = useRef()
  const saved = !!state.value.saved[c.id]
  useEffect(() => {
    let t
    const io = new IntersectionObserver(([e]) => {
      clearTimeout(t)
      if (e.intersectionRatio > 0.6) t = setTimeout(() => markSeen(c.id), 1200)
    }, { threshold: [0, 0.6, 1] })
    io.observe(ref.current)
    return () => { io.disconnect(); clearTimeout(t) }
  }, [c.id])
  const hasVis = !!(c.diagram && VIS[c.diagram])
  const img = c.images[0]
  const color = areaColor(c)
  return (
    <section class="feed-item" ref={ref} aria-label={c.name}>
      <article class="card feed-card rise">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
          <Crumb color={color} text={breadcrumb(c)} />
          {state.value.studied[c.id] && <span class="studied-badge"><Icon.check s={13} />studiata</span>}
        </div>
        <h2>{c.hook}</h2>
        {hasVis
          ? <Visual k={c.diagram} mode="auto" />
          : img && <WImg src={img.src} alt={img.cap} class="feed-photo" style={img.fit === 'contain' ? `object-fit:contain;background:${img.bg};padding:10px` : ''} />}
        <p>{c.short}</p>
        <div class="chips">{c.uses.slice(0, 4).map(u => <span class="chip" key={u}>{u}</span>)}</div>
        <div style="margin-top:auto;display:flex;flex-direction:column;gap:10px">
          <a class="btn primary" href={'#/t/' + c.id}>Come funziona davvero <Icon.arrow /></a>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <button class={'btn' + (saved ? ' on' : '')} aria-pressed={saved} onClick={() => { if (toggleSave(c.id)) onSaved() }}>
              <Icon.bookmark s={18} filled={saved} />{saved ? 'Salvato' : 'Salva'}
            </button>
            <a class="btn" href={'#/mappa/' + c.id}><Icon.map s={18} />Sulla mappa</a>
          </div>
          <div style="display:flex;justify-content:space-between;gap:10px;font-size:11px;color:#A0A7B4">
            <span>Fonte: <a href={c.source.url} target="_blank" rel="noopener">{c.source.title}</a></span>
            {next && <span class="mono" style="white-space:nowrap">↓ {next}</span>}
          </div>
        </div>
      </article>
    </section>
  )
}

export function Feed () {
  // l'ordine si calcola una volta sola, così le schede non si spostano mentre scorri
  const order = useMemo(() => dailyOrder(cards.value, state.value.seen, state.value.settings.feedOrder), [cards.value.length, state.value.settings.feedOrder])
  const [toast, setToast] = useState(0)
  const [tab, setTabS] = useState(() => { try { return localStorage.getItem('feedTab') || 'feed' } catch (e) { return 'feed' } })
  const setTab = (t) => { setTabS(t); try { localStorage.setItem('feedTab', t) } catch (e) {} }
  const today = order.slice(0, PACK)
  const seenToday = today.filter(c => state.value.seen[c.id]).length
  return (
    <div class="screen">
      <header style="padding:10px 16px 6px;display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
          <span style="display:flex;align-items:center;gap:6px;font-family:var(--display);font-size:20px;font-weight:700;letter-spacing:-.5px"><Icon.logo />invenio</span>
          <div class="seg seg-mini" role="group" aria-label="Come vuoi imparare">
            <button aria-pressed={tab === 'feed'} onClick={() => setTab('feed')}>Per te</button>
            <button aria-pressed={tab === 'paths'} onClick={() => setTab('paths')}>Percorsi</button>
          </div>
          <a class="icon-btn" href="#/impostazioni" aria-label="Impostazioni" style="color:#A0A7B4"><Icon.gear /></a>
        </div>
        {tab === 'feed' && <div style="display:flex;align-items:center;gap:10px">
          <div class="progress" style={{ gridTemplateColumns: `repeat(${today.length},1fr)`, flex: 1 }} aria-hidden="true">
            {today.map((c) => <div key={c.id} class={state.value.seen[c.id] ? 'on' : ''} />)}
          </div>
          <span class="mono muted" style="font-size:10.5px;white-space:nowrap">OGGI {seenToday}/{today.length}</span>
        </div>}
      </header>
      {tab === 'paths' ? <PathList /> : <main class="feed hide-sb">
        {order.map((c, i) => <FeedItem key={c.id} c={c} next={order[i + 1]?.name} onSaved={() => setToast(Date.now())} />)}
        <section class="feed-item"><div class="card feed-card" style="align-items:center;justify-content:center;text-align:center">
          <h2>Hai visto tutto, per ora</h2>
          <p>Nuove schede arriveranno con i prossimi pacchetti. Intanto ripassa con il quiz o esplora la mappa.</p>
          <div style="display:flex;gap:8px"><a class="btn primary" href="#/quiz">Vai al quiz</a><a class="btn" href="#/mappa">Mappa</a></div>
        </div></section>
      </main>}
      {toast > 0 && <div class="toast" key={toast} role="status">Salvato in "Senza cartella" <a href="#/salvati">Scegli cartella</a></div>}
    </div>
  )
}
