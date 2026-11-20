// Schemi dei connettori e cablaggi. Regole: skill "invenio-schemi".
import { K, Svg, Lbl, Wire, Flow, Arrow, Lamp, Fig, Seg, Readout, useAuto } from './kit'
import './connettori.css'

const CU = '#C98A4B'     // rame
const MET = '#B0B8C8'    // acciaio / metallo chiaro
const BRASS = '#C9A86A'  // ottone
const INS = '#3E6FB0'    // isolante del filo
const ease = (t) => ({ transform: t, transformBox: 'view-box' })

/* Morsetto a leva (versione passante, sezione) */
export function MorsettoLeva ({ mode }) {
  const [s, setS] = useAuto(mode, [0, 1, 2], 1900)
  const open = s < 2
  const foot = open ? 66 : 90
  const leaf = (x, dir) => `M${x} 46 Q${x} ${foot - 6} ${x + dir * 14} ${foot} L${x + dir * 40} ${foot}`
  const state = ['leve alzate, fili fuori', 'fili appoggiati: contatto incerto', 'molle chiuse: fili collegati'][s]
  return (
    <Fig caption="sezione di un morsetto passante, schema semplificato · a leve abbassate la molla preme il filo sulla barretta di rame e la corrente passa da un filo all'altro. Nei morsetti da giunzione i fili entrano dallo stesso lato, il principio è uguale"
      readout={<Readout items={[['stato', state, s === 2 ? K.cur : null]]} />}
      controls={mode === 'play' && <Seg label="Fase" value={s} set={setS} options={[[0, 'Leve su'], [1, 'Fili dentro'], [2, 'Leve giù']]} />}>
      <Svg h={190} label={`Morsetto a leva: ${state}`}>
        <rect x="70" y="40" width="196" height="84" rx="8" fill="rgba(160,170,190,.06)" stroke={K.part} />
        <rect x="86" y="102" width="164" height="8" rx="2" fill={CU} />
        <Lbl x={168} y={138} s={9}>barretta di rame</Lbl>
        <g class="k-ease" style={ease(`translateX(${s ? 0 : -56}px)`)}>
          <rect x="-10" y="90" width="96" height="12" rx="3" fill={INS} />
          <rect x="86" y="92" width="62" height="9" rx="4" fill={CU} />
        </g>
        <g class="k-ease" style={ease(`translateX(${s ? 0 : 56}px)`)}>
          <rect x="250" y="90" width="96" height="12" rx="3" fill={INS} />
          <rect x="188" y="92" width="62" height="9" rx="4" fill={CU} />
        </g>
        <path d={leaf(100, 1)} fill="none" stroke={MET} stroke-width="3" />
        <path d={leaf(236, -1)} fill="none" stroke={MET} stroke-width="3" />
        <Lbl x={168} y={58} s={9}>molle</Lbl>
        <g class="k-ease" style={{ transform: `rotate(${open ? -22 : 0}deg)`, transformOrigin: '80px 34px', transformBox: 'view-box' }}>
          <rect x="76" y="28" width="80" height="10" rx="4" fill="#E0A23C" />
        </g>
        <g class="k-ease" style={{ transform: `rotate(${open ? 22 : 0}deg)`, transformOrigin: '256px 34px', transformBox: 'view-box' }}>
          <rect x="180" y="28" width="80" height="10" rx="4" fill="#E0A23C" />
        </g>
        {s === 2 && <g>
          <Arrow x1={128} y1={70} x2={128} y2={87} c={K.force} head={5} /><Arrow x1={208} y1={70} x2={208} y2={87} c={K.force} head={5} />
          <Lbl x={120} y={80} s={9} c={K.force} a="end">F</Lbl><Lbl x={216} y={80} s={9} c={K.force} a="start">F</Lbl>
          <Flow d="M2 96 H128 V106 H208 V96 H334" dur={0.9} />
          <Lbl x={20} y={84} c={K.cur} s={10}>I</Lbl>
        </g>}
        <Lbl x={40} y={172} s={9}>filo 1</Lbl><Lbl x={296} y={172} s={9}>filo 2</Lbl>
      </Svg>
    </Fig>
  )
}

