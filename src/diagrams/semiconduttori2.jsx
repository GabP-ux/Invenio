// Schemi di Zener, optoaccoppiatore, amplificatore operazionale, 555 e porte logiche. Regole: skill "invenio-schemi".
import { useEffect, useState } from 'preact/hooks'
import { calm, K, Svg, Lbl, Wire, Flow, Battery, Lamp, Fig, Seg, Slider, Readout, useAuto } from './kit'

const f1 = (v) => v.toFixed(1).replace('.', ',')
const f2 = (v) => v.toFixed(2).replace('.', ',')
const zig = (x, y, len = 50) => { let d = `M${x} ${y}`; const n = 6, st = len / n; for (let i = 0; i < n; i++) d += ` L${x + st * i + st / 4} ${y - 6} L${x + st * i + 3 * st / 4} ${y + 6}`; return d + ` L${x + len} ${y}` }
const vzig = (x, y, len) => { let d = `M${x} ${y}`; const n = 6, st = len / n; for (let i = 0; i < n; i++) d += ` L${x - 5} ${y + st * i + st / 4} L${x + 5} ${y + st * i + 3 * st / 4}`; return d + ` L${x} ${y + len}` }
const Gnd = ({ x, y, label }) => <g><path d={`M${x - 9} ${y} H${x + 9} M${x - 5} ${y + 4} H${x + 5} M${x - 2} ${y + 8} H${x + 2}`} stroke={K.ink} stroke-width="1.3" />{label && <Lbl x={x} y={y + 20} s={8}>{label}</Lbl>}</g>

/* Diodo Zener 5,1 V con resistenza da 220 Ω */
export function Zener ({ mode }) {
  const [v, setV] = useAuto(mode, [3, 6, 9, 12], 1800)
  const VZ = 5.1, R = 220
  const on = v > VZ, vo = on ? VZ : v, iz = on ? (v - VZ) / R : 0
  const gx = (x) => 236 + x / 12 * 90, gy = (y) => 150 - y / 12 * 90
  return (
    <Fig caption="schema ideale: Zener da 5,1 V, resistenza da 220 Ω, nessun carico · sotto la soglia lo Zener non conduce e l'uscita segue l'ingresso; sopra, conduce al contrario e tiene 5,1 V. La tensione in più cade sulla resistenza"
      readout={<Readout items={[['ingresso', f1(v) + ' V'], ['uscita', f1(vo) + ' V', K.cur], ['corrente nello Zener', Math.round(iz * 1000) + ' mA']]} />}
      controls={mode === 'play' && <Slider id="zn-v" label="Tensione in ingresso" min={0} max={12} step={0.5} value={v} set={setV} show={f1(v) + ' V'} />}>
      <Svg h={190} label={`Zener: ingresso ${f1(v)} volt, uscita ${f1(vo)} volt`}>
        <Battery x={30} y={80} label="Vin" />
        <Wire d="M30 80 V40 H70 M120 40 H200 M170 40 V82 M170 110 V160 H30 V90" />
        <path d={zig(70, 40, 50)} fill="none" stroke={K.ink} stroke-width="1.6" /><Lbl x={95} y={28} s={9}>220 Ω</Lbl>
        <path d="M160 110 L180 110 L170 92 Z" fill={on ? K.ink : 'none'} stroke={K.ink} stroke-width="1.4" />
        <path d="M156 88 L160 92 H180 L184 96" fill="none" stroke={K.ink} stroke-width="2" />
        <Lbl x={152} y={106} s={8} a="end">Zener</Lbl><Lbl x={186} y={84} s={8} a="start">catodo</Lbl>
        <circle cx="200" cy="40" r="3" fill={K.cur} /><Lbl x={200} y={28} s={9} c={K.cur}>uscita {f1(vo)} V</Lbl>
        {on && <Flow d="M30 80 V40 H170 V160 H30 V90" dur={Math.max(0.4, 0.02 / iz)} />}
        <path d="M236 60 V150 H326" fill="none" stroke={K.part} />
        <path d={`M${gx(0)} ${gy(0)} L${gx(VZ)} ${gy(VZ)} L${gx(12)} ${gy(VZ)}`} fill="none" stroke={K.cur} stroke-width="1.8" />
        <circle class="k-ease" cx={gx(v)} cy={gy(vo)} r="4" fill={K.cur} />
        <Lbl x={281} y={168} s={8}>ingresso 0 → 12 V</Lbl><Lbl x={232} y={gy(VZ) + 3} s={8} a="end">5,1</Lbl>
        <Lbl x={281} y={54} s={8}>uscita</Lbl>
      </Svg>
    </Fig>
  )
}

