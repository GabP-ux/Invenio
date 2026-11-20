// Disposizione "organica" della mappa: piccola simulazione a forze, deterministica (sempre uguale).
// - ogni tecnologia è attirata dal suo principio principale (molla corta) e, più debolmente, dagli altri principi
// - le tecnologie "collegate a" si attirano appena
// - tutti i nodi si respingono; i principi (centri dei gruppi) si respingono di più
// Funziona in 2D (mappa) e in 3D (costellazione).
import { cards, index, byId, areaById } from '../data'

const rng = (seed) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }

export function graphData () {
  const used = index.value.principles.filter(p => cards.value.some(c => c.principles.includes(p.id)))
  const principles = used.map(p => ({ id: p.id, label: p.name, kind: 'principle', members: cards.value.filter(c => c.principles[0] === p.id).map(c => c.id) }))
  const cardNodes = cards.value.map(c => ({ id: c.id, label: mapLabel(c), kind: 'card', area: c.area, principle: c.principles[0], principles: c.principles }))
  const edges = []
  cards.value.forEach(c => c.principles.forEach((p, i) => edges.push({ a: c.id, b: p, kind: 'principle', primary: i === 0 })))
  const seen = new Set()
  cards.value.forEach(c => c.related.forEach(r => {
    const k = [c.id, r].sort().join('|'); if (seen.has(k) || !cards.value.some(x => x.id === r)) return; seen.add(k)
    edges.push({ a: c.id, b: r, kind: 'related' })
  }))
  return { principles, cardNodes, nodes: [...principles, ...cardNodes], edges }
}

export const mapLabel = (c) => c.name.replace(/ \(.*\)/, '').replace(/^Sensore (a |di |ToF a )?/, (m, x) => x === 'ToF a ' ? 'ToF ' : '').replace(/^./, ch => ch.toUpperCase())

export function simulate ({ principles, cardNodes, edges }, dims = 2, opts = {}) {
  const rand = rng(opts.seed || 7)
  const N = [...principles, ...cardNodes]
  const idx = new Map(N.map((n, i) => [n.id, i]))
  const P = N.map(() => [0, 0, 0]); const V = N.map(() => [0, 0, 0])
  const isP = N.map(n => n.kind === 'principle')
  const mass = N.map(n => n.kind === 'principle' ? 2 + n.members.length * 0.6 : 1)
  // posizioni iniziali: principi su una spirale (o sfera di Fibonacci), tecnologie vicino al loro principio
  const np = principles.length
  principles.forEach((p, i) => {
    const r = 180 * Math.sqrt(i + 0.5)
    if (dims === 2) { const a = i * 2.39996; P[i] = [Math.cos(a) * r, Math.sin(a) * r, 0] } else {
      const y = 1 - (i + 0.5) / np * 2, rr = Math.sqrt(1 - y * y), a = i * 2.39996, R = 520
      P[i] = [Math.cos(a) * rr * R, y * R, Math.sin(a) * rr * R]
    }
  })
  cardNodes.forEach((c, j) => {
    const i = np + j, pp = P[idx.get(c.principle)]
    P[i] = [pp[0] + (rand() - 0.5) * 160, pp[1] + (rand() - 0.5) * 160, dims === 3 ? pp[2] + (rand() - 0.5) * 160 : 0]
  })
  const springs = edges.map(e => {
    const a = idx.get(e.a), b = idx.get(e.b)
    if (e.kind === 'principle') return e.primary ? [a, b, dims === 3 ? 120 : 125, 0.06] : [a, b, 260, 0.012]
    return [a, b, 240, 0.004]
  })
  const iters = opts.iters || 420
  for (let it = 0; it < iters; it++) {
    const cool = 1 - it / iters
    const F = N.map(() => [0, 0, 0])
    for (let i = 0; i < N.length; i++) for (let j = i + 1; j < N.length; j++) {
      const d = [P[j][0] - P[i][0], P[j][1] - P[i][1], P[j][2] - P[i][2]]
      let L2 = d[0] * d[0] + d[1] * d[1] + d[2] * d[2]; if (L2 < 1) { d[0] = rand() - 0.5; d[1] = rand() - 0.5; L2 = 1 }
      const L = Math.sqrt(L2)
      const k = (isP[i] && isP[j] ? (dims === 3 ? 140000 : 90000) : isP[i] || isP[j] ? 22000 : 9000) / L2
      for (let a = 0; a < dims; a++) { const f = k * d[a] / L; F[i][a] -= f; F[j][a] += f }
    }
    for (const [a, b, rest, s] of springs) {
      const d = [P[b][0] - P[a][0], P[b][1] - P[a][1], P[b][2] - P[a][2]]
      const L = Math.hypot(d[0], d[1], d[2]) || 1, f = s * (L - rest)
      for (let k = 0; k < dims; k++) { F[a][k] += f * d[k] / L * mass[b] / (mass[a] + mass[b]) * 2; F[b][k] -= f * d[k] / L * mass[a] / (mass[a] + mass[b]) * 2 }
    }
    for (let i = 0; i < N.length; i++) for (let k = 0; k < dims; k++) {
      F[i][k] -= P[i][k] * (dims === 3 ? 0.0025 : 0.0035) * mass[i]                       // gravità leggera verso il centro
      V[i][k] = (V[i][k] + F[i][k] / mass[i]) * 0.6
      const step = Math.max(-30, Math.min(30, V[i][k])) * (0.3 + 0.7 * cool)
      P[i][k] += step
    }
  }
  const pos = {}
  N.forEach((n, i) => { pos[n.id] = { x: P[i][0], y: P[i][1], z: P[i][2] } })
  return pos
}

// 2D: dopo la simulazione separa le etichette che si toccano
export function declutter (nodes, pos, pad = 14) {
  for (let it = 0; it < 160; it++) {
    let moved = false
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const A = nodes[i], B = nodes[j], a = pos[A.id], b = pos[B.id]
      const ox = (A.w + B.w) / 2 + pad - Math.abs(a.x - b.x), oy = (A.h + B.h) / 2 + pad - Math.abs(a.y - b.y)
      if (ox > 0 && oy > 0) {
        moved = true
        if (ox < oy) { const d = (a.x < b.x ? -1 : 1) * ox / 2; a.x += d; b.x -= d } else { const d = (a.y < b.y ? -1 : 1) * oy / 2; a.y += d; b.y -= d }
      }
    }
    if (!moved) break
  }
  return pos
}

// Gruppi: un alone per principio, che contiene le sue tecnologie principali
export function clusters (principles, pos, extra = 56) {
  return principles.map(p => {
    const c = pos[p.id]
    const r = Math.max(110, ...p.members.map(m => Math.hypot(pos[m].x - c.x, pos[m].y - c.y, (pos[m].z || 0) - (c.z || 0)) + extra))
    return { id: p.id, x: c.x, y: c.y, z: c.z || 0, r, members: p.members }
  })
}

// colore di un gruppo: l'area più presente tra le sue tecnologie
export function clusterColor (members) {
  const count = {}
  members.forEach(m => { const a = byId.value[m]?.area; if (a) count[a] = (count[a] || 0) + 1 })
  const top = Object.entries(count).sort((x, y) => y[1] - x[1])[0]
  return (top && areaById.value[top[0]]?.color) || '#8FA8FF'
}

