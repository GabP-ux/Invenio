// Costellazione 3D: gli stessi nodi della mappa, disposti nello spazio con la simulazione a forze.
// Disegnata su canvas (niente librerie). Etichette solo per: gruppi (principi), nodo scelto e i suoi vicini.
import { useEffect, useMemo, useRef } from 'preact/hooks'
import { cards, byId, areaById } from '../data'
import { state } from '../store'
import { graphData, simulate, clusters, clusterColor } from './mapLayout'

const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const DMIN = 420, DMAX = 3400

const sprites = {}
function glow (color) {
  if (sprites[color]) return sprites[color]
  const c = document.createElement('canvas'); c.width = c.height = 64
  const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  r.addColorStop(0, color); r.addColorStop(0.25, color + 'AA'); r.addColorStop(1, color + '00')
  g.fillStyle = r; g.fillRect(0, 0, 64, 64)
  return (sprites[color] = c)
}

export function Map3D ({ selected, onSelect }) {
  const data = useMemo(() => {
    const g = graphData()
    const pos = simulate(g, 3, { iters: 380, seed: 11 })
    const cl = clusters(g.principles, pos).map(c => ({ ...c, color: clusterColor(c.members) }))
    const nb = {}
    g.edges.forEach(e => { (nb[e.a] = nb[e.a] || new Set()).add(e.b); (nb[e.b] = nb[e.b] || new Set()).add(e.a) })
    const color = {}
    g.cardNodes.forEach(n => { color[n.id] = areaById.value[n.area]?.color || '#F0B44C' })
    return { ...g, pos, cl, nb, color }
  }, [cards.value.length])

  const cv = useRef(); const sel = useRef(selected)
  const cam = useRef({ yaw: 0.5, pitch: -0.25, dist: 1900, tx: 0, ty: 0, tz: 0, goal: { x: 0, y: 0, z: 0, dist: 1500 } })
  const io = useRef({ ptr: new Map(), moved: false, vy: 0, vp: 0, idle: 0, pinch: null, start: null })
  const proj = useRef([])
  const stars = useMemo(() => Array.from({ length: 160 }, (_, i) => ({ u: (Math.sin(i * 91.7) * 43758.5) % 1, v: (Math.sin(i * 47.3) * 12543.1) % 1, s: 0.4 + ((i * 37) % 10) / 10, p: i })), [])

  useEffect(() => {
    sel.current = selected
    const p = data.pos[selected]; if (!p) return
    const c = cam.current; c.goal = { x: p.x, y: p.y, z: p.z, dist: Math.min(c.goal.dist, 1150) }
  }, [selected, data])

  useEffect(() => {
    const el = cv.current; const ctx = el.getContext('2d'); let raf, last = performance.now(), W = 0, H = 0, dpr = 1
    const resize = () => { dpr = Math.min(2, devicePixelRatio || 1); W = el.clientWidth; H = el.clientHeight; el.width = W * dpr; el.height = H * dpr }
    resize(); const ro = new ResizeObserver(resize); ro.observe(el)
    const frame = (t) => {
      const dt = Math.min(50, t - last); last = t
      const c = cam.current, s = io.current
      // movimento: inerzia, rotazione lenta quando nessuno tocca, avvicinamento al nodo scelto
      if (!s.ptr.size) {
        const f = Math.pow(0.93, dt / 16.7); s.vy *= f; s.vp *= f
        c.yaw += s.vy * dt / 16.7; c.pitch = clamp(c.pitch + s.vp * dt / 16.7, -1.35, 1.35)
        s.idle += dt; if (!reduced && s.idle > 2500 && Math.abs(s.vy) < 0.001) c.yaw += 0.00012 * dt
      }
      const e = 1 - Math.pow(0.9, dt / 16.7)
      c.tx += (c.goal.x - c.tx) * e; c.ty += (c.goal.y - c.ty) * e; c.tz += (c.goal.z - c.tz) * e; c.dist += (c.goal.dist - c.dist) * e
      draw(ctx, W, H, dpr, t)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [data])

  function draw (ctx, W, H, dpr, t) {
    const c = cam.current, S = sel.current
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H)
    const cy = Math.cos(c.yaw), sy = Math.sin(c.yaw), cp = Math.cos(c.pitch), sp = Math.sin(c.pitch)
    const F = Math.min(W, H) * 1.15, ox = W / 2, oy = H * 0.47
    const P = (p) => {
      const x = p.x - c.tx, y = p.y - c.ty, z = p.z - c.tz
      const x1 = x * cy - z * sy, z1 = x * sy + z * cy
      const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp
      const d = c.dist - z2; if (d < 60) return null
      const f = F / d; return { x: ox + x1 * f, y: oy + y2 * f, f, d }
    }
    // stelle di sfondo con leggera parallasse
    for (const st of stars) {
      const x = ((Math.abs(st.u) * W + c.yaw * 60) % W + W) % W, y = ((Math.abs(st.v) * H - c.pitch * 60) % H + H) % H
      ctx.globalAlpha = 0.25 + 0.2 * Math.sin(t / 900 + st.p); ctx.fillStyle = '#C9D7EA'; ctx.fillRect(x, y, st.s, st.s)
    }
    // nebulose dei gruppi
    const selCl = data.pos[S] && (data.cl.find(k => k.id === S) || data.cl.find(k => k.members.includes(S)))
    for (const k of data.cl) {
      const q = P(k); if (!q) continue
      const r = k.r * q.f * 0.95, g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, r)
      const on = k === selCl
      g.addColorStop(0, k.color + (on ? '30' : '1A')); g.addColorStop(1, k.color + '00')
      ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, 7); ctx.fill()
    }
    const pr = {}; for (const n of data.nodes) pr[n.id] = P(data.pos[n.id])
    // linee della costellazione
    ctx.lineCap = 'round'
    for (const ed of data.edges) {
      const a = pr[ed.a], b = pr[ed.b]; if (!a || !b) continue
      const on = ed.a === S || ed.b === S
      if (ed.kind === 'related' && !on) continue
      const depthA = clamp(1.4 - (a.d + b.d) / 2 / (c.dist * 1.6), 0.15, 1)
      if (ed.kind === 'related') { ctx.setLineDash([2, 5]); ctx.strokeStyle = '#B9A3FF'; ctx.globalAlpha = 0.9; ctx.lineWidth = 1.4 } else {
        ctx.setLineDash(ed.primary ? [] : [3, 6]); ctx.strokeStyle = on ? '#8FA8FF' : '#9AA8C8'
        ctx.globalAlpha = on ? 0.95 : (ed.primary ? 0.22 : 0.1) * depthA; ctx.lineWidth = on ? 1.6 : 1
      }
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
    }
    ctx.setLineDash([])
    // stelle (dal fondo verso chi guarda)
    const order = data.nodes.filter(n => pr[n.id]).sort((m, n) => pr[n.id].d - pr[m.id].d)
    const out = []
    for (const n of order) {
      const q = pr[n.id], isP = n.kind === 'principle', seen = isP || !!state.value.seen[n.id]
      const col = isP ? '#ECEEF3' : data.color[n.id]
      const fade = clamp(1.5 - q.d / (c.dist * 1.25), 0.25, 1)
      const r = clamp((isP ? 7 : 4.2) * q.f * 1.6, 1.6, isP ? 14 : 9)
      ctx.globalAlpha = fade * (seen ? 1 : 0.55)
      const sz = r * (isP ? 6 : 5); ctx.drawImage(glow(col), q.x - sz / 2, q.y - sz / 2, sz, sz)
      ctx.globalAlpha = fade
      ctx.beginPath(); ctx.arc(q.x, q.y, r * 0.55, 0, 7)
      if (seen) { ctx.fillStyle = isP ? '#FFFFFF' : col; ctx.fill() } else { ctx.strokeStyle = col; ctx.lineWidth = 1.2; ctx.stroke() }
      if (n.id === S) {
        ctx.globalAlpha = 0.5 + 0.4 * Math.sin(t / 300); ctx.strokeStyle = '#8FA8FF'; ctx.lineWidth = 2
        ctx.beginPath(); ctx.arc(q.x, q.y, r + 6, 0, 7); ctx.stroke()
      }
      out.push({ id: n.id, x: q.x, y: q.y, r, d: q.d })
    }
    proj.current = out
    // etichette: nodo scelto > vicini > nomi dei gruppi; niente sovrapposizioni
    const near = data.nb[S] || new Set()
    const want = []
    if (pr[S]) want.push([S, 0])
    near.forEach(id => pr[id] && want.push([id, 1]))
    data.principles.forEach(p => { if (pr[p.id] && p.id !== S && !near.has(p.id)) want.push([p.id, 2]) })
    want.sort((a, b) => a[1] - b[1] || pr[a[0]].d - pr[b[0]].d)
    const boxes = []
    for (const [id, pri] of want) {
      const n = data.nodes.find(x => x.id === id), q = pr[id]
      const isP = n.kind === 'principle'
      const fade = pri < 2 ? 1 : clamp(1.75 - q.d / (c.dist * 0.95), 0, 0.85); if (fade < 0.12) continue
      ctx.font = (isP ? (pri === 2 ? '600 11px ' : '600 12px ') : '500 11px ') + 'Inter, system-ui, sans-serif'
      const w = ctx.measureText(n.label).width + 14, h = 20, x = q.x - w / 2, y = q.y + (isP ? 14 : 10)
      if (boxes.some(b => x < b.x + b.w && x + w > b.x && y < b.y + b.h && y + h > b.y)) continue
      boxes.push({ x, y, w, h })
      ctx.globalAlpha = fade * 0.85; ctx.fillStyle = id === S ? '#1E2433' : 'rgba(11,13,18,.78)'
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, 10) : ctx.rect(x, y, w, h); ctx.fill()
      if (id === S) { ctx.strokeStyle = '#8FA8FF'; ctx.lineWidth = 1; ctx.stroke() }
      ctx.globalAlpha = fade; ctx.fillStyle = isP ? '#ECEEF3' : '#C9CED8'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(n.label, q.x, y + h / 2 + 0.5)
    }
    ctx.globalAlpha = 1
  }

  // gesti: un dito ruota, due dita avvicinano/allontanano, tocco seleziona
  const local = (e) => { const r = cv.current.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top } }
  const onDown = (e) => {
    const s = io.current; s.ptr.set(e.pointerId, local(e)); s.idle = 0; s.vy = 0; s.vp = 0
    if (s.ptr.size === 1) { s.moved = false; s.start = local(e); s.t = performance.now() }
    if (s.ptr.size === 2) { const [a, b] = [...s.ptr.values()]; s.pinch = { d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, g0: cam.current.goal.dist }; s.moved = true }
  }
  const onMove = (e) => {
    const s = io.current; if (!s.ptr.has(e.pointerId)) return
    const prev = s.ptr.get(e.pointerId), p = local(e); s.ptr.set(e.pointerId, p); s.idle = 0
    const c = cam.current
    if (s.ptr.size === 1 && !s.pinch) {
      if (!s.moved && Math.hypot(p.x - s.start.x, p.y - s.start.y) > 7) { s.moved = true; cv.current.setPointerCapture?.(e.pointerId) }
      if (!s.moved) return
      const dy = (p.x - prev.x) * 0.0055, dp = (p.y - prev.y) * 0.0055
      c.yaw += dy; c.pitch = clamp(c.pitch + dp, -1.35, 1.35); s.vy = s.vy * 0.5 + dy * 0.5; s.vp = s.vp * 0.5 + dp * 0.5
    } else if (s.ptr.size >= 2 && s.pinch) {
      const [a, b] = [...s.ptr.values()]
      c.goal.dist = clamp(s.pinch.g0 * s.pinch.d0 / (Math.hypot(a.x - b.x, a.y - b.y) || 1), DMIN, DMAX); c.dist = c.goal.dist
    }
  }
  const onUp = (e) => {
    const s = io.current; if (!s.ptr.has(e.pointerId)) return
    const p = local(e); s.ptr.delete(e.pointerId)
    if (s.ptr.size < 2) s.pinch = null
    if (s.ptr.size === 1) { s.start = [...s.ptr.values()][0] }
    if (s.ptr.size === 0 && !s.moved) {
      // tocco: la stella più vicina al dito (entro 26 px), preferendo quelle davanti
      let best = null, bd = 26
      for (const q of proj.current) { const d = Math.hypot(q.x - p.x, q.y - p.y) - q.r * 0.5; if (d < bd - 3 || (best && d < bd + 3 && q.d < best.d)) { best = q; bd = Math.min(bd, d) } }
      if (best) onSelect(best.id)
    }
  }
  const onWheel = (e) => { e.preventDefault(); const c = cam.current; c.goal.dist = clamp(c.goal.dist * Math.exp(e.deltaY * 0.0012), DMIN, DMAX); io.current.idle = 0 }
  const zoomBtn = (f) => { const c = cam.current; c.goal.dist = clamp(c.goal.dist / f, DMIN, DMAX); io.current.idle = 0 }
  const overview = () => { const c = cam.current; c.goal = { x: 0, y: 0, z: 0, dist: 1900 } }

  return (
    <div class="map-wrap map3d">
      <canvas ref={cv} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onWheel={onWheel}
        role="img" aria-label="Costellazione 3D delle tecnologie: ogni gruppo di stelle è un principio fisico. Tocca una stella per selezionarla." />
      <div class="map-hint"><span>RUOTA CON UN DITO · PIZZICA PER AVVICINARTI</span></div>
      <div class="zoom">
        <button aria-label="Avvicina" onClick={() => zoomBtn(1.35)}>+</button>
        <button aria-label="Allontana" onClick={() => zoomBtn(0.74)}>−</button>
        <button aria-label="Vista d'insieme" onClick={overview}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg></button>
      </div>
    </div>
  )
}