/* Optoaccoppiatore: due circuiti separati */
export function Optoaccoppiatore ({ mode }) {
  const [on, setOn] = useAuto(mode, [false, true], 2200)
  return (
    <Fig caption="schema semplificato · a sinistra il circuito del microcontrollore (3,3 V), a destra un circuito a 12 V con la sua massa. Il LED interno illumina il fototransistor attraverso un isolante: il segnale passa, la corrente no"
      readout={<Readout items={[['LED interno', on ? 'acceso' : 'spento'], ['lato 12 V', on ? 'il fototransistor conduce' : 'bloccato', on ? K.cur : null]]} />}
      controls={mode === 'play' && <Seg label="Uscita del microcontrollore" value={on} set={setOn} options={[[false, '0 V'], [true, '3,3 V']]} />}>
      <Svg h={190} label={`Optoaccoppiatore: LED ${on ? 'acceso, il lato a 12 volt conduce' : 'spento, nessuna corrente'}`}>
        <rect x="120" y="36" width="96" height="112" rx="6" fill="#141418" stroke="#4A5263" />
        <path d="M168 40 V144" stroke={K.text} stroke-dasharray="3 4" /><Lbl x={168} y={164} s={8}>isolamento</Lbl>
        <Lbl x={30} y={28} s={9} c={K.plus}>3,3 V</Lbl>
        <Wire d="M30 34 V60 H60 M110 60 H146 V78 M146 92 V130 H30 V148" />
        <path d={zig(60, 60, 50)} fill="none" stroke={K.ink} stroke-width="1.4" /><Lbl x={85} y={48} s={8}>resistenza</Lbl>
        <path d="M138 78 H154 L146 92 Z M138 92 H154" fill={on ? '#F28C6B' : 'none'} stroke={K.ink} stroke-width="1.4" />
        <Lbl x={146} y={110} s={8}>LED</Lbl>
        <Gnd x={30} y={150} label="massa 1" />
        {on && <g class="k-blink" style={{ '--dur': '0.8s' }}>{[78, 86, 94].map(y => <path key={y} d={`M157 ${y} L178 ${y}`} stroke={K.light} stroke-width="1.8" stroke-dasharray="3 3" />)}</g>}
        <circle cx="192" cy="92" r="14" fill="none" stroke={K.ink} stroke-width="1.4" />
        <path d="M186 82 V102 M186 88 L200 78 M186 96 L200 106" fill="none" stroke={K.ink} stroke-width="1.6" />
        <Lbl x={306} y={16} s={9} c={K.plus}>12 V</Lbl>
        <Wire d="M306 22 V28 M306 52 V60 H200 V78 M200 106 V140 H306 V148" />
        <Lamp x={306} y={40} glow={on ? 1 : 0} /><Lbl x={290} y={44} s={8} a="end">carico</Lbl>
        <Gnd x={306} y={150} label="massa 2" />
        {on && <Flow d="M30 34 V60 H146 V130 H30 V148" dur={1.2} w={2} />}
        {on && <Flow d="M306 22 V60 H200 V140 H306 V148" dur={0.9} w={2} />}
        <Lbl x={222} y={124} s={8} a="start">fototransistor</Lbl>
      </Svg>
    </Fig>
  )
}

