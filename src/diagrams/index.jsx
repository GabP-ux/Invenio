import { useState, useEffect } from 'preact/hooks'
import './diagrams.css'

const T = { fontFamily: 'JetBrains Mono, monospace' }

/* ---------- LiDAR: schema animato (feed) ---------- */
export function LidarAnim () {
  return (
    <svg viewBox="0 0 336 150" role="img" aria-label="Il laser emette un impulso verso un oggetto; la luce riflessa torna al sensore, che misura il tempo trascorso">
      <rect x="12" y="34" width="48" height="30" rx="6" fill="#1A1F2A" stroke="#F0B44C" stroke-width="1.4" />
      <text x="36" y="53" fill="#ECEEF3" style={T} font-size="10" text-anchor="middle">laser</text>
      <rect class="lDet" x="12" y="86" width="48" height="30" rx="6" fill="#1A1F2A" stroke="#8FA8FF" stroke-width="1.4" />
      <text x="36" y="105" fill="#ECEEF3" style={T} font-size="10" text-anchor="middle">sensore</text>
      <path d="M60 49 H262" stroke="#F0B44C" stroke-opacity=".28" stroke-width="1.4" stroke-dasharray="3 5" />
      <path d="M255 44 L263 49 L255 54" fill="none" stroke="#F0B44C" stroke-width="1.6" stroke-linejoin="round" />
      <path d="M264 101 H62" stroke="#8FA8FF" stroke-opacity=".28" stroke-width="1.4" stroke-dasharray="3 5" />
      <path d="M69 96 L61 101 L69 106" fill="none" stroke="#8FA8FF" stroke-width="1.6" stroke-linejoin="round" />
      <line class="lOut" x1="60" y1="49" x2="78" y2="49" stroke="#FFD27A" stroke-width="3.5" stroke-linecap="round" />
      <line class="lBack" x1="246" y1="101" x2="262" y2="101" stroke="#B8C8FF" stroke-width="3.5" stroke-linecap="round" />
      <rect x="266" y="22" width="54" height="104" rx="8" fill="#20242D" stroke="#3A4050" />
      <g class="lHit" fill="none" stroke="#FFD27A" stroke-width="1.4"><path d="M262 40 a10 10 0 0 0 0 18" /><path d="M256 36 a16 16 0 0 0 0 26" /></g>
      <text x="293" y="140" fill="#A0A7B4" style={T} font-size="10" text-anchor="middle">oggetto</text>
      <text x="162" y="40" fill="#F0B44C" style={T} font-size="10" text-anchor="middle">impulso in uscita</text>
      <text x="162" y="120" fill="#8FA8FF" style={T} font-size="10" text-anchor="middle">luce riflessa</text>
    </svg>
  )
}

/* ---------- LiDAR: simulatore (scheda) ---------- */
export function LidarSim () {
  const [d, setD] = useState(15)
  const objX = Math.round(80 + (d - 2) / 28 * 200)
  const t = Math.round(2 * d / 0.299792458)
  const dur = (d * 0.12).toFixed(2) + 's' // velocità costante: rallentato ~18 milioni di volte
  const out = `M62 45 H${objX}`; const back = `M${objX} 95 H62`
  return (
    <div class="card" style="padding:14px;display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="kicker">Prova tu</span><span class="mono muted" style="font-size:10px">rallentato ~18 milioni di volte</span>
      </div>
      <svg viewBox="0 0 322 140" role="img" aria-label={`Oggetto a ${d} metri: la luce torna dopo ${t} nanosecondi`} style="width:100%;height:auto">
        <rect x="8" y="30" width="54" height="30" rx="6" fill="#1A1F2A" stroke="#F0B44C" stroke-width="1.4" />
        <text x="35" y="49" fill="#ECEEF3" style={T} font-size="10" text-anchor="middle">laser</text>
        <rect class="pDet" style={{ animationDuration: dur }} x="8" y="80" width="54" height="30" rx="6" fill="#1A1F2A" stroke="#8FA8FF" stroke-width="1.4" />
        <text x="35" y="99" fill="#ECEEF3" style={T} font-size="10" text-anchor="middle">sensore</text>
        <path d={out} stroke="#F0B44C" stroke-opacity=".28" stroke-width="1.4" stroke-dasharray="3 5" fill="none" />
        <path d={`M${objX - 8} 40 L${objX} 45 L${objX - 8} 50`} fill="none" stroke="#F0B44C" stroke-width="1.6" stroke-linejoin="round" />
        <path d={back} stroke="#8FA8FF" stroke-opacity=".28" stroke-width="1.4" stroke-dasharray="3 5" fill="none" />
        <path d="M70 90 L62 95 L70 100" fill="none" stroke="#8FA8FF" stroke-width="1.6" stroke-linejoin="round" />
        <path key={'o' + d} class="pOut" style={{ animationDuration: dur }} d={out} pathLength="100" stroke="#FFD27A" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="6 200" fill="none" />
        <path key={'b' + d} class="pBack" style={{ animationDuration: dur }} d={back} pathLength="100" stroke="#B8C8FF" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="6 200" fill="none" />
        <rect x={objX} y="18" width="34" height="104" rx="7" fill="#20242D" stroke="#3A4050" />
        <path d={`M62 132 H${objX} M62 128 V136 M${objX} 128 V136`} stroke="#5A6378" stroke-width="1" />
      </svg>
      <div class="sim-read"><div><small>distanza</small><b>{d} m</b></div><div><small>tempo di ritorno</small><b style="color:#8FA8FF">{t} ns</b></div></div>
      <label for="dist" style="font-size:12px;color:#C9CED8">Sposta l'oggetto</label>
      <input id="dist" type="range" min="2" max="30" step="1" value={d} onInput={e => setD(+e.currentTarget.value)} />
    </div>
  )
}

