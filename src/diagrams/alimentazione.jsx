// Schemi dell'alimentazione. Regole: skill "invenio-schemi".
import { useEffect, useState } from 'preact/hooks'
import { calm, K, Svg, Lbl, Wire, Flow, Electrons, Battery, Lamp, Fig, Seg, Slider, Readout, useAuto } from './kit'
import './alimentazione.css'

const f1 = (v) => v.toFixed(1).replace('.', ',')
const f2 = (v) => v.toFixed(2).replace('.', ',')
const vzig = (x, y, len) => { let d = `M${x} ${y}`; const n = 6, st = len / n; for (let i = 0; i < n; i++) d += ` L${x - 6} ${y + st * i + st / 4} L${x + 6} ${y + st * i + 3 * st / 4}`; return d + ` L${x} ${y + len}` }
const coil = (x, y, n = 4, r = 8) => { let d = `M${x} ${y}`; for (let i = 0; i < n; i++) d += ` a${r} ${r} 0 0 1 ${2 * r} 0`; return d }
const Gnd = ({ x, y }) => <path d={`M${x - 10} ${y} H${x + 10} M${x - 6} ${y + 5} H${x + 6} M${x - 2} ${y + 10} H${x + 2}`} stroke={K.ink} stroke-width="1.4" />
// Diodo lungo un segmento: anodo in (x1,y1), catodo in (x2,y2)
function DiodeSeg ({ x1, y1, x2, y2, on = true, s = 7 }) {
  const a = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
  const c = on ? K.ink : '#4A5263'
  return <g>
    <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke={c} stroke-width="1.6" />
    <g transform={`translate(${mx} ${my}) rotate(${a})`}>
      <path d={`M${-s} ${-s} L${s} 0 L${-s} ${s} Z`} fill={on ? K.ink : '#2A2F3A'} stroke={c} stroke-width="1.4" />
      <path d={`M${s} ${-s} V${s}`} stroke={c} stroke-width="2" />
    </g>
  </g>
}
// Interruttore che si chiude per D del periodo (periodo rallentato a 2,4 s)
function useSwitch (D) {
  const [on, setOn] = useState(true)
  useEffect(() => {
    if (calm()) { setOn(true); return }
    let alive = true, t
    const step = (v) => { if (!alive) return; setOn(v); t = setTimeout(() => step(!v), (v ? D : 1 - D) * 2400) }
    step(true)
    return () => { alive = false; clearTimeout(t) }
  }, [D])
  return on
}
function Pwm ({ D, x = 60, y = 172, w = 240, h = 22, periods = 3 }) {
  const p = w / periods; let d = `M${x} ${y + h}`
  for (let i = 0; i < periods; i++) { const x0 = x + i * p; d += ` V${y} H${x0 + D * p} V${y + h} H${x0 + p}` }
  return <g><path d={d} fill="none" stroke={K.ink} stroke-width="1.4" /><Lbl x={x - 6} y={y + 6} s={8} a="end">chiuso</Lbl><Lbl x={x - 6} y={y + h} s={8} a="end">aperto</Lbl></g>
}

