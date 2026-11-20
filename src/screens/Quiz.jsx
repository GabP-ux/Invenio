import { useMemo, useState } from 'preact/hooks'
import { cards, areaColor } from '../data'
import { state, answerQuiz } from '../store'

const MAX = 8
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]] } return b }

// Solo domande sulle schede che hai già visto
function buildSession (all) {
  const now = Date.now(); const seen = state.value.seen; const q = state.value.quiz
  const pool = cards.value.filter(c => seen[c.id]).flatMap(c => c.quiz.map((x, i) => ({ c, x, key: c.id + ':' + i })))
  const due = all ? pool : pool.filter(p => !q[p.key] || q[p.key].due <= now)
  // prima quelle sbagliate o mai fatte, poi le altre
  const sorted = shuffle(due).sort((a, b) => (q[a.key]?.box ?? 0) - (q[b.key]?.box ?? 0))
  return sorted.slice(0, MAX).map(p => {
    const order = shuffle(p.x.options.map((_, i) => i))
    return { ...p, order }
  })
}

const ago = (ts) => {
  const d = Math.floor((Date.now() - ts) / 86400000)
  return d <= 0 ? 'vista oggi' : d === 1 ? 'vista ieri' : `vista ${d} giorni fa`
}

export function Quiz () {
  const [all, setAll] = useState(false)
  const [nonce, setNonce] = useState(0)
  const session = useMemo(() => buildSession(all), [all, nonce])
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const seenCount = Object.keys(state.value.seen).length
  const restart = (everything) => { setAll(everything); setNonce(n => n + 1); setI(0); setPicked(null); setScore(0) }

  const header = (
    <header style="padding:14px 20px 8px;display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;align-items:baseline;justify-content:space-between">
        <h1 style="margin:0;font-family:var(--display);font-size:22px;font-weight:600">Quiz</h1>
        {session.length > 0 && i < session.length && <span class="mono muted" style="font-size:12px">{i + 1} di {session.length}</span>}
      </div>
      <div class="card" style="display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:12px;font-size:12px;color:#C9CED8">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8FA8FF" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 2" /></svg>
        Solo domande sulle {seenCount} schede che hai già visto
      </div>
    </header>
  )

  if (!seenCount) return <div class="screen">{header}<div class="empty">Non hai ancora visto nessuna scheda.<br />Scorri il feed: le domande arrivano solo su ciò che conosci.<div style="margin-top:16px"><a class="btn primary" href="#/feed">Vai al feed</a></div></div></div>
  if (!session.length) return <div class="screen">{header}<div class="empty">Ripasso finito per oggi: le prossime domande torneranno nei giorni giusti per fissarle in memoria.<div style="margin-top:16px;display:flex;gap:8px;justify-content:center"><button class="btn" onClick={() => restart(true)}>Ripassa comunque</button><a class="btn primary" href="#/feed">Scopri nuove schede</a></div></div></div>
  if (i >= session.length) return <div class="screen">{header}<div class="empty"><div style="font-family:var(--display);font-size:28px;color:var(--text)">{score} / {session.length}</div>Le risposte sbagliate torneranno domani, quelle giuste tra qualche giorno.<div style="margin-top:16px;display:flex;gap:8px;justify-content:center"><button class="btn" onClick={() => restart(false)}>Altro giro</button><a class="btn primary" href="#/feed">Torna al feed</a></div></div></div>

  const cur = session[i]; const ans = picked !== null; const ok = picked === cur.x.correct
  const pick = (k) => { if (ans) return; setPicked(k); const good = k === cur.x.correct; if (good) setScore(s => s + 1); answerQuiz(cur.key, good) }
  return (
    <div class="screen">
      {header}
      <main class="scroll hide-sb" style="padding:8px 16px 20px;display:flex;flex-direction:column;gap:14px">
        <div class="crumb"><span class="dot" style={{ background: areaColor(cur.c) }} />Da: {cur.c.name} · {ago(state.value.seen[cur.c.id])}</div>
        <h2 style="margin:0;font-family:var(--display);font-size:22px;line-height:1.25;font-weight:600">{cur.x.q}</h2>
        <div style="display:flex;flex-direction:column;gap:8px" role="group" aria-label="Risposte">
          {cur.order.map(k => {
            const cls = !ans ? '' : k === cur.x.correct ? 'right' : k === picked ? 'wrong' : 'dim'
            return (
              <button key={k} class={'opt ' + cls} onClick={() => pick(k)} disabled={ans && cls === 'dim'} aria-disabled={ans}>
                {cur.x.options[k]}
                {cls === 'right' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6FD3C1" stroke-width="2.2" stroke-linecap="round" role="img" aria-label="corretta"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
                {cls === 'wrong' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F28C6B" stroke-width="2.2" stroke-linecap="round" role="img" aria-label="sbagliata"><path d="M6 6l12 12M18 6L6 18" /></svg>}
              </button>
            )
          })}
        </div>
        {ans && (
          <>
            <div class="card" style="padding:14px 16px;display:flex;flex-direction:column;gap:8px" role="status">
              <div style={{ fontFamily: 'var(--display)', fontSize: '17px', fontWeight: 600, color: ok ? '#6FD3C1' : '#F28C6B' }}>{ok ? 'Esatto!' : 'Quasi: te la ripropongo domani'}</div>
              <p style="margin:0;font-size:14px;line-height:1.5;color:var(--text-2)">{cur.x.expl}</p>
              <a href={'#/t/' + cur.c.id} style="font-size:13px;font-weight:600">Rivedi la scheda</a>
            </div>
            <button class="btn primary" style="min-height:50px" onClick={() => { setI(i + 1); setPicked(null) }}>{i + 1 < session.length ? 'Prossima domanda' : 'Vedi il risultato'}</button>
          </>
        )}
      </main>
    </div>
  )
}
