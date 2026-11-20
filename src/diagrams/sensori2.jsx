// Schemi dei sensori. Regole: skill "invenio-schemi".
import { K, Svg, Lbl, Wire, Flow, Electrons, Arrow, Battery, Fig, Seg, Slider, Readout, useAuto } from './kit'
import './sensori2.css'

/* Accelerometro MEMS: massa su molle tra due elettrodi fissi */
export function Accelerometro () {
  return (
    <Fig caption="schema semplificato e molto ingrandito · quando il chip accelera, la massa resta indietro: le due distanze cambiano e con loro le capacità C1 e C2">
      <Svg h={180} label="La massa di silicio sospesa su molle si sposta rispetto al chip quando questo accelera: si avvicina a un elettrodo e si allontana dall'altro">
        <rect x="40" y="30" width="256" height="110" rx="6" fill="none" stroke={K.part} />
        <rect x="56" y="55" width="14" height="60" fill="#B0B8C8" /><rect x="266" y="55" width="14" height="60" fill="#B0B8C8" />
        <Lbl x={63} y={50}>C1</Lbl><Lbl x={273} y={50}>C2</Lbl>
        <g class="ac-mass">
          <rect x="128" y="60" width="80" height="50" rx="4" fill="#5A6378" stroke="#8C96AA" />
          <Lbl x={168} y={90} c={K.ink}>massa</Lbl>
          <path d="M168 60 l-6 -5 l12 -5 l-12 -5 l12 -5 l-6 -5" fill="none" stroke={K.text} stroke-width="1.4" transform="translate(0 0)" />
          <path d="M168 110 l-6 5 l12 5 l-12 5 l12 5 l-6 5" fill="none" stroke={K.text} stroke-width="1.4" />
        </g>
        <g class="ac-r"><Arrow x1={130} y1={162} x2={206} y2={162} c={K.ink} /><Lbl x={168} y={178} s={9}>il chip accelera verso destra</Lbl></g>
        <g class="ac-l"><Arrow x1={206} y1={162} x2={130} y2={162} c={K.ink} /><Lbl x={168} y={178} s={9}>il chip accelera verso sinistra</Lbl></g>
      </Svg>
    </Fig>
  )
}

/* Fotoresistenza */
export function Ldr ({ mode }) {
  const [l, setL] = useAuto(mode, [0, 1, 2, 3], 1700)
  const names = ['buio', 'penombra', 'stanza illuminata', 'sole']
  const res = ['molto alta', 'alta', 'media', 'bassa'][l]
  const loop = 'M60 92 V40 H140 M196 40 H290 V150 H60 V102'
  return (
    <Fig caption="più luce colpisce il materiale, più cariche diventano libere di muoversi: la resistenza scende e la corrente sale"
      readout={<Readout items={[['luce', names[l]], ['resistenza', res, K.cur]]} />}
      controls={mode === 'play' && <Seg label="Quanta luce" value={l} set={setL} options={[[0, 'Buio'], [1, 'Poca'], [2, 'Stanza'], [3, 'Sole']]} />}>
      <Svg h={170} label={`Con ${names[l]} la resistenza della fotoresistenza è ${res}`}>
        <Wire d="M60 92 V40 H140 M196 40 H290 V150 H60 V102" />
        <Battery x={60} y={92} />
        <circle cx="168" cy="40" r="28" fill="#2A2416" stroke="#D9B45A" />
        <path d="M150 28 H186 V36 H150 V44 H186 V52 H150" fill="none" stroke="#E07B39" stroke-width="2.4" />
        {Array.from({ length: l * 2 }).map((_, i) => {
          const x = 128 + i * 14
          return <g key={i} class="ldr-ph" style={{ animationDelay: (i * 0.17) + 's' }}><path d={`M${x} 120 L${x + 14} 76`} stroke={K.light} stroke-width="1.8" /><path d={`M${x + 8} 80 L${x + 14} 76 L${x + 15} 83`} fill="none" stroke={K.light} stroke-width="1.8" /></g>
        })}
        {l > 0 && <Flow d={loop} dur={[0, 2.4, 1.1, 0.5][l]} />}
        {l === 0 && <Lbl x={230} y={100} s={9}>quasi nessuna corrente</Lbl>}
        <Lbl x={168} y={86} s={9} c={K.text}>{l > 0 ? '' : 'buio'}</Lbl>
      </Svg>
    </Fig>
  )
}