/* ---------- PIR ---------- */
export function PirAnim () {
  return (
    <svg viewBox="0 0 336 176" role="img" aria-label="Una persona attraversa due zone di rilevamento: nella zona A il segnale d'uscita ha un impulso positivo, nella zona B un impulso negativo">
      <polygon class="pZoneA" points="168,22 82,84 152,84" fill="#F28C6B" fill-opacity=".06" stroke="#F28C6B" stroke-opacity=".5" />
      <polygon class="pZoneB" points="168,22 184,84 254,84" fill="#8FA8FF" fill-opacity=".06" stroke="#8FA8FF" stroke-opacity=".5" />
      <rect x="152" y="6" width="32" height="16" rx="4" fill="#1A1F2A" stroke="#ECEEF3" stroke-width="1.2" />
      <text x="168" y="17.5" fill="#ECEEF3" style={T} font-size="9" text-anchor="middle">PIR</text>
      <text x="117" y="98" fill="#F28C6B" style={T} font-size="10" text-anchor="middle">zona A</text>
      <text x="219" y="98" fill="#8FA8FF" style={T} font-size="10" text-anchor="middle">zona B</text>
      <path d="M8 84 H328" stroke="#3A4050" stroke-dasharray="2 4" />
      <path d="M8 140 H328" stroke="#2A2F3A" />
      <path d="M12 140 H82 C97 140 97 114 117 114 C137 114 137 140 152 140 H184 C199 140 199 166 219 166 C239 166 239 140 254 140 H328" fill="none" stroke="#ECEEF3" stroke-width="1.8" />
      <text x="117" y="108" fill="#F28C6B" style={T} font-size="11" text-anchor="middle">+</text>
      <text x="270" y="166" fill="#8FA8FF" style={T} font-size="11">−</text>
      <text x="12" y="132" fill="#A0A7B4" style={T} font-size="9">uscita</text>
      <g class="pWalk">
        <circle cx="12" cy="84" r="15" fill="#F28C6B" fill-opacity=".18" />
        <circle cx="12" cy="84" r="7" fill="#F28C6B" />
        <line x1="12" y1="104" x2="12" y2="170" stroke="#ECEEF3" stroke-opacity=".5" stroke-dasharray="2 3" />
      </g>
    </svg>
  )
}

