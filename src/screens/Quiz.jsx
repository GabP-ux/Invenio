// Quiz con più modalità. La partita in corso resta in memoria (anche se apri una scheda e torni indietro,
// o ricarichi la pagina): riprende dalla stessa domanda, con la risposta già data e il tempo rimasto.
import { signal } from '@preact/signals'
import { useEffect, useState } from 'preact/hooks'
import { cards, byId, index, principleById, areaById, areaColor } from '../data'
import { state, answerQuiz } from '../store'
import { Visual } from '../diagrams/registry'

const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]] } return b }
const LAMPO_MS = 60000
const SKEY = 'invenio-quiz-session'

const load = () => { try { return JSON.parse(sessionStorage.getItem(SKEY)) } catch (e) { return null } }
export const session = signal(load())
const save = (s) => { session.value = s; try { s ? sessionStorage.setItem(SKEY, JSON.stringify(s)) : sessionStorage.removeItem(SKEY) } catch (e) {} }
const patch = (p) => save({ ...session.value, ...p })
const best = () => { try { return +localStorage.getItem('invenio-lampo-best') || 0 } catch (e) { return 0 } }

// ---------- costruzione delle domande (solo schede già viste) ----------
const seenCards = () => cards.value.filter(c => state.value.seen[c.id])
const cardQs = (list) => list.flatMap(c => c.quiz.map((x, qi) => ({ t: 'card', key: c.id + ':' + qi, cid: c.id, qi })))
const withOrder = (it) => ({ ...it, order: shuffle(byId.value[it.cid].quiz[it.qi].options.map((_, i) => i)) })

function schemaItems () {
  const seen = seenCards().filter(c => c.diagram)
  return shuffle(seen).slice(0, 8).map(c => {
    // distrattori: altre schede viste con uno schema diverso, meglio se della stessa area
    const others = shuffle(seen.filter(o => o.id !== c.id && o.diagram !== c.diagram)).sort((a, b) => (b.area === c.area) - (a.area === c.area))
    return { t: 'schema', cid: c.id, opts: shuffle([c.id, ...others.slice(0, 3).map(o => o.id)]) }
  })
}
function principleItems () {
  const used = index.value.principles.filter(p => cards.value.some(c => c.principles.includes(p.id)))
  return shuffle(seenCards()).slice(0, 8).map(c => {
    const wrong = shuffle(used.filter(p => !c.principles.includes(p.id))).slice(0, 3).map(p => p.id)
    return { t: 'princ', cid: c.id, opts: shuffle([c.principles[0], ...wrong]) }
  })
}

const MODES = {
  ripasso: { name: 'Ripasso del giorno', desc: 'Le domande che è il momento di ripassare: prima quelle sbagliate o nuove.', icon: 'M12 7v5l3 2M21 12a9 9 0 1 1-9-9' },
  lampo: { name: 'Lampo · 60 secondi', desc: 'Più risposte giuste che puoi in un minuto.', icon: 'M13 2 4 14h7l-1 8 9-12h-7z' },
  area: { name: 'Per area', desc: 'Scegli un argomento e ripassa solo quello.', icon: 'M4 5h7v7H4zM13 5h7v7h-7zM4 14h7v6H4zM13 14h7v6h-7z' },
  schema: { name: 'Indovina dallo schema', desc: 'Guardi lo schema animato e riconosci la tecnologia.', icon: 'M3 12h4l2-5 4 10 2-5h6' },
  principi: { name: 'Che principio c\'è sotto?', desc: 'Collega ogni tecnologia al fenomeno fisico su cui funziona.', icon: 'M12 3a6 6 0 0 1 4 10.5V17H8v-3.5A6 6 0 0 1 12 3zM9 21h6' },
  errori: { name: 'I tuoi errori', desc: 'Solo le domande che l\'ultima volta hai sbagliato.', icon: 'M6 6l12 12M18 6 6 18' }
}

function available (mode) {
  const qs = cardQs(seenCards()); const q = state.value.quiz; const now = Date.now()
  if (mode === 'ripasso') return qs.filter(p => !q[p.key] || q[p.key].due <= now).length
  if (mode === 'lampo') return qs.length
  if (mode === 'area') return qs.length
  if (mode === 'schema') return seenCards().filter(c => c.diagram).length >= 4 ? Math.min(8, seenCards().filter(c => c.diagram).length) : 0
  if (mode === 'principi') return Math.min(8, seenCards().length)
  if (mode === 'errori') return qs.filter(p => q[p.key]?.wrong).length
  return 0
}

