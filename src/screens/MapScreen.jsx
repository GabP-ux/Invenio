import { useMemo, useRef, useState, useEffect } from 'preact/hooks'
import { cards, index, byId, principleById, areaById, subById, areaColor } from '../data'
import { state } from '../store'
import { routeReplace } from '../router'


// Disposizione a gruppi: ogni principio al centro del suo gruppo, le tecnologie in cerchio intorno.
// Le linee principio → tecnologia restano corte e dentro il gruppo, così non attraversano altri nodi.
function layout (principles, cardNodes) {
  const pos = {}
  const groups = principles.map(p => ({ p, items: cardNodes.filter(n => n.principle === p.id) }))
    .sort((a, b) => b.items.length - a.items.length)
  const [first, ...rest] = groups
  const R = 430
  const place = (g, cx, cy, outward) => {
    pos[g.p.id] = { x: cx, y: cy }
    const n = g.items.length
    const r = n <= 1 ? 115 : n <= 2 ? 125 : 150
    const span = n <= 1 ? 0 : Math.min(Math.PI * 1.6, n * 0.9)
    g.items.forEach((it, i) => {
      const a = n === 1 ? outward : (n >= 4 ? outward + (i / n) * Math.PI * 2 : outward - span / 2 + (span / (n - 1)) * i)
      pos[it.id] = { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.8 }
    })
  }
  place(first, 0, 0, -Math.PI / 2)
  rest.forEach((g, i) => {
    const a = -Math.PI / 2 + (i / rest.length) * Math.PI * 2
    place(g, Math.cos(a) * R, Math.sin(a) * R * 0.85, a)
  })
  // separazione finale: se due etichette si sovrappongono, si allontanano un poco
  const all = [...principles, ...cardNodes]
  for (let it = 0; it < 120; it++) {
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
      const A = all[i], B = all[j], a = pos[A.id], b = pos[B.id]
      const ox = (A.w + B.w) / 2 + 16 - Math.abs(a.x - b.x), oy = (A.h + B.h) / 2 + 14 - Math.abs(a.y - b.y)
      if (ox > 0 && oy > 0) {
        if (ox < oy) { const d = (a.x < b.x ? -1 : 1) * ox / 2; a.x += d; b.x -= d } else { const d = (a.y < b.y ? -1 : 1) * oy / 2; a.y += d; b.y -= d }
      }
    }
  }
  return pos
}

const mapLabel = (c) => c.name.replace(/ \(.*\)/, '').replace(/^Sensore (a |di |ToF a )?/, (m, x) => x === 'ToF a ' ? 'ToF ' : '').replace(/^./, ch => ch.toUpperCase())