/* Regolatore lineare: 7805 con carico da 10 Ω */
export function RegolatoreLineare ({ mode }) {
  const [vin, setVin] = useAuto(mode, [12, 9, 7, 6], 2000)
  const vout = Math.max(0, Math.min(5, vin - 2)), i = vout / 10, p = (vin - vout) * i
  const waves = Math.min(4, Math.round(p * 1.2))
  return (
    <Fig caption="schema semplificato di un 7805 con un carico da 10 Ω · il transistor in serie fa da resistenza variabile: tiene l'uscita a 5 V e trasforma in calore la tensione in più, (Vin − Vout) × I. Sotto circa 7 V non ha più margine e l'uscita scende"
      readout={<Readout items={[['ingresso', f1(vin) + ' V'], ['uscita', f2(vout) + ' V', K.cur], ['calore', f2(p) + ' W', K.heat]]} />}
      controls={mode === 'play' && <Slider id="lin-vin" label="Tensione in ingresso" min={5} max={15} step={0.5} value={vin} set={setVin} show={f1(vin) + ' V'} />}>
      <Svg h={190} label={`Ingresso ${vin} volt, uscita ${f2(vout)} volt, il regolatore scalda ${f2(p)} watt`}>
        <Battery x={40} y={86} />
        <Lbl x={50} y={124} s={9} a="start">Vin</Lbl>
        <Wire d="M40 86 V50 H110 M200 50 H290 V70 M290 118 V160 H40 V96 M155 98 V160" />
        <rect x="110" y="30" width="90" height="68" rx="6" fill={K.body} stroke={K.part} />
        <path d="M120 50 L127 43 L135 57 L143 43 L151 57 L159 43 L167 57 L175 43 L182 57 L190 50" fill="none" stroke={K.ink} stroke-width="1.6" />
        <path d="M128 66 L184 36 M178 36 H184 V42" fill="none" stroke={K.ink} stroke-width="1.2" />
        <path d="M146 76 L164 84 L146 92 Z" fill="none" stroke={K.text} stroke-width="1.2" />
        <path d="M220 50 V84 H164" fill="none" stroke={K.text} stroke-width="1" stroke-dasharray="3 3" />
        <Lbl x={155} y={112} s={8}>transistor + confronto</Lbl>
        <Lbl x={240} y={98} s={8}>misura</Lbl>
        {Array.from({ length: waves }).map((_, k) => <path key={k} class="lin-heat" style={{ animationDelay: (k * 0.2) + 's' }} d={`M${128 + k * 18} 26 q4 -5 0 -10 q-4 -5 0 -10`} fill="none" stroke={K.heat} stroke-width="1.8" />)}
        <path d={vzig(290, 70, 48)} fill="none" stroke={K.ink} stroke-width="1.6" />
        <Lbl x={304} y={98} s={9} a="start">10 Ω</Lbl>
        <Lbl x={290} y={40} s={9} c={K.cur}>Vout</Lbl>
        <Lbl x={155} y={176} s={9}>massa comune</Lbl>
        {vout > 0 && <Flow d="M40 86 V50 H290 V160 H40 V96" dur={Math.max(0.4, 0.25 / i)} />}
      </Svg>
    </Fig>
  )
}

/* Convertitore step-down (buck) */
const BUCK = [0.25, 0.42, 0.67]
export function ConvertitoreBuck ({ mode }) {
  const [D, setD] = useAuto(mode, BUCK, 4800)
  const on = useSwitch(D)
  const vout = 12 * D
  return (
    <Fig caption="schema ideale e rallentato moltissimo: in realtà l'interruttore scatta decine o centinaia di migliaia di volte al secondo · chiuso, la corrente passa dalla batteria alla bobina e al carico; aperto, la bobina la mantiene girando nel diodo. Uscita ≈ D × 12 V"
      readout={<Readout items={[['interruttore chiuso', Math.round(D * 100) + ' % del tempo'], ['uscita', f1(vout) + ' V', K.cur]]} />}
      controls={mode === 'play' && <Seg label="Duty cycle" value={D} set={setD} options={BUCK.map(v => [v, Math.round(v * 100) + ' %'])} />}>
      <Svg h={200} label={`Convertitore step-down: interruttore ${on ? 'chiuso' : 'aperto'}, uscita circa ${f1(vout)} volt`}>
        <Battery x={30} y={90} /><Lbl x={40} y={124} s={9} a="start">12 V</Lbl>
        <Wire d="M30 90 V40 H70 M110 40 H150 M214 40 H290 V80 M290 120 V150 H30 V100 M130 40 V90 M130 104 V150 M240 40 V92 M240 100 V150" />
        <circle cx="70" cy="40" r="2.6" fill={K.ink} /><circle cx="110" cy="40" r="2.6" fill={K.ink} />
        <path d={on ? 'M70 40 L110 40' : 'M70 40 L104 22'} stroke={K.ink} stroke-width="2.4" />
        <Lbl x={90} y={60} s={8}>interruttore</Lbl>
        <path d="M122 104 L138 104 L130 90 Z" fill="none" stroke={on ? '#4A5263' : K.ink} stroke-width="1.4" /><path d="M122 90 H138" stroke={on ? '#4A5263' : K.ink} stroke-width="2" />
        <Lbl x={118} y={100} s={8} a="end">diodo</Lbl>
        <path d={coil(150, 40)} fill="none" stroke={K.ink} stroke-width="1.8" /><Lbl x={182} y={24} s={8}>bobina</Lbl>
        <path d="M230 92 H250 M230 100 H250" stroke={K.ink} stroke-width="2" /><Lbl x={234} y={120} s={8} a="end">C</Lbl>
        <path d={vzig(290, 80, 40)} fill="none" stroke={K.ink} stroke-width="1.6" /><Lbl x={302} y={104} s={8} a="start">carico</Lbl>
        {on ? <Flow d="M30 90 V40 H290 V150 H30 V100" dur={0.8} /> : <Flow d="M130 150 V40 H290 V150 H130" dur={0.8} />}
        <Lbl x={260} y={30} s={8} c={K.cur}>{f1(vout)} V</Lbl>
        <Pwm D={D} />
      </Svg>
    </Fig>
  )
}

