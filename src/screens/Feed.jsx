import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { cards, breadcrumb, areaColor } from '../data'
import { state, markSeen, toggleSave } from '../store'
import { ANIM, CAPTION } from '../diagrams'
import { Icon, WImg, Crumb } from '../components/ui'

const PACK = 5

// Ordine del giorno: prima le schede mai viste (mescolate in modo stabile per la giornata), poi le altre.
function dailyOrder (list, seen) {
  const day = new Date().toISOString().slice(0, 10)
  const h = (s) => { let x = 0; for (const ch of day + s) x = (x * 31 + ch.charCodeAt(0)) >>> 0; return x }
  const unseen = list.filter(c => !seen[c.id]).sort((a, b) => h(a.id) - h(b.id))
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
  const A = c.diagram && ANIM[c.diagram]
  const img = c.images[0]
  const color = areaColor(c)
  return (
    <section class="feed-item" ref={ref} aria-label={c.name}>
      <article class="card feed-card rise">
        <Crumb color={color} text={breadcrumb(c)} />
        <h2>{c.hook}</h2>
        {A
          ? <figure class="fig"><A /><figcaption>{CAPTION[c.diagram]}</figcaption></figure>
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
  const order = useMemo(() => dailyOrder(cards.value, state.value.seen), [cards.value.length])
  const [toast, setToast] = useState(0)
  const today = order.slice(0, PACK)
  const seenToday = today.filter(c => state.value.seen[c.id]).length
  return (
    <div class="screen">
      <header style="padding:14px 20px 8px;display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span style="display:flex;align-items:center;gap:8px;font-family:var(--display);font-size:22px;font-weight:700;letter-spacing:-.5px"><Icon.logo />invenio</span>
          <span class="mono muted" style="font-size:11px">OGGI · {seenToday}/{today.length}</span>
        </div>
        <div class="progress" style={{ gridTemplateColumns: `repeat(${today.length},1fr)` }} aria-hidden="true">
          {today.map((c) => <div key={c.id} class={state.value.seen[c.id] ? 'on' : ''} />)}
        </div>
      </header>
      <main class="feed hide-sb">
        {order.map((c, i) => <FeedItem key={c.id} c={c} next={order[i + 1]?.name} onSaved={() => setToast(Date.now())} />)}
        <section class="feed-item"><div class="card feed-card" style="align-items:center;justify-content:center;text-align:center">
          <h2>Hai visto tutto, per ora</h2>
          <p>Nuove schede arriveranno con i prossimi pacchetti. Intanto ripassa con il quiz o esplora la mappa.</p>
          <div style="display:flex;gap:8px"><a class="btn primary" href="#/quiz">Vai al quiz</a><a class="btn" href="#/mappa">Mappa</a></div>
        </div></section>
      </main>
      {toast > 0 && <div class="toast" key={toast} role="status">Salvato in "Senza cartella" <a href="#/salvati">Scegli cartella</a></div>}
    </div>
  )
}
