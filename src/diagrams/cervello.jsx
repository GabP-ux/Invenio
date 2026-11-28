// Schemi di microcontrollori e comunicazione. Regole: skill "invenio-schemi".
import { useEffect, useState } from 'preact/hooks'
import { calm, K, Svg, Lbl, Wire, Flow, Arrow, Lamp, Fig, Seg, Slider, Readout, useAuto } from './kit'
import './cervello.css'

const f1 = (v) => v.toFixed(1).replace('.', ',')
const f2 = (v) => v.toFixed(2).replace('.', ',')
const MONO = { fontFamily: 'JetBrains Mono, monospace' }
const bin = (n, w) => n.toString(2).padStart(w, '0')
// passo che avanza da solo da 0 a n-1 (con le animazioni ridotte resta sull'ultimo)
function useStep (n, ms, deps = []) {
  const [s, setS] = useState(calm() ? n - 1 : 0)
  useEffect(() => {
    if (calm()) { setS(n - 1); return }
    setS(0); const t = setInterval(() => setS(v => (v + 1) % n), ms)
    return () => clearInterval(t)
  }, deps)
  return s
}
const vzig = (x, y, len) => { let d = `M${x} ${y}`; const n = 6, st = len / n; for (let i = 0; i < n; i++) d += ` L${x - 5} ${y + st * i + st / 4} L${x + 5} ${y + st * i + 3 * st / 4}`; return d + ` L${x} ${y + len}` }
const Gnd = ({ x, y }) => <path d={`M${x - 9} ${y} H${x + 9} M${x - 5} ${y + 4} H${x + 5} M${x - 2} ${y + 8} H${x + 2}`} stroke={K.ink} stroke-width="1.3" />
const Chip = ({ x, y, w, h, label }) => <g><rect x={x} y={y} width={w} height={h} rx="6" fill="#1A1F2B" stroke="#4A5263" /><Lbl x={x + w / 2} y={y + 14} s={9} c={K.ink}>{label}</Lbl></g>