/* Amplificatore operazionale non invertente, alimentato a ±12 V */
const GAINS = [[1, 'filo', '—'], [2, '1 kΩ', '1 kΩ'], [5, '4 kΩ', '1 kΩ'], [11, '10 kΩ', '1 kΩ'], [21, '20 kΩ', '1 kΩ']]
export function AmplificatoreOperazionale ({ mode }) {
  const [g, setG] = useAuto(mode, GAINS.map(x => x[0]), 2200)
  const [, rf, rg] = GAINS.find(x => x[0] === g)
  const VIN = 1, SAT = 10.5
  const X0 = 196, W = 130, Y0 = 108, S = 4.6   // px per volt
  let pin = '', pout = ''
  for (let k = 0; k <= W; k++) { const s = Math.sin(k / W * 4 * Math.PI); pin += (k ? ' L' : 'M') + (X0 + k) + ' ' + (Y0 - s * VIN * S).toFixed(1); pout += (k ? ' L' : 'M') + (X0 + k) + ' ' + (Y0 - Math.max(-SAT, Math.min(SAT, s * VIN * g)) * S).toFixed(1) }
  const clip = VIN * g > SAT
  return (
    <Fig caption="amplificatore non invertente alimentato a ±12 V, ingresso con picchi di 1 V · guadagno = 1 + Rf ÷ Rg. L'uscita non può superare circa ±10,5 V (poco meno dell'alimentazione): oltre, l'onda viene tagliata"
      readout={<Readout items={[['guadagno', g + '×'], ['picco in uscita', clip ? 'tagliato a ±10,5 V' : '±' + f1(VIN * g) + ' V', K.cur], ['Rf / Rg', rf + ' / ' + rg]]} />}
      controls={mode === 'play' && <Seg label="Guadagno" value={g} set={setG} options={GAINS.map(x => [x[0], x[0] + '×'])} />}>
      <Svg h={200} label={`Amplificatore operazionale con guadagno ${g}: uscita ${clip ? 'tagliata' : 'di picco ' + f1(VIN * g) + ' volt'}`}>
        <path d="M60 40 L60 110 L120 75 Z" fill="#1A1F2B" stroke={K.ink} stroke-width="1.6" />
        <Lbl x={68} y={58} s={11} c={K.minus}>−</Lbl><Lbl x={68} y={100} s={11} c={K.plus}>+</Lbl>
        <Wire d={"M14 96 H60 M120 75 H160 M40 54 H60 M40 54 V20 H140 V75" + (g > 1 ? " M40 54 V140" : "")} />
        <circle cx="14" cy="96" r="3" fill="#8FA8FF" /><Lbl x={14} y={88} s={8} c="#8FA8FF">ingresso</Lbl>
        {g > 1 ? <g><path d={zig(70, 20, 44)} fill="none" stroke={K.ink} stroke-width="1.4" /><rect x="66" y="12" width="52" height="16" fill="#0E1117" opacity="0" /><Lbl x={92} y={12} s={8}>Rf {rf}</Lbl>
          <path d={vzig(40, 140, 30)} fill="none" stroke={K.ink} stroke-width="1.4" /><Lbl x={50} y={160} s={8} a="start">Rg {rg}</Lbl><Gnd x={40} y={172} /></g>
          : <Lbl x={92} y={14} s={8}>uscita collegata direttamente a −</Lbl>}
        <circle cx="160" cy="75" r="3" fill={K.cur} /><Lbl x={160} y={67} s={8} c={K.cur}>uscita</Lbl>
        <path d={`M${X0} ${Y0} H${X0 + W}`} stroke={K.part} />
        {[SAT, -SAT].map(sv => <path key={sv} d={`M${X0} ${Y0 - sv * S} H${X0 + W}`} stroke={K.text} stroke-dasharray="2 4" opacity=".6" />)}
        <Lbl x={X0 - 4} y={Y0 - SAT * S + 3} s={7} a="end">+10,5</Lbl><Lbl x={X0 - 4} y={Y0 + SAT * S + 3} s={7} a="end">−10,5</Lbl>
        <path d={pout} fill="none" stroke={K.cur} stroke-width="2" />
        <path d={pin} fill="none" stroke="#8FA8FF" stroke-width="1.6" />
        <Lbl x={X0 + W / 2} y={190} s={8}>blu: ingresso · giallo: uscita</Lbl>
      </Svg>
    </Fig>
  )
}