/* Fotodiodo: la luce crea coppie elettrone-lacuna nella giunzione */
export function Fotodiodo () {
  return (
    <Fig caption="schema semplificato · un fotone crea una coppia: l'elettrone (●) va verso N, la lacuna (○) verso P. Nel circuito esterno gli elettroni vanno da N a P, la corrente convenzionale (giallo) da P a N">
      <Svg h={190} label="La luce colpisce la giunzione del fotodiodo e crea coppie di cariche che il campo interno separa, generando una corrente nel circuito esterno">
        <rect x="60" y="90" width="216" height="60" rx="6" fill={K.body} stroke={K.part} />
        <rect x="148" y="90" width="40" height="60" fill="#0B0D12" />
        <Lbl x={100} y={166} c={K.hole}>P</Lbl><Lbl x={236} y={166} c={K.el}>N</Lbl><Lbl x={168} y={166} s={8}>giunzione</Lbl>
        <g class="fd-ph"><path d="M150 20 Q154 30 150 40 T150 60 T150 80" fill="none" stroke={K.light} stroke-width="2" /><path d="M145 76 L150 84 L155 76" fill="none" stroke={K.light} stroke-width="2" /><Lbl x={136} y={30} c={K.light} s={9} a="end">luce</Lbl></g>
        <g class="fd-e"><circle cx="168" cy="120" r="5" fill={K.el} /></g>
        <g class="fd-h"><circle cx="168" cy="120" r="5" fill="none" stroke={K.hole} stroke-width="1.8" /></g>
        <Wire d="M60 120 H30 V40 H120 M216 40 H306 V120 H276" />
        <circle cx="168" cy="40" r="14" fill={K.body} stroke={K.ink} /><Lbl x={168} y={44} c={K.ink} s={10}>A</Lbl>
        <Flow d="M60 120 H30 V40 H154 M182 40 H306 V120 H276" dur={1.1} />
        <Electrons d="M60 120 H30 V40 H154 M182 40 H306 V120 H276" dur={1.4} r={4} />
        <Lbl x={168} y={70} s={9}>strumento</Lbl>
      </Svg>
    </Fig>
  )
}

/* Termistore NTC: curva resistenza–temperatura (NTC 10 kΩ, B = 3950, valori tipici) */
const ntcR = (t) => 10 * Math.exp(3950 * (1 / (t + 273.15) - 1 / 298.15)) // kΩ
export function Ntc ({ mode }) {
  const [t, setT] = useAuto(mode, [0, 25, 50, 75, 100], 1600)
  const X = (tt) => 60 + tt * 2.5; const Y = (r) => 150 - Math.min(r, 34) * 3.6
  let d = ''; for (let tt = 0; tt <= 100; tt += 2) d += (tt ? ' L' : 'M') + X(tt).toFixed(1) + ' ' + Y(ntcR(tt)).toFixed(1)
  const r = ntcR(t)
  return (
    <Fig caption="curva di un termistore NTC da 10 kΩ a 25 °C (coefficiente B = 3950, valori tipici): più caldo, meno resistenza"
      readout={<Readout items={[['temperatura', t + ' °C'], ['resistenza', (r >= 10 ? r.toFixed(1) : r.toFixed(2)).replace('.', ',') + ' kΩ', K.cur]]} />}
      controls={mode === 'play' && <Slider id="ntc" label="Temperatura:" show={t + ' °C'} min={0} max={100} step={5} value={t} set={setT} />}>
      <Svg h={180} label={`A ${t} gradi la resistenza è circa ${r.toFixed(1)} kiloohm`}>
        <path d="M60 20 V150 H320" stroke={K.part} fill="none" />
        <Lbl x={56} y={14} a="start" s={9}>resistenza (kΩ)</Lbl><Lbl x={190} y={177} s={9}>temperatura (°C)</Lbl>
        {[0, 50, 100].map(v => <Lbl key={v} x={X(v)} y={162} s={9}>{v}</Lbl>)}
        {[10, 20, 30].map(v => <g key={v}><path d={`M57 ${Y(v)} H320`} stroke="#1F2430" /><Lbl x={52} y={Y(v) + 3} a="end" s={9}>{v}</Lbl></g>)}
        <path d={d} fill="none" stroke={K.heat} stroke-width="2.2" />
        <path d={`M${X(t)} 150 V${Y(r)} H60`} stroke={K.cur} stroke-dasharray="3 3" fill="none" class="k-ease" />
        <circle cx={X(t)} cy={Y(r)} r="6" fill={K.cur} />
      </Svg>
    </Fig>
  )
}