/* Microcontrollore: ciclo leggi → decidi → scrivi */
export function Microcontrollore ({ mode }) {
  const [p, setP] = useAuto(mode, [false, true], 2400)
  const step = useStep(3, 650)
  const lines = ['leggi D2', p ? 'premuto: accendi D13' : 'rilasciato: spegni D13', 'ricomincia da capo']
  return (
    <Fig caption="schema semplificato, ciclo molto rallentato · il programma sta nella memoria flash; il processore legge l'ingresso D2 (5 V se il pulsante è premuto), decide e scrive l'uscita D13, che accende il LED. Poi ricomincia"
      readout={<Readout items={[['pulsante su D2', p ? 'premuto · 5 V' : 'rilasciato · 0 V'], ['uscita D13', p ? '5 V: LED acceso' : '0 V: LED spento', p ? K.cur : null]]} />}
      controls={mode === 'play' && <Seg label="Pulsante" value={p} set={setP} options={[[false, 'Rilasciato'], [true, 'Premuto']]} />}>
      <Svg h={200} label={`Microcontrollore: pulsante ${p ? 'premuto, LED acceso' : 'rilasciato, LED spento'}`}>
        <rect x="100" y="30" width="140" height="150" rx="8" fill="#151A24" stroke="#5A6378" />
        {[50, 70, 90, 110, 130, 150].map(y => <g key={y}><path d={`M92 ${y} H100 M240 ${y} H248`} stroke="#8C96AA" stroke-width="3" /></g>)}
        <rect x="110" y="40" width="56" height="26" rx="4" fill="#232A3A" /><Lbl x={138} y={57} s={9} c={K.ink}>processore</Lbl>
        <rect x="172" y="40" width="58" height="26" rx="4" fill="#232A3A" /><Lbl x={201} y={57} s={9} c={K.ink}>flash</Lbl>
        <rect x="110" y="70" width="56" height="20" rx="4" fill="#232A3A" /><Lbl x={138} y={84} s={8} c={K.ink}>RAM</Lbl>
        <rect x="172" y="70" width="58" height="20" rx="4" fill="#232A3A" /><Lbl x={201} y={84} s={8} c={K.ink}>16 MHz</Lbl>
        {lines.map((l, i) => <g key={i}>
          <rect x="108" y={98 + i * 24} width="124" height="20" rx="4" fill={step === i ? '#2B3A66' : 'transparent'} class="k-ease" />
          <Lbl x={114} y={112 + i * 24} s={8} a="start" c={step === i ? K.ink : K.text}>{(i + 1) + '. ' + l}</Lbl>
        </g>)}
        <Lbl x={86} y={94} s={8} a="end">D2</Lbl><Lbl x={254} y={94} s={8} a="start">D13</Lbl>
        <Lbl x={30} y={22} s={9} c={K.plus}>5 V</Lbl>
        <Wire d="M30 28 V48 M30 80 V90 H92 M60 90 V120 M60 150 V164 M292 90 H248 M292 90 V104 M292 128 V138 M292 166 V172" />
        <circle cx="30" cy="48" r="2.4" fill={K.ink} /><circle cx="30" cy="80" r="2.4" fill={K.ink} />
        <path class="k-ease" d={p ? 'M30 48 L30 80' : 'M30 48 L50 74'} stroke={K.ink} stroke-width="2.4" />
        <Lbl x={36} y={44} s={8} a="start">pulsante</Lbl>
        <path d={vzig(60, 120, 30)} fill="none" stroke={K.ink} stroke-width="1.4" /><Gnd x={60} y={166} />
        <Lbl x={70} y={140} s={8} a="start">pull-down</Lbl>
        <path d="M284 104 L300 104 L292 118 Z M284 118 H300" fill={p ? K.light : 'none'} stroke={K.ink} stroke-width="1.4" />
        {p && <circle cx="292" cy="111" r="14" fill={K.light} opacity=".25" />}
        <path d={vzig(292, 138, 28)} fill="none" stroke={K.ink} stroke-width="1.4" /><Gnd x={292} y={174} />
        {p && <Flow d="M248 90 H292 V172" dur={1.2} w={2} />}
        {p && <Flow d="M30 28 V90 H92" dur={2.4} w={1.6} />}
      </Svg>
    </Fig>
  )
}

/* ADC a 10 bit, riferimento 5 V */
export function Adc ({ mode }) {
  const [v, setV] = useAuto(mode, [0.8, 2.5, 3.3, 4.6], 1800)
  const n = Math.min(1023, Math.floor(v * 1024 / 5))
  const n3 = Math.min(7, Math.floor(v * 8 / 5))
  const X = (vv) => 30 + vv / 5 * 140, Y = (c) => 150 - c * 15
  let stair = `M${X(0)} ${Y(0)}`; for (let c = 0; c < 8; c++) stair += ` H${X((c + 1) * 5 / 8)}` + (c < 7 ? ` V${Y(c + 1)}` : '')
  const bits = bin(n, 10)
  return (
    <Fig caption="ADC a 10 bit con riferimento 5 V, come in Arduino Uno: numero = tensione × 1024 ÷ 5. A sinistra lo stesso principio con soli 3 bit (8 gradini), per vedere la scala: ogni gradino raccoglie un intervallo di tensioni"
      readout={<Readout items={[['tensione', f2(v) + ' V'], ['numero (10 bit)', n + '', K.cur], ['un gradino', '≈ 4,9 mV']]} />}
      controls={mode === 'play' && <Slider id="adc-v" label="Tensione sul piedino" min={0} max={5} step={0.05} value={v} set={setV} show={f2(v) + ' V'} />}>
      <Svg h={190} label={`ADC: ${f2(v)} volt diventano il numero ${n}`}>
        <path d="M30 30 V150 H176" fill="none" stroke={K.part} />
        <path d={`M${X(0)} ${Y(0)} L${X(5)} ${Y(8)}`} stroke={K.text} stroke-dasharray="2 4" opacity=".5" />
        <path d={stair} fill="none" stroke={K.cur} stroke-width="2" />
        <path d={`M${X(v)} 150 V${Y(n3) - 0}`} stroke="#8FA8FF" stroke-width="1.4" stroke-dasharray="3 3" class="k-ease" />
        <circle cx={X(v)} cy={Y(n3)} r="4.5" fill="#8FA8FF" class="k-ease" />
        <Lbl x={100} y={168} s={8}>tensione 0 → 5 V</Lbl>
        <Lbl x={22} y={Y(7) + 3} s={8} a="end">7</Lbl><Lbl x={22} y={Y(0) + 3} s={8} a="end">0</Lbl>
        <Lbl x={100} y={22} s={8}>esempio con 3 bit: gradino {n3}</Lbl>
        <Lbl x={262} y={44} s={9}>Arduino Uno legge</Lbl>
        <text x="262" y="80" fill={K.cur} font-size="28" text-anchor="middle" style={MONO}>{n}</text>
        {bits.split('').map((b, i) => <g key={i}><rect x={192 + i * 14} y="96" width="12" height="18" rx="2" fill={b === '1' ? '#2B3A66' : '#141821'} stroke="#4A5263" /><Lbl x={198 + i * 14} y={109} s={9} c={b === '1' ? K.ink : K.text}>{b}</Lbl></g>)}
        <Lbl x={262} y={130} s={8}>10 bit: da 0 a 1023</Lbl>
        <Lbl x={262} y={150} s={8}>{f2(v)} V × 1024 ÷ 5 = {n}</Lbl>
      </Svg>
    </Fig>
  )
}

