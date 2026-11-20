// Schemi dei sensori ambientali. Regole: skill "invenio-schemi".
import { K, Svg, Lbl, Wire, Flow, Arrow, Fig, Seg, Slider, Readout, useAuto } from './kit'
import './ambiente.css'

const OX = '#E06C6C'   // ossigeno
const E = '#6FD3C1'    // campo elettrico
// posizioni pseudo-casuali ma sempre uguali (niente salti tra un disegno e l'altro)
const rnd = (i, s = 1) => { const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x) }
const vzig = (x, y, len) => { let d = `M${x} ${y}`; const n = 6, st = len / n; for (let i = 0; i < n; i++) d += ` L${x - 6} ${y + st * i + st / 4} L${x + 6} ${y + st * i + 3 * st / 4}`; return d + ` L${x} ${y + len}` }

/* Sensore di gas a ossido metallico (MOX) */
export function GasMox ({ mode }) {
  const [l, setL] = useAuto(mode, [0, 1, 2], 2200)
  const nO = [6, 3, 1][l], nGas = [0, 3, 5][l], nE = [2, 6, 10][l]
  const ox = [34, 58, 82, 106, 130, 154]
  return (
    <Fig caption="schema semplificato e molto ingrandito · in aria pulita l'ossigeno (O⁻) si posa sull'ossido caldo e trattiene elettroni; il gas lo consuma e libera elettroni (blu): la resistenza del sensore scende e la tensione sulla resistenza di carico sale"
      readout={<Readout items={[['resistenza sensore', ['alta', 'media', 'bassa'][l]], ['tensione in uscita', ['bassa', 'media', 'alta'][l], K.cur]]} />}
      controls={mode === 'play' && <Seg label="Aria" value={l} set={setL} options={[[0, 'Pulita'], [1, 'Poco gas'], [2, 'Molto gas']]} />}>
      <Svg h={200} label={`Sensore di gas: con ${['aria pulita', 'poco gas', 'molto gas'][l]} la resistenza è ${['alta', 'media', 'bassa'][l]}`}>
        <rect x="18" y="104" width="160" height="50" rx="4" fill="#3A3A30" stroke="#6B6B55" />
        <Lbl x={98} y={134} s={9} c={K.ink}>ossido di stagno (SnO₂)</Lbl>
        <path d="M24 170 q8 -6 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0" fill="none" stroke={K.heat} stroke-width="2" />
        <Lbl x={100} y={190} s={9} c={K.heat}>riscaldatore: centinaia di °C</Lbl>
        {ox.slice(0, nO).map((x, i) => <g key={'o' + i}>
          <circle cx={x} cy={98} r="6" fill={OX} /><Lbl x={x} y={101} s={8} c="#0B0D12">O</Lbl>
          <Lbl x={x + 8} y={92} s={9} c={K.minus}>−</Lbl>
        </g>)}
        {Array.from({ length: nGas }).map((_, i) => <g key={'g' + i} class="mox-gas" style={{ animationDelay: (i * 0.3) + 's' }}>
          <circle cx={30 + rnd(i, 3) * 140} cy={34 + rnd(i, 4) * 40} r="7" fill="#8C96AA" />
          <Lbl x={30 + rnd(i, 3) * 140} y={37 + rnd(i, 4) * 40} s={7} c="#0B0D12">gas</Lbl>
        </g>)}
        {Array.from({ length: nE }).map((_, i) => <circle key={'e' + i} class="k-blink" style={{ '--dur': (1 + rnd(i, 5)) + 's' }} cx={28 + rnd(i, 6) * 140} cy={112 + rnd(i, 7) * 10} r="3" fill={K.el} />)}
        <Lbl x={98} y={20} s={9}>{l ? 'il gas reagisce con l\'ossigeno' : 'aria pulita'}</Lbl>
        <Wire d="M262 30 V48 M262 88 V96 M262 96 V104 M262 152 V176" />
        <Lbl x={262} y={24} s={9} c={K.plus}>5 V</Lbl>
        <rect x="248" y="48" width="28" height="40" rx="4" fill="#3A3A30" stroke="#6B6B55" /><Lbl x={238} y={72} s={9} a="end">sensore</Lbl>
        <path d={vzig(262, 104, 48)} fill="none" stroke={K.ink} stroke-width="1.6" /><Lbl x={250} y={132} s={9} a="end">carico</Lbl>
        <path d="M252 176 H272 M256 181 H268 M260 186 H264" stroke={K.ink} stroke-width="1.4" />
        <Wire d="M262 96 H300" /><circle cx="262" cy="96" r="2.5" fill={K.ink} />
        <rect x="302" y="56" width="16" height="80" rx="3" fill="none" stroke={K.part} />
        <rect class="k-ease" x="304" y={134 - [16, 42, 70][l]} width="12" height={[16, 42, 70][l]} rx="2" fill={K.cur} />
        <Lbl x={310} y={150} s={8}>uscita</Lbl>
        <Flow d="M262 30 V176" dur={[2.6, 1.3, 0.6][l]} w={2.2} />
      </Svg>
    </Fig>
  )
}