/* Termocoppia tipo K: circa 41 µV per grado di differenza */
export function Termocoppia ({ mode }) {
  const [dt, setDt] = useAuto(mode, [0, 100, 300, 500], 1800)
  const mv = dt * 0.041
  return (
    <Fig caption="valori approssimati per una termocoppia di tipo K (circa 41 µV per °C di differenza)"
      readout={<Readout items={[['differenza di temperatura', dt + ' °C'], ['tensione', mv.toFixed(1).replace('.', ',') + ' mV', K.cur]]} />}
      controls={mode === 'play' && <Slider id="tc" label="Differenza tra punta e estremità fredde:" show={dt + ' °C'} min={0} max={500} step={25} value={dt} set={setDt} />}>
      <Svg h={170} label={`Con ${dt} gradi di differenza la termocoppia produce circa ${mv.toFixed(1)} millivolt`}>
        <path d="M70 90 C120 60 180 60 232 66" fill="none" stroke="#5FBF7A" stroke-width="3" />
        <path d="M70 90 C120 120 180 120 232 114" fill="none" stroke="#E8EAF0" stroke-width="3" />
        <Lbl x={160} y={56} c="#5FBF7A" s={9}>lega A (+)</Lbl><Lbl x={160} y={134} s={9}>lega B (−)</Lbl>
        <circle cx="70" cy="90" r="6" fill={K.heat} />
        <g opacity={Math.min(1, dt / 300)} class="tc-heat"><path d="M52 132 Q44 116 56 104 Q52 118 64 112 Q60 96 72 88 Q74 104 84 110 Q90 122 78 134 Z" fill={K.heat} opacity=".8" /></g>
        <Lbl x={70} y={156} c={K.heat} s={9}>punta calda</Lbl>
        <rect x="232" y="56" width="70" height="68" rx="8" fill={K.body} stroke={K.ink} />
        <Lbl x={267} y={86} c={K.cur} s={14}>{mv.toFixed(1).replace('.', ',')}</Lbl><Lbl x={267} y={104} s={9}>mV</Lbl>
        <Lbl x={267} y={140} s={9}>estremità fredde</Lbl>
      </Svg>
    </Fig>
  )
}