/* Timer 555 astabile: R1 = 1 kΩ, C = 100 µF, alimentazione 9 V */
const R2S = [4700, 10000, 47000]
export function Timer555 ({ mode }) {
  const [r2, setR2] = useAuto(mode, R2S, 6000)
  const R1 = 1000, C = 100e-6
  const th = 0.693 * (R1 + r2) * C, tl = 0.693 * r2 * C, T = th + tl, f = 1 / T
  const [led, setLed] = useState(true)
  useEffect(() => {
    if (calm()) { setLed(true); return }
    let on = true, t
    const run = () => { setLed(on); t = setTimeout(() => { on = !on; run() }, (on ? th : tl) * 1000) }
    run(); return () => clearTimeout(t)
  }, [r2])
  // grafico: due periodi, tensione del condensatore tra 1/3 e 2/3 (curve esponenziali) e uscita
  const X0 = 150, W = 176, sx = W / (2 * T), V = 9, vy = (vv) => 120 - vv / V * 90
  const tauC = (R1 + r2) * C, tauD = r2 * C
  let cap = '', out = ''
  for (let k = 0; k <= 200; k++) {
    const t = k / 200 * 2 * T, tm = t % T
    const vc = tm < th ? V - (V - V / 3) * Math.exp(-tm / tauC) : (2 * V / 3) * Math.exp(-(tm - th) / tauD)
    cap += (k ? ' L' : 'M') + (X0 + t * sx).toFixed(1) + ' ' + vy(vc).toFixed(1)
    out += (k ? ' L' : 'M') + (X0 + t * sx).toFixed(1) + ' ' + (tm < th ? 140 : 168)
  }
  return (
    <Fig caption="555 astabile a 9 V con R1 = 1 kΩ e C = 100 µF · il condensatore (curva gialla) si carica fino a 2/3 di Vcc e si scarica fino a 1/3; l'uscita (bianca) è alta durante la carica. Il LED lampeggia con i tempi veri calcolati"
      readout={<Readout items={[['R2', r2 >= 10000 ? r2 / 1000 + ' kΩ' : f1(r2 / 1000) + ' kΩ'], ['frequenza', f2(f) + ' Hz', K.cur], ['acceso / spento', f2(th) + ' s / ' + f2(tl) + ' s']]} />}
      controls={mode === 'play' && <Seg label="Resistenza R2" value={r2} set={setR2} options={[[4700, '4,7 kΩ'], [10000, '10 kΩ'], [47000, '47 kΩ']]} />}>
      <Svg h={190} label={`Timer 555: con R2 di ${r2} ohm lampeggia a ${f2(f)} hertz`}>
        <rect x="30" y="40" width="76" height="96" rx="6" fill="#1A1F2B" stroke="#4A5263" /><Lbl x={68} y={58} s={10} c={K.ink}>555</Lbl>
        <Lbl x={68} y={80} s={7}>2 comparatori</Lbl><Lbl x={68} y={92} s={7}>+ memoria</Lbl>
        <Wire d="M106 100 H124 V112" />
        <circle cx="124" cy="122" r="9" fill={led ? '#F28C6B' : '#2A1914'} stroke="#F28C6B" />
        {led && <circle cx="124" cy="122" r="16" fill="#F28C6B" opacity=".25" />}
        <Lbl x={124} y={148} s={8}>LED</Lbl>
        <path d={`M${X0} 30 V170`} stroke={K.part} />
        {[V / 3, 2 * V / 3].map(vv => <path key={vv} d={`M${X0} ${vy(vv)} H${X0 + W}`} stroke={K.text} stroke-dasharray="2 4" opacity=".6" />)}
        <Lbl x={X0 - 4} y={vy(2 * V / 3) + 3} s={7} a="end">2/3</Lbl><Lbl x={X0 - 4} y={vy(V / 3) + 3} s={7} a="end">1/3</Lbl>
        <path d={cap} fill="none" stroke={K.cur} stroke-width="2" />
        <path d={out} fill="none" stroke={K.ink} stroke-width="1.6" />
        <Lbl x={X0 + W} y={26} s={8} a="end">condensatore · 2 periodi = {f2(2 * T)} s</Lbl>
        <Lbl x={X0 + W} y={184} s={8} a="end">uscita</Lbl>
      </Svg>
    </Fig>
  )
}