/* Convertitore step-up (boost) */
const BOOST = [0.26, 0.5, 0.69]
export function ConvertitoreBoost ({ mode }) {
  const [D, setD] = useAuto(mode, BOOST, 4800)
  const on = useSwitch(D)
  const vout = 3.7 / (1 - D)
  return (
    <Fig caption="schema ideale e rallentato moltissimo · interruttore chiuso: la corrente va dalla batteria alla bobina e a massa, la bobina si carica (il carico è alimentato dal condensatore). Aperto: la bobina somma la sua tensione a quella della batteria e spinge corrente nel diodo. Uscita ≈ 3,7 V ÷ (1 − D)"
      readout={<Readout items={[['interruttore chiuso', Math.round(D * 100) + ' % del tempo'], ['uscita', f1(vout) + ' V', K.cur]]} />}
      controls={mode === 'play' && <Seg label="Duty cycle" value={D} set={setD} options={BOOST.map(v => [v, Math.round(v * 100) + ' %'])} />}>
      <Svg h={200} label={`Convertitore step-up: interruttore ${on ? 'chiuso' : 'aperto'}, uscita circa ${f1(vout)} volt`}>
        <Battery x={30} y={90} /><Lbl x={40} y={124} s={9} a="start">3,7 V</Lbl>
        <Wire d="M30 90 V40 H50 M114 40 H160 M174 40 H290 V80 M290 120 V150 H30 V100 M140 40 V78 M140 112 V150 M230 40 V92 M230 100 V150" />
        <path d={coil(50, 40)} fill="none" stroke={K.ink} stroke-width="1.8" /><Lbl x={82} y={24} s={8}>bobina</Lbl>
        <circle cx="140" cy="78" r="2.6" fill={K.ink} /><circle cx="140" cy="112" r="2.6" fill={K.ink} />
        <path d={on ? 'M140 78 L140 112' : 'M140 78 L124 108'} stroke={K.ink} stroke-width="2.4" />
        <Lbl x={148} y={98} s={8} a="start">interruttore</Lbl>
        <path d="M160 32 L160 48 L174 40 Z" fill="none" stroke={on ? '#4A5263' : K.ink} stroke-width="1.4" /><path d="M174 32 V48" stroke={on ? '#4A5263' : K.ink} stroke-width="2" />
        <Lbl x={167} y={24} s={8}>diodo</Lbl>
        <path d="M220 92 H240 M220 100 H240" stroke={K.ink} stroke-width="2" /><Lbl x={224} y={120} s={8} a="end">C</Lbl>
        <path d={vzig(290, 80, 40)} fill="none" stroke={K.ink} stroke-width="1.6" /><Lbl x={302} y={104} s={8} a="start">carico</Lbl>
        {on ? <g><Flow d="M30 90 V40 H140 V150 H30 V100" dur={0.8} /><Flow d="M230 92 V40 H290 V150 H230 V100" dur={1.6} w={1.8} /></g>
          : <Flow d="M30 90 V40 H290 V150 H30 V100" dur={0.8} />}
        <Lbl x={262} y={30} s={8} c={K.cur}>{f1(vout)} V</Lbl>
        <Pwm D={D} />
      </Svg>
    </Fig>
  )
}