/* Morsettiera a vite (sezione) */
export function MorsettieraVite ({ mode }) {
  const [s, setS] = useAuto(mode, [0, 1], 2200)
  const tight = s === 1
  const plate = tight ? 106 : 98          // y del lato alto della piastrina (spessa 8)
  const cu = tight ? [114, 13] : [113, 14]
  const dots = tight ? [140, 156, 172, 188, 204] : [150, 196]
  return (
    <Fig caption="sezione di un morsetto per circuito stampato, schema semplificato · stringendo la vite, la piastrina schiaccia il filo sul metallo: aumentano i punti di contatto (gialli) e la resistenza del contatto scende. Un contatto lento si scalda"
      readout={<Readout items={[['vite', tight ? 'stretta' : 'allentata'], ['resistenza del contatto', tight ? 'bassa' : 'alta: si scalda', tight ? K.cur : K.heat]]} />}
      controls={mode === 'play' && <Seg label="Vite" value={s} set={setS} options={[[0, 'Allentata'], [1, 'Stretta']]} />}>
      <Svg h={190} label={`Morsetto a vite ${tight ? 'stretto: buon contatto' : 'allentato: contatto debole'}`}>
        <rect x="0" y="176" width="336" height="10" fill="#1F4D3A" /><Lbl x={300} y={172} s={9}>scheda</Lbl>
        <rect x="120" y="60" width="110" height="70" fill="none" stroke={BRASS} stroke-width="6" />
        <rect x="171" y="130" width="8" height="46" fill={BRASS} />
        <g class="k-ease" style={ease(`translateY(${plate - 90}px)`)}>
          <rect x="160" y="22" width="30" height="12" rx="3" fill={MET} />
          <path d="M175 22 V34" stroke="#0B0D12" stroke-width="3" />
          <rect x="169" y="34" width="12" height="56" fill={MET} />
          {[40, 48, 56, 64, 72, 80].map(y => <path key={y} d={`M169 ${y} L181 ${y + 4}`} stroke="#6B7385" stroke-width="1.4" />)}
          <rect x="132" y="90" width="86" height="8" rx="2" fill={MET} />
        </g>
        <rect x="10" y="111" width="100" height="18" rx="4" fill={INS} />
        <rect x="110" y={cu[0]} width="104" height={cu[1]} rx="5" fill={CU} class="k-ease" />
        {dots.map(x => <g key={x}>
          <circle cx={x} cy={127} r="2.4" fill={K.cur} />
          {tight && <circle cx={x} cy={114} r="2.4" fill={K.cur} />}
        </g>)}
        {!tight && <path class="k-blink" d="M150 156 q4 -5 0 -10 q-4 -5 0 -10 M196 156 q4 -5 0 -10 q-4 -5 0 -10" fill="none" stroke={K.heat} stroke-width="1.6" style={{ '--dur': '1.2s' }} />}
        <Flow d="M2 120 H175 V174" dur={1} />
        <Lbl x={20} y={104} c={K.cur}>I</Lbl>
        <Lbl x={60} y={146} s={9}>filo</Lbl>
        <Lbl x={240} y={30} s={9} a="start">vite</Lbl>
        <Lbl x={240} y={plate + 6} s={9} a="start" class="k-ease">piastrina</Lbl>
      </Svg>
    </Fig>
  )
}