/* PWM: duty cycle, media e LED */
export function Pwm ({ mode }) {
  const [d, setD] = useAuto(mode, [10, 25, 50, 75, 100], 1700)
  const D = d / 100, val = Math.round(D * 255)
  const x0 = 40, P = 60, hi = 36, lo = 96
  let w = `M${x0} ${lo}`; for (let k = 0; k < 4; k++) { const a = x0 + k * P; w += D > 0 ? ` V${hi} H${a + D * P}` : ''; w += D < 1 ? ` V${lo} H${a + P}` : ` H${a + P}` }
  const avgY = lo - D * (lo - hi)
  const [blink, setBlink] = useState(true)
  useEffect(() => {
    if (calm()) return
    let on = true, t
    const run = () => { setBlink(on); t = setTimeout(() => { on = !on; run() }, Math.max(60, (on ? D : 1 - D) * 1200)) }
    if (D === 0) setBlink(false); else if (D === 1) setBlink(true); else run()
    return () => clearTimeout(t)
  }, [d])
  return (
    <Fig caption="uscita a 5 V che si accende e si spegne in cicli fissi (in Arduino circa 490 al secondo) · conta la frazione di tempo accesa: la media (tratteggio) è duty × 5 V. Il LED al rallentatore mostra il lampeggio vero, quello a destra come lo vede l'occhio"
      readout={<Readout items={[['duty cycle', d + ' %'], ['analogWrite', val + ''], ['media', f2(D * 5) + ' V', K.cur]]} />}
      controls={mode === 'play' && <Slider id="pwm-d" label="Duty cycle" min={0} max={100} step={5} value={d} set={setD} show={d + ' %'} />}>
      <Svg h={180} label={`PWM al ${d} per cento: media ${f2(D * 5)} volt`}>
        <path d={`M${x0} ${lo + 4} H${x0 + 4 * P}`} stroke={K.part} />
        <Lbl x={x0 - 6} y={hi + 3} s={8} a="end">5 V</Lbl><Lbl x={x0 - 6} y={lo + 3} s={8} a="end">0 V</Lbl>
        <path d={w} fill="none" stroke={K.ink} stroke-width="2" />
        <path class="k-ease" d={`M${x0} ${avgY} H${x0 + 4 * P}`} stroke={K.cur} stroke-width="1.6" stroke-dasharray="5 4" />
        <Lbl x={x0 + 4 * P + 4} y={avgY + 3} s={8} a="start" c={K.cur}>media</Lbl>
        <path d={`M${x0} 112 V118 H${x0 + P} V112`} fill="none" stroke={K.text} /><Lbl x={x0 + P / 2} y={130} s={8}>1 ciclo ≈ 2 ms</Lbl>
        <circle cx="56" cy="158" r="10" fill={blink ? K.light : '#2A2416'} stroke={K.light} />
        <Lbl x={72} y={161} s={8} a="start">al rallentatore</Lbl>
        <circle cx="290" cy="158" r="10" fill={K.light} opacity={0.08 + 0.92 * D} stroke={K.light} />
        <circle cx="290" cy="158" r="20" fill={K.light} opacity={0.2 * D} />
        <Lbl x={266} y={161} s={8} a="end">come lo vedi</Lbl>
      </Svg>
    </Fig>
  )
}

