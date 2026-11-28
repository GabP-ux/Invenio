// Percorsi tematici: sequenze di schede con un obiettivo concreto.
import { cards, byId, index, areaColor } from '../data'
import { state } from '../store'
import { Back, Icon } from '../components/ui'

const P = { fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' }
const ICONS = {
  spark: 'M13 2 4 14h7l-1 8 9-12h-7z',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 1 3.5 10.9c-.6.5-1 1.2-1 2V16h-5v-.1c0-.8-.4-1.5-1-2A6 6 0 0 1 12 3z',
  cloud: 'M7 18a4 4 0 0 1-.6-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z',
  robot: 'M5 9h14v10H5zM9 13h.01M15 13h.01M12 5v4M9 19v2M15 19v2M10 16h4',
  battery: 'M3 8h15v8H3zM21 11v2M6 11v2M9 11v2',
  tools: 'M14 6a4 4 0 0 0 5 5l-9 9-3-3 9-9a4 4 0 0 0-2-2zM5 5l4 4',
  magnet: 'M6 3v8a6 6 0 0 0 12 0V3h-4v8a2 2 0 0 1-4 0V3zM6 7h4M14 7h4',
  wave: 'M2 12h3l2-6 4 12 3-9 2 3h6',
  radio: 'M12 12v9M8.5 8.5a5 5 0 0 1 7 0M5.6 5.6a9 9 0 0 1 12.8 0M12 12h.01'
}
export const PathIcon = ({ name, c, s = 22 }) => <svg width={s} height={s} viewBox="0 0 24 24" {...P} stroke={c}><path d={ICONS[name] || ICONS.spark} /></svg>

export const pathById = (id) => (index.value.paths || []).find(p => p.id === id)
export function pathProgress (p) {
  const ids = p.steps.map(s => s[0]).filter(id => byId.value[id])
  const studied = ids.filter(id => state.value.studied[id]).length
  const next = ids.find(id => !state.value.studied[id])
  return { ids, studied, total: ids.length, next }
}

// Elenco dei percorsi (dentro la schermata Feed)
export function PathList () {
  const list = index.value.paths || []
  return (
    <main class="scroll hide-sb" style="padding:4px 16px 20px;display:flex;flex-direction:column;gap:10px">
      <div class="mono muted" style="font-size:10.5px;letter-spacing:.5px">PERCORSI TEMATICI · OGNI PASSO SI COMPLETA CON LA SPUNTA "STUDIATO"</div>
      {list.map(p => {
        const { studied, total, next } = pathProgress(p)
        const started = p.steps.some(([id]) => state.value.seen[id])
        return (
          <a key={p.id} class="card path-card" href={'#/percorso/' + p.id} style={{ '--pc': p.color }}>
            <span class="path-ico"><PathIcon name={p.icon} c={p.color} /></span>
            <span style="display:flex;flex-direction:column;gap:6px;min-width:0;flex:1">
              <span style="display:flex;justify-content:space-between;gap:8px;align-items:baseline">
                <b style="font-size:15.5px">{p.name}</b>
                <span class="mono muted" style="font-size:10.5px;white-space:nowrap">{studied}/{total}</span>
              </span>
              <span style="font-size:12.5px;line-height:1.4;color:var(--text-2)">{p.goal}</span>
              <span class="bar"><span style={{ display: 'block', height: '100%', width: (studied / total * 100) + '%', background: p.color }} /></span>
              <span class="mono" style="font-size:10.5px;color:#A0A7B4">{!next ? '✓ PERCORSO COMPLETATO' : (started ? 'CONTINUA: ' : 'INIZIA: ') + byId.value[next].name.toUpperCase()}</span>
            </span>
          </a>
        )
      })}
    </main>
  )
}

// Pagina di un percorso
export function PathPage ({ id }) {
  const p = pathById(id)
  if (!p) return <div class="screen"><div class="topbar"><Back /></div><div class="empty">Percorso non trovato.</div></div>
  const { studied, total, next } = pathProgress(p)
  return (
    <div class="screen">
      <header class="topbar" style="padding:6px 8px;border-bottom:1px solid var(--line-soft)">
        <Back label="Percorsi" />
        <span class="mono muted" style="font-size:12px;text-transform:uppercase">Percorso</span>
        <span style="width:40px" />
      </header>
      <main class="scroll hide-sb" style="padding:16px 16px 28px;display:flex;flex-direction:column;gap:14px">
        <section style="display:flex;gap:14px;align-items:center">
          <span class="path-ico big" style={{ '--pc': p.color }}><PathIcon name={p.icon} c={p.color} s={30} /></span>
          <span style="display:flex;flex-direction:column;gap:4px">
            <h1 style="margin:0;font-family:var(--display);font-size:22px;line-height:1.2">{p.name}</h1>
            <span class="mono muted" style="font-size:11px">{total} PASSI · {studied} STUDIATI</span>
          </span>
        </section>
        <p style="margin:0;font-size:14.5px;line-height:1.5;color:var(--text-2)">{p.goal}</p>
        <div class="bar"><div style={{ width: (studied / total * 100) + '%', background: p.color }} /></div>
        {next
          ? <a class="btn primary" href={`#/t/${next}/${p.id}`}>{studied ? 'Continua' : 'Inizia'}: {byId.value[next].name} <Icon.arrow /></a>
          : <div class="card" style="padding:14px;text-align:center;color:#6FD3C1;font-weight:600">Percorso completato: hai studiato tutti i passi.</div>}
        <ol class="steps-list">
          {p.steps.map(([cid, why], i) => {
            const c = byId.value[cid]; if (!c) return null
            const st = state.value.studied[cid] ? 'done' : state.value.seen[cid] ? 'seen' : 'new'
            return (
              <li key={cid} class={'step ' + st + (cid === next ? ' next' : '')}>
                <span class="step-dot" style={{ '--pc': p.color }}>{st === 'done' ? <Icon.check s={14} /> : i + 1}</span>
                <a href={`#/t/${cid}/${p.id}`} class="step-body">
                  <span class="crumb" style="font-size:10px"><span class="dot" style={{ background: areaColor(c) }} />{st === 'done' ? 'studiata' : st === 'seen' ? 'vista' : 'da scoprire'}</span>
                  <b>{c.name}</b>
                  <span>{why}</span>
                </a>
              </li>
            )
          })}
        </ol>
      </main>
    </div>
  )
}

// Barra in fondo alla scheda quando la apri da un percorso
export function PathNav ({ pathId, cardId }) {
  const p = pathById(pathId); if (!p) return null
  const ids = p.steps.map(s => s[0]).filter(id => byId.value[id])
  const i = ids.indexOf(cardId); if (i < 0) return null
  const prev = ids[i - 1], nxt = ids[i + 1]
  return (
    <section class="card path-nav" style={{ '--pc': p.color }}>
      <a href={'#/percorso/' + p.id} class="mono" style="font-size:10.5px;color:#A0A7B4;text-decoration:none;display:flex;align-items:center;gap:6px">
        <PathIcon name={p.icon} c={p.color} s={16} />{p.name.toUpperCase()} · PASSO {i + 1} DI {ids.length}
      </a>
      <div style="display:grid;grid-template-columns:1fr 2fr;gap:8px">
        {prev ? <a class="btn" href={`#/t/${prev}/${p.id}`}><Icon.back />Prima</a> : <a class="btn" href={'#/percorso/' + p.id}>Percorso</a>}
        {nxt ? <a class="btn primary" href={`#/t/${nxt}/${p.id}`}>{byId.value[nxt].name} <Icon.arrow /></a> : <a class="btn primary" href={'#/percorso/' + p.id}>Fine del percorso</a>}
      </div>
    </section>
  )
}