/* Encoder in quadratura */
export function Encoder ({ mode }) {
  const [cw, setCw] = useAuto(mode, [true, false], 3200)
  const wave = (y, shift) => {
    let d = `M${150 + shift} ${y + 12}`
    for (let i = 0; i < 12; i++) { const x = 150 + shift + i * 32; d += ` V${y} H${x + 16} V${y + 12} H${x + 32}` }
    return d
  }
  // in senso orario A anticipa B di un quarto di periodo; al contrario B anticipa A
  return (
    <Fig caption="A e B sono sfasati di un quarto di periodo: chi cambia per primo indica il verso di rotazione"
      readout={<Readout items={[['verso', cw ? 'orario' : 'antiorario'], ['cambia per primo', cw ? 'A' : 'B', K.cur]]} />}
      controls={mode === 'play' && <Seg label="Verso di rotazione" value={cw} set={setCw} options={[[true, 'Orario ↻'], [false, 'Antiorario ↺']]} />}>
      <Svg h={170} label={cw ? 'Rotazione oraria: il segnale A cambia prima del segnale B' : 'Rotazione antioraria: il segnale B cambia prima del segnale A'}>
        <g class={cw ? 'k-spin' : 'k-spin-rev'} style={{ transformOrigin: '70px 85px', '--dur': '6s' }}>
          <circle cx="70" cy="85" r="52" fill={K.body} stroke={K.part} />
          {Array.from({ length: 12 }).map((_, i) => <rect key={i} x="66" y="37" width="8" height="14" fill="#0B0D12" transform={`rotate(${i * 30} 70 85)`} />)}
          <circle cx="70" cy="85" r="8" fill={K.part} />
        </g>
        <circle cx="70" cy="40" r="4" fill={K.cur} /><Lbl x={58} y={26} c={K.cur} s={9}>A</Lbl>
        <circle cx="82" cy="41" r="4" fill={K.light2} /><Lbl x={92} y={28} c={K.light2} s={9}>B</Lbl>
        <Lbl x={140} y={52} a="end" c={K.cur} s={10}>A</Lbl><Lbl x={140} y={102} a="end" c={K.light2} s={10}>B</Lbl>
        <clipPath id="encc"><rect x="150" y="30" width="176" height="100" /></clipPath>
        <g clip-path="url(#encc)">
          <g class="enc-scroll"><path d={wave(40, 0)} fill="none" stroke={K.cur} stroke-width="2" /></g>
          <g class="enc-scroll"><path d={wave(90, cw ? 8 : -8)} fill="none" stroke={K.light2} stroke-width="2" /></g>
        </g>
        <path d="M238 30 V130" stroke={K.ink} stroke-dasharray="2 3" opacity=".5" />
        <Lbl x={238} y={146} s={9}>adesso</Lbl>
      </Svg>
    </Fig>
  )
}

/* Sensore di forza resistivo */
export function Fsr ({ mode }) {
  const [f, setF] = useAuto(mode, [0, 1, 2, 3], 1600)
  const gap = 14 - f * 4
  const pts = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) pts.push([96 + c * 18 + (r % 2) * 9, r])
  return (
    <Fig caption="schema semplificato · premendo, le particelle conduttive si toccano in più punti: più strade per la corrente, meno resistenza"
      readout={<Readout items={[['pressione', ['nessuna', 'leggera', 'media', 'forte'][f]], ['resistenza', ['molto alta', 'alta', 'media', 'bassa'][f], K.cur]]} />}
      controls={mode === 'play' && <Seg label="Pressione" value={f} set={setF} options={[[0, 'Nessuna'], [1, 'Leggera'], [2, 'Media'], [3, 'Forte']]} />}>
      <Svg h={170} label={`Pressione ${['nessuna', 'leggera', 'media', 'forte'][f]}: la resistenza del sensore diminuisce con la forza`}>
        {f > 0 && <Arrow x1={168} y1={8} x2={168} y2={46 + (3 - f) * 0} c={K.ink} w={2 + f} />}
        {f > 0 && <Lbl x={190} y={26} a="start" s={9}>forza</Lbl>}
        <rect x="80" y={50 + (3 - f) * 0} width="176" height="6" fill="#5A6378" class="k-ease" />
        {pts.map(([x, r], i) => <circle key={i} cx={x} cy={64 + r * gap} r="5" fill="#2C2C2C" stroke="#8C96AA" class="k-ease" />)}
        <rect x="80" y={64 + 2 * gap + 8} width="176" height="6" fill="#B98A3A" class="k-ease" />
        <Wire d={`M80 ${67 + 2 * gap + 8} H40 V150 H300 V${67 + 2 * gap + 8} H256`} />
        {f > 0 && <Flow d={`M40 150 V${67 + 2 * gap + 8} H80 M256 ${67 + 2 * gap + 8} H300 V150`} dur={[0, 2, 1, 0.5][f]} />}
        <Lbl x={168} y={164} s={9}>elettrodi</Lbl>
      </Svg>
    </Fig>
  )
}