/* UART: trama di un carattere, 9600 baud */
const CH = { A: 0x41, K: 0x4B, '!': 0x21 }
export function Uart ({ mode }) {
  const [c, setC] = useAuto(mode, ['A', 'K', '!'], 3000)
  const code = CH[c]
  const data = Array.from({ length: 8 }, (_, i) => (code >> i) & 1)   // dal bit meno significativo
  const bits = [0, ...data, 1]
  const BW = 26, X0 = 44, HI = 118, LO = 150
  let wave = `M14 ${HI} H${X0}`
  bits.forEach((b, i) => { wave += ` V${b ? HI : LO} H${X0 + (i + 1) * BW}` }); wave += ` V${HI} H330`
  return (
    <Fig caption="trama seriale 8N1 a 9600 baud · a riposo la linea è alta; il bit di start (S) la abbassa, poi 8 bit di dati partendo dal meno significativo (b0), infine il bit di stop (P). Ogni bit dura circa 104 µs"
      readout={<Readout items={[['carattere', `"${c}"`], ['codice', bin(code, 8), K.cur], ['durata', '10 bit ≈ 1,04 ms']]} />}
      controls={mode === 'play' && <Seg label="Carattere" value={c} set={setC} options={Object.keys(CH).map(k => [k, `"${k}"`])} />}>
      <Svg h={190} label={`UART: trasmissione del carattere ${c}, codice ${bin(code, 8)}`}>
        <Chip x={14} y={14} w={86} h={66} label="Arduino" /><Chip x={236} y={14} w={86} h={66} label="modulo" />
        <Lbl x={92} y={44} s={8} a="end">TX</Lbl><Lbl x={92} y={66} s={8} a="end">RX</Lbl>
        <Lbl x={244} y={44} s={8} a="start">RX</Lbl><Lbl x={244} y={66} s={8} a="start">TX</Lbl>
        <path d="M100 41 C168 41 168 41 236 41" stroke={K.cur} stroke-width="2" fill="none" />
        <path d="M100 63 C140 63 196 63 236 63" stroke="#5A6378" stroke-width="1.6" fill="none" />
        <Arrow x1={150} y1={41} x2={176} y2={41} c={K.cur} w={1.6} head={5} />
        <Arrow x1={186} y1={63} x2={160} y2={63} c="#5A6378" w={1.4} head={5} />
        <Lbl x={168} y={34} s={8} c={K.cur}>TX → RX</Lbl><Lbl x={168} y={78} s={8}>RX ← TX</Lbl>
        {bits.map((b, i) => <g key={i}>
          <rect x={X0 + i * BW} y={HI - 6} width={BW} height={LO - HI + 12} fill={i === 0 || i === 9 ? 'rgba(143,168,255,.08)' : 'transparent'} />
          <Lbl x={X0 + i * BW + BW / 2} y={104} s={8} c={i === 0 || i === 9 ? '#8FA8FF' : K.text}>{i === 0 ? 'S' : i === 9 ? 'P' : 'b' + (i - 1)}</Lbl>
          <Lbl x={X0 + i * BW + BW / 2} y={170} s={10} c={K.ink}>{b}</Lbl>
        </g>)}
        <path d={wave} fill="none" stroke={K.cur} stroke-width="2" />
        <rect class="uart-scan" x={X0} y={HI - 8} width={BW} height={LO - HI + 16} fill="rgba(255,210,122,.16)" />
        <Lbl x={14} y={112} s={8} a="start">riposo</Lbl>
      </Svg>
    </Fig>
  )
}