function start (mode, opt = {}) {
  const q = state.value.quiz; const now = Date.now()
  let items = []
  if (mode === 'ripasso') {
    const pool = cardQs(seenCards()); const due = opt.all ? pool : pool.filter(p => !q[p.key] || q[p.key].due <= now)
    items = shuffle(due).sort((a, b) => (q[a.key]?.box ?? 0) - (q[b.key]?.box ?? 0)).slice(0, 8).map(withOrder)
  } else if (mode === 'lampo') {
    const pool = cardQs(seenCards()); while (items.length < 60 && pool.length) items.push(...shuffle(pool).map(withOrder))
    items = items.slice(0, 60)
  } else if (mode === 'area') {
    items = shuffle(cardQs(seenCards().filter(c => c.area === opt.area))).slice(0, 10).map(withOrder)
  } else if (mode === 'schema') items = schemaItems()
  else if (mode === 'principi') items = principleItems()
  else if (mode === 'errori') items = shuffle(cardQs(seenCards()).filter(p => q[p.key]?.wrong)).slice(0, 10).map(withOrder)
  if (!items.length) return
  save({ mode, opt, items, i: 0, picked: null, score: 0, missed: [], done: false, ...(mode === 'lampo' ? { remaining: LAMPO_MS } : {}) })
}

// domanda pronta da mostrare, qualunque sia il tipo
function view (it) {
  const c = byId.value[it.cid]; if (!c) return null
  if (it.t === 'card') { const x = c.quiz[it.qi]; return { c, q: x.q, opts: it.order.map(k => ({ k, label: x.options[k] })), correct: x.correct, expl: x.expl } }
  if (it.t === 'schema') return { c, q: 'Quale tecnologia mostra questo schema?', visual: c.diagram, opts: it.opts.map(id => ({ k: id, label: byId.value[id]?.name })), correct: c.id, expl: c.hook }
  const p = principleById.value[c.principles[0]]
  return { c, q: `Su quale principio funziona: ${c.name}?`, opts: it.opts.map(id => ({ k: id, label: principleById.value[id]?.name })), correct: c.principles[0], expl: p?.text }
}