/* Crimpaggio: sezione vista dalla punta del filo */
const hex = (cx, cy, d) => [[0, 0], [d, 0], [-d, 0], [d / 2, -d * 0.87], [-d / 2, -d * 0.87], [d / 2, d * 0.87], [-d / 2, d * 0.87]].map(([x, y]) => [cx + x, cy + y])
export function Crimpaggio ({ mode }) {
  const [s, setS] = useAuto(mode, [0, 1, 2], 1800)
  const loose = hex(168, 110, 17).map(([x, y], i) => [x + [0, 2, -3, 3, -2, 1, -3][i], y + [0, 3, -2, -3, 2, 4, 1][i]])
  const packed = hex(168, 116, 12.5)
  const barrel = [
    'M128 60 V100 A40 40 0 0 0 208 100 V60',
    'M140 62 L128 100 A40 40 0 0 0 208 100 L196 62',
    'M166 90 C164 64 128 64 128 100 A40 40 0 0 0 208 100 C208 64 172 64 170 90'][s]
  const die = 'M110 0 V100 H126 C126 58 164 58 168 86 C172 58 210 58 210 100 H226 V0 Z'
  const label = ['terminale aperto, filo dentro', 'la pinza piega le alette', 'crimpato: rame e terminale compattati'][s]
  return (
    <Fig caption="sezione vista dalla punta del filo, schema semplificato · la matrice della pinza arrotola le alette del terminale dentro i filini di rame e li compatta: niente spazi per aria e umidità"
      readout={<Readout items={[['fase', label, s === 2 ? K.cur : null]]} />}
      controls={mode === 'play' && <Seg label="Fase" value={s} set={setS} options={[[0, 'Aperto'], [1, 'Pinza'], [2, 'Crimpato']]} />}>
      <Svg h={190} label={`Crimpaggio: ${label}`}>
        <g class="k-ease" style={ease(`translateY(${[-70, -30, 0][s]}px)`)}>
          <path d={die} fill="#3A4050" stroke="#5A6378" />
          <Lbl x={168} y={24} s={9} c={K.ink}>matrice</Lbl>
        </g>
        <path d="M110 186 V100 H125 A43 43 0 0 0 211 100 H226 V186 Z" fill="#3A4050" stroke="#5A6378" />
        <Lbl x={168} y={176} s={9} c={K.ink}>incudine</Lbl>
        {(s === 2 ? packed : loose).map(([x, y], i) =>
          <circle key={i} class="k-ease" cx={x} cy={y} r={s === 2 ? 6.3 : 7} fill={CU} stroke="#8A5A2E" stroke-width="1" />)}
        <path d={barrel} fill="none" stroke={BRASS} stroke-width="6" stroke-linejoin="round" />
        {s === 2 && <g><Arrow x1={100} y1={86} x2={122} y2={96} head={5} /><Arrow x1={236} y1={86} x2={214} y2={96} head={5} /></g>}
        <Lbl x={60} y={70} s={9}>alette</Lbl>
        <path d="M76 72 L122 62" stroke={K.text} stroke-width="0.8" />
        <Lbl x={290} y={124} s={9}>filini</Lbl><Lbl x={290} y={136} s={9}>di rame</Lbl>
      </Svg>
    </Fig>
  )
}

/* Header e contatto femmina Dupont */
export function HeaderDupont ({ mode }) {
  const [s, setS] = useAuto(mode, [0, 1], 2200)
  const inn = s === 1
  const g = inn ? 5 : 3                    // metà apertura della forcella in basso
  const leaf = (dir) => `M${168 + dir * 7} 44 L${168 + dir * 7} 58 L${168 + dir * g} 88 L${168 + dir * (g + 4)} 104`
  return (
    <Fig caption="sezione, schema semplificato e ingrandito · la forcella del contatto femmina è più stretta del piedino: infilandolo si allarga come una molla e lo stringe ai lati (F). Da lì passa la corrente"
      readout={<Readout items={[['stato', inn ? 'infilato: contatto' : 'staccato'], ['passo', '2,54 mm']]} />}
      controls={mode === 'play' && <Seg label="Piedino" value={s} set={setS} options={[[0, 'Staccato'], [1, 'Infilato']]} />}>
      <Svg h={190} label={inn ? 'Il piedino è infilato nel contatto femmina, che lo stringe ai lati' : 'Il piedino è fuori dal contatto femmina'}>
        <rect x="164" y="0" width="8" height="40" fill="#D0473F" />
        <rect x="166" y="24" width="4" height="22" fill={CU} />
        <rect x="128" y="20" width="80" height="94" rx="4" fill="rgba(160,170,190,.07)" stroke={K.part} />
        <rect x="158" y="38" width="20" height="12" fill={MET} />
        <path d={leaf(-1)} fill="none" stroke={MET} stroke-width="3" stroke-linejoin="round" />
        <path d={leaf(1)} fill="none" stroke={MET} stroke-width="3" stroke-linejoin="round" />
        <g class="k-ease" style={ease(`translateY(${inn ? 0 : 50}px)`)}>
          <path d="M164 66 L166 60 H170 L172 66 V174 H164 Z" fill="#E3C46A" />
          <rect x="140" y="150" width="56" height="12" fill="#22252D" stroke={K.part} />
          <rect x="0" y="174" width="230" height="10" fill="#1F4D3A" />
        </g>
        {inn && <g>
          <Arrow x1={146} y1={86} x2={160} y2={86} head={5} /><Arrow x1={190} y1={86} x2={176} y2={86} head={5} />
          <Lbl x={140} y={90} c={K.force} a="end" s={9}>F</Lbl><Lbl x={196} y={90} c={K.force} a="start" s={9}>F</Lbl>
          <Flow d="M168 2 V172" dur={1} w={2.2} />
          <Lbl x={156} y={14} c={K.cur} a="end">I</Lbl>
        </g>}
        <Lbl x={110} y={60} s={9} a="end">contatto</Lbl><Lbl x={110} y={72} s={9} a="end">a forcella</Lbl>
        <Lbl x={110} y={146} s={9} a="end">piedino</Lbl>
        <g>
          <rect x="246" y="124" width="8" height="8" fill="#E3C46A" /><rect x="276" y="124" width="8" height="8" fill="#E3C46A" /><rect x="306" y="124" width="8" height="8" fill="#E3C46A" />
          <path d="M250 142 V148 M280 142 V148 M250 145 H280" stroke={K.text} stroke-width="1" />
          <Lbl x={265} y={160} s={9}>2,54 mm</Lbl>
          <Lbl x={280} y={114} s={9}>vista da sopra</Lbl>
        </g>
      </Svg>
    </Fig>
  )
}