/* I²C: indirizzo e risposta */
const DEV = [[0x76, 'barometro'], [0x3C, 'display'], [0x68, 'orologio']]
export function I2c ({ mode }) {
  const [a, setA] = useAuto(mode, DEV.map(d => d[0]), 2800)
  const bits = [...bin(a, 7).split('').map(Number), 0, 0]    // 7 bit di indirizzo, W = 0, ACK = 0
  const X0 = 56, BW = 28, SCLy = [128, 142], SDAy = [158, 172]
  let sda = `M30 ${SDAy[0]} H${X0 - 8} V${SDAy[1]} H${X0}`, scl = `M30 ${SCLy[0]} H${X0 + 4}`
  bits.forEach((b, i) => { const x = X0 + i * BW; sda += ` V${b ? SDAy[0] : SDAy[1]} H${x + BW}`; scl += ` H${x + 8} V${SCLy[0]} H${x + 20} V${SCLy[1]} H${x + BW}` })
  return (
    <Fig caption="schema semplificato · il controllore manda 7 bit di indirizzo (dal più significativo), poi 1 bit di lettura/scrittura (W = 0, scrittura). A ogni impulso di SCL si legge un bit di SDA. Solo il dispositivo con quell'indirizzo risponde ACK tirando SDA a 0 (verde acqua)"
      readout={<Readout items={[['indirizzo', '0x' + a.toString(16).toUpperCase()], ['in bit', bin(a, 7), K.cur], ['risponde', DEV.find(d => d[0] === a)[1]]]} />}
      controls={mode === 'play' && <Seg label="Indirizzo" value={a} set={setA} options={DEV.map(([v, n]) => [v, n])} />}>
      <Svg h={190} label={`Bus I2C: il controllore chiama l'indirizzo 0x${a.toString(16)}, risponde il ${DEV.find(d => d[0] === a)[1]}`}>
        <Chip x={8} y={14} w={70} h={70} label="Arduino" />
        <Lbl x={86} y={32} s={8} a="start">SDA</Lbl><Lbl x={86} y={56} s={8} a="start">SCL</Lbl>
        <path d="M78 38 H330 M78 62 H330" stroke="#5A6378" stroke-width="2" />
        <path d={vzig(110, 4, 16)} fill="none" stroke={K.ink} stroke-width="1.2" /><path d={vzig(126, 4, 16)} fill="none" stroke={K.ink} stroke-width="1.2" />
        <path d="M110 20 V38 M126 20 V62" stroke="#5A6378" stroke-width="1.2" /><Lbl x={136} y={12} s={7} a="start">pull-up</Lbl>
        {DEV.map(([v, n], i) => { const x = 170 + i * 56, on = v === a; return <g key={v} style={{ opacity: on ? 1 : 0.4 }} class="k-ease">
          <path d={`M${x + 10} 38 V70 M${x + 26} 62 V70`} stroke="#5A6378" stroke-width="1.4" />
          <rect x={x} y="70" width="46" height="34" rx="5" fill={on ? '#16302B' : '#1A1F2B'} stroke={on ? '#6FD3C1' : '#4A5263'} />
          <Lbl x={x + 23} y={84} s={8} c={K.ink}>{n}</Lbl><Lbl x={x + 23} y={97} s={8} c={on ? '#6FD3C1' : K.text}>0x{v.toString(16).toUpperCase()}</Lbl>
        </g> })}
        <Lbl x={26} y={SCLy[0] + 10} s={8} a="end">SCL</Lbl><Lbl x={26} y={SDAy[0] + 10} s={8} a="end">SDA</Lbl>
        <path d={scl} fill="none" stroke={K.text} stroke-width="1.4" />
        <path d={sda} fill="none" stroke={K.cur} stroke-width="2" />
        {bits.map((b, i) => <Lbl key={i} x={X0 + i * BW + BW / 2} y={186} s={8} c={i === 8 ? '#6FD3C1' : i === 7 ? '#8FA8FF' : K.ink}>{i < 7 ? b : i === 7 ? 'W' : 'ACK'}</Lbl>)}
        <rect x={X0 + 8 * BW} y={SDAy[0] - 4} width={BW} height={SDAy[1] - SDAy[0] + 8} fill="rgba(111,211,193,.15)" />
        <Lbl x={X0 - 4} y={120} s={7} a="start">start</Lbl>
      </Svg>
    </Fig>
  )
}

