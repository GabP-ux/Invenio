import { useMemo, useRef, useState, useEffect } from 'preact/hooks'
import { cards, byId, principleById, areaById, subById, index } from '../data'
import { state } from '../store'
import { routeReplace } from '../router'
import { graphData, simulate, declutter, clusters, clusterColor } from './mapLayout'
import { Map3D } from './Map3D'

const KMIN = 0.2, KMAX = 2.6
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const now = () => performance.now()

function useMapData () {
  return useMemo(() => {
    const g = graphData()
    g.principles.forEach(n => { n.w = n.label.length * 7.4 + 30; n.h = 34 })
    g.cardNodes.forEach(n => { n.w = n.label.length * 7 + 26; n.h = 32 })
    const pos = declutter(g.nodes, simulate(g, 2))
    const cl = clusters(g.principles, pos).map(c => ({ ...c, color: clusterColor(c.members) }))
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
    g.nodes.forEach(n => { const p = pos[n.id]; x0 = Math.min(x0, p.x - n.w / 2); x1 = Math.max(x1, p.x + n.w / 2); y0 = Math.min(y0, p.y - n.h / 2); y1 = Math.max(y1, p.y + n.h / 2) })
    return { ...g, pos, cl, box: { x0, y0, x1, y1 } }
  }, [cards.value.length])
}