/* USB-C: rilevamento del verso con i contatti CC */
const zig = (x, y, len = 46) => { let d = `M${x} ${y}`; const n = 6, st = len / n; for (let i = 0; i < n; i++) d += ` L${x + st * i + st / 4} ${y - 6} L${x + st * i + 3 * st / 4} ${y + 6}`; return d + ` L${x + len} ${y}` }
export function UsbC ({ mode }) {
  const [s, setS] = useAuto(mode, [0, 1, 2], 2200)
  const vRd = (5 * 5.1 / (56 + 5.1)).toFixed(2).replace('.', ',') // 0,42 V
  const cc1 = s === 1 ? vRd + ' V' : '5 V'
  const cc2 = s === 2 ? vRd + ' V' : '5 V'
  const y = s === 2 ? 132 : 72
  const cable = s === 1 ? 'M120 72 H216' : 'M120 132 C170 132 166 72 216 72'
  const dev = s > 0
  return (
    <Fig caption="schema semplificato: solo i contatti CC e VBUS · il cavo porta un solo filo CC. Il caricatore (56 kΩ verso 5 V) vede quale contatto scende a 0,42 V per il partitore con i 5,1 kΩ del dispositivo: così sa che c'è qualcuno e com'è girata la spina. Solo allora accende VBUS"
      readout={<Readout items={[['CC1', cc1, s === 1 ? K.cur : null], ['CC2', cc2, s === 2 ? K.cur : null], ['VBUS', dev ? '5 V acceso' : 'spento', dev ? K.cur : null]]} />}
      controls={mode === 'play' && <Seg label="Collegamento" value={s} set={setS} options={[[0, 'Niente'], [1, 'Diritta'], [2, 'Capovolta']]} />}>
      <Svg h={200} label={`USB-C: ${['nessun dispositivo collegato', 'spina diritta, il filo CC arriva su CC1', 'spina capovolta, il filo CC arriva su CC2'][s]}`}>
        <rect x="8" y="16" width="112" height="170" rx="8" fill={K.body} stroke={K.part} />
        <Lbl x={64} y={180} s={9}>caricatore</Lbl>
        <Wire d="M24 50 V140" /><Lbl x={24} y={44} s={9} c={K.plus}>5 V</Lbl>
        <Wire d="M24 72 H34 M80 72 H120 M24 132 H34 M80 132 H120" />
        <path d={zig(34, 72)} fill="none" stroke={K.ink} stroke-width="1.6" /><path d={zig(34, 132)} fill="none" stroke={K.ink} stroke-width="1.6" />
        <Lbl x={57} y={60} s={8}>56 kΩ</Lbl><Lbl x={57} y={120} s={8}>56 kΩ</Lbl>
        <Lbl x={114} y={66} s={9} a="end">CC1</Lbl><Lbl x={114} y={126} s={9} a="end">CC2</Lbl>
        <Lbl x={100} y={86} s={8} c={s === 1 ? K.cur : K.text} a="end">{cc1}</Lbl>
        <Lbl x={100} y={146} s={8} c={s === 2 ? K.cur : K.text} a="end">{cc2}</Lbl>
        <Wire d="M120 32 H216" dash={dev ? null : '4 4'} /><Lbl x={168} y={26} s={9}>VBUS</Lbl>
        <g style={{ opacity: dev ? 1 : 0.25 }} class="k-ease">
          <rect x="216" y="16" width="112" height="170" rx="8" fill={K.body} stroke={K.part} />
          <Lbl x={272} y={180} s={9}>dispositivo</Lbl>
          <Wire d="M216 72 H234 M280 72 H306 M216 132 H234 M280 132 H306 M306 72 V160" />
          <path d={zig(234, 72)} fill="none" stroke={K.ink} stroke-width="1.6" /><path d={zig(234, 132)} fill="none" stroke={K.ink} stroke-width="1.6" />
          <Lbl x={257} y={60} s={8}>5,1 kΩ</Lbl><Lbl x={257} y={120} s={8}>5,1 kΩ</Lbl>
          <path d="M296 160 H316 M300 165 H312 M304 170 H308" stroke={K.ink} stroke-width="1.4" />
          <Lbl x={222} y={88} s={9} a="start">CC1</Lbl><Lbl x={222} y={148} s={9} a="start">CC2</Lbl>
          <Wire d="M216 32 H240" /><rect x="240" y="26" width="40" height="14" rx="3" fill="none" stroke={K.text} /><Lbl x={260} y={36} s={8}>carico</Lbl>
        </g>
        {dev && <path d={cable} fill="none" stroke="#8C96AA" stroke-width="2" />}
        {dev && <Lbl x={168} y={s === 1 ? 64 : 152} s={9}>filo CC del cavo</Lbl>}
        {dev && <Flow d={`M24 ${y} H120 ${s === 1 ? 'H216' : 'C170 132 166 72 216 72'} H306 V158`} dur={2.4} w={2} />}
        {dev && <Flow d="M120 32 H240" dur={0.9} />}
      </Svg>
    </Fig>
  )
}