/* Ponte raddrizzatore */
const T = [140, 45], B = [140, 145], L = [90, 95], R = [190, 95]
export function PonteRaddrizzatore ({ mode }) {
  const [c, setC] = useAuto(mode, [false, true], 4800)
  const [h, setH] = useState(0)
  useEffect(() => { if (calm()) return; const t = setInterval(() => setH(v => 1 - v), 1300); return () => clearInterval(t) }, [])
  const p1 = 'M42 95 H90 L140 45 H260 V170 H140 V145 L190 95 H230 V12 H30 V83'
  const p2 = 'M30 83 V12 H230 V95 H190 L140 45 H260 V170 H140 V145 L90 95 H42'
  // grafico: due periodi, uscita raddrizzata o livellata (costante di scarica illustrativa)
  const gx = (t) => 40 + t * 140, gy = (v) => 238 - v * 34
  let raw = '', sm = '', vs = 0
  for (let k = 0; k <= 200; k++) {
    const t = k / 100, a = Math.abs(Math.sin(Math.PI * t)); vs = Math.max(a, vs * Math.exp(-0.003))
    raw += (k ? ' L' : 'M') + gx(t).toFixed(1) + ' ' + gy(a).toFixed(1)
    sm += (k ? ' L' : 'M') + gx(t).toFixed(1) + ' ' + gy(vs).toFixed(1)
  }
  return (
    <Fig caption="schema semplificato · in ogni semionda conducono due diodi (chiari), gli altri due sono bloccati: nel carico la corrente va sempre dall'alto in basso. Il condensatore riempie le valli tra le gobbe. Animazione molto rallentata"
      readout={<Readout items={[['semionda', h ? 'negativa' : 'positiva'], ['uscita', c ? 'quasi continua' : 'a gobbe', K.cur]]} />}
      controls={mode === 'play' && <Seg label="Condensatore" value={c} set={setC} options={[[false, 'Senza C'], [true, 'Con C']]} />}>
      <Svg h={250} label={`Ponte raddrizzatore, semionda ${h ? 'negativa' : 'positiva'}: due diodi conducono e la corrente nel carico va sempre nello stesso verso`}>
        <circle cx="30" cy="95" r="12" fill={K.body} stroke={K.ink} /><path d="M22 95 q4 -7 8 0 t8 0" fill="none" stroke={K.ink} stroke-width="1.4" />
        <Lbl x={30} y={124} s={8}>alternata</Lbl>
        <Lbl x={50} y={88} s={10} c={h ? K.minus : K.plus}>{h ? '−' : '+'}</Lbl>
        <Lbl x={20} y={74} s={10} c={h ? K.plus : K.minus}>{h ? '+' : '−'}</Lbl>
        <Wire d="M42 95 H90 M190 95 H230 V50 M230 40 V12 H30 V83 M140 45 H260 V70 M260 118 V170 H140 V145" />
        <path d="M230 50 a5 5 0 0 0 0 -10" fill="none" stroke={K.wire} stroke-width="1.6" />
        <DiodeSeg x1={L[0]} y1={L[1]} x2={T[0]} y2={T[1]} on={!h} />
        <DiodeSeg x1={R[0]} y1={R[1]} x2={T[0]} y2={T[1]} on={!!h} />
        <DiodeSeg x1={B[0]} y1={B[1]} x2={L[0]} y2={L[1]} on={!!h} />
        <DiodeSeg x1={B[0]} y1={B[1]} x2={R[0]} y2={R[1]} on={!h} />
        <path d={vzig(260, 70, 48)} fill="none" stroke={K.ink} stroke-width="1.6" />
        <Lbl x={260} y={186} s={8}>carico</Lbl>
        <Lbl x={150} y={38} s={10} c={K.plus} a="start">+</Lbl><Lbl x={150} y={162} s={10} c={K.minus} a="start">−</Lbl>
        {c && <g><Wire d="M260 45 H300 V90 M300 98 V170 H260" /><path d="M290 90 H310 M290 98 H310" stroke={K.ink} stroke-width="2" /><Lbl x={316} y={98} s={8} a="start">C</Lbl></g>}
        <Flow d={h ? p2 : p1} dur={0.9} />
        <path d="M40 238 H320" stroke={K.part} />
        <path d={raw} fill="none" stroke={c ? '#4A5263' : K.cur} stroke-width="1.6" />
        {c && <path d={sm} fill="none" stroke={K.cur} stroke-width="1.8" />}
        <Lbl x={36} y={204} s={8} a="end">V</Lbl>
        <Lbl x={320} y={250} s={8} a="end">tempo</Lbl>
      </Svg>
    </Fig>
  )
}