/* Sensore di CO2 a infrarossi (NDIR) */
const LEV = [420, 1000, 2000, 5000]
export function Co2Ndir ({ mode }) {
  const [p, setP] = useAuto(mode, LEV, 2000)
  const i = LEV.indexOf(p)
  const n = [3, 7, 13, 24][i]
  const t = [0.9, 0.78, 0.62, 0.4][i]          // luce residua: andamento indicativo
  const id = 'ndir-g'
  return (
    <Fig caption="schema semplificato · quantità di molecole e calo della luce esagerati e solo indicativi · la CO₂ assorbe la luce infrarossa a 4,26 µm: più CO₂ nella camera, meno luce di quella lunghezza d'onda passa il filtro e arriva al rilevatore"
      readout={<Readout items={[['CO₂', p + ' ppm'], ['luce al rilevatore', ['molta', 'un po\' meno', 'meno', 'molta meno'][i], K.light]]} />}
      controls={mode === 'play' && <Seg label="CO₂" value={p} set={setP} options={LEV.map(v => [v, v + ''])} />}>
      <Svg h={190} label={`Sensore NDIR con ${p} ppm di CO₂: arriva ${['molta', 'un po\' meno', 'meno', 'molta meno'][i]} luce al rilevatore`}>
        <defs><linearGradient id={id} gradientUnits="userSpaceOnUse" x1="44" y1="0" x2="276" y2="0"><stop offset="0" stop-color={K.light} stop-opacity="0.95" /><stop offset="1" stop-color={K.light} stop-opacity={t} /></linearGradient></defs>
        <rect x="38" y="56" width="248" height="68" rx="8" fill={K.body} stroke={K.part} />
        <path d="M80 56 H240" stroke={K.text} stroke-dasharray="3 5" stroke-width="2" />
        <Lbl x={160} y={46} s={9}>l'aria entra da una retina</Lbl>
        <circle cx="28" cy="90" r="12" fill="#3A2416" stroke={K.light} /><circle cx="28" cy="90" r="18" fill={K.light} opacity=".15" />
        <Lbl x={28} y={128} s={8}>lampada IR</Lbl>
        {[74, 90, 106].map(y => <path key={y} class="k-flow" d={`M44 ${y} H276`} stroke={`url(#${id})`} stroke-width="2.4" fill="none" style={{ '--dur': '1.2s' }} />)}
        {Array.from({ length: n }).map((_, k) => {
          const x = 60 + rnd(k, 1) * 200, y = 66 + rnd(k, 2) * 48, a = rnd(k, 3) * 180
          return <g key={k} class="co2-mol" style={{ animationDelay: (rnd(k, 4) * 2) + 's' }} transform={`rotate(${a.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`}>
            <circle cx={x - 6} cy={y} r="2.6" fill={OX} /><circle cx={x} cy={y} r="3" fill="#5A6378" /><circle cx={x + 6} cy={y} r="2.6" fill={OX} />
          </g>
        })}
        <rect x="276" y="64" width="6" height="52" fill="#7A5A9A" /><Lbl x={279} y={140} s={8}>filtro</Lbl><Lbl x={279} y={150} s={8}>4,26 µm</Lbl>
        <rect x="288" y="74" width="20" height="32" rx="3" fill="#22252D" stroke={K.ink} />
        <Lbl x={332} y={50} s={8} a="end">rilevatore</Lbl>
        <rect x="314" y="110" width="14" height="70" rx="3" fill="none" stroke={K.part} />
        <rect class="k-ease" x="316" y={178 - 66 * t} width="10" height={66 * t} rx="2" fill={K.light} />
        <Lbl x={300} y={178} s={8} a="end">segnale</Lbl>
        <Lbl x={120} y={170} s={9}>O=C=O · {p} ppm</Lbl>
      </Svg>
    </Fig>
  )
}