/* ---------- Effetto Hall (animazione + interattivo) ---------- */
function HallSvg ({ field = 'in' }) {
  const on = field !== 'off'; const isIn = field === 'in'
  const cls = !on ? 'hFlat' : isIn ? 'hUp' : 'hDown'
  const top = isIn ? '− − − − −' : '+ + + + +'; const bot = isIn ? '+ + + + +' : '− − − − −'
  const label = !on ? 'Senza campo magnetico gli elettroni passano dritti e non c\'è tensione di Hall'
    : isIn ? 'Campo entrante: gli elettroni deviano verso il bordo superiore, che diventa negativo'
      : 'Campo uscente: gli elettroni deviano verso il bordo inferiore, che diventa negativo'
  return (
    <svg viewBox="0 0 336 176" role="img" aria-label={label}>
      <rect x="70" y="45" width="196" height="80" rx="6" fill="#161B25" stroke="#3A4050" />
      <g stroke="#8C96AA" stroke-width="1.2" opacity={isIn ? 1 : 0}>
        {[95, 145, 195, 245].flatMap(x => [59, 104].map(y => <path key={x + '-' + y} d={`M${x} ${y} l6 6 M${x + 6} ${y} l-6 6`} />))}
      </g>
      <g fill="none" stroke="#8C96AA" stroke-width="1.2" opacity={field === 'out' ? 1 : 0}>
        {[98, 148, 198, 248].flatMap(x => [62, 107].map(y => <g key={x + '_' + y}><circle cx={x} cy={y} r="4" /><circle cx={x} cy={y} r="1.3" fill="#8C96AA" /></g>))}
      </g>
      <g fill="#8FA8FF">
        {[[80, ''], [90, 'd1'], [86, 'd2'], [96, 'd3']].map(([y, d]) => <circle key={field + y} class={`${cls} ${d}`} cx="252" cy={y} r="3.5" />)}
      </g>
      {on && <text x="168" y="40" fill={isIn ? '#8FA8FF' : '#F28C6B'} style={T} font-size="12" text-anchor="middle" letter-spacing="6">{top}</text>}
      {on && <text x="168" y="141" fill={isIn ? '#F28C6B' : '#8FA8FF'} style={T} font-size="12" text-anchor="middle" letter-spacing="6">{bot}</text>}
      <path d="M296 45 V125" stroke={on ? '#ECEEF3' : '#5A6378'} stroke-width="1.2" />
      <path d="M292 51 L296 45 L300 51 M292 119 L296 125 L300 119" fill="none" stroke={on ? '#ECEEF3' : '#5A6378'} stroke-width="1.2" />
      <text x="303" y="84" fill="#ECEEF3" style={T} font-size="9">V</text><text x="309" y="87" fill="#ECEEF3" style={T} font-size="6">H</text>
      <text x="303" y="97" fill={on ? '#ECEEF3' : '#A0A7B4'} style={T} font-size="8">{on ? '≠ 0' : '= 0'}</text>
      <path d="M70 85 H52 V160 H158 M178 160 H284 V85 H266" fill="none" stroke="#ECEEF3" stroke-width="1.4" />
      <path d="M158 150 V170" stroke="#ECEEF3" stroke-width="2" /><path d="M168 154 V166" stroke="#ECEEF3" stroke-width="3.5" /><path d="M168 160 H178" stroke="#ECEEF3" stroke-width="1.4" />
      <text x="150" y="148" fill="#ECEEF3" style={T} font-size="10">+</text>
      <path d="M47 128 L52 120 L57 128" fill="none" stroke="#FFD27A" stroke-width="1.6" /><text x="36" y="122" fill="#FFD27A" style={T} font-size="11">I</text>
    </svg>
  )
}
export const HallAnim = () => <HallSvg field="in" />

export function HallSim () {
  const [f, setF] = useState('in')
  const text = {
    off: 'Senza campo gli elettroni attraversano la piastrina dritti: i bordi restano neutri e la tensione di Hall è zero.',
    in: 'Con il campo entrante gli elettroni vengono spinti verso il bordo superiore, che diventa negativo: tra i bordi nasce la tensione di Hall.',
    out: 'Invertendo il campo la spinta si inverte: gli elettroni vanno verso il bordo inferiore e la tensione cambia segno.'
  }[f]
  return (
    <div class="card" style="padding:14px;display:flex;flex-direction:column;gap:10px">
      <span class="kicker">Prova tu · campo magnetico</span>
      <div class="fig"><HallSvg field={f} /><figcaption>× campo entrante · ⊙ campo uscente · ● elettroni (verso opposto a I)</figcaption></div>
      <div class="seg" role="group" aria-label="Campo magnetico">
        {[['off', 'Spento'], ['in', 'Entrante ×'], ['out', 'Uscente ⊙']].map(([k, l]) =>
          <button key={k} aria-pressed={f === k} onClick={() => setF(k)}>{l}</button>)}
      </div>
      <p style="margin:0;font-size:14px;line-height:1.5;color:#C9CED8">{text}</p>
    </div>
  )
}

