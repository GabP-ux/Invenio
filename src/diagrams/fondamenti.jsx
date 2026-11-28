// Schemi dei fondamenti e degli strumenti. Regole: skill "invenio-schemi".
import { useEffect, useState } from 'preact/hooks'
import { calm, K, Svg, Lbl, Wire, Flow, Electrons, Arrow, Battery, Lamp, Fig, Seg, Slider, Readout, useAuto } from './kit'
import './fondamenti.css'

const f1 = (v) => v.toFixed(1).replace('.', ',')
const f2 = (v) => v.toFixed(2).replace('.', ',')
const CU = '#C98A4B'
const zig = (x, y, len = 50) => { let d = `M${x} ${y}`; const n = 6, st = len / n; for (let i = 0; i < n; i++) d += ` L${x + st * i + st / 4} ${y - 6} L${x + st * i + 3 * st / 4} ${y + 6}`; return d + ` L${x + len} ${y}` }
const vzig = (x, y, len) => { let d = `M${x} ${y}`; const n = 6, st = len / n; for (let i = 0; i < n; i++) d += ` L${x - 6} ${y + st * i + st / 4} L${x + 6} ${y + st * i + 3 * st / 4}`; return d + ` L${x} ${y + len}` }
const dur = (i, ref = 0.3) => Math.max(0.35, Math.min(3, ref / Math.max(i, 0.01)))
// angolo che avanza da solo (fermo se le animazioni sono ridotte)
function useAngle (speed = 1.6, start = 0.7) {
  const [a, setA] = useState(start)
  useEffect(() => {
    if (calm()) return
    let raf, t0 = performance.now()
    const tick = (t) => { setA(v => v + (t - t0) / 1000 * speed); t0 = t; raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return a
}

/* Tensione e corrente: pila, interruttore, lampadina (trattata come 15 Ω) */
export function TensioneCorrente ({ mode }) {
  const [v, setV] = useAuto(mode, [0, 1.5, 3, 4.5], 1800)
  const on = v > 0, i = v / 15
  const loop = 'M40 86 V40 H300 V150 H40 V96'
  return (
    <Fig caption="schema semplificato: la lampadina è trattata come una resistenza fissa da 15 Ω · a circuito aperto la tensione c'è ma la corrente no. Chiuso, la corrente convenzionale (giallo) va dal + al −; gli elettroni (blu) al contrario"
      readout={<Readout items={[['tensione', on ? f1(v) + ' V' : '4,5 V (aperto)'], ['corrente', on ? Math.round(i * 1000) + ' mA' : '0 mA', K.cur]]} />}
      controls={mode === 'play' && <Seg label="Circuito" value={v} set={setV} options={[[0, 'Aperto'], [1.5, '1,5 V'], [3, '3 V'], [4.5, '4,5 V']]} />}>
      <Svg h={180} label={on ? `Circuito chiuso a ${f1(v)} volt: scorrono ${Math.round(i * 1000)} milliampere` : 'Circuito aperto: nessuna corrente'}>
        <Battery x={40} y={86} label={on ? f1(v) + ' V' : '4,5 V'} />
        <Wire d="M40 86 V40 H120 M160 40 H300 V83 M300 107 V150 H40 V96" />
        <circle cx="120" cy="40" r="2.6" fill={K.ink} /><circle cx="160" cy="40" r="2.6" fill={K.ink} />
        <path d={on ? 'M120 40 L160 40' : 'M120 40 L154 20'} stroke={K.ink} stroke-width="2.4" />
        <Lbl x={140} y={62} s={9}>interruttore</Lbl>
        <Lamp x={300} y={95} glow={on ? v / 4.5 : 0} />
        {on && <g><Flow d={loop} dur={dur(i, 0.12)} /><Electrons d={loop} dur={dur(i, 0.15)} r={4} /></g>}
        {on && <Lbl x={210} y={30} s={10} c={K.cur}>I →</Lbl>}
        {!on && <Lbl x={170} y={130} s={9}>nessuna corrente: il circuito è aperto</Lbl>}
      </Svg>
    </Fig>
  )
}

/* Serie e parallelo: pila 6 V, due lampadine da 12 Ω */
export function SerieParallelo ({ mode }) {
  const [st, setSt] = useAuto(mode, ['s', 's1', 'p', 'p1'], 2200)
  const par = st[0] === 'p', one = st.length > 1
  const R = 12, V = 6
  const iS = one ? 0 : V / (2 * R)
  const vS = one ? 0 : V / 2
  const iP = (one ? 1 : 2) * V / R
  const glowS = (vS * vS / R) / 3, glowP = 1
  return (
    <Fig caption="pila da 6 V e lampadine trattate come resistenze da 12 Ω · in serie la stessa corrente le attraversa entrambe e ognuna riceve 3 V; in parallelo ognuna riceve 6 V e la pila dà la somma delle correnti. Se ne togli una…"
      readout={<Readout items={[['corrente della pila', f2(par ? iP : iS) + ' A', K.cur], ['tensione su ogni lampadina', par ? '6 V' : f1(vS) + ' V']]} />}
      controls={mode === 'play' && <div style="display:flex;flex-direction:column;gap:8px">
        <Seg label="Collegamento" value={par ? 'p' : 's'} set={(x) => setSt(x + (one ? '1' : ''))} options={[['s', 'Serie'], ['p', 'Parallelo']]} />
        <Seg label="Lampadine" value={one ? '1' : ''} set={(x) => setSt((par ? 'p' : 's') + x)} options={[['', 'Entrambe'], ['1', 'Ne tolgo una']]} />
      </div>}>
      <Svg h={190} label={`${par ? 'In parallelo' : 'In serie'}${one ? ', con una lampadina tolta' : ''}: corrente della pila ${f2(par ? iP : iS)} ampere`}>
        <Battery x={40} y={90} label="6 V" />
        {!par ? <g>
          <Wire d="M40 90 V40 H128 M152 40 H208 M232 40 H300 V150 H40 V100" />
          <Lamp x={140} y={40} glow={glowS} />
          {one ? <g><circle cx="220" cy="40" r="12" fill="none" stroke={K.text} stroke-dasharray="3 3" /><Lbl x={220} y={68} s={9}>tolta</Lbl></g> : <Lamp x={220} y={40} glow={glowS} />}
          {iS > 0 && <Flow d="M40 90 V40 H300 V150 H40 V100" dur={dur(iS, 0.2)} />}
          {one && <Lbl x={190} y={120} s={9}>circuito interrotto: si spegne tutto</Lbl>}
        </g> : <g>
          <Wire d="M40 90 V40 H270 V83 M270 107 V150 H40 V100 M170 40 V83 M170 107 V150" />
          <Lamp x={170} y={95} glow={glowP} />
          {one ? <g><circle cx="270" cy="95" r="12" fill="none" stroke={K.text} stroke-dasharray="3 3" /><Lbl x={270} y={124} s={9}>tolta</Lbl></g> : <Lamp x={270} y={95} glow={glowP} />}
          <Flow d={one ? 'M40 90 V40 H170 V150 H40 V100' : 'M40 90 V40 H270 V150 H40 V100'} dur={dur(iP, 0.25)} />
          {!one && <Flow d="M170 40 V150" dur={dur(0.5, 0.25)} />}
          <Lbl x={186} y={82} s={9} a="start">0,5 A</Lbl>
          {!one && <Lbl x={286} y={82} s={9} a="start">0,5 A</Lbl>}
        </g>}
        <Lbl x={70} y={176} s={9} a="start" c={K.cur}>{par ? (one ? 'pila: 0,5 A' : 'pila: 0,5 + 0,5 = 1 A') : one ? 'pila: 0 A' : 'stessa corrente ovunque: 0,25 A'}</Lbl>
      </Svg>
    </Fig>
  )
}

/* Corrente alternata: alternatore e onda sinusoidale */
export function CorrenteAlternata () {
  const a = useAngle(1.8)
  const v = Math.sin(a)                       // tensione relativa (picco = 1)
  const W = 128, gx = 172, gy = 100, A = 52
  let wave = ''
  for (let k = 0; k <= W; k++) { const t = a - (W - k) / W * 2 * Math.PI * 1.5; wave += (k ? ' L' : 'M') + (gx + k).toFixed(1) + ' ' + (gy - Math.sin(t) * A).toFixed(1) }
  const deg = a * 180 / Math.PI
  const show = Math.abs(v) > 0.15
  const loop = v > 0 ? 'M124 58 V20 H12 V180 H124 V142' : 'M124 142 V180 H12 V20 H124 V58'
  return (
    <Fig caption="schema semplificato e rallentato: in rete l'onda fa 50 giri al secondo · il magnete che gira cambia il campo nella bobina e lì nasce una tensione che sale, si annulla e si inverte. In Italia: 230 V efficaci, picchi di circa ±325 V">
      <Svg h={200} label="Un magnete che ruota davanti a una bobina genera una tensione che oscilla come un'onda e cambia verso a ogni mezzo giro">
        <rect x="102" y="58" width="44" height="84" rx="6" fill={K.body} stroke={K.part} />
        {[66, 76, 86, 96, 106, 116, 126].map(y => <path key={y} d={`M102 ${y} H146`} stroke={CU} stroke-width="3" />)}
        <Lbl x={124} y={156} s={9}>bobina</Lbl>
        <g transform={`rotate(${deg} 70 100)`}>
          <rect x="46" y="92" width="24" height="16" fill="#D0473F" /><rect x="70" y="92" width="24" height="16" fill="#3E6FB0" />
          <text x="58" y="104" fill="#fff" font-size="10" text-anchor="middle" transform={`rotate(${-deg} 58 100)`}>N</text>
          <text x="82" y="104" fill="#fff" font-size="10" text-anchor="middle" transform={`rotate(${-deg} 82 100)`}>S</text>
        </g>
        <circle cx="70" cy="100" r="30" fill="none" stroke={K.part} stroke-dasharray="3 4" />
        <Lbl x={70} y={52} s={9}>magnete che gira</Lbl>
        <Wire d="M124 58 V20 H12 V180 H124 V142" />
        <Lamp x={12} y={100} glow={Math.abs(v)} />
        {show && <Flow d={loop} dur={dur(Math.abs(v), 0.4)} />}
        <path d={`M${gx} ${gy} H${gx + W}`} stroke={K.part} />
        <path d={`M${gx} ${gy - A * 0.707} H${gx + W}`} stroke={K.text} stroke-dasharray="2 4" opacity=".5" />
        <path d={wave} fill="none" stroke={K.cur} stroke-width="2" />
        <circle cx={gx + W} cy={gy - v * A} r="4" fill={K.cur} />
        <Lbl x={gx + W + 4} y={gy - A + 4} s={8} a="start">+325</Lbl><Lbl x={gx + W + 4} y={gy + A + 4} s={8} a="start">−325</Lbl>
        <Lbl x={gx} y={gy - A * 0.707 - 4} s={8} a="start">230 V efficaci</Lbl>
        <Lbl x={gx + W / 2} y={186} s={9}>tensione nel tempo → adesso</Lbl>
        <Lbl x={gx + W / 2} y={30} s={9} c={v > 0 ? K.plus : K.minus}>{v > 0.15 ? 'verso +' : v < -0.15 ? 'verso −' : 'zero: inversione'}</Lbl>
      </Svg>
    </Fig>
  )
}

/* Trasformatore: 1000 spire al primario, 230 V */
const N2 = [26, 52, 104, 500]
export function Trasformatore ({ mode }) {
  const [n, setN] = useAuto(mode, N2, 2200)
  const vout = 230 * n / 1000
  const loops = Math.max(1, Math.min(14, Math.round(Math.sqrt(n) * 0.65)))
  const ys = (k, m) => Array.from({ length: m }, (_, i) => 60 + (i + 0.5) * (80 / m))
  return (
    <Fig caption="schema semplificato, spire disegnate in scala ridotta · primario da 1000 spire a 230 V: la tensione in uscita è 230 × spire del secondario ÷ 1000. Il campo magnetico (grigio) gira nel nucleo e collega le due bobine, che non si toccano"
      readout={<Readout items={[['spire secondario', n + ''], ['uscita', f1(vout) + ' V', K.cur], ['rapporto', '1000 : ' + n]]} />}
      controls={mode === 'play' && <Seg label="Spire del secondario" value={n} set={setN} options={N2.map(x => [x, x + ''])} />}>
      <Svg h={190} label={`Trasformatore: ${n} spire al secondario, uscita circa ${f1(vout)} volt`}>
        <path d="M110 40 H226 V160 H110 Z" fill="none" stroke="#6B7385" stroke-width="18" />
        <path d="M110 40 H226 V160 H110 Z" fill="none" stroke={K.field} stroke-width="1.4" stroke-dasharray="4 4" />
        <Lbl x={168} y={104} s={9}>nucleo di ferro</Lbl>
        {ys(0, 8).map(y => <path key={y} d={`M98 ${y} H122`} stroke={CU} stroke-width="3" />)}
        {ys(0, loops).map(y => <path key={y} d={`M214 ${y} H238`} stroke="#E3C46A" stroke-width="3" />)}
        <Wire d="M98 64 H60 M98 136 H60" />
        <circle cx="48" cy="100" r="14" fill={K.body} stroke={K.ink} /><path d="M40 100 q4 -7 8 0 t8 0" fill="none" stroke={K.ink} stroke-width="1.4" />
        <Wire d="M60 64 H48 V86 M60 136 H48 V114" />
        <Lbl x={48} y={170} s={9}>230 V</Lbl><Lbl x={50} y={30} s={9} a="start">primario · 1000</Lbl>
        <Wire d="M238 64 H290 V76 M238 136 H290 V124" />
        <path d={vzig(290, 76, 48)} fill="none" stroke={K.ink} stroke-width="1.6" /><Lbl x={302} y={104} s={8} a="start">carico</Lbl>
        <Lbl x={300} y={30} s={9} a="end">secondario · {n}</Lbl>
        <Lbl x={290} y={170} s={9} c={K.cur}>{f1(vout)} V</Lbl>
      </Svg>
    </Fig>
  )
}

/* Multimetro: tensione, corrente, resistenza (pila 9 V, resistenza 450 Ω) */
export function Multimetro ({ mode }) {
  const [m, setM] = useAuto(mode, ['V', 'A', 'R'], 2600)
  const disp = { V: '9,00 V', A: '20,0 mA', R: '450 Ω' }[m]
  const red = '#D0473F'
  const sock = { COM: [246, 182], V: [276, 182], A: [306, 182] }
  const lead = (from, to, c) => <path d={`M${from[0]} ${from[1]} C${from[0]} ${from[1] + 0} ${to[0]} ${to[1] + 40} ${to[0]} ${to[1]}`} fill="none" stroke={c} stroke-width="2.4" />
  return (
    <Fig caption="schema semplificato: pila da 9 V e resistenza da 450 Ω · tensione: puntali ai capi del componente (in parallelo). Corrente: si apre il circuito e il multimetro diventa un pezzo di filo, con il rosso nella boccola A (in serie). Resistenza: a circuito spento, lo strumento usa una sua piccola corrente"
      readout={<Readout items={[['misura', { V: 'tensione', A: 'corrente', R: 'resistenza' }[m]], ['display', disp, K.cur], ['collegamento', { V: 'in parallelo', A: 'in serie', R: 'circuito spento' }[m]]]} />}
      controls={mode === 'play' && <Seg label="Misura" value={m} set={setM} options={[['V', 'Tensione'], ['A', 'Corrente'], ['R', 'Resistenza']]} />}>
      <Svg h={200} label={`Multimetro in misura di ${{ V: 'tensione', A: 'corrente', R: 'resistenza' }[m]}: il display mostra ${disp}`}>
        {m === 'R' ? <g><rect x="28" y="70" width="24" height="40" rx="3" fill="none" stroke={K.text} stroke-dasharray="3 3" /><Lbl x={40} y={126} s={8}>pila tolta</Lbl></g> : <Battery x={40} y={80} />}
        <Wire d={m === 'R' ? 'M40 70 V30 H120 M170 30 H220 V110 H40 V110' : 'M40 80 V30 H120 M170 30 H220 V110 H40 V90'} />
        {m === 'A' && <path d="M220 52 V68" stroke="#0B0D12" stroke-width="6" />}
        <path d={zig(120, 30, 50)} fill="none" stroke={K.ink} stroke-width="1.6" /><Lbl x={145} y={18} s={9}>450 Ω</Lbl>
        {m === 'V' && <Flow d="M40 80 V30 H220 V110 H40 V90" dur={1.4} />}
        {m === 'A' && <Flow d="M40 80 V30 H220 V52" dur={1.4} />}
        {m === 'A' && <Flow d="M220 68 V110 H40 V90" dur={1.4} />}
        <rect x="226" y="120" width="100" height="74" rx="8" fill="#E3C46A" />
        <rect x="236" y="128" width="80" height="26" rx="3" fill="#1D2416" />
        <text x="310" y="147" fill="#B8F08A" font-size="13" text-anchor="end" style="font-family:JetBrains Mono, monospace">{disp}</text>
        {Object.entries(sock).map(([k, [x, y]]) => <g key={k}><circle cx={x} cy={y} r="5" fill="#22252D" /><Lbl x={x} y={y - 9} s={7} c="#22252D">{k === 'V' ? 'VΩ' : k}</Lbl></g>)}
        {m === 'V' && <g>{lead(sock.V, [170, 36], red)}{lead(sock.COM, [120, 36], '#22252D')}</g>}
        {m === 'R' && <g>{lead(sock.V, [170, 36], red)}{lead(sock.COM, [120, 36], '#22252D')}<path class="k-flow" d="M170 30 H120" stroke={K.cur} stroke-width="1.2" stroke-dasharray="2 4" style={{ '--dur': '2s' }} /></g>}
        {m === 'A' && <g>{lead(sock.A, [224, 52], red)}{lead(sock.COM, [224, 68], '#22252D')}
          <Flow d={`M224 52 C224 92 ${sock.A[0]} ${sock.A[1]} ${sock.A[0]} ${sock.A[1]}`} dur={1.4} w={2} />
          <Flow d={`M${sock.COM[0]} ${sock.COM[1]} C${sock.COM[0]} ${sock.COM[1]} 224 108 224 68`} dur={1.4} w={2} /></g>}
        <Lbl x={112} y={150} s={9}>{{ V: 'in parallelo', A: 'circuito aperto: passa nel tester', R: 'niente pila: circuito spento' }[m]}</Lbl>
      </Svg>
    </Fig>
  )
}

/* Oscilloscopio: sinusoide da 50 Hz e 2 V di picco */
export function Oscilloscopio ({ mode }) {
  const [td, setTd] = useAuto(mode, [2, 5, 10], 2400)       // ms per quadretto
  const [vd, setVd] = useState(1)                           // V per quadretto
  const X0 = 38, Y0 = 20, DX = 26, DY = 18, NX = 10, NY = 8
  const cyc = 20 / td                                       // quadretti per ciclo (periodo 20 ms)
  let d = ''
  for (let k = 0; k <= 260; k++) { const x = k / 26; const t = x * td / 1000; const v = 2 * Math.sin(2 * Math.PI * 50 * t); const y = Y0 + NY * DY / 2 - v / vd * DY; d += (k ? ' L' : 'M') + (X0 + k).toFixed(1) + ' ' + Math.max(Y0, Math.min(Y0 + NY * DY, y)).toFixed(1) }
  return (
    <Fig caption="segnale di prova: onda da 50 Hz con picchi di ±2 V · cambiando i millisecondi per quadretto si stringe o allarga il tempo; i volt per quadretto cambiano l'altezza. Un ciclo dura 20 ms: con 5 ms per quadretto occupa 4 quadretti. Il trigger (▸) fa partire il disegno quando il segnale sale oltre 0 V"
      readout={<Readout items={[['tempo/quadretto', td + ' ms'], ['quadretti per ciclo', f1(cyc).replace(',0', '')], ['frequenza', '50 Hz', K.cur]]} />}
      controls={mode === 'play' && <div style="display:flex;flex-direction:column;gap:8px">
        <Seg label="Tempo per quadretto" value={td} set={setTd} options={[[2, '2 ms'], [5, '5 ms'], [10, '10 ms']]} />
        <Seg label="Volt per quadretto" value={vd} set={setVd} options={[[0.5, '0,5 V'], [1, '1 V'], [2, '2 V']]} />
      </div>}>
      <Svg h={190} label={`Oscilloscopio: ${td} millisecondi per quadretto, un ciclo occupa ${f1(cyc)} quadretti`}>
        <rect x={X0 - 6} y={Y0 - 6} width={NX * DX + 12} height={NY * DY + 12} rx="6" fill="#0E1A14" stroke={K.part} />
        {Array.from({ length: NX + 1 }).map((_, i) => <path key={'x' + i} d={`M${X0 + i * DX} ${Y0} V${Y0 + NY * DY}`} stroke="#1E3A2C" />)}
        {Array.from({ length: NY + 1 }).map((_, i) => <path key={'y' + i} d={`M${X0} ${Y0 + i * DY} H${X0 + NX * DX}`} stroke="#1E3A2C" />)}
        <path d={`M${X0} ${Y0 + NY * DY / 2} H${X0 + NX * DX}`} stroke="#2E5A44" />
        <path class="osc-trace" d={d} fill="none" stroke="#8CF0B0" stroke-width="2" />
        <path d={`M${X0 - 10} ${Y0 + NY * DY / 2 - 4} L${X0 - 4} ${Y0 + NY * DY / 2} L${X0 - 10} ${Y0 + NY * DY / 2 + 4} Z`} fill="#F0B44C" />
        <path d={`M${X0} ${Y0 + NY * DY + 10} H${X0 + Math.min(cyc, 10) * DX}`} stroke={K.cur} stroke-width="1.4" />
        <Lbl x={X0 + Math.min(cyc, 10) * DX / 2} y={Y0 + NY * DY + 22} s={9} c={K.cur}>{cyc <= 10 ? '1 ciclo = 20 ms' : 'ciclo più lungo dello schermo'}</Lbl>
        <Lbl x={X0 + NX * DX} y={Y0 - 10} s={8} a="end">{td} ms/quadr · {f1(vd).replace(',0', '')} V/quadr</Lbl>
      </Svg>
    </Fig>
  )
}

/* Saldatura a stagno: sezione di un piedino in una piazzola */
export function Saldatore ({ mode }) {
  const [s, setS] = useAuto(mode, [0, 1, 2], 2000)
  const cone = ['', 'M152 106 Q162 102 165 84 L171 84 Q174 102 184 106 Z', 'M146 106 Q160 100 165 64 L171 64 Q176 100 190 106 Z'][s]
  return (
    <Fig caption="sezione semplificata · 1: la punta scalda insieme piazzola e piedino; 2: lo stagno appoggiato sul giunto fonde, il flussante pulisce e la lega scorre intorno; 3: tolti stagno e punta, si solidifica in un piccolo cono lucido"
      readout={<Readout items={[['fase', ['scaldo il giunto', 'aggiungo lo stagno', 'giunto finito'][s], s === 2 ? K.cur : null], ['punta', s < 2 ? 'circa 350 °C' : 'tolta'], ['lo stagno fonde a', 'circa 183–220 °C']]} />}
      controls={mode === 'play' && <Seg label="Fase" value={s} set={setS} options={[[0, '1 · Scalda'], [1, '2 · Stagno'], [2, '3 · Finito']]} />}>
      <Svg h={190} label={['La punta del saldatore scalda piazzola e piedino', 'Lo stagno fonde sul giunto caldo e scorre intorno al piedino', 'Il giunto finito: un piccolo cono lucido'][s]}>
        <rect x="40" y="110" width="256" height="22" fill="#1F4D3A" /><Lbl x={60} y={150} s={9}>scheda</Lbl>
        <rect x="142" y="106" width="52" height="5" fill={CU} /><rect x="142" y="131" width="52" height="5" fill={CU} />
        <rect x="160" y="110" width="16" height="22" fill="#0B0D12" />
        <rect x="165" y="30" width="6" height="130" fill="#B0B8C8" /><Lbl x={186} y={40} s={9} a="start">piedino</Lbl>
        <Lbl x={120} y={102} s={8} a="end">piazzola</Lbl>
        {cone && <path class="k-ease" d={cone} fill="#C9D2E0" stroke="#ECEEF3" stroke-width="1" />}
        {s < 2 && <g>
          <path d="M60 30 L148 100 L156 108 L142 92 Z" fill="#8C96AA" /><path d="M60 30 L148 100" stroke="#5A6378" stroke-width="10" stroke-linecap="round" />
          <Lbl x={52} y={22} s={9} a="start">punta del saldatore</Lbl>
          {[0, 1, 2].map(k => <path key={k} class="sd-heat" style={{ animationDelay: k * 0.3 + 's' }} d={`M${150 + k * 12} 96 q4 -5 0 -10 q-4 -5 0 -10`} fill="none" stroke={K.heat} stroke-width="1.6" />)}
        </g>}
        {s === 1 && <g><path d="M290 40 L190 98" stroke="#C9D2E0" stroke-width="4" stroke-linecap="round" /><Lbl x={286} y={32} s={9} a="end">filo di stagno</Lbl></g>}
        {s === 2 && <Lbl x={210} y={86} s={9} a="start" c={K.cur}>cono lucido</Lbl>}
      </Svg>
    </Fig>
  )
}

/* Pulsante con resistenza di pull-up: rimbalzo e antirimbalzo */
export function Pulsante ({ mode }) {
  const [s, setS] = useAuto(mode, [0, 1, 2], 2200)
  const pressed = s > 0
  const G = { x: 168, y: 120, w: 150, h: 50 }
  const raw = 'M168 120 H204 V170 H208 V120 H212 V170 H216 V130 H219 V170 H222 V122 H224 V170 H318'
  const clean = 'M168 120 H232 V170 H318'
  return (
    <Fig caption="resistenza di pull-up da 10 kΩ verso 5 V: a pulsante aperto l'ingresso legge 5 V, premuto legge 0 V · nel momento del contatto la lamella rimbalza per pochi millisecondi (rimbalzi esagerati nel disegno); l'antirimbalzo aspetta che il segnale si stabilizzi"
      readout={<Readout items={[['pulsante', pressed ? 'premuto' : 'rilasciato'], ['ingresso', pressed ? '0 V' : '5 V', K.cur], ['corrente', pressed ? '0,5 mA' : '0 mA']]} />}
      controls={mode === 'play' && <Seg label="Stato" value={s} set={setS} options={[[0, 'Rilasciato'], [1, 'Premuto'], [2, 'Antirimbalzo']]} />}>
      <Svg h={190} label={pressed ? 'Pulsante premuto: l\'ingresso va a 0 volt' : 'Pulsante rilasciato: l\'ingresso legge 5 volt'}>
        <Lbl x={60} y={16} s={9} c={K.plus}>5 V</Lbl>
        <Wire d="M60 22 V34 M60 82 V100 M60 100 H110 M60 100 V120 M60 150 V172" />
        <path d={vzig(60, 34, 48)} fill="none" stroke={K.ink} stroke-width="1.6" /><Lbl x={74} y={62} s={8} a="start">10 kΩ</Lbl>
        <circle cx="60" cy="100" r="2.6" fill={K.ink} />
        <rect x="110" y="92" width="34" height="16" rx="3" fill="none" stroke={K.text} /><Lbl x={127} y={86} s={8}>ingresso</Lbl>
        <circle cx="60" cy="120" r="2.4" fill={K.ink} /><circle cx="60" cy="150" r="2.4" fill={K.ink} />
        <path class="k-ease" d={pressed ? 'M60 120 L60 150' : 'M60 120 L82 146'} stroke={K.ink} stroke-width="2.4" />
        <path d="M50 178 H70 M54 183 H66 M58 188 H62" stroke={K.ink} stroke-width="1.4" />
        <Lbl x={92} y={140} s={8} a="start">pulsante</Lbl>
        {pressed && <Flow d="M60 22 V172" dur={2.4} w={2} />}
        <path d={`M${G.x} ${G.y - 8} V${G.y + G.h + 6} H${G.x + G.w}`} fill="none" stroke={K.part} />
        <Lbl x={G.x - 4} y={G.y + 4} s={8} a="end">5 V</Lbl><Lbl x={G.x - 4} y={G.y + G.h + 4} s={8} a="end">0 V</Lbl>
        <path d={pressed ? (s === 1 ? raw : clean) : 'M168 120 H318'} fill="none" stroke={K.cur} stroke-width="2" />
        {s === 1 && <Lbl x={214} y={110} s={8}>rimbalzi: pochi ms</Lbl>}
        {s === 2 && <Lbl x={232} y={110} s={8}>pulito</Lbl>}
        <Lbl x={243} y={188} s={8}>tempo →</Lbl>
        <Lbl x={243} y={96} s={9}>segnale all'ingresso</Lbl>
      </Svg>
    </Fig>
  )
}

/* Alimentatore da banco: 12 V impostati, limite 0,5 A */
export function AlimentatoreBanco ({ mode }) {
  const [r, setR] = useAuto(mode, [100, 40, 24, 10, 2], 1800)
  const VS = 12, IL = 0.5
  const cc = VS / r > IL
  const i = cc ? IL : VS / r, v = cc ? IL * r : VS
  const px = 210 + i / 0.6 * 100, py = 160 - v / 14 * 120
  return (
    <Fig caption="impostati 12 V e un limite di 0,5 A · con un carico grande (poca corrente) tiene 12 V: modalità CV. Quando il carico vorrebbe più di 0,5 A, abbassa la tensione e tiene la corrente al limite: modalità CC. Nel grafico il punto di lavoro corre sul bordo del rettangolo"
      readout={<Readout items={[['carico', r + ' Ω'], ['uscita', f1(v) + ' V · ' + f2(i) + ' A', K.cur], ['modalità', cc ? 'CC (corrente costante)' : 'CV (tensione costante)']]} />}
      controls={mode === 'play' && <Slider id="psu-r" label="Resistenza del carico" min={2} max={100} value={r} set={setR} show={r + ' Ω'} />}>
      <Svg h={190} label={`Alimentatore da banco con carico da ${r} ohm: ${f1(v)} volt e ${f2(i)} ampere, modalità ${cc ? 'corrente costante' : 'tensione costante'}`}>
        <rect x="14" y="26" width="120" height="88" rx="8" fill={K.body} stroke={K.part} />
        <rect x="24" y="36" width="100" height="22" rx="3" fill="#1D2416" /><text x="118" y="52" fill="#B8F08A" font-size="13" text-anchor="end" style="font-family:JetBrains Mono, monospace">{f2(v)} V</text>
        <rect x="24" y="62" width="100" height="22" rx="3" fill="#1D2416" /><text x="118" y="78" fill="#F0B44C" font-size="13" text-anchor="end" style="font-family:JetBrains Mono, monospace">{f2(i)} A</text>
        <circle cx="34" cy="100" r="5" fill={cc ? '#4A5263' : '#6FD3C1'} /><Lbl x={44} y={103} s={9} a="start">CV</Lbl>
        <circle cx="82" cy="100" r="5" fill={cc ? '#F28C6B' : '#4A5263'} /><Lbl x={92} y={103} s={9} a="start">CC</Lbl>
        <Lbl x={140} y={42} s={10} c={K.plus} a="start">+</Lbl><Lbl x={140} y={104} s={10} c={K.minus} a="start">−</Lbl>
        <Wire d="M134 46 H180 V52 M180 92 V96 H134" />
        <path d={vzig(180, 52, 40)} fill="none" stroke={K.ink} stroke-width="1.6" />
        <Lbl x={172} y={128} s={9}>carico</Lbl>
        <Flow d="M134 46 H180 V96 H134" dur={dur(i, 0.18)} />
        <path d="M210 40 V160 H316" fill="none" stroke={K.part} />
        <path d={`M210 ${160 - 12 / 14 * 120} H${210 + IL / 0.6 * 100} V160`} fill="none" stroke={K.text} stroke-dasharray="3 3" />
        <Lbl x={206} y={160 - 12 / 14 * 120 + 3} s={8} a="end">12 V</Lbl><Lbl x={210 + IL / 0.6 * 100} y={172} s={8}>0,5 A</Lbl>
        <circle class="k-ease" cx={px} cy={py} r="5" fill={K.cur} />
        <Lbl x={260} y={30} s={8}>tensione ↑ · corrente →</Lbl>
      </Svg>
    </Fig>
  )
}