const ago = (ts) => { const d = Math.floor((Date.now() - ts) / 86400000); return d <= 0 ? 'vista oggi' : d === 1 ? 'vista ieri' : `vista ${d} giorni fa` }
const Ico = ({ d, c = '#8FA8FF' }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={d} /></svg>

// ---------- schermate ----------
function Home () {
  const [pickArea, setPickArea] = useState(false)
  const seen = seenCards()
  const areas = (index.value?.areas || []).map(a => ({ a, n: cardQs(seen.filter(c => c.area === a.id)).length })).filter(x => x.n)
  return (
    <main class="scroll hide-sb" style="padding:4px 16px 20px;display:flex;flex-direction:column;gap:10px">
      <div class="mono muted" style="font-size:10.5px;letter-spacing:.5px">SCEGLI UNA MODALITÀ · SOLO SULLE {seen.length} SCHEDE CHE HAI VISTO</div>
      {Object.entries(MODES).map(([id, m]) => {
        const n = available(id); const off = id === 'ripasso' ? cardQs(seen).length === 0 : n === 0
        const extra = id === 'ripasso' ? (n ? `${Math.min(n, 8)} domande` : 'tutto ripassato') : id === 'lampo' ? (best() ? `record ${best()}` : 'nessun record') : id === 'area' ? `${areas.length} aree` : id === 'errori' ? (n ? `${n} da rifare` : 'nessun errore') : id === 'schema' && !n ? 'servono 4 schede viste' : `${n} domande`
        return (
          <div key={id}>
            <button class="card mode-tile" disabled={off} aria-expanded={id === 'area' ? pickArea : undefined}
              onClick={() => id === 'area' ? setPickArea(!pickArea) : id === 'ripasso' && !n ? start('ripasso', { all: true }) : start(id)}>
              <span class="mode-ico"><Ico d={m.icon} c={off ? '#5A6378' : '#8FA8FF'} /></span>
              <span style="display:flex;flex-direction:column;gap:3px;min-width:0;flex:1">
                <b style="font-size:15px">{m.name}</b>
                <span style="font-size:12.5px;color:var(--text-2);line-height:1.35">{id === 'ripasso' && !n && !off ? 'Per oggi hai finito: tocca per ripassare comunque.' : m.desc}</span>
              </span>
              <span class="mono muted" style="font-size:10.5px;white-space:nowrap;align-self:flex-start">{extra}</span>
            </button>
            {id === 'area' && pickArea && <div class="chips" style="padding:10px 4px 2px">
              {areas.map(({ a, n }) => <button key={a.id} class="chip" style={`border-color:${a.color}66`} onClick={() => start('area', { area: a.id })}><span class="dot" style={{ background: a.color }} />{a.name} · {n}</button>)}
            </div>}
          </div>
        )
      })}
    </main>
  )
}

function Timer ({ s }) {
  const [, tick] = useState(0)
  useEffect(() => {
    // il tempo scorre solo mentre sei sul quiz: uscendo si mette in pausa
    const endAt = Date.now() + s.remaining
    const t = setInterval(() => {
      const left = endAt - Date.now()
      if (left <= 0) { clearInterval(t); patch({ remaining: 0 }); finish() } else { session.value = { ...session.value, remaining: left }; tick(x => x + 1) }
    }, 200)
    return () => { clearInterval(t); if (session.value && !session.value.done) patch({ remaining: Math.max(0, endAt - Date.now()) }) }
  }, [])
  const sec = Math.ceil((session.value?.remaining || 0) / 1000)
  return <div class="lampo-bar" role="timer" aria-label={sec + ' secondi rimasti'}><div style={{ width: (session.value?.remaining || 0) / LAMPO_MS * 100 + '%' }} /><span class="mono">{sec}s</span></div>
}

function finish () {
  const s = session.value; if (!s) return
  const record = s.mode === 'lampo' && s.score > best()
  if (record) { try { localStorage.setItem('invenio-lampo-best', s.score) } catch (e) {} }
  patch({ done: true, record })
}

function Play ({ s }) {
  const [sure, setSure] = useState(false)
  const it = s.items[s.i]; const v = it && view(it)
  useEffect(() => { if (sure) { const t = setTimeout(() => setSure(false), 3000); return () => clearTimeout(t) } }, [sure])
  if (!v) { finish(); return null }
  const ans = s.picked !== null; const ok = s.picked === v.correct
  const next = () => { const i = s.i + 1; if (i >= s.items.length) { patch({ i }); finish() } else patch({ i, picked: null }) }
  const pick = (k) => {
    if (ans) return
    const good = k === v.correct
    if (it.t === 'card') answerQuiz(it.key, good)
    patch({ picked: k, score: s.score + (good ? 1 : 0), missed: good ? s.missed : [...s.missed, it.cid] })
    if (s.mode === 'lampo') setTimeout(() => { if (session.value?.i === s.i) next() }, good ? 450 : 1100)
  }
  const m = MODES[s.mode]
  return (
    <main class="scroll hide-sb" style="padding:4px 16px 20px;display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <span class="mono muted" style="font-size:11px">{m.name.toUpperCase()}{s.mode === 'area' ? ' · ' + areaById.value[s.opt.area]?.name : ''}</span>
        <span style="display:flex;align-items:center;gap:10px">
          <span class="mono muted" style="font-size:12px">{s.mode === 'lampo' ? `${s.score} giuste` : `${s.i + 1} di ${s.items.length}`}</span>
          <button class="btn small" onClick={() => sure ? save(null) : setSure(true)}>{sure ? 'Sicuro? Esci' : 'Esci'}</button>
        </span>
      </div>
      {s.mode === 'lampo' ? <Timer s={s} /> : <div class="bar"><div style={{ width: (s.i / s.items.length * 100) + '%', background: 'var(--accent)' }} /></div>}
      {it.t !== 'schema' && <div class="crumb"><span class="dot" style={{ background: areaColor(v.c) }} />Da: {v.c.name} · {ago(state.value.seen[v.c.id])}</div>}
      <h2 style="margin:0;font-family:var(--display);font-size:21px;line-height:1.25;font-weight:600">{v.q}</h2>
      {v.visual && <div class="quiz-vis"><Visual k={v.visual} mode="auto" /></div>}
      <div style="display:flex;flex-direction:column;gap:8px" role="group" aria-label="Risposte">
        {v.opts.map(({ k, label }) => {
          const cls = !ans ? '' : k === v.correct ? 'right' : k === s.picked ? 'wrong' : 'dim'
          return (
            <button key={k} class={'opt ' + cls} onClick={() => pick(k)} disabled={ans && cls === 'dim'} aria-disabled={ans}>
              {label}
              {cls === 'right' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6FD3C1" stroke-width="2.2" stroke-linecap="round" role="img" aria-label="corretta"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
              {cls === 'wrong' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F28C6B" stroke-width="2.2" stroke-linecap="round" role="img" aria-label="sbagliata"><path d="M6 6l12 12M18 6L6 18" /></svg>}
            </button>
          )
        })}
      </div>
      {ans && s.mode !== 'lampo' && (
        <>
          <div class="card" style="padding:14px 16px;display:flex;flex-direction:column;gap:8px" role="status">
            <div style={{ fontFamily: 'var(--display)', fontSize: '17px', fontWeight: 600, color: ok ? '#6FD3C1' : '#F28C6B' }}>{ok ? 'Esatto!' : it.t === 'card' ? 'Quasi: te la ripropongo domani' : 'Quasi!'}</div>
            {it.t === 'schema' && <div style="font-size:14px;font-weight:600">È: {v.c.name}</div>}
            <p style="margin:0;font-size:14px;line-height:1.5;color:var(--text-2)">{v.expl}</p>
            <a href={'#/t/' + v.c.id} style="font-size:13px;font-weight:600">Rivedi la scheda · poi torna qui e riprendi</a>
          </div>
          <button class="btn primary" style="min-height:50px" onClick={next}>{s.i + 1 < s.items.length ? 'Prossima domanda' : 'Vedi il risultato'}</button>
        </>
      )}
    </main>
  )
}

function Result ({ s }) {
  const total = s.mode === 'lampo' ? s.score + s.missed.length : s.items.length
  const missed = [...new Set(s.missed)].map(id => byId.value[id]).filter(Boolean)
  const rec = !!s.record
  return (
    <main class="scroll hide-sb" style="padding:12px 16px 20px;display:flex;flex-direction:column;gap:14px;align-items:stretch">
      <div class="card" style="padding:20px;text-align:center;display:flex;flex-direction:column;gap:6px">
        <span class="mono muted" style="font-size:11px">{MODES[s.mode].name.toUpperCase()}</span>
        <div style="font-family:var(--display);font-size:34px">{s.score} / {total}</div>
        <div style="font-size:13px;color:var(--text-2)">{rec ? 'Nuovo record!' : s.mode === 'ripasso' || s.mode === 'errori' || s.mode === 'area' ? 'Le sbagliate torneranno domani, le giuste tra qualche giorno.' : s.score === total ? 'Tutte giuste!' : 'Ripassa le schede qui sotto e riprova.'}</div>
      </div>
      {missed.length > 0 && <div style="display:flex;flex-direction:column;gap:8px">
        <div class="mono muted" style="font-size:10.5px">DA RIVEDERE</div>
        <div class="chips">{missed.map(c => <a key={c.id} class="chip" style="text-decoration:none" href={'#/t/' + c.id}><span class="dot" style={{ background: areaColor(c) }} />{c.name}</a>)}</div>
      </div>}
      <div style="display:flex;gap:8px">
        <button class="btn" style="flex:1" onClick={() => save(null)}>Altre modalità</button>
        <button class="btn primary" style="flex:1" onClick={() => start(s.mode, s.opt)}>Rifai</button>
      </div>
    </main>
  )
}

export function Quiz () {
  const s = session.value
  const seenCount = Object.keys(state.value.seen).length
  const header = (
    <header style="padding:14px 20px 8px;display:flex;align-items:baseline;justify-content:space-between">
      <h1 style="margin:0;font-family:var(--display);font-size:22px;font-weight:600">Quiz</h1>
    </header>
  )
  if (!seenCount) return <div class="screen">{header}<div class="empty">Non hai ancora visto nessuna scheda.<br />Scorri il feed: le domande arrivano solo su ciò che conosci.<div style="margin-top:16px"><a class="btn primary" href="#/feed">Vai al feed</a></div></div></div>
  return (
    <div class="screen">
      {header}
      {!s ? <Home /> : s.done || s.i >= s.items.length ? <Result s={s} /> : <Play s={s} />}
    </div>
  )
}