/* ---------- Umidità capacitivo ---------- */
const IN = [[40, 92], [300, 130], [120, 112], [210, 96], [70, 138], [260, 104], [160, 140], [330, 90], [230, 128]]
const AIR = [[60, 30], [180, 22], [300, 40], [110, 48], [240, 26], [30, 52], [200, 50], [330, 20], [150, 36]]
function HumiditySvg ({ rh }) {
  const n = rh / 10; const k = Math.max(1, Math.round(n * 0.6) + 2)
  return (
    <svg viewBox="0 0 470 200" role="img" aria-label={`Umidità ${rh}%: il vapore entra nel polimero tra gli elettrodi e la capacità cresce`}>
      <text x="20" y="12" fill="#A0A7B4" style={T} font-size="10">ARIA · vapore acqueo</text>
      {AIR.slice(0, k).map(([x, y]) => <circle key={'a' + x} class="drift" cx={x + 4} cy={y + 4} r="4" fill="#6FB8FF" opacity=".55" />)}
      {Array.from({ length: 11 }).map((_, i) => <rect key={i} x={20 + i * 30} y="70" width="22" height="8" fill="#D9B45A" />)}
      <rect x="20" y="78" width="330" height="78" fill="#B9A3FF" fill-opacity=".10" stroke="#3A4050" />
      {IN.slice(0, n).map(([x, y]) => <circle key={'i' + x} cx={x + 4} cy={y + 4} r="4" fill="#6FB8FF" />)}
      <rect x="20" y="156" width="330" height="8" fill="#D9B45A" />
      <text x="362" y="78" fill="#A0A7B4" style={T} font-size="10">elettrodo poroso</text>
      <text x="362" y="120" fill="#B9A3FF" style={T} font-size="10">polimero</text>
      <text x="362" y="164" fill="#A0A7B4" style={T} font-size="10">elettrodo</text>
      <text x="20" y="186" fill="#A0A7B4" style={T} font-size="10">CAPACITÀ (RELATIVA)</text>
      <rect x="170" y="179" width="180" height="8" rx="4" fill="#222733" />
      <rect x="170" y="179" width={180 * (0.2 + rh * 0.008)} height="8" rx="4" fill="#8FA8FF" style="transition:width .35s" />
    </svg>
  )
}
export const HumidityAnim = () => <HumiditySvg rh={60} />
export function HumiditySim () {
  const [rh, setRh] = useState(50)
  return (
    <div class="card" style="padding:14px;display:flex;flex-direction:column;gap:10px">
      <span class="kicker">Prova tu · umidità</span>
      <div class="fig"><HumiditySvg rh={rh} /><figcaption>schema semplificato</figcaption></div>
      <label for="rh" style="font-size:12px;color:#C9CED8">Umidità relativa: <span class="mono" style="color:#ECEEF3">{rh}%</span></label>
      <input id="rh" type="range" min="10" max="90" step="10" value={rh} onInput={e => setRh(+e.currentTarget.value)} />
    </div>
  )
}