/* Jack di alimentazione con diodo di protezione */
export function JackDc ({ mode }) {
  const [s, setS] = useAuto(mode, [0, 1], 2600)
  const pos = s === 0                       // centro positivo: il circuito funziona
  const cIn = pos ? K.plus : K.minus, cOut = pos ? K.minus : K.plus
  const loop = 'M48 100 H252 M266 100 H300 V40 H252 M228 40 H182 V72 H100 V118 H48'
  return (
    <Fig caption="schema semplificato · questo circuito vuole il centro positivo e ha un diodo in serie: con un alimentatore a centro negativo il diodo blocca la corrente e il circuito non si rovina. Il simbolo sotto dice la polarità"
      readout={<Readout items={[['alimentatore', pos ? 'centro +' : 'centro −'], ['lampadina', pos ? 'accesa' : 'spenta: il diodo blocca', pos ? K.cur : null]]} />}
      controls={mode === 'play' && <Seg label="Alimentatore" value={s} set={setS} options={[[0, 'Centro +'], [1, 'Centro −']]} />}>
      <Svg h={200} label={pos ? 'Alimentatore a centro positivo: la corrente passa nel diodo e accende la lampadina' : 'Alimentatore a centro negativo: il diodo è in inversa e blocca la corrente'}>
        <rect x="8" y="84" width="40" height="46" rx="5" fill={K.body} stroke={K.part} />
        <Lbl x={28} y={140} s={8}>alim.</Lbl>
        <Lbl x={56} y={96} c={cIn} s={11}>{pos ? '+' : '−'}</Lbl><Lbl x={56} y={126} c={cOut} s={11}>{pos ? '−' : '+'}</Lbl>
        <Wire d="M48 100 H130 M48 118 H110" />
        <rect x="100" y="72" width="94" height="50" rx="3" fill="#2A2F3A" stroke={MET} stroke-width="3" />
        <rect x="128" y="92" width="66" height="16" fill="#0B0D12" />
        <path d="M128 92 H194 M128 108 H194" stroke={cIn} stroke-width="2.4" />
        <rect x="140" y="96" width="112" height="8" fill={MET} />
        <path d="M182 40 V70" stroke={MET} stroke-width="3" />
        <Lbl x={147} y={66} s={8}>spina</Lbl><Lbl x={222} y={92} s={8}>piedino</Lbl><Lbl x={188} y={62} s={8} a="start">molla</Lbl>
        <path d="M252 92 L266 100 L252 108 Z M266 92 V108" fill="none" stroke={K.ink} stroke-width="1.6" />
        <Lbl x={259} y={86} s={8}>diodo</Lbl>
        <Wire d="M266 100 H300 V40 H254 M226 40 H182" />
        <Lamp x={240} y={40} glow={pos ? 1 : 0} />
        {pos && <Flow d={loop} dur={1} />}
        {!pos && <Lbl x={290} y={124} s={9} c={K.heat}>bloccato</Lbl>}
        <g transform="translate(168 176)">
          <Lbl x={-52} y={4} c={pos ? K.minus : K.plus} s={12}>{pos ? '−' : '+'}</Lbl>
          <path d="M-44 0 H-12 M8 -9 A12 12 0 1 0 8 9" fill="none" stroke={K.ink} stroke-width="1.6" />
          <circle cx="0" cy="0" r="3.5" fill={K.ink} /><path d="M0 0 H44" stroke={K.ink} stroke-width="1.6" />
          <Lbl x={52} y={4} c={pos ? K.plus : K.minus} s={12}>{pos ? '+' : '−'}</Lbl>
        </g>
      </Svg>
    </Fig>
  )
}