/* SPI: due registri a scorrimento che si scambiano i bit */
const MB = 0b10110010, SB = 0b01011100
export function Spi ({ mode }) {
  const [dev, setDev] = useAuto(mode, [0, 1], 5600)
  const k = useStep(11, 520, [dev])
  const st = Math.min(8, k)
  const shift = (a, b, s) => s === 0 ? a : ((a << s) | (b >> (8 - s))) & 0xFF
  const m = shift(MB, SB, st), d = shift(SB, MB, st)
  // blu: bit partiti dal controllore · corallo: bit partiti dal dispositivo
  const Reg = ({ x, y, val, who }) => <g>{bin(val, 8).split('').map((bt, i) => { const late = i >= 8 - st; const fromM = who === 'm' ? !late : late; return <g key={i}><rect x={x + i * 12} y={y} width="11" height="16" rx="2" fill={fromM ? '#24305A' : '#4A2A22'} /><Lbl x={x + i * 12 + 5.5} y={y + 12} s={9} c={K.ink}>{bt}</Lbl></g> })}</g>
  const dy = dev === 0 ? 30 : 120
  return (
    <Fig caption="schema semplificato e rallentato · il controllore abbassa il CS del dispositivo scelto; a ogni impulso di SCK un bit va su MOSI e uno torna su MISO. Dopo 8 impulsi i due registri si sono scambiati i byte (blu: bit del controllore, corallo: bit del dispositivo). L'altro dispositivo, con CS alto, ignora tutto"
      readout={<Readout items={[['dispositivo', dev === 0 ? 'sensore (CS1 basso)' : 'scheda SD (CS2 basso)'], ['impulsi di clock', st + ' / 8', K.cur]]} />}
      controls={mode === 'play' && <Seg label="Dispositivo" value={dev} set={setDev} options={[[0, 'Sensore'], [1, 'Scheda SD']]} />}>
      <Svg h={200} label={`SPI: scambio di un byte con ${dev === 0 ? 'il sensore' : 'la scheda SD'}, ${st} impulsi su 8`}>
        <Chip x={6} y={60} w={110} h={80} label="controllore" />
        <Reg x={14} y={100} val={m} who="m" />
        {[['SCK', 74, 160], ['MOSI', 90, 172], ['MISO', 106, 184]].map(([n, y, bx]) => <g key={n}><path d={`M116 ${y} H${bx} M${bx} 52 V170`} stroke="#5A6378" stroke-width="1.4" fill="none" /><Lbl x={120} y={y - 3} s={7} a="start">{n}</Lbl></g>)}
        {[0, 1].map(i => { const y = i === 0 ? 30 : 120, on = i === dev; return <g key={i} style={{ opacity: on ? 1 : 0.4 }} class="k-ease">
          <Chip x={216} y={y} w={112} h={62} label={i === 0 ? 'sensore' : 'scheda SD'} />
          {[[160, 22], [172, 36], [184, 50]].map(([bx, o]) => <g key={bx}><path d={`M${bx} ${y + o} H216`} stroke="#5A6378" stroke-width="1.4" /><circle cx={bx} cy={y + o} r="2.4" fill="#5A6378" /></g>)}
          {on && <Reg x={224} y={y + 38} val={d} who="d" />}
          {!on && <Lbl x={272} y={y + 46} s={8}>CS alto: ignora</Lbl>}
        </g> })}
        <path d={`M60 140 V188 H200 V${dev === 0 ? 86 : 176} H216`} stroke="#8FA8FF" stroke-width="1.6" fill="none" />
        <path d={`M48 140 V194 H206 V${dev === 0 ? 176 : 86} H216`} stroke="#4A5263" stroke-width="1.2" fill="none" stroke-dasharray="3 3" />
        <Lbl x={130} y={184} s={7} c="#8FA8FF">CS{dev + 1} basso</Lbl>
        {st > 0 && st < 8 && <g><path class="k-flow" d={`M116 90 H172 V${dy + 36} H216`} stroke="#8FA8FF" stroke-width="2" fill="none" style={{ '--dur': '0.6s' }} /><path class="k-flow" d={`M216 ${dy + 50} H184 V106 H116`} stroke="#F28C6B" stroke-width="2" fill="none" style={{ '--dur': '0.6s' }} /></g>}
      </Svg>
    </Fig>
  )
}