/* Estensimetro */
export function Estensimetro ({ mode }) {
  const [e, setE] = useAuto(mode, [0, 1, 2], 1800)
  const sx = 1 + e * 0.08; const sy = 1 - e * 0.03
  return (
    <Fig caption="deformazione esagerata moltissimo per vederla · nei metalli la variazione di resistenza è circa 2 volte la deformazione relativa"
      readout={<Readout items={[['trazione', ['nessuna', 'media', 'forte'][e]], ['resistenza', ['di riposo', 'un po\' più alta', 'più alta'][e], K.cur]]} />}
      controls={mode === 'play' && <Seg label="Trazione" value={e} set={setE} options={[[0, 'Nessuna'], [1, 'Media'], [2, 'Forte']]} />}>
      <Svg h={150} label="Quando il pezzo viene tirato, la griglia dell'estensimetro si allunga e si assottiglia e la sua resistenza aumenta">
        <g class="k-ease" style={{ transform: `scale(${sx},${sy})`, transformOrigin: '168px 75px', transformBox: 'view-box' }}>
          <rect x="70" y="45" width="196" height="60" fill="#2A2F3A" stroke={K.part} />
          <path d="M110 60 H226 V66 H110 V72 H226 V78 H110 V84 H226 V90 H110" fill="none" stroke="#D9B45A" stroke-width="2" />
        </g>
        {e > 0 && <><Arrow x1={60} y1={75} x2={20} y2={75} c={K.ink} w={1 + e} /><Arrow x1={276} y1={75} x2={316} y2={75} c={K.ink} w={1 + e} /></>}
        <Lbl x={168} y={128} s={9}>griglia metallica incollata sul pezzo</Lbl>
      </Svg>
    </Fig>
  )
}

/* GPS: distanze dai satelliti */
export function Gps () {
  const S = [[60, 30], [168, 14], [282, 34]]; const R = [150, 150]
  const d = S.map(([x, y]) => Math.hypot(R[0] - x, R[1] - y))
  return (
    <Fig caption="schema semplificato in 2D: tre distanze individuano un punto. Nello spazio servono 4 satelliti, uno anche per correggere l'orologio del ricevitore">
      <Svg h={190} label="Ogni satellite invia un segnale; dal tempo di arrivo il ricevitore calcola la distanza da ciascuno. Il punto in cui i cerchi si incontrano è la sua posizione">
        <clipPath id="gpsc"><rect x="0" y="0" width="336" height="190" /></clipPath>
        <g clip-path="url(#gpsc)">
          {S.map(([x, y], i) => <circle key={'c' + i} cx={x} cy={y} r={d[i]} fill="none" stroke="#6FD3C1" stroke-opacity=".35" stroke-dasharray="4 5" />)}
          {S.map(([x, y], i) => <g key={'p' + i} transform={`translate(${x} ${y})`}><circle class="gps-pulse" style={{ animationDelay: (i * 0.4) + 's', '--s': d[i] }} r="1" fill="none" stroke="#6FD3C1" stroke-width="2" vector-effect="non-scaling-stroke" /></g>)}
        </g>
        {S.map(([x, y], i) => <g key={'s' + i}><rect x={x - 8} y={y - 5} width="16" height="10" fill="#B0B8C8" /><path d={`M${x - 20} ${y} H${x - 8} M${x + 8} ${y} H${x + 20}`} stroke="#5FA8D3" stroke-width="4" /></g>)}
        <circle cx={R[0]} cy={R[1]} r="7" fill={K.cur} />
        <Lbl x={R[0] + 12} y={R[1] + 18} a="start" c={K.cur} s={9}>ricevitore</Lbl>
      </Svg>
    </Fig>
  )
}