/* Cavo coassiale */
export function Coassiale () {
  const E = '#6FD3C1'
  const rad = [0, 45, 90, 135, 180, 225, 270, 315].map(a => a * Math.PI / 180)
  return (
    <Fig caption="istantanea del segnale, schema semplificato · la corrente va sul filo centrale e torna sulla calza: il campo elettrico (verde acqua) e quello magnetico (grigio) restano nell'isolante, i disturbi si fermano sulla calza. A sinistra la sezione vista dall'estremità destra del cavo (⊙ verso di te, ⊗ lontano da te)">
      <Svg h={200} label="Cavo coassiale: corrente avanti sul filo centrale e indietro sulla calza; i campi restano dentro l'isolante">
        <circle cx="76" cy="100" r="58" fill="#2A2F3A" />
        <circle cx="76" cy="100" r="48" fill="#17222B" stroke={CU} stroke-width="6" stroke-dasharray="3 2" />
        {rad.map((a, i) => <g key={i}>
          <Arrow x1={76 + 12 * Math.cos(a)} y1={100 + 12 * Math.sin(a)} x2={76 + 42 * Math.cos(a)} y2={100 + 42 * Math.sin(a)} c={E} w={1.2} head={4} />
        </g>)}
        {[20, 32].map(r => <g key={r}>
          <circle cx="76" cy="100" r={r} fill="none" stroke={K.field} stroke-width="1.2" stroke-dasharray="3 3" />
          <path d={`M${80} ${100 - r - 3} L${74} ${100 - r} L${80} ${100 - r + 3}`} fill="none" stroke={K.field} stroke-width="1.2" />
        </g>)}
        <circle cx="76" cy="100" r="8" fill={CU} /><circle cx="76" cy="100" r="2.2" fill="#0B0D12" />
        {[30, 150, 270].map(d => { const a = d * Math.PI / 180; const x = 76 + 48 * Math.cos(a), y = 100 + 48 * Math.sin(a); return <g key={d}><circle cx={x} cy={y} r="6" fill="#0B0D12" stroke={K.ink} stroke-width="1" /><path d={`M${x - 3.5} ${y - 3.5} L${x + 3.5} ${y + 3.5} M${x + 3.5} ${y - 3.5} L${x - 3.5} ${y + 3.5}`} stroke={K.ink} stroke-width="1" /></g> })}
        <Lbl x={76} y={196} s={9}>sezione</Lbl>
        <rect x="160" y="58" width="172" height="84" fill="#2A2F3A" />
        <rect x="160" y="66" width="172" height="68" fill="#17222B" />
        <path d="M160 66 H332 M160 134 H332" stroke={CU} stroke-width="5" stroke-dasharray="3 2" />
        <path d="M160 100 H332" stroke={CU} stroke-width="5" />
        <Flow d="M160 100 H332" dur={1} />
        <Flow d="M332 66 H160" dur={1} w={2.2} /><Flow d="M332 134 H160" dur={1} w={2.2} />
        <path d="M250 8 q5 5 0 10 q-5 5 0 10 q5 5 0 10 q-5 5 0 10 L250 58" fill="none" stroke={K.text} stroke-width="1.4" />
        <path d="M245 52 L250 60 L255 52" fill="none" stroke={K.text} stroke-width="1.4" />
        <Lbl x={262} y={22} s={9} a="start">disturbo</Lbl>
        <Lbl x={160} y={160} s={9} a="start">filo · isolante · calza · guaina</Lbl>
        <Lbl x={176} y={94} s={9} c={K.cur} a="start">I andata</Lbl>
        <Lbl x={326} y={124} s={9} c={K.cur} a="end">I ritorno</Lbl>
      </Svg>
    </Fig>
  )
}