/* Sensore barometrico MEMS piezoresistivo */
const press = (h) => 1013.25 * Math.pow(1 - 2.25577e-5 * h, 5.25588)
export function Barometro ({ mode }) {
  const [h, setH] = useAuto(mode, [0, 1000, 2000, 3000], 2000)
  const p = press(h)
  const def = 24 * p / 1013.25                 // flessione proporzionale alla pressione (esagerata)
  const yAt = (x) => { const t = (x - 106) / 124; return 100 + 4 * def * t * (1 - t) }
  const L = 34 * p / 1013.25
  return (
    <Fig caption="sezione del chip, flessione molto esagerata · sotto la membrana c'è il vuoto: l'aria la spinge verso il basso. Più in alto la pressione è minore e la membrana si piega meno; le resistenze sulla membrana (arancio) cambiano valore con la flessione. Pressione calcolata con l'atmosfera standard"
      readout={<Readout items={[['quota', h.toLocaleString('it-IT') + ' m'], ['pressione', Math.round(p).toLocaleString('it-IT') + ' hPa', K.cur]]} />}
      controls={mode === 'play' && <Slider id="baro-h" label="Quota" min={0} max={3000} step={100} value={h} set={setH} show={h.toLocaleString('it-IT') + ' m'} />}>
      <Svg h={190} label={`A ${h} metri la pressione è circa ${Math.round(p)} hPa e la membrana si piega di conseguenza`}>
        <rect x="70" y="100" width="196" height="64" fill="#5A6378" />
        <rect x="110" y="100" width="116" height="44" fill="#0B0D12" />
        <Lbl x={168} y={136} s={9}>vuoto</Lbl>
        <path d={`M106 100 Q168 ${100 + 2 * def} 230 100`} fill="none" stroke="#C9D2E0" stroke-width="4" />
        {[118, 150, 186, 218].map(x => <rect key={x} x={x - 5} y={yAt(x) - 4} width="10" height="4" fill={K.heat} />)}
        {[124, 146, 168, 190, 212].map(x => <Arrow key={x} x1={x} y1={yAt(x) - 8 - L} x2={x} y2={yAt(x) - 7} head={5} />)}
        <Lbl x={168} y={28} s={9}>pressione dell'aria</Lbl>
        <Lbl x={70} y={180} s={9} a="start">silicio</Lbl>
        <Lbl x={290} y={104} s={9}>membrana</Lbl>
        <path d="M266 104 L236 102" stroke={K.text} stroke-width="0.8" />
      </Svg>
    </Fig>
  )
}