/* ESP32: Wi-Fi e Bluetooth a 2,4 GHz */
export function Esp32 ({ mode }) {
  const [m, setM] = useAuto(mode, ['wifi', 'ble'], 3200)
  const wifi = m === 'wifi'
  return (
    <Fig caption="schema semplificato, onde non in scala · la radio fa oscillare la corrente nell'antenna a 2,4 GHz e irradia onde radio, lunghe circa 12,5 cm. Con il Wi-Fi l'ESP32 entra nella rete di casa e in Internet; con il Bluetooth a basso consumo parla con un telefono vicino"
      readout={<Readout items={[['collegamento', wifi ? 'Wi-Fi' : 'Bluetooth LE'], ['frequenza', '2,4 GHz', K.cur], ['verso', wifi ? 'router → Internet' : 'telefono vicino']]} />}
      controls={mode === 'play' && <Seg label="Radio" value={m} set={setM} options={[['wifi', 'Wi-Fi'], ['ble', 'Bluetooth LE']]} />}>
      <Svg h={190} label={`ESP32 che trasmette via ${wifi ? 'Wi-Fi verso il router' : 'Bluetooth verso un telefono'}`}>
        <rect x="18" y="60" width="78" height="96" rx="4" fill="#1F3A2E" />
        <rect x="26" y="88" width="62" height="58" rx="3" fill="#B0B8C8" /><Lbl x={57} y={120} s={8} c="#22252D">ESP32</Lbl>
        <path d="M26 66 H38 V80 H48 V66 H58 V80 H68 V66 H78 V80 H88" fill="none" stroke="#E3C46A" stroke-width="2" />
        <Lbl x={57} y={172} s={8}>antenna sulla scheda</Lbl>
        {[0, 1, 2].map(i => <path key={i} class="esp-wave" style={{ animationDelay: (i * 0.6) + 's' }} d="M100 50 A40 40 0 0 1 100 100" fill="none" stroke="#B9C7FF" stroke-width="2" />)}
        <path class="esp-pkt" d="M110 78 h30" stroke={K.cur} stroke-width="6" stroke-linecap="round" />
        <Lbl x={160} y={60} s={8} c={K.cur}>22,5 °C</Lbl>
        {wifi ? <g>
          <rect x="212" y="78" width="54" height="26" rx="5" fill={K.body} stroke={K.ink} /><path d="M222 78 V60 M256 78 V60" stroke={K.ink} stroke-width="2" />
          <Lbl x={239} y={95} s={8} c={K.ink}>router</Lbl>
          <path d="M266 91 H290" stroke={K.text} stroke-dasharray="3 3" />
          <path d="M296 98 a10 10 0 0 1 4 -19 a13 13 0 0 1 24 4 a9 9 0 0 1 -2 15 Z" fill="none" stroke={K.text} /><Lbl x={310} y={116} s={8}>Internet</Lbl>
        </g> : <g>
          <rect x="226" y="58" width="36" height="66" rx="6" fill={K.body} stroke={K.ink} /><rect x="231" y="66" width="26" height="44" rx="2" fill="#2B3A66" />
          <Lbl x={244} y={140} s={8}>telefono</Lbl>
        </g>}
        <path d="M120 170 q8 -10 16 0 t16 0 t16 0 t16 0" fill="none" stroke="#B9C7FF" stroke-width="1.4" />
        <path d="M120 180 H184" stroke={K.text} /><path d="M120 176 V184 M184 176 V184" stroke={K.text} />
        <Lbl x={152} y={160} s={8}>≈ 12,5 cm per onda</Lbl>
      </Svg>
    </Fig>
  )
}