/* Breadboard: quali fori sono collegati */
const COLS = 12
const cx = (i) => 48 + i * 24
const ROWS_T = [78, 90, 102, 114, 126], ROWS_B = [150, 162, 174, 186, 198]
export function Breadboard ({ mode }) {
  const [s, setS] = useAuto(mode, [0, 1, 2, 3], 2400)
  const hl = 'rgba(255,210,122,.32)'
  const label = ['ogni fila di 5 fori è collegata', 'le linee di alimentazione corrono lungo tutta la basetta', 'il chip a cavallo del canale: ogni piedino ha la sua fila', 'un circuito: + → resistenza → LED → −'][s]
  return (
    <Fig caption="vista da sopra con le strisce di metallo nascoste evidenziate, schema semplificato · i fori sopra la stessa striscia sono un unico punto del circuito"
      readout={<Readout items={[['mostra', label]]} />}
      controls={mode === 'play' && <Seg label="Mostra" value={s} set={setS} options={[[0, 'Fila'], [1, 'Alimentazione'], [2, 'Chip'], [3, 'Circuito']]} />}>
      <Svg h={250} label={`Breadboard: ${label}`}>
        <rect x="30" y="20" width="294" height="224" rx="6" fill="#E8E6DF" />
        <rect x="30" y="134" width="294" height="10" fill="#CFCCC2" />
        <path d="M40 28 H316" stroke="#D0473F" stroke-width="1.4" /><path d="M40 56 H316" stroke="#3E6FB0" stroke-width="1.4" />
        <Lbl x={36} y={39} c="#D0473F" s={10} a="end">+</Lbl><Lbl x={36} y={51} c="#3E6FB0" s={10} a="end">−</Lbl>
        {s === 0 && <g><rect x={cx(4) - 6} y="71" width="12" height="62" rx="3" fill={hl} /><rect x={cx(8) - 6} y="143" width="12" height="62" rx="3" fill={hl} /></g>}
        {s === 1 && <g><rect x="40" y="31" width="276" height="10" rx="3" fill="rgba(240,120,110,.35)" /><rect x="40" y="43" width="276" height="10" rx="3" fill="rgba(120,160,240,.35)" /></g>}
        {s === 2 && [4, 5, 6, 7].map(i => <g key={i}><rect x={cx(i) - 6} y="71" width="12" height="62" rx="3" fill={hl} /><rect x={cx(i) - 6} y="143" width="12" height="62" rx="3" fill="rgba(140,190,255,.35)" /></g>)}
        {s === 3 && <g><rect x="40" y="31" width="276" height="10" rx="3" fill="rgba(240,120,110,.3)" /><rect x="40" y="43" width="276" height="10" rx="3" fill="rgba(120,160,240,.3)" />
          {[1, 5, 8].map(i => <rect key={i} x={cx(i) - 6} y="71" width="12" height="62" rx="3" fill={hl} />)}</g>}
        {[36, 48].map(y => Array.from({ length: COLS }).map((_, i) => <rect key={y + '-' + i} x={cx(i) - 2.5} y={y - 2.5} width="5" height="5" fill="#55524A" />))}
        {[...ROWS_T, ...ROWS_B].map(y => Array.from({ length: COLS }).map((_, i) => <rect key={y + '_' + i} x={cx(i) - 2.5} y={y - 2.5} width="5" height="5" fill="#55524A" />))}
        {s === 2 && <g>
          <rect x={cx(4) - 8} y="122" width={cx(7) - cx(4) + 16} height="32" rx="2" fill="#22252D" />
          <Lbl x={(cx(4) + cx(7)) / 2} y={142} c={K.ink} s={9}>chip</Lbl>
          {[4, 5, 6, 7].map(i => <g key={i}><rect x={cx(i) - 2} y="122" width="4" height="6" fill={MET} /><rect x={cx(i) - 2} y="148" width="4" height="6" fill={MET} /></g>)}
        </g>}
        {s === 3 && <g>
          <path d={`M${cx(1)} 36 V78`} stroke="#D0473F" stroke-width="3" />
          <path d={`M${cx(1)} 102 ` + zig(cx(1) + 10, 102, cx(5) - cx(1) - 20).replace('M', 'L') + ` H${cx(5)}`} fill="none" stroke="#5A4630" stroke-width="2" />
          <path d={`M${cx(5)} 90 H${cx(6) - 8} M${cx(6) + 8} 90 H${cx(8)}`} stroke="#8C8A80" stroke-width="2" />
          <path d={`M${cx(6) - 8} 82 L${cx(6) + 6} 90 L${cx(6) - 8} 98 Z M${cx(6) + 6} 82 V98`} fill="#F28C6B" stroke="#8A3A2A" stroke-width="1.4" />
          <circle cx={cx(6)} cy="90" r="14" fill={K.light} opacity=".25" class="k-blink" style={{ '--dur': '1.6s' }} />
          <path d={`M${cx(8)} 78 V48`} stroke="#22252D" stroke-width="3" />
          <Flow d={`M${cx(1)} 36 V102 H${cx(5)} V90 H${cx(8)} V48`} dur={1} w={2} />
        </g>}
      </Svg>
    </Fig>
  )
}