/* ---------- Ultrasuoni: come il LiDAR ma con il suono (viola) ---------- */
export function UltrasoundAnim () {
  const arcs = (cls, dir) => <g class={cls} fill="none" stroke={dir > 0 ? '#B9A3FF' : '#D6C9FF'} stroke-width="1.8">
    {[0, 6, 12].map(o => <path key={o} d={dir > 0 ? `M${64 + o} 41 a9 9 0 0 1 0 16` : `M${258 - o} 93 a9 9 0 0 0 0 16`} />)}
  </g>
  return (
    <svg viewBox="0 0 336 150" role="img" aria-label="Il trasmettitore emette un impulso di ultrasuoni verso un ostacolo; l'eco torna al ricevitore, che misura il tempo trascorso">
      <circle cx="36" cy="49" r="17" fill="#1A1F2A" stroke="#B9A3FF" stroke-width="1.4" />
      <text x="36" y="80" fill="#ECEEF3" style={T} font-size="9" text-anchor="middle">trasmettitore</text>
      <circle class="lDet" cx="36" cy="101" r="17" fill="#1A1F2A" stroke="#D6C9FF" stroke-width="1.4" />
      <text x="36" y="132" fill="#ECEEF3" style={T} font-size="9" text-anchor="middle">ricevitore</text>
      <path d="M60 49 H262" stroke="#B9A3FF" stroke-opacity=".28" stroke-width="1.4" stroke-dasharray="3 5" />
      <path d="M255 44 L263 49 L255 54" fill="none" stroke="#B9A3FF" stroke-width="1.6" stroke-linejoin="round" />
      <path d="M264 101 H62" stroke="#D6C9FF" stroke-opacity=".28" stroke-width="1.4" stroke-dasharray="3 5" />
      <path d="M69 96 L61 101 L69 106" fill="none" stroke="#D6C9FF" stroke-width="1.6" stroke-linejoin="round" />
      {arcs('lOut', 1)}{arcs('lBack', -1)}
      <rect x="266" y="22" width="54" height="104" rx="8" fill="#20242D" stroke="#3A4050" />
      <text x="293" y="140" fill="#A0A7B4" style={T} font-size="10" text-anchor="middle">ostacolo</text>
      <text x="162" y="40" fill="#B9A3FF" style={T} font-size="10" text-anchor="middle">impulso di ultrasuoni</text>
      <text x="162" y="120" fill="#D6C9FF" style={T} font-size="10" text-anchor="middle">eco</text>
    </svg>
  )
}


/* ---------- Motore passo-passo ---------- */
export function StepperAnim () {
  const coil = (x, y, w, h, cls, label, lx, ly) => (
    <g>
      <rect class={'stC ' + cls} x={x} y={y} width={w} height={h} rx="4" fill="#1A1F2A" stroke="#F0B44C" stroke-width="1.3" />
      <text x={lx} y={ly} fill="#A0A7B4" style={T} font-size="10" text-anchor="middle">{label}</text>
    </g>
  )
  const rows = [['1', ''], ['2', 'stC2'], ['3', 'stC3'], ['4', 'stC4']]
  return (
    <svg viewBox="0 0 336 170" role="img" aria-label="Quattro bobine si accendono una alla volta in senso orario; il rotore scatta ogni volta verso la bobina accesa">
      <circle cx="96" cy="85" r="58" fill="none" stroke="#2A2F3A" />
      {coil(84, 14, 24, 22, '', '1', 96, 10)}
      {coil(145, 73, 22, 24, 'stC2', '2', 174, 88)}
      {coil(84, 134, 24, 22, 'stC3', '3', 96, 166)}
      {coil(25, 73, 22, 24, 'stC4', '4', 18, 88)}
      <circle cx="96" cy="85" r="30" fill="#161B25" stroke="#3A4050" />
      <g class="stRot">
        <path d="M96 85 L96 59" stroke="#8FA8FF" stroke-width="5" stroke-linecap="round" />
        <path d="M89 64 L96 54 L103 64 Z" fill="#8FA8FF" />
        <circle cx="96" cy="85" r="4" fill="#ECEEF3" />
      </g>
      <text x="262" y="16" fill="#A0A7B4" style={T} font-size="9" text-anchor="middle">impulsi alle bobine</text>
      {rows.map(([n], i) => {
        const y = 36 + i * 28; const x0 = 200 + i * 31
        return (
          <g key={n}>
            <text x="192" y={y + 4} fill="#A0A7B4" style={T} font-size="10" text-anchor="end">{n}</text>
            <path d={`M200 ${y + 6} H${x0} V${y - 6} H${x0 + 31} V${y + 6} H324`} fill="none" stroke="#F0B44C" stroke-width="1.5" />
          </g>
        )
      })}
      <line class="stHead" x1="200" y1="24" x2="200" y2="134" stroke="#ECEEF3" stroke-opacity=".6" stroke-dasharray="2 3" />
      <text x="262" y="152" fill="#A0A7B4" style={T} font-size="9" text-anchor="middle">un impulso = un passo</text>
    </svg>
  )
}