/* Porte logiche */
const GATES = { AND: (a, b) => a & b, OR: (a, b) => a | b, NOT: (a) => 1 - a, NAND: (a, b) => 1 - (a & b), XOR: (a, b) => a ^ b }
const HINT = { AND: 'come due interruttori in serie', OR: 'come due interruttori in parallelo', NOT: 'fa il contrario', NAND: 'AND seguita da NOT', XOR: '1 se gli ingressi sono diversi' }
function GateShape ({ g, x, y }) {
  const bubble = g === 'NOT' || g === 'NAND'
  const body = g === 'AND' || g === 'NAND' ? `M${x} ${y} H${x + 30} A30 30 0 0 1 ${x + 30} ${y + 60} H${x} Z`
    : g === 'NOT' ? `M${x} ${y} L${x + 52} ${y + 30} L${x} ${y + 60} Z`
      : `M${x} ${y} Q${x + 18} ${y + 30} ${x} ${y + 60} Q${x + 42} ${y + 60} ${x + 62} ${y + 30} Q${x + 42} ${y} ${x} ${y} Z`
  const end = g === 'NOT' ? x + 52 : g === 'AND' || g === 'NAND' ? x + 60 : x + 62
  return <g>
    <path d={body} fill="#1A1F2B" stroke={K.ink} stroke-width="1.8" />
    {g === 'XOR' && <path d={`M${x - 8} ${y} Q${x + 10} ${y + 30} ${x - 8} ${y + 60}`} fill="none" stroke={K.ink} stroke-width="1.8" />}
    {bubble && <circle cx={end + 5} cy={y + 30} r="5" fill="#1A1F2B" stroke={K.ink} stroke-width="1.8" />}
    <Lbl x={x + 22} y={y + 34} s={10} c={K.ink}>{g}</Lbl>
  </g>
}
export function PorteLogiche ({ mode }) {
  const [g, setG] = useState('AND')
  const [ab, setAb] = useAuto(mode, ['00', '01', '10', '11'], 1400)
  const a = +ab[0], b = +ab[1], one = g === 'NOT'
  const out = one ? GATES.NOT(a) : GATES[g](a, b)
  const c1 = (v) => v ? K.cur : '#4A5263'
  const rows = one ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]]
  return (
    <Fig caption="1 = tensione alta (circa 5 V), 0 = circa 0 V · l'uscita dipende solo dagli ingressi, secondo la regola della porta. La riga accesa della tabella è la situazione di adesso"
      readout={<Readout items={[['porta', g], ['ingressi', one ? 'A = ' + a : `A = ${a}, B = ${b}`], ['uscita', out + '', K.cur]]} />}
      controls={mode === 'play' && <div style="display:flex;flex-direction:column;gap:8px">
        <Seg label="Porta" value={g} set={setG} options={Object.keys(GATES).map(k => [k, k])} />
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <button class={'btn' + (a ? ' on' : '')} aria-pressed={!!a} onClick={() => setAb((1 - a) + '' + b)}>A = {a}</button>
          {!one && <button class={'btn' + (b ? ' on' : '')} aria-pressed={!!b} onClick={() => setAb(a + '' + (1 - b))}>B = {b}</button>}
        </div>
      </div>}>
      <Svg h={180} label={`Porta ${g}: ingressi ${one ? a : a + ' e ' + b}, uscita ${out}`}>
        <path d={one ? 'M44 78 H90' : 'M44 58 H90'} stroke={c1(a)} stroke-width="2.4" />
        {!one && <path d="M44 98 H90" stroke={c1(b)} stroke-width="2.4" />}
        <Lbl x={38} y={one ? 82 : 62} s={10} a="end" c={c1(a)}>A {a}</Lbl>
        {!one && <Lbl x={38} y={102} s={10} a="end" c={c1(b)}>B {b}</Lbl>}
        <GateShape g={g} x={90} y={48} />
        <path d="M160 78 H196" stroke={c1(out)} stroke-width="2.4" />
        <circle cx="206" cy="78" r="10" fill={out ? K.light : '#2A2416'} stroke={K.light} />
        {out ? <circle cx="206" cy="78" r="18" fill={K.light} opacity=".25" /> : null}
        <Lbl x={206} y={104} s={9} c={c1(out)}>uscita {out}</Lbl>
        <Lbl x={120} y={140} s={9}>{HINT[g]}</Lbl>
        <g transform="translate(244 30)">
          <Lbl x={one ? 30 : 40} y={0} s={8}>{one ? 'A → esce' : 'A B → esce'}</Lbl>
          {rows.map((r, i) => { const o = one ? GATES.NOT(r[0]) : GATES[g](r[0], r[1]); const cur = one ? r[0] === a : r[0] === a && r[1] === b
            return <g key={i}><rect x="0" y={8 + i * 20} width={one ? 60 : 80} height="18" rx="3" fill={cur ? '#2B3A66' : 'transparent'} class="k-ease" />
              <text x={one ? 30 : 40} y={21 + i * 20} fill={cur ? K.ink : K.text} font-size="11" text-anchor="middle" style="font-family:JetBrains Mono, monospace">{r.join(' ')} → {o}</text></g> })}
        </g>
      </Svg>
    </Fig>
  )
}