/* Guaina termorestringente */
export function Termorestringente ({ mode }) {
  const [s, setS] = useAuto(mode, [0, 1, 2], 2000)
  const shrunk = 'M96 71 H140 C148 71 148 67 156 67 H180 C188 67 188 71 196 71 H240 V89 H196 C188 89 188 93 180 93 H156 C148 93 148 89 140 89 H96 Z'
  const label = ['larga, infilata', 'il calore la restringe', 'stretta sulla giunta'][s]
  return (
    <Fig caption="schema semplificato · la guaina è stata prodotta stretta e poi allargata da calda: scaldandola di nuovo (circa 90–120 °C) torna alla forma stretta, fino alla metà del diametro in una guaina 2:1"
      readout={<Readout items={[['fase', label, s ? K.cur : null], ['diametro', s ? 'circa ½' : 'pieno']]} />}
      controls={mode === 'play' && <Seg label="Fase" value={s} set={setS} options={[[0, 'Infilata'], [1, 'Calore'], [2, 'Ristretta']]} />}>
      <Svg h={180} label={`Guaina termorestringente: ${label}`}>
        <rect x="6" y="74" width="122" height="12" rx="3" fill="#D0473F" />
        <rect x="208" y="74" width="122" height="12" rx="3" fill="#D0473F" />
        <rect x="124" y="76" width="88" height="8" fill={CU} />
        <ellipse cx="168" cy="80" rx="22" ry="9" fill="#9FA6B2" />
        <Lbl x={168} y={40} s={9}>giunta saldata</Lbl>
        <path d="M168 44 V60" stroke={K.text} stroke-width="0.8" />
        <g class="ts-fade" style={{ opacity: s ? 0 : 1 }}>
          <rect x="96" y="54" width="144" height="52" rx="6" fill="rgba(62,111,176,.45)" stroke="#6F9AD8" />
        </g>
        <g class="ts-fade" style={{ opacity: s ? 1 : 0 }}>
          <path d={shrunk} fill="rgba(62,111,176,.85)" stroke="#6F9AD8" />
        </g>
        {s === 1 && <g class="ts-heat">
          {[120, 150, 186, 216].map(x => <path key={x} d={`M${x} 160 q5 -6 0 -12 q-5 -6 0 -12 q5 -6 0 -12`} fill="none" stroke={K.heat} stroke-width="1.8" />)}
          <Lbl x={168} y={176} s={9} c={K.heat}>aria calda</Lbl>
        </g>}
        <Lbl x={290} y={60} s={9}>guaina</Lbl>
        <path d="M268 62 L242 70" stroke={K.text} stroke-width="0.8" />
      </Svg>
    </Fig>
  )
}