/* Batteria agli ioni di litio */
export function BatteriaLitio ({ mode }) {
  const [s, setS] = useAuto(mode, ['s', 'c'], 3600)
  const dis = s === 's'
  const loop = dis ? 'M266 70 V30 H70 V70' : 'M70 70 V30 H266 V70'
  return (
    <Fig caption="schema semplificato · in scarica gli ioni di litio (verdi) vanno dalla grafite all'ossido dentro l'elettrolita, gli elettroni (blu) fanno il giro esterno dal − al +; la corrente convenzionale (giallo) va dal + al − nel circuito. In carica il caricatore spinge tutto al contrario"
      readout={<Readout items={[['fase', dis ? 'scarica: alimenta il circuito' : 'carica'], ['ioni Li⁺', dis ? 'grafite → ossido' : 'ossido → grafite', '#7FD08A']]} />}
      controls={mode === 'play' && <Seg label="Fase" value={s} set={setS} options={[['s', 'Scarica'], ['c', 'Carica']]} />}>
      <Svg h={200} label={dis ? 'Batteria al litio in scarica: ioni dalla grafite all\'ossido, elettroni nel circuito esterno' : 'Batteria al litio in carica: il caricatore riporta ioni ed elettroni verso la grafite'}>
        <rect x="40" y="70" width="256" height="100" rx="8" fill="#141A22" stroke={K.part} />
        <rect x="44" y="74" width="56" height="92" fill="#2B2F36" />
        {[82, 94, 106, 118, 130, 142, 154].map(y => <path key={y} d={`M46 ${y} H98`} stroke="#4A505C" stroke-width="2" />)}
        <rect x="236" y="74" width="56" height="92" fill="#3A2E3E" />
        {[0, 1, 2, 3].map(i => [0, 1, 2, 3, 4, 5].map(j => <circle key={i + '-' + j} cx={244 + i * 13} cy={82 + j * 15} r="3" fill="#6B5A70" />))}
        <path d="M168 74 V166" stroke={K.text} stroke-dasharray="4 4" />
        <Lbl x={72} y={186} s={8}>grafite (−)</Lbl><Lbl x={264} y={186} s={8}>ossido (+)</Lbl>
        <Lbl x={168} y={186} s={8}>elettrolita · separatore</Lbl>
        {[0, 1, 2, 3, 4, 5].map(k => <g key={k} class={dis ? 'li-s' : 'li-c'} style={{ animationDelay: (k * 0.45) + 's' }}>
          <circle cx={dis ? 104 : 232} cy={84 + k * 15} r="4.5" fill="#7FD08A" />
        </g>)}
        <Lbl x={58} y={64} s={11} c={K.minus}>−</Lbl><Lbl x={280} y={64} s={11} c={K.plus}>+</Lbl>
        <Wire d="M70 70 V30 H140 M196 30 H266 V70" />
        {dis ? <Lamp x={168} y={30} glow={1} />
          : <g><rect x="140" y="18" width="56" height="24" rx="4" fill={K.body} stroke={K.ink} /><Lbl x={168} y={12} s={8} c={K.ink}>caricatore</Lbl>
            <Lbl x={204} y={24} s={10} c={K.plus}>+</Lbl><Lbl x={132} y={24} s={10} c={K.minus}>−</Lbl></g>}
        <Flow d={loop} dur={1.1} />
        <Electrons d={loop} dur={1.4} r={4} />
      </Svg>
    </Fig>
  )
}