/* LED indirizzabili: ogni LED si tiene i primi 24 bit */
const PAT = {
  arc: ['#FF3B3B', '#FF9F1C', '#3BD16F', '#3B7BFF', '#B05BFF'],
  red: ['#FF3B3B', '#FF3B3B', '#FF3B3B', '#FF3B3B', '#FF3B3B'],
  one: ['#000000', '#000000', '#3BD16F', '#000000', '#000000']
}
const grb = (hex) => { const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16); return [g, r, b] }
export function LedIndirizzabili ({ mode }) {
  const [p, setP] = useAuto(mode, ['arc', 'red', 'one'], 4600)
  const cols = PAT[p]
  const s = useStep(8, 520, [p])
  const lit = Math.min(5, s)                      // quanti LED hanno già il loro colore
  const LX = (i) => 92 + i * 52
  const [g, r, b] = grb(cols[0])
  return (
    <Fig caption="schema semplificato e rallentato (in realtà 800 000 bit al secondo) · il microcontrollore manda i colori di tutti i LED in fila. Ogni LED si tiene i primi 24 bit che riceve (verde, rosso, blu) e passa il resto al successivo"
      readout={<Readout items={[['primo LED (G R B)', `${g} ${r} ${b}`], ['bit inviati', 5 * 24 + ''], ['LED impostati', lit + ' / 5', K.cur]]} />}
      controls={mode === 'play' && <Seg label="Colori" value={p} set={setP} options={[['arc', 'Arcobaleno'], ['red', 'Tutti rossi'], ['one', 'Solo il terzo']]} />}>
      <Svg h={180} label={`Striscia di 5 LED indirizzabili: ${lit} su 5 hanno ricevuto il loro colore`}>
        <Chip x={6} y={86} w={56} h={50} label="Arduino" />
        <path d="M62 112 H330" stroke="#5A6378" stroke-width="1.6" />
        <path d="M20 160 H330" stroke={K.minus} stroke-width="1.2" opacity=".6" /><path d="M20 70 H330" stroke={K.plus} stroke-width="1.2" opacity=".6" />
        <Lbl x={334} y={73} s={8} a="end" c={K.plus}>5 V</Lbl><Lbl x={334} y={170} s={8} a="end" c={K.minus}>GND</Lbl>
        {cols.map((c, i) => { const on = i < lit; return <g key={i}>
          <path d={`M${LX(i)} 70 V96 M${LX(i)} 128 V160`} stroke="#4A5263" />
          <rect x={LX(i) - 16} y="96" width="32" height="32" rx="4" fill="#E8E6DF" />
          <circle cx={LX(i)} cy="112" r="10" fill={on && c !== '#000000' ? c : '#2A2F3A'} class="k-ease" />
          {on && c !== '#000000' && <circle cx={LX(i)} cy="112" r="20" fill={c} opacity=".25" />}
          <Lbl x={LX(i)} y={146} s={8}>{i + 1}</Lbl>
        </g> })}
        {lit < 5 && <g class="k-ease">
          {cols.slice(lit).map((c, j) => <rect key={j} x={LX(lit) - 40 + j * 9} y="34" width="8" height="14" rx="1.5" fill={c === '#000000' ? '#3A4050' : c} stroke="#0B0D12" />)}
          <path d={`M${LX(lit) - 36} 52 L${LX(lit) - 20} 90`} stroke={K.cur} stroke-width="1.2" stroke-dasharray="2 3" />
          <Lbl x={LX(lit) - 40} y={28} s={8} a="start" c={K.cur}>{5 - lit} × 24 bit in arrivo</Lbl>
        </g>}
        {lit === 5 && <Lbl x={196} y={34} s={9} c={K.cur}>pausa: tutti si accendono</Lbl>}
      </Svg>
    </Fig>
  )
}