/* Sensore di colore */
const OBJ = { r: ['Rosso', '#D04040', [1, 0.1, 0.1]], g: ['Verde', '#3FA34D', [0.1, 1, 0.15]], b: ['Blu', '#3E6FD0', [0.1, 0.15, 1]], y: ['Giallo', '#E3C33A', [1, 0.95, 0.1]], w: ['Bianco', '#E8E8E8', [1, 1, 1]] }
export function SensoreColore ({ mode }) {
  const [o, setO] = useAuto(mode, ['r', 'g', 'b', 'y', 'w'], 1800)
  const [name, fill, rf] = OBJ[o]
  const refl = `rgb(${rf.map(v => Math.round(60 + 195 * v)).join(',')})`
  const bars = [['R', '#E05050'], ['G', '#4FBF5F'], ['B', '#5080E8']]
  return (
    <Fig caption="schema semplificato, riflessioni idealizzate · la luce bianca del LED contiene tutti i colori; l'oggetto ne rimanda solo alcuni e ogni gruppo di fotodiodi, dietro il suo filtro, misura il suo"
      readout={<Readout items={[['oggetto', name], ['canali più forti', bars.filter((_, i) => rf[i] > 0.5).map(b => b[0]).join(' + ') || '—', K.light]]} />}
      controls={mode === 'play' && <Seg label="Colore dell'oggetto" value={o} set={setO} options={Object.entries(OBJ).map(([k, v]) => [k, v[0]])} />}>
      <Svg h={200} label={`Sensore di colore davanti a un oggetto ${name.toLowerCase()}`}>
        <rect x="40" y="20" width="200" height="34" rx="4" fill="#1F4D3A" />
        <circle cx="80" cy="56" r="9" fill="#F4F4F4" /><Lbl x={80} y={14} s={9}>LED bianco</Lbl>
        <rect x="178" y="44" width="28" height="28" fill="#22252D" stroke={K.ink} />
        {[['#E05050', 180, 46], ['#4FBF5F', 193, 46], ['#5080E8', 180, 59], ['#C9CED8', 193, 59]].map(([c, x, y]) => <rect key={x + '' + y} x={x} y={y} width="11" height="11" fill={c} opacity=".85" />)}
        <Lbl x={192} y={14} s={9}>chip con filtri</Lbl>
        <rect class="k-ease" x="60" y="156" width="170" height="26" rx="3" fill={fill} />
        <Lbl x={145} y={196} s={9}>oggetto</Lbl>
        <path class="k-flow" d="M84 66 L132 154" stroke="#F4F4F4" stroke-width="2.4" fill="none" style={{ '--dur': '1s' }} />
        <path class="k-flow" d="M150 154 L186 76" stroke={refl} stroke-width="2.4" fill="none" style={{ '--dur': '1s' }} />
        {bars.map(([b, c], i) => <g key={b}>
          <rect x={262 + i * 22} y="60" width="14" height="96" rx="3" fill="none" stroke={K.part} />
          <rect class="k-ease" x={264 + i * 22} y={154 - 92 * rf[i]} width="10" height={92 * rf[i]} rx="2" fill={c} />
          <Lbl x={269 + i * 22} y={172} s={9} c={c}>{b}</Lbl>
        </g>)}
        <Lbl x={291} y={50} s={8}>segnale</Lbl>
      </Svg>
    </Fig>
  )
}

/* Sensore capacitivo di umidità del terreno */
export function UmiditaTerreno ({ mode }) {
  const [l, setL] = useAuto(mode, [0, 1, 2], 2000)
  const drops = [0, 9, 20][l], q = [2, 4, 7][l]
  return (
    <Fig caption="sezione della forcella, schema semplificato · a parità di tensione, con l'acqua tra le piste si accumula più carica (+ e −): la capacità aumenta. Le piste sono coperte di vernice e non toccano la terra"
      readout={<Readout items={[['terreno', ['secco', 'umido', 'bagnato'][l]], ['capacità', ['bassa', 'media', 'alta'][l], K.cold]]} />}
      controls={mode === 'play' && <Seg label="Terreno" value={l} set={setL} options={[[0, 'Secco'], [1, 'Umido'], [2, 'Bagnato']]} />}>
      <Svg h={190} label={`Terreno ${['secco', 'umido', 'bagnato'][l]}: capacità ${['bassa', 'media', 'alta'][l]}`}>
        <rect x="20" y="30" width="296" height="146" rx="6" fill="#3B2E22" />
        {Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={26 + rnd(i, 8) * 284} cy={36 + rnd(i, 9) * 134} r={1.5 + rnd(i, 10) * 2} fill="#5A4632" />)}
        {Array.from({ length: drops }).map((_, i) => <path key={'d' + i} class="k-ease" d={`M${30 + rnd(i, 11) * 276} ${40 + rnd(i, 12) * 124} q4 6 0 9 q-4 -3 0 -9`} fill={K.cold} />)}
        {[50, 70, 90, 110, 130, 150].map(y => <path key={y} d={`M140 ${y} C158 ${y - 6} 178 ${y - 6} 196 ${y}`} fill="none" stroke={E} stroke-width="1.1" stroke-dasharray="3 3" />)}
        <rect x="120" y="36" width="18" height="132" rx="3" fill={'#C98A4B'} stroke="#2E7D5B" stroke-width="3" />
        <rect x="198" y="36" width="18" height="132" rx="3" fill={'#C98A4B'} stroke="#2E7D5B" stroke-width="3" />
        {Array.from({ length: q }).map((_, i) => { const y = 48 + i * (112 / Math.max(q - 1, 1)); return <g key={i}><Lbl x={129} y={y + 4} c={K.plus} s={11}>+</Lbl><Lbl x={207} y={y + 4} c={K.minus} s={11}>−</Lbl></g> })}
        <Lbl x={129} y={22} s={9}>pista</Lbl><Lbl x={207} y={22} s={9}>pista</Lbl>
        <Lbl x={70} y={186} s={9}>terra</Lbl><Lbl x={258} y={186} s={9} c="#2E9D6B">vernice isolante</Lbl>
      </Svg>
    </Fig>
  )
}

