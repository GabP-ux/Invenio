// Kit per disegnare gli schemi di Invenio (vedi la skill "invenio-schemi").
// Colori e segni sono sempre gli stessi in tutta l'app: ogni freccia indica un verso reale.
import { useEffect, useState } from 'preact/hooks'
import './kit.css'

export const K = {
  cur: '#FFD27A',    // corrente convenzionale (dal + al −)
  el: '#8FA8FF',     // elettroni (verso opposto alla corrente)
  hole: '#F28C6B',   // lacune
  light: '#F0B44C',  // luce emessa
  light2: '#B8C8FF', // luce ricevuta / riflessa
  sound: '#B9A3FF',  // suono
  heat: '#F28C6B',   // calore
  cold: '#6FB8FF',   // freddo, acqua
  field: '#8C96AA',  // campo magnetico
  force: '#ECEEF3',  // forza
  plus: '#F28C6B', minus: '#8FA8FF',
  wire: '#5A6378', part: '#3A4050', body: '#161B25', text: '#A0A7B4', ink: '#ECEEF3'
}
export const T = { fontFamily: 'JetBrains Mono, monospace' }
const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

export const Svg = ({ w = 336, h = 180, label, children }) =>
  <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>{children}</svg>

export const Lbl = ({ x, y, c = K.text, s = 10, a = 'middle', children, ...r }) =>
  <text x={x} y={y} fill={c} style={T} font-size={s} text-anchor={a} {...r}>{children}</text>

export const Wire = ({ d, c = K.wire, w = 1.6, dash }) =>
  <path d={d} fill="none" stroke={c} stroke-width={w} stroke-linejoin="round" stroke-dasharray={dash} />

// Corrente convenzionale che scorre lungo il percorso d (nel verso in cui è scritto il percorso).
// dur: secondi per un ciclo del tratteggio. Più è piccolo, più la corrente "corre".
export const Flow = ({ d, on = true, dur = 1, c = K.cur, w = 2.6 }) => on
  ? <path class="k-flow" d={d} fill="none" stroke={c} stroke-width={w} stroke-linecap="round" stroke-linejoin="round" style={{ '--dur': dur + 's' }} />
  : null

// Elettroni: pallini che scorrono lungo d nel verso OPPOSTO a quello in cui è scritto il percorso.
export const Electrons = ({ d, on = true, dur = 1.2, c = K.el, r = 5 }) => on
  ? <path class="k-dots" d={d} fill="none" stroke={c} stroke-width={r} stroke-linecap="round" style={{ '--dur': dur + 's' }} />
  : null

export function Arrow ({ x1, y1, x2, y2, c = K.force, w = 2, head = 7 }) {
  const a = Math.atan2(y2 - y1, x2 - x1)
  const p = (s) => `${(x2 - head * Math.cos(a + s)).toFixed(1)} ${(y2 - head * Math.sin(a + s)).toFixed(1)}`
  return <g><path d={`M${x1} ${y1} L${x2} ${y2}`} stroke={c} stroke-width={w} /><path d={`M${p(-0.45)} L${x2} ${y2} L${p(0.45)}`} fill="none" stroke={c} stroke-width={w} stroke-linejoin="round" /></g>
}

// Pila verticale: piastra lunga (+) in alto a y, corta (−) in basso a y+10. Collega i fili a (x,y) e (x,y+10).
export const Battery = ({ x, y, label }) => (
  <g>
    <path d={`M${x - 12} ${y} H${x + 12}`} stroke={K.ink} stroke-width="2" />
    <path d={`M${x - 6} ${y + 10} H${x + 6}`} stroke={K.ink} stroke-width="4" />
    <Lbl x={x - 18} y={y + 3} c={K.plus} s={11}>+</Lbl>
    <Lbl x={x - 18} y={y + 15} c={K.minus} s={11}>−</Lbl>
    {label && <Lbl x={x + 18} y={y + 9} a="start">{label}</Lbl>}
  </g>
)

// Resistenza a zig-zag orizzontale da x a x+len
export const Resistor = ({ x, y, len = 60, c = K.ink, label }) => {
  const n = 6; const s = len / n
  let d = `M${x} ${y}`
  for (let i = 0; i < n; i++) d += ` L${x + s * i + s / 4} ${y - 7} L${x + s * i + (3 * s) / 4} ${y + 7}`
  d += ` L${x + len} ${y}`
  return <g><path d={d} fill="none" stroke={c} stroke-width="1.8" stroke-linejoin="round" />{label && <Lbl x={x + len / 2} y={y - 12}>{label}</Lbl>}</g>
}

// Lampadina: cerchio con croce; glow 0..1 = quanto è accesa
export const Lamp = ({ x, y, r = 12, glow = 0 }) => (
  <g>
    {glow > 0 && <circle cx={x} cy={y} r={r + 10} fill={K.cur} opacity={0.25 * glow} />}
    <circle cx={x} cy={y} r={r} fill={glow > 0 ? `rgba(255,210,122,${0.25 + 0.6 * glow})` : K.body} stroke={K.ink} stroke-width="1.4" />
    <path d={`M${x - r * 0.7} ${y - r * 0.7} L${x + r * 0.7} ${y + r * 0.7} M${x + r * 0.7} ${y - r * 0.7} L${x - r * 0.7} ${y + r * 0.7}`} stroke={K.ink} stroke-width="1.2" />
  </g>
)

export const Fig = ({ caption, controls, children, readout }) => (
  <div class="vis">
    <figure class="fig">{children}{caption && <figcaption>{caption}</figcaption>}</figure>
    {readout}
    {controls}
  </div>
)

export const Seg = ({ value, set, options, label }) => (
  <div class="seg" role="group" aria-label={label}>
    {options.map(([k, l]) => <button key={String(k)} aria-pressed={value === k} onClick={() => set(k)}>{l}</button>)}
  </div>
)

export const Slider = ({ id, label, min, max, step = 1, value, set, show }) => (
  <div style="display:flex;flex-direction:column;gap:4px">
    <label for={id} style="font-size:12px;color:#C9CED8">{label}{show !== undefined && <span class="mono" style="color:#ECEEF3"> {show}</span>}</label>
    <input id={id} type="range" min={min} max={max} step={step} value={value} onInput={e => set(+e.currentTarget.value)} />
  </div>
)

export const Readout = ({ items }) => (
  <div class="sim-read" style={{ gridTemplateColumns: `repeat(${items.length},1fr)` }}>
    {items.map(([k, v, c]) => <div key={k}><small>{k}</small><b style={c ? { color: c } : null}>{v}</b></div>)}
  </div>
)

// Stato che in modalità "auto" (feed) scorre da solo tra i valori, in "play" (scheda) lo decide l'utente.
export function useAuto (mode, values, ms = 2200) {
  const [v, setV] = useState(values[0])
  useEffect(() => {
    if (mode !== 'auto' || reduced) return
    let i = 0
    const t = setInterval(() => { i = (i + 1) % values.length; setV(values[i]) }, ms)
    return () => clearInterval(t)
  }, [mode])
  return [v, setV]
}