function Graph ({ selected, onSelect }) {
  const { nodes, edges, pos } = useMemo(() => {
    const pr = index.value.principles.filter(p => cards.value.some(c => c.principles.includes(p.id)))
      .map(p => ({ id: p.id, label: p.name, kind: 'principle', w: p.name.length * 7.4 + 30, h: 34 }))
    const cn = cards.value.map(c => { const label = mapLabel(c); return { id: c.id, label, kind: 'card', area: c.area, principle: c.principles[0], w: label.length * 7 + 26, h: 32 } })
    const edges = []
    cards.value.forEach(c => c.principles.forEach(p => edges.push({ a: c.id, b: p, kind: 'principle' })))
    const seenPair = new Set()
    cards.value.forEach(c => c.related.forEach(r => {
      const k = [c.id, r].sort().join('|'); if (seenPair.has(k)) return; seenPair.add(k)
      edges.push({ a: c.id, b: r, kind: 'related' })
    }))
    return { nodes: [...pr, ...cn], edges, pos: layout(pr, cn) }
  }, [cards.value.length])

  const wrap = useRef(); const [view, setView] = useState({ x: 0, y: 0, k: 1 })
  const pointers = useRef(new Map()); const last = useRef(null); const moved = useRef(false)

  // centra il nodo selezionato
  useEffect(() => {
    const p = pos[selected]; const el = wrap.current; if (!p || !el) return
    const r = el.getBoundingClientRect()
    setView(v => ({ k: v.k, x: r.width / 2 - p.x * v.k, y: r.height * 0.45 - p.y * v.k }))
  }, [selected])

  const onDown = (e) => { pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY }); moved.current = false; last.current = null }
  const onMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return
    const prev = pointers.current.get(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pts = [...pointers.current.values()]
    if (pts.length === 1) {
      const dx = e.clientX - prev.x, dy = e.clientY - prev.y
      if (Math.abs(dx) + Math.abs(dy) > 2) moved.current = true
      if (moved.current) { wrap.current.setPointerCapture?.(e.pointerId); setView(v => ({ ...v, x: v.x + dx, y: v.y + dy })) }
    } else if (pts.length === 2) {
      moved.current = true
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      const cx = (pts[0].x + pts[1].x) / 2, cy = (pts[0].y + pts[1].y) / 2
      if (last.current) zoomAt(d / last.current, cx, cy)
      last.current = d
    }
  }
  const onUp = (e) => { pointers.current.delete(e.pointerId); if (pointers.current.size < 2) last.current = null }
  const zoomAt = (f, cx, cy) => {
    const r = wrap.current.getBoundingClientRect(); const px = cx - r.left, py = cy - r.top
    setView(v => { const k = Math.max(0.4, Math.min(2.5, v.k * f)); const s = k / v.k; return { k, x: px - (px - v.x) * s, y: py - (py - v.y) * s } })
  }
  const zoomBtn = (f) => { const r = wrap.current.getBoundingClientRect(); zoomAt(f, r.left + r.width / 2, r.top + r.height / 2) }

  const lit = (e) => e.a === selected || e.b === selected
  return (
    <div class="map-wrap" ref={wrap} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      onWheel={(e) => { e.preventDefault(); zoomAt(e.deltaY < 0 ? 1.12 : 0.89, e.clientX, e.clientY) }}>
      <svg role="group" aria-label="Mappa delle connessioni tra tecnologie e principi fisici">
        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`} style="transition:transform .35s ease">
          {pos[selected] && <g aria-hidden="true">
            {[80, 160, 240].map(r => <circle key={r} cx={pos[selected].x} cy={pos[selected].y} r={r} fill="none" stroke="#8FA8FF" stroke-opacity=".07" />)}
          </g>}
          {edges.map((e, i) => {
            const a = pos[e.a], b = pos[e.b]; const on = lit(e)
            if (e.kind === 'principle') {
              return <line key={i} class={'edge' + (on ? ' lit' : '')} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={on ? '#8FA8FF' : '#2E3442'} stroke-width={on ? 2 : 1.4} stroke-dasharray={on ? '6 6' : 'none'} />
            }
            if (!on) return null
            // collegamento tra tecnologie: arco curvo, mostrato solo per il nodo selezionato
            const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2; const dx = b.x - a.x, dy = b.y - a.y; const L = Math.hypot(dx, dy) || 1
            // curva dalla parte opposta al centro del gruppo, per non passare sopra il principio
            const ctr = pos[byId.value[e.a]?.principles[0]] || { x: 0, y: 0 }
            let cx = mx - dy * 0.35, cy = my + dx * 0.35
            const alt = { x: mx + dy * 0.35, y: my - dx * 0.35 }
            if (Math.hypot(alt.x - ctr.x, alt.y - ctr.y) > Math.hypot(cx - ctr.x, cy - ctr.y)) { cx = alt.x; cy = alt.y }
            return <path key={i} d={`M${a.x} ${a.y} Q${cx} ${cy} ${b.x} ${b.y}`} fill="none" stroke="#B9A3FF" stroke-width="1.6" stroke-dasharray="2 5" opacity=".8" />
          })}
          {nodes.map(n => {
            const p = pos[n.id]; const sel = n.id === selected
            const seen = n.kind === 'principle' || !!state.value.seen[n.id]
            const color = n.kind === 'principle' ? '#ECEEF3' : (areaById.value[n.area]?.color || '#F0B44C')
            return (
              <g key={n.id} class={'node ' + n.kind} transform={`translate(${p.x - n.w / 2} ${p.y - n.h / 2})`}
                role="button" tabIndex={0} aria-label={n.label + (n.kind === 'card' ? (seen ? ', vista' : ', da scoprire') : ', principio')} aria-pressed={sel}
                onClick={() => { if (!moved.current) onSelect(n.id) }} onKeyDown={(e) => { if (e.key === 'Enter') onSelect(n.id) }}>
                {sel && <rect class="sel-ring" x="-6" y="-6" width={n.w + 12} height={n.h + 12} rx={n.h / 2 + 6} fill="none" stroke="#8FA8FF" stroke-width="3" />}
                <rect width={n.w} height={n.h} rx={n.kind === 'principle' ? n.h / 2 : 10}
                  fill={n.kind === 'principle' ? '#ECEEF3' : seen ? '#1B1A16' : '#0B0D12'}
                  stroke={n.kind === 'principle' ? 'none' : color} stroke-width="1.5" stroke-dasharray={seen ? 'none' : '4 4'} />
                <text x={n.w / 2} y={n.h / 2 + 4} text-anchor="middle" style={n.kind === 'card' && !seen ? 'fill:#C9CED8' : ''}>{n.label}</text>
              </g>
            )
          })}
        </g>
      </svg>
      <div style="position:absolute;left:12px;top:10px;font:500 10px var(--mono);color:#A0A7B4;letter-spacing:.5px;pointer-events:none;display:flex;flex-direction:column;gap:4px"><span>TRASCINA · PIZZICA PER ZOOM</span><span style="display:flex;align-items:center;gap:6px"><svg width="22" height="6" aria-hidden="true"><path d="M0 3 H22" stroke="#B9A3FF" stroke-width="1.6" stroke-dasharray="2 5"/></svg>COLLEGATO A</span></div>
      <div class="zoom"><button aria-label="Ingrandisci" onClick={() => zoomBtn(1.25)}>+</button><button aria-label="Riduci" onClick={() => zoomBtn(0.8)}>−</button></div>
    </div>
  )
}

function Sheet ({ id }) {
  const c = byId.value[id]; const p = principleById.value[id]
  if (c) {
    const seen = !!state.value.seen[c.id]
    return (
      <section class="sheet" aria-live="polite">
        <div class="grab" />
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
          <div style="min-width:0">
            <div style="font-family:var(--display);font-size:18px;font-weight:600">{c.name}</div>
            <div class="mono muted" style="font-size:10.5px;text-transform:uppercase">{subById.value[c.sub]?.name} · {seen ? 'vista' : 'da scoprire'}</div>
          </div>
          <a class="btn primary small" href={'#/t/' + c.id} style="flex-shrink:0">Apri scheda</a>
        </div>
        <p style="margin:0;font-size:13px;line-height:1.45;color:#C9CED8">{c.short.split('. ')[0]}.</p>
      </section>
    )
  }
  if (p) {
    const linked = cards.value.filter(x => x.principles.includes(p.id))
    return (
      <section class="sheet" aria-live="polite">
        <div class="grab" />
        <div style="font-family:var(--display);font-size:18px;font-weight:600">{p.name}</div>
        <div class="mono muted" style="font-size:10.5px">PRINCIPIO FISICO · {linked.length} COLLEGAMENTI</div>
        <p style="margin:0;font-size:13px;line-height:1.45;color:#C9CED8">{p.text}</p>
        <div class="chips">{linked.map(x => <a key={x.id} class="chip" style="text-decoration:none" href={'#/mappa/' + x.id}>{x.name}</a>)}</div>
      </section>
    )
  }
  return null
}

function Areas () {
  const [open, setOpen] = useState('sensori')
  return (
    <div class="scroll hide-sb" style="padding:0 16px 16px;display:flex;flex-direction:column;gap:10px">
      <div class="mono muted" style="font-size:10.5px;letter-spacing:.5px">CATEGORIE COME NEI CATALOGHI DEI DISTRIBUTORI</div>
      {index.value.areas.map(a => {
        const list = cards.value.filter(c => c.area === a.id)
        const seen = list.filter(c => state.value.seen[c.id]).length
        const subs = index.value.subs.filter(s => s.area === a.id)
        const isOpen = open === a.id
        return (
          <div key={a.id} class="card area-card" style={isOpen ? `border-color:${a.color}` : ''}>
            <button onClick={() => setOpen(isOpen ? null : a.id)} aria-expanded={isOpen} style="all:unset;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px">
              <span style="display:flex;align-items:center;gap:8px;font-size:15px;font-weight:600"><span class="dot" style={{ width: '10px', height: '10px', background: a.color }} />{a.name}</span>
              <span class="mono muted" style="font-size:11px">{list.length ? `${seen}/${list.length} VISTE` : 'IN ARRIVO'}</span>
            </button>
            {list.length > 0 && <div class="bar"><div style={{ width: (seen / list.length * 100) + '%', background: a.color }} /></div>}
            {isOpen && subs.map(s => {
              const sl = list.filter(c => c.sub === s.id); if (!sl.length) return null
              return (
                <div key={s.id} style="display:flex;flex-direction:column;gap:6px">
                  <div class="mono muted" style="font-size:10.5px;text-transform:uppercase">› {s.name}</div>
                  <div class="chips">{sl.map(c => <a key={c.id} href={'#/t/' + c.id} class="chip" style={'text-decoration:none;' + (state.value.seen[c.id] ? `border-color:${a.color}55;color:#ECEEF3` : 'border-style:dashed;background:transparent')}>{c.name}</a>)}</div>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export function MapScreen ({ focus }) {
  const [tab, setTab] = useState('graph')
  const selected = focus || 'tempo-di-volo'
  return (
    <div class="screen">
      <header class="topbar"><h1>Mappa</h1></header>
      <div style="padding:0 16px 10px">
        <div class="seg" role="group" aria-label="Vista della mappa">
          <button aria-pressed={tab === 'graph'} onClick={() => setTab('graph')}>Connessioni</button>
          <button aria-pressed={tab === 'areas'} onClick={() => setTab('areas')}>Aree tematiche</button>
        </div>
      </div>
      {tab === 'graph'
        ? <><Graph selected={selected} onSelect={(id) => routeReplace('mappa/' + id)} /><Sheet id={selected} /></>
        : <Areas />}
    </div>
  )
}