/* Sensore di polveri a diffusione laser */
export function PolveriPm () {
  const ps = [[2.2, 0], [4, 1], [6, 2]]   // raggio della particella, ritardo in secondi
  return (
    <Fig caption="schema semplificato e rallentato · la ventola fa passare l'aria nel raggio laser; ogni particella devia un lampo di luce verso il fotodiodo, che senza polvere resta al buio. Più la particella è grande, più alto è l'impulso">
      <Svg h={200} label="La ventola aspira l'aria; ogni particella che attraversa il raggio laser devia luce verso il fotodiodo e genera un impulso">
        <rect x="20" y="30" width="296" height="106" rx="8" fill={K.body} stroke={K.part} />
        <g class="k-spin" style={{ '--dur': '0.8s', transformOrigin: '52px 84px' }}>
          {[0, 120, 240].map(a => <ellipse key={a} cx="52" cy="72" rx="5" ry="12" fill="#5A6378" transform={`rotate(${a} 52 84)`} />)}
        </g>
        <circle cx="52" cy="84" r="4" fill={K.ink} />
        <Lbl x={52} y={124} s={8}>ventola</Lbl>
        <Arrow x1={96} y1={118} x2={128} y2={118} c={K.text} w={1.4} head={5} />
        <Lbl x={112} y={132} s={8}>aria</Lbl>
        <rect x="178" y="14" width="24" height="16" rx="3" fill="#3A2416" stroke={K.light} />
        <Lbl x={214} y={24} s={8} a="start">laser</Lbl>
        <path d="M190 30 V136" stroke={K.light} stroke-width="3" opacity=".8" />
        <g transform="rotate(-30 278 104)"><rect x="266" y="98" width="24" height="12" rx="2" fill="#22252D" stroke={K.ink} /></g>
        <Lbl x={272} y={130} s={8}>fotodiodo</Lbl>
        {ps.map(([r, d], i) => <g key={i}>
          <circle class="pm-move" style={{ animationDelay: d + 's' }} cx="80" cy="84" r={r} fill="#C9CED8" />
          <path class="pm-flash" style={{ animationDelay: d + 's' }} d="M192 86 L268 106" stroke={K.light2} stroke-width={r * 0.9} stroke-linecap="round" />
          <rect class="pm-flash" style={{ animationDelay: d + 's' }} x={110 + i * 70} y={190 - r * 6} width="8" height={r * 6} rx="1" fill={K.light2} />
        </g>)}
        <path d="M80 190 H300" stroke={K.part} />
        <Lbl x={20} y={170} s={8} a="start">segnale</Lbl><Lbl x={20} y={180} s={8} a="start">fotodiodo</Lbl>
      </Svg>
    </Fig>
  )
}