/* Ricarica CC/CV (TP4056, 1 A) */
const chV = (t) => t < 60 ? 3.0 + 1.2 * Math.pow(t / 60, 0.55) : 4.2
const TEND = 60 + 15 * Math.log(10)          // fine carica: corrente scesa a 0,1 A
const chI = (t) => t < 60 ? 1 : t < TEND ? Math.exp(-(t - 60) / 15) : 0
export function RicaricaLitio ({ mode }) {
  const [t, setT] = useAuto(mode, [10, 40, 75, 100], 2000)
  const X = (tt) => 40 + tt * 2.6, YV = (v) => 150 - (v - 2.8) / 1.6 * 120, YI = (i) => 150 - i / 1.25 * 120
  let dv = '', di = ''
  for (let k = 0; k <= 100; k++) { dv += (k ? ' L' : 'M') + X(k).toFixed(1) + ' ' + YV(chV(k)).toFixed(1); di += (k ? ' L' : 'M') + X(k).toFixed(1) + ' ' + YI(chI(k)).toFixed(1) }
  const V = '#B9A3FF'
  const phase = t < 60 ? 'corrente costante' : t < TEND ? 'tensione costante' : 'carica completa'
  const done = t >= TEND
  return (
    <Fig caption="andamento tipico, tempi indicativi · prima corrente costante (qui 1 A) mentre la tensione sale; a 4,2 V la tensione resta ferma e la corrente cala da sola; sotto 0,1 A (un decimo) la carica finisce e il LED cambia colore"
      readout={<Readout items={[['fase', phase], ['tensione', f2(chV(t)) + ' V', V], ['corrente', f2(chI(t)) + ' A', K.cur]]} />}
      controls={mode === 'play' && <Slider id="ch-t" label="Avanzamento della carica" min={0} max={100} value={t} set={setT} show={t + ' %'} />}>
      <Svg h={190} label={`Carica al ${t} per cento: ${phase}, ${f2(chV(t))} volt e ${f2(chI(t))} ampere`}>
        <path d="M40 30 V150 H300 V30" fill="none" stroke={K.part} />
        <rect x={X(0)} y="30" width={X(60) - X(0)} height="120" fill="rgba(255,210,122,.05)" />
        <Lbl x={X(30)} y={24} s={8}>corrente costante</Lbl><Lbl x={X(80)} y={24} s={8}>tensione costante</Lbl>
        <path d={`M${X(60)} 30 V150`} stroke={K.part} stroke-dasharray="3 3" />
        <path d={`M40 ${YV(4.2)} H300`} stroke={V} stroke-dasharray="2 4" opacity=".6" /><Lbl x={36} y={YV(4.2) + 3} s={8} c={V} a="end">4,2 V</Lbl>
        <Lbl x={36} y={YV(3.0) + 3} s={8} c={V} a="end">3,0 V</Lbl>
        <Lbl x={304} y={YI(1) + 3} s={8} c={K.cur} a="start">1 A</Lbl><Lbl x={304} y={YI(0.1) + 3} s={8} c={K.cur} a="start">0,1 A</Lbl>
        <path d={dv} fill="none" stroke={V} stroke-width="2" />
        <path d={di} fill="none" stroke={K.cur} stroke-width="2" />
        <path d={`M${X(t)} 30 V150`} stroke={K.ink} stroke-width="1" class="k-ease" />
        <circle cx={X(t)} cy={YV(chV(t))} r="4" fill={V} /><circle cx={X(t)} cy={YI(chI(t))} r="4" fill={K.cur} />
        <Lbl x={170} y={168} s={8}>tempo →</Lbl>
        <circle cx="290" cy="178" r="5" fill={done ? '#5080E8' : '#E05050'} /><Lbl x={280} y={181} s={8} a="end">LED {done ? 'carica finita' : 'in carica'}</Lbl>
      </Svg>
    </Fig>
  )
}

/* Cella solare */
export function CellaSolare ({ mode }) {
  const [l, setL] = useAuto(mode, [0, 1, 2], 2000)
  const loop = 'M168 160 H300 V30 H40 V70'
  return (
    <Fig caption="sezione semplificata e ingrandita · la luce crea coppie: il campo della giunzione manda l'elettrone (●) verso N, in alto, e la lacuna (○) verso P. Nel circuito la corrente convenzionale esce dal lato P (+) e rientra dal lato N (−). Più luce, più corrente; la tensione resta intorno a mezzo volt"
      readout={<Readout items={[['luce', ['buio', 'nuvoloso', 'sole pieno'][l]], ['corrente', ['nulla', 'bassa', 'alta'][l], K.cur], ['tensione', l ? 'circa 0,5 V' : '0 V']]} />}
      controls={mode === 'play' && <Seg label="Luce" value={l} set={setL} options={[[0, 'Buio'], [1, 'Nuvoloso'], [2, 'Sole']]} />}>
      <Svg h={190} label={`Cella solare con ${['buio', 'cielo nuvoloso', 'sole pieno'][l]}: corrente ${['nulla', 'bassa', 'alta'][l]}`}>
        <rect x="40" y="70" width="200" height="22" fill="#2E3D66" /><Lbl x={250} y={85} s={9} a="start">N</Lbl>
        <rect x="40" y="92" width="200" height="60" fill="#3C3450" /><Lbl x={250} y={126} s={9} a="start">P</Lbl>
        <path d="M40 92 H240" stroke={K.text} stroke-dasharray="3 3" />
        <rect x="40" y="152" width="200" height="8" fill="#9FA6B2" /><Wire d="M168 160 H300 V97 M300 73 V30 H40 V70" />
        {[60, 100, 140, 180, 220].map(x => <rect key={x} x={x - 3} y="64" width="6" height="8" fill="#C9D2E0" />)}
        <path d="M40 64 V70" stroke="#C9D2E0" stroke-width="2" />
        <Lbl x={140} y={176} s={8}>contatto posteriore</Lbl>
        <Lamp x={300} y={85} glow={[0, 0.4, 1][l]} />
        {Array.from({ length: [0, 2, 4][l] }).map((_, k) => <g key={k} style={{ animationDelay: (k * 0.6) + 's' }}>
          <g class="cs-ph" style={{ animationDelay: (k * 0.6) + 's' }}>
            <path d={`M${80 + k * 40} 38 L${80 + k * 40} 92`} stroke={K.light} stroke-width="1.8" /><path d={`M${75 + k * 40} 86 L${80 + k * 40} 94 L${85 + k * 40} 86`} fill="none" stroke={K.light} stroke-width="1.8" />
          </g>
          <circle class="cs-e" style={{ animationDelay: (k * 0.6) + 's' }} cx={86 + k * 40} cy={96} r="4" fill={K.el} />
          <circle class="cs-h" style={{ animationDelay: (k * 0.6) + 's' }} cx={86 + k * 40} cy={96} r="4" fill="none" stroke={K.hole} stroke-width="1.6" />
        </g>)}
        {l > 0 && <g><Flow d={loop} dur={l === 2 ? 0.7 : 1.8} /><Electrons d={loop} dur={l === 2 ? 0.9 : 2.2} r={4} /></g>}
        <Lbl x={316} y={128} s={10} c={K.plus}>+</Lbl><Lbl x={28} y={52} s={10} c={K.minus}>−</Lbl>
      </Svg>
    </Fig>
  )
}