/* ---------- Solenoide ---------- */
export function SolenoidAnim () {
  return (
    <svg viewBox="0 0 336 160" role="img" aria-label="Quando passa corrente nella bobina, lo stantuffo di ferro viene tirato dentro; quando la corrente si spegne, la molla lo spinge fuori">
      <rect x="70" y="52" width="150" height="56" rx="6" fill="#161B25" stroke="#3A4050" />
      {Array.from({ length: 14 }).map((_, i) => <path key={i} d={`M${78 + i * 10} 52 l6 56`} stroke="#B98A3A" stroke-width="2" />)}
      <rect x="70" y="66" width="150" height="28" fill="#0E1117" stroke="#2A2F3A" />
      <g class="soSpring"><path d="M78 80 l6 -8 l6 16 l6 -16 l6 16 l6 -8" fill="none" stroke="#A0A7B4" stroke-width="1.4" /></g>
      <g class="soPlunger">
        <rect x="120" y="69" width="150" height="22" rx="3" fill="#5A6378" stroke="#8C96AA" />
        <text x="240" y="84" fill="#ECEEF3" style={T} font-size="9" text-anchor="middle">ferro</text>
      </g>
      <g class="soOn">
        <path d="M80 60 Q145 40 210 60" fill="none" stroke="#8FA8FF" stroke-dasharray="3 4" />
        <path d="M80 100 Q145 120 210 100" fill="none" stroke="#8FA8FF" stroke-dasharray="3 4" />
        <path class="hbFlow" d="M30 130 H70 V108 M220 108 V130 H306" fill="none" stroke="#FFD27A" stroke-width="2" />
        <text x="145" y="30" fill="#8FA8FF" style={T} font-size="10" text-anchor="middle">corrente accesa: la bobina tira</text>
        <path d="M150 140 L120 140 M126 135 L120 140 L126 145" stroke="#ECEEF3" stroke-width="1.4" fill="none" />
      </g>
      <g class="soOff">
        <path d="M30 130 H70 V108 M220 108 V130 H306" fill="none" stroke="#3A4050" stroke-width="2" />
        <text x="145" y="30" fill="#A0A7B4" style={T} font-size="10" text-anchor="middle">corrente spenta: la molla spinge fuori</text>
      </g>
      <text x="26" y="134" fill="#FFD27A" style={T} font-size="10" text-anchor="end">+</text>
      <text x="312" y="134" fill="#A0A7B4" style={T} font-size="10">−</text>
    </svg>
  )
}