function Graph ({ selected, onSelect }) {
  const { nodes, edges, pos, cl, box } = useMapData()
  const wrap = useRef(); const gRef = useRef()
  const view = useRef({ x: 0, y: 0, k: 0.85 })
  const raf = useRef(0); const anim = useRef(null)
  const ptr = useRef(new Map()); const gest = useRef({}); const moved = useRef(false)
  const vel = useRef({ x: 0, y: 0, t: 0 }); const lastTap = useRef(0); const pending = useRef(false)

  const apply = () => {
    const v = view.current, g = gRef.current, el = wrap.current; if (!g || !el) return
    g.setAttribute('transform', `translate(${v.x.toFixed(2)} ${v.y.toFixed(2)}) scale(${v.k.toFixed(4)})`)
    el.style.backgroundPosition = `${v.x}px ${v.y}px`; el.style.backgroundSize = `${96 * v.k}px ${96 * v.k}px`
    const far = v.k < 0.5; el.classList.toggle('far', far)
    el.style.setProperty('--inv', far ? clamp(0.46 / v.k, 1, 2.2).toFixed(3) : 1)
  }
  const stop = () => { cancelAnimationFrame(raf.current); anim.current = null }
  const animateTo = (t, ms = 520) => {
    stop(); const from = { ...view.current }, t0 = now()
    const tick = () => {
      const u = Math.min(1, (now() - t0) / ms), e = 1 - Math.pow(1 - u, 3)
      view.current = { x: from.x + (t.x - from.x) * e, y: from.y + (t.y - from.y) * e, k: from.k + (t.k - from.k) * e }
      apply(); if (u < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }
  const inertia = () => {
    stop(); let { x: vx, y: vy } = vel.current, t0 = now()
    const tick = () => {
      const t = now(), dt = Math.min(40, t - t0); t0 = t
      const f = Math.pow(0.94, dt / 16.7); vx *= f; vy *= f
      view.current.x += vx * dt / 16.7; view.current.y += vy * dt / 16.7; apply()
      if (Math.abs(vx) + Math.abs(vy) > 0.15) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }
  const zoomAt = (k, px, py, smooth) => {
    const v = view.current; k = clamp(k, KMIN, KMAX); const s = k / v.k
    const t = { k, x: px - (px - v.x) * s, y: py - (py - v.y) * s }
    if (smooth) animateTo(t, 260); else { view.current = t; apply() }
  }
  const center = (id, k) => {
    const p = pos[id]; const el = wrap.current; if (!p || !el) return
    const r = el.getBoundingClientRect(); const kk = k || clamp(view.current.k < 0.6 ? 0.9 : view.current.k, KMIN, KMAX)
    animateTo({ k: kk, x: r.width / 2 - p.x * kk, y: r.height * 0.46 - p.y * kk })
  }
  const fitAll = () => {
    const r = wrap.current.getBoundingClientRect(); const k = clamp(Math.min(r.width / (box.x1 - box.x0 + 60), r.height / (box.y1 - box.y0 + 60)), KMIN, KMAX)
    animateTo({ k, x: r.width / 2 - (box.x0 + box.x1) / 2 * k, y: r.height / 2 - (box.y0 + box.y1) / 2 * k })
  }

  useEffect(() => { apply() }, [])
  useEffect(() => { center(selected) }, [selected, pos])
  useEffect(() => () => stop(), [])

  const local = (e) => { const r = wrap.current.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top } }
  const onDown = (e) => {
    stop(); ptr.current.set(e.pointerId, local(e))
    if (ptr.current.size === 1) { moved.current = false; gest.current = { start: local(e), t: now() }; vel.current = { x: 0, y: 0, t: now() } }
    if (ptr.current.size === 2) startPinch()
  }
  const startPinch = () => {
    const [a, b] = [...ptr.current.values()]; const v = view.current
    const c = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
    gest.current.pinch = { d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, k0: v.k, wx: (c.x - v.x) / v.k, wy: (c.y - v.y) / v.k }
    moved.current = true
  }
  const onMove = (e) => {
    if (!ptr.current.has(e.pointerId)) return
    const prev = ptr.current.get(e.pointerId), p = local(e); ptr.current.set(e.pointerId, p)
    if (ptr.current.size === 1 && !gest.current.pinch) {
      const s = gest.current.start
      if (!moved.current && Math.hypot(p.x - s.x, p.y - s.y) > 7) { moved.current = true; wrap.current.setPointerCapture?.(e.pointerId) }
      if (!moved.current) return
      const dx = p.x - prev.x, dy = p.y - prev.y, t = now(), dt = Math.max(1, t - vel.current.t)
      vel.current = { x: vel.current.x * 0.6 + dx / dt * 16.7 * 0.4, y: vel.current.y * 0.6 + dy / dt * 16.7 * 0.4, t }
      view.current.x += dx; view.current.y += dy
    } else if (ptr.current.size >= 2 && gest.current.pinch) {
      const [a, b] = [...ptr.current.values()]; const g = gest.current.pinch
      const k = clamp(g.k0 * Math.hypot(a.x - b.x, a.y - b.y) / g.d0, KMIN, KMAX)
      const c = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      view.current = { k, x: c.x - g.wx * k, y: c.y - g.wy * k }
    }
    if (!pending.current) { pending.current = true; requestAnimationFrame(() => { pending.current = false; apply() }) }
  }
  const onUp = (e) => {
    if (!ptr.current.has(e.pointerId)) return
    ptr.current.delete(e.pointerId)
    if (ptr.current.size === 1) { gest.current.pinch = null; const [p] = [...ptr.current.values()]; gest.current.start = p; vel.current = { x: 0, y: 0, t: now() } }
    if (ptr.current.size === 0) {
      gest.current.pinch = null
      if (moved.current && now() - vel.current.t < 80) inertia()
      else if (!moved.current && !e.target.closest?.('.node')) {
        // doppio tocco sullo sfondo: ingrandisce
        const t = now(); if (t - lastTap.current < 320) { const p = local(e); zoomAt(view.current.k * 1.7, p.x, p.y, true); lastTap.current = 0 } else lastTap.current = t
      }
    }
  }
  const onWheel = (e) => { e.preventDefault(); stop(); const p = local(e); zoomAt(view.current.k * Math.exp(-e.deltaY * 0.0016), p.x, p.y) }
  const zoomBtn = (f) => { const r = wrap.current.getBoundingClientRect(); zoomAt(view.current.k * f, r.width / 2, r.height / 2, true) }

  const lit = (e) => e.a === selected || e.b === selected
  const selCluster = principleById.value[selected] ? selected : byId.value[selected]?.principles[0]
  return (
    <div class="map-wrap" ref={wrap} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onWheel={onWheel}>
      <svg role="group" aria-label="Mappa delle connessioni tra tecnologie e principi fisici">
        <defs>{cl.map(c => <radialGradient key={c.id} id={'halo-' + c.id}><stop offset="0" stop-color={c.color} stop-opacity=".2" /><stop offset=".7" stop-color={c.color} stop-opacity=".07" /><stop offset="1" stop-color={c.color} stop-opacity="0" /></radialGradient>)}</defs>
        <g ref={gRef}>
          <g aria-hidden="true">
            {cl.map(c => {
              const on = c.id === selCluster
              return <g key={c.id}>
                <circle cx={c.x} cy={c.y} r={c.r} fill={`url(#halo-${c.id})`} />
                {[c.r * 0.55, c.r * 0.82, c.r].map((r, i) => <circle key={i} class={on ? 'halo-ring on' : 'halo-ring'} cx={c.x} cy={c.y} r={r} fill="none" stroke={on ? '#8FA8FF' : c.color} stroke-opacity={on ? 0.22 : 0.07} stroke-dasharray={i === 2 ? '2 6' : 'none'} />)}
              </g>
            })}
          </g>
          {edges.map((e, i) => {
            const a = pos[e.a], b = pos[e.b]; const on = lit(e)
            if (e.kind === 'principle') {
              return <line key={i} class={'edge' + (on ? ' lit' : '')} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={on ? '#8FA8FF' : e.primary ? '#2E3442' : '#252A35'} stroke-width={on ? 2 : 1.4} stroke-dasharray={on ? '6 6' : e.primary ? 'none' : '3 6'} />
            }
            if (!on) return null
            const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2; const dx = b.x - a.x, dy = b.y - a.y
            return <path key={i} d={`M${a.x} ${a.y} Q${mx - dy * 0.22} ${my + dx * 0.22} ${b.x} ${b.y}`} fill="none" stroke="#B9A3FF" stroke-width="1.6" stroke-dasharray="2 5" opacity=".85" />
          })}
          {nodes.map(n => {
            const p = pos[n.id]; const sel = n.id === selected
            const seen = n.kind === 'principle' || !!state.value.seen[n.id]
            const color = n.kind === 'principle' ? '#ECEEF3' : (areaById.value[n.area]?.color || '#F0B44C')
            return (
              <g key={n.id} class={'node ' + n.kind + (sel ? ' sel' : '')} transform={`translate(${p.x - n.w / 2} ${p.y - n.h / 2})`}
                role="button" tabIndex={0} aria-label={n.label + (n.kind === 'card' ? (seen ? ', vista' : ', da scoprire') : ', principio')} aria-pressed={sel}
                onClick={() => { if (!moved.current) onSelect(n.id) }} onKeyDown={(e) => { if (e.key === 'Enter') onSelect(n.id) }}>
                {sel && <rect class="sel-ring" x="-6" y="-6" width={n.w + 12} height={n.h + 12} rx={n.h / 2 + 6} fill="none" stroke="#8FA8FF" stroke-width="3" />}
                <g class={n.kind === 'principle' ? 'lab' : null}>
                  <rect class="box" width={n.w} height={n.h} rx={n.kind === 'principle' ? n.h / 2 : 10}
                    fill={n.kind === 'principle' ? '#ECEEF3' : seen ? '#1B1A16' : '#0B0D12'}
                    stroke={n.kind === 'principle' ? 'none' : color} stroke-width="1.5" stroke-dasharray={seen ? 'none' : '4 4'} />
                  <text x={n.w / 2} y={n.h / 2 + 4} text-anchor="middle" style={n.kind === 'card' && !seen ? 'fill:#C9CED8' : ''}>{n.label}</text>
                </g>
                {n.kind === 'card' && state.value.studied[n.id] && <g class="stud" transform={`translate(${n.w - 6} -6)`}><circle r="8" fill="#6FD3C1" /><path d="M-3.5 0.2 L-1 2.7 L3.6 -2.2" fill="none" stroke="#0B0D12" stroke-width="2" stroke-linecap="round" /></g>}
                {n.kind === 'card' && <circle class="dot" cx={n.w / 2} cy={n.h / 2} r="9" fill={seen ? color : '#0B0D12'} stroke={color} stroke-width="2" />}
              </g>
            )
          })}
        </g>
      </svg>
      <div class="map-hint"><span>TRASCINA · PIZZICA · DOPPIO TOCCO</span><span style="display:flex;align-items:center;gap:6px"><svg width="22" height="6" aria-hidden="true"><path d="M0 3 H22" stroke="#B9A3FF" stroke-width="1.6" stroke-dasharray="2 5" /></svg>COLLEGATO A</span></div>
      <div class="zoom">
        <button aria-label="Ingrandisci" onClick={() => zoomBtn(1.35)}>+</button>
        <button aria-label="Riduci" onClick={() => zoomBtn(0.74)}>−</button>
        <button aria-label="Vista d'insieme" onClick={fitAll}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg></button>
      </div>
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
  const [open, setOpen] = useState(null)
  const levels = index.value.levels || [{ id: 'all', name: 'Aree', desc: '', areas: index.value.areas.map(a => a.id) }]
  return (
    <div class="scroll hide-sb" style="padding:0 16px 16px;display:flex;flex-direction:column;gap:14px">
      <div class="mono muted" style="font-size:10.5px;letter-spacing:.5px">IL PERCORSO, DAI FONDAMENTI IN SU · CATEGORIE COME NEI CATALOGHI</div>
      {levels.map((l, li) => {
        const areas = l.areas.map(id => areaById.value[id]).filter(Boolean)
        const list = cards.value.filter(c => l.areas.includes(c.area))
        const st = list.filter(c => state.value.studied[c.id]).length
        return (
          <section key={l.id} class="level">
            <div class="level-head">
              <span class="level-n mono">{li + 1}</span>
              <span style="display:flex;flex-direction:column;gap:1px;flex:1;min-width:0"><b style="font-size:15px">{l.name}</b><small class="muted" style="font-size:12px">{l.desc}</small></span>
              <span class="mono muted" style="font-size:10.5px;white-space:nowrap">{list.length ? `${st}/${list.length} STUDIATE` : 'IN ARRIVO'}</span>
            </div>
            {list.length > 0 && <div class="bar"><div style={{ width: (st / list.length * 100) + '%', background: '#6FD3C1' }} /></div>}
            {areas.map(a => {
              const al = list.filter(c => c.area === a.id); if (!al.length) return null
              const seen = al.filter(c => state.value.seen[c.id]).length, sd = al.filter(c => state.value.studied[c.id]).length
              const subs = index.value.subs.filter(s => s.area === a.id)
              const isOpen = open === a.id
              return (
                <div key={a.id} class="card area-card" style={isOpen ? `border-color:${a.color}` : ''}>
                  <button onClick={() => setOpen(isOpen ? null : a.id)} aria-expanded={isOpen} style="all:unset;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px">
                    <span style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600"><span class="dot" style={{ width: '10px', height: '10px', background: a.color }} />{a.name}</span>
                    <span class="mono muted" style="font-size:10.5px;white-space:nowrap">{seen}/{al.length} VISTE · {sd} ✓</span>
                  </button>
                  <div class="bar"><div style={{ width: (seen / al.length * 100) + '%', background: a.color }} /></div>
                  {isOpen && subs.map(s => {
                    const sl = al.filter(c => c.sub === s.id); if (!sl.length) return null
                    return (
                      <div key={s.id} style="display:flex;flex-direction:column;gap:6px">
                        <div class="mono muted" style="font-size:10.5px;text-transform:uppercase">› {s.name}</div>
                        <div class="chips">{sl.map(c => <a key={c.id} href={'#/t/' + c.id} class="chip" style={'text-decoration:none;' + (state.value.seen[c.id] ? `border-color:${a.color}55;color:#ECEEF3` : 'border-style:dashed;background:transparent')}>{state.value.studied[c.id] && <span style="color:#6FD3C1">✓ </span>}{c.name}</a>)}</div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </section>
        )
      })}
    </div>
  )
}

export function MapScreen ({ focus }) {
  const [tab, setTabS] = useState(() => { try { return localStorage.getItem('mapTab') || 'graph' } catch (e) { return 'graph' } })
  const setTab = (t) => { setTabS(t); try { localStorage.setItem('mapTab', t) } catch (e) {} }
  const selected = focus || 'tempo-di-volo'
  return (
    <div class="screen">
      <header class="topbar"><h1>Mappa</h1></header>
      <div style="padding:0 16px 10px">
        <div class="seg" role="group" aria-label="Vista della mappa">
          <button aria-pressed={tab === 'graph'} onClick={() => setTab('graph')}>Connessioni</button>
          <button aria-pressed={tab === '3d'} onClick={() => setTab('3d')}>Costellazione 3D</button>
          <button aria-pressed={tab === 'areas'} onClick={() => setTab('areas')}>Aree</button>
        </div>
      </div>
      {tab === 'graph' && <><Graph selected={selected} onSelect={(id) => routeReplace('mappa/' + id)} /><Sheet id={selected} /></>}
      {tab === '3d' && <><Map3D selected={selected} onSelect={(id) => routeReplace('mappa/' + id)} /><Sheet id={selected} /></>}
      {tab === 'areas' && <Areas />}
    </div>
  )
}