/* Pila alcalina */
export function PilaAlcalina () {
  const loop = 'M168 20 V8 H296 V190 H168 V180'
  return (
    <Fig caption="sezione semplificata · lo zinco (al centro) cede elettroni, che escono dal fondello (−), attraversano il circuito e rientrano dal polo + verso il biossido di manganese. Dentro la pila gli ioni OH⁻ vanno dal lato positivo allo zinco e chiudono il percorso">
      <Svg h={200} label="Sezione di una pila alcalina collegata a una lampadina: elettroni dal fondello negativo al polo positivo attraverso il circuito">
        <rect x="156" y="20" width="24" height="10" rx="2" fill="#B0B8C8" />
        <rect x="118" y="30" width="100" height="144" rx="6" fill="#8C96AA" />
        <rect x="124" y="36" width="88" height="132" fill="#2B2420" />
        <rect x="146" y="44" width="44" height="118" fill="#4A4A4A" stroke="#B9A3FF" stroke-dasharray="3 2" />
        <rect x="166" y="60" width="4" height="114" fill="#C9A86A" />
        <rect x="140" y="174" width="56" height="8" rx="2" fill="#B0B8C8" />
        {[0, 1, 2].map(k => <g key={k}>
          <g class="pa-l" style={{ animationDelay: (k * 0.7) + 's' }}><circle cx="130" cy={70 + k * 34} r="3.5" fill="#C9D7EA" /></g>
          <g class="pa-r" style={{ animationDelay: (k * 0.7 + 0.35) + 's' }}><circle cx="206" cy={86 + k * 34} r="3.5" fill="#C9D7EA" /></g>
        </g>)}
        <Lbl x={168} y={16} s={10} c={K.plus} a="end" dx="-14">+</Lbl>
        <Lbl x={130} y={194} s={10} c={K.minus}>−</Lbl>
        <Wire d="M168 20 V8 H296 V105 M296 129 V190 H168 V182" />
        <Lamp x={296} y={117} glow={0.9} />
        <Flow d={loop} dur={1.2} />
        <Electrons d={loop} dur={1.5} r={4} />
        <path d="M112 50 H126 M112 100 H150 M112 150 H164 M226 70 H212" stroke={K.text} stroke-width="0.8" />
        <Lbl x={108} y={46} s={8} a="end">biossido di</Lbl><Lbl x={108} y={56} s={8} a="end">manganese (+)</Lbl>
        <Lbl x={108} y={104} s={8} a="end">zinco (−)</Lbl>
        <Lbl x={108} y={154} s={8} a="end">chiodino di ottone</Lbl>
        <Lbl x={230} y={66} s={8} a="start">separatore</Lbl>
        <Lbl x={230} y={150} s={8} a="start" c="#C9D7EA">● OH⁻</Lbl>
      </Svg>
    </Fig>
  )
}