/* ---------- Ponte H interattivo: il percorso della corrente ---------- */
const HB = {
  off: { closed: [], path: null, spin: null, text: 'Tutti gli interruttori aperti: nessuna corrente, il motore è fermo.' },
  avanti: { closed: ['S1', 'S4'], path: 'M70 20 V58 M70 82 V112 H140 M196 112 H266 V142 M266 166 V204', spin: 'spinCw', text: 'S1 e S4 chiusi: la corrente entra nel motore da sinistra ed esce a destra. Il motore gira in un verso.' },
  indietro: { closed: ['S2', 'S3'], path: 'M266 20 V58 M266 82 V112 H196 M140 112 H70 V142 M70 166 V204', spin: 'spinCcw', text: 'S2 e S3 chiusi: la corrente attraversa il motore da destra a sinistra. Il motore gira al contrario.' },
  corto: { closed: ['S1', 'S3'], path: 'M70 20 V58 M70 82 V142 M70 166 V204', spin: null, short: true, text: 'Errore! S1 e S3 sono sullo stesso lato: la corrente va dritta da + a − senza passare dal motore. È un cortocircuito che brucia i transistor.' }
}
function Switch ({ x, y, name, closed, label }) {
  // interruttore verticale tra y e y+24
  return (
    <g>
      <circle cx={x} cy={y} r="3" fill="#ECEEF3" /><circle cx={x} cy={y + 24} r="3" fill="#ECEEF3" />
      <path d={closed ? `M${x} ${y} L${x} ${y + 24}` : `M${x} ${y} L${x + 14} ${y + 20}`} stroke={closed ? '#ECEEF3' : '#8C96AA'} stroke-width="2.4" stroke-linecap="round" style="transition:d .2s" />
      <text x={label === 'l' ? x - 12 : x + 12} y={y + 16} fill="#A0A7B4" style={T} font-size="10" text-anchor={label === 'l' ? 'end' : 'start'}>{name}</text>
    </g>
  )
}
export function HBridgeSim ({ auto }) {
  const [m, setM] = useState('avanti')
  useEffect(() => {
    if (!auto) return
    const seq = ['avanti', 'indietro', 'off', 'corto']; let i = 0
    const t = setInterval(() => { i = (i + 1) % seq.length; setM(seq[i]) }, 2400)
    return () => clearInterval(t)
  }, [auto])
  const st = HB[m]; const on = (n) => st.closed.includes(n)
  return (
    <div class={auto ? 'vis' : 'card'} style={auto ? '' : 'padding:14px;display:flex;flex-direction:column;gap:10px'}>
      {!auto && <span class="kicker">Prova tu · dove passa la corrente</span>}
      <div class="fig">
        <svg viewBox="0 0 336 222" role="img" aria-label={st.text}>
          <path d="M40 20 H296" stroke="#F28C6B" stroke-width="2" /><text x="34" y="24" fill="#F28C6B" style={T} font-size="11" text-anchor="end">+</text>
          <path d="M40 204 H296" stroke="#8FA8FF" stroke-width="2" /><text x="34" y="208" fill="#8FA8FF" style={T} font-size="11" text-anchor="end">−</text>
          <path d="M70 20 V58 M70 82 V142 M70 166 V204 M266 20 V58 M266 82 V142 M266 166 V204 M70 112 H140 M196 112 H266" fill="none" stroke="#3A4050" stroke-width="1.6" />
          {st.path && <path class="hbFlow" d={st.path} fill="none" stroke={st.short ? '#FF5A4E' : '#FFD27A'} stroke-width="3" stroke-linecap="round" />}
          <Switch x={70} y={58} name="S1" closed={on('S1')} label="l" />
          <Switch x={70} y={142} name="S3" closed={on('S3')} label="l" />
          <Switch x={266} y={58} name="S2" closed={on('S2')} label="r" />
          <Switch x={266} y={142} name="S4" closed={on('S4')} label="r" />
          <circle cx="168" cy="112" r="28" fill="#161B25" stroke="#B9A3FF" stroke-width="1.6" />
          <text x="168" y="116" fill="#ECEEF3" style={T} font-size="12" text-anchor="middle">M</text>
          {st.spin && <g class={st.spin}><path d="M168 76 A36 36 0 0 1 204 112" fill="none" stroke="#B9A3FF" stroke-width="2" /><path d={st.spin === 'spinCw' ? 'M199 104 L204 112 L209 104' : 'M175 71 L168 76 L175 81'} fill="none" stroke="#B9A3FF" stroke-width="2" /></g>}
          {st.short && <text x="168" y="160" fill="#FF5A4E" style={T} font-size="11" text-anchor="middle">CORTOCIRCUITO</text>}
        </svg>
        <figcaption>linea gialla = percorso della corrente (dal + al −)</figcaption>
      </div>
      {!auto && <div class="seg" role="group" aria-label="Interruttori chiusi">
        {[['off', 'Spento'], ['avanti', 'S1+S4'], ['indietro', 'S2+S3'], ['corto', 'S1+S3']].map(([k, l]) =>
          <button key={k} aria-pressed={m === k} onClick={() => setM(k)}>{l}</button>)}
      </div>}
      <p style={'margin:0;font-size:14px;line-height:1.5;color:' + (st.short ? '#FF8A80' : '#C9CED8')}>{st.text}</p>
    </div>
  )
}

export const ANIM = { lidar: LidarAnim, ultrasuoni: UltrasoundAnim, stepper: StepperAnim, solenoid: SolenoidAnim, pir: PirAnim, hall: HallAnim, humidity: HumidityAnim }
export const SIM = { lidar: LidarSim, hall: HallSim, humidity: HumiditySim, hbridge: HBridgeSim }
export const CAPTION = {
  lidar: 'd = c × t ÷ 2 · animazione rallentata',
  ultrasuoni: 'd = v × t ÷ 2 · v ≈ 343 m/s nell\'aria · animazione rallentata',
  pir: 'schema semplificato: una sola coppia di zone',
  hall: '× campo magnetico entrante · ● elettroni (verso opposto a I)',
  humidity: 'schema semplificato',
  stepper: 'schema semplificato: 4 passi per giro (un motore vero ne fa di solito 200)',
  solenoid: 'schema semplificato · bobina, stantuffo di ferro e molla di ritorno'
}
