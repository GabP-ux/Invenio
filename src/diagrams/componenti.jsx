// Schemi dei componenti di base. Regole: skill "invenio-schemi".
import { useState, useEffect } from 'preact/hooks'
import { K, Svg, Lbl, Wire, Flow, Electrons, Arrow, Battery, Resistor, Lamp, Fig, Seg, Slider, Readout, useAuto } from './kit'
import './componenti.css'

/* Resistore: legge di Ohm. V fissa 9 V, scegli R: I = V / R. Velocità del tratteggio ∝ I. */
export function Resistore ({ mode }) {
  const [r, setR] = useAuto(mode, [100, 220, 470, 1000], 2200)
  const i = 9 / r * 1000 // mA
  const dur = (r / 100) * 0.45
  const loop = 'M60 70 V30 H300 V150 H60 V82'
  return (
    <Fig caption="velocità del tratteggio proporzionale alla corrente · I = V ÷ R"
      readout={<Readout items={[['tensione', '9 V'], ['resistenza', r + ' Ω'], ['corrente', i.toFixed(i < 10 ? 1 : 0) + ' mA', K.cur]]} />}
      controls={mode === 'play' && <Seg label="Resistenza" value={r} set={setR} options={[[100, '100 Ω'], [220, '220 Ω'], [470, '470 Ω'], [1000, '1 kΩ']]} />}>
      <Svg h={170} label={`Pila da 9 volt e resistenza da ${r} ohm: scorre una corrente di ${i.toFixed(1)} milliampere`}>
        <Wire d="M60 70 V30 H140 M220 30 H300 V150 H60 V82" />
        <Resistor x={140} y={30} len={80} label={`R = ${r} Ω`} />
        <Battery x={60} y={70} label="9 V" />
        <Flow d={loop} dur={dur} />
        <Electrons d={loop} dur={dur * 1.3} />
        <Arrow x1={240} y1={46} x2={280} y2={46} c={K.cur} w={1.6} head={6} /><Lbl x={260} y={62} c={K.cur}>I</Lbl>
        <Lbl x={180} y={170 - 6}>● elettroni: verso opposto a I</Lbl>
      </Svg>
    </Fig>
  )
}

/* Condensatore: carica dalla pila, scarica sulla lampadina. */
export function Condensatore ({ mode }) {
  const [s, setS] = useAuto(mode, ['carica', 'scarica'], 3600)
  const charge = s === 'carica'
  const pc = 'M50 92 V40 H168 V80'; const nc = 'M168 100 V150 H50 V102'
  const pd = 'M168 80 V40 H206 M206 40 H286 V84 M286 112 V150 H168 V100'
  return (
    <Fig caption="la corrente è forte all'inizio e cala fino a zero, mentre il condensatore si carica (o si scarica)"
      readout={<div><div class="mono muted" style="font-size:11px;margin-bottom:4px">TENSIONE SUL CONDENSATORE</div><div class="bar" style="height:8px"><div key={s} class={charge ? 'cap-up' : 'cap-down'} style="height:100%;background:#8FA8FF" /></div></div>}
      controls={mode === 'play' && <Seg label="Collega" value={s} set={setS} options={[['carica', 'Alla pila (carica)'], ['scarica', 'Alla lampadina']]} />}>
      <Svg h={170} label={charge ? 'Il condensatore collegato alla pila si carica: si accumula carica positiva su una piastra e negativa sull\'altra' : 'Il condensatore collegato alla lampadina si scarica: la corrente accende la lampadina e poi si esaurisce'}>
        <Wire d="M50 92 V40 H130 M206 40 H286 V84 M286 112 V150 H50 V102 M168 40 V80 M168 100 V150" />
        <Battery x={50} y={92} />
        <circle cx="130" cy="40" r="3" fill={K.ink} /><circle cx="206" cy="40" r="3" fill={K.ink} /><circle cx="168" cy="40" r="3" fill={K.ink} />
        <path d={charge ? 'M168 40 L130 40' : 'M168 40 L206 40'} stroke={K.ink} stroke-width="2.4" stroke-linecap="round" />
        <path d="M146 80 H190 M146 100 H190" stroke={K.ink} stroke-width="3" />
        <g key={'q' + s} class={charge ? 'cap-q-in' : 'cap-q-out'}>
          {[152, 162, 172, 182].map(x => <text key={x} x={x} y="76" fill={K.plus} style="font:11px JetBrains Mono" text-anchor="middle">+</text>)}
          {[152, 162, 172, 182].map(x => <text key={x} x={x} y="113" fill={K.minus} style="font:11px JetBrains Mono" text-anchor="middle">−</text>)}
        </g>
        <g key={'f' + s} class="cap-fade">
          {charge ? <><Flow d={pc} dur={0.7} /><Flow d={nc} dur={0.7} /></> : <Flow d={pd} dur={0.7} />}
        </g>
        <Lamp x={286} y={98} glow={0} />
        {!charge && <g key={'l' + s} class="cap-fade"><Lamp x={286} y={98} glow={1} /></g>}
        <Lbl x={214} y={94} a="start">C</Lbl>
      </Svg>
    </Fig>
  )
}

/* Induttore: la corrente cresce lentamente; all'apertura, scintilla. */
export function Induttore () {
  return (
    <Fig caption="schema semplificato · a sinistra la bobina col suo nucleo; a destra come cresce la corrente quando si chiude l'interruttore">
      <Svg h={180} label="Chiudendo l'interruttore, nella bobina la corrente cresce gradualmente mentre si forma il campo magnetico; in una semplice resistenza salirebbe subito. All'apertura, la bobina produce una scintilla">
        <Wire d="M30 92 V40 H60 M92 40 H130 M200 40 H210 V150 H30 V102" />
        <Battery x={30} y={92} />
        <circle cx="60" cy="40" r="3" fill={K.ink} /><circle cx="92" cy="40" r="3" fill={K.ink} />
        <path class="ind-sw" d="M60 40 L90 34" stroke={K.ink} stroke-width="2.4" stroke-linecap="round" style={{ transformOrigin: '60px 40px' }} />
        <g class="ind-spark"><path d="M76 24 l4 6 l-5 2 l6 7" fill="none" stroke={K.cur} stroke-width="2" /><Lbl x={76} y={18} c={K.cur} s={9}>scintilla</Lbl></g>
        <rect x="130" y="34" width="70" height="12" rx="3" fill="#3A3426" />
        {[0, 1, 2, 3, 4, 5].map(i => <path key={i} d={`M${132 + i * 11} 46 a5.5 9 0 0 1 11 0`} transform={`translate(0 -12)`} fill="none" stroke="#D9B45A" stroke-width="2" />)}
        <g class="ind-field">
          <ellipse cx="165" cy="40" rx="48" ry="20" fill="none" stroke={K.field} stroke-dasharray="3 4" />
          <ellipse cx="165" cy="40" rx="62" ry="30" fill="none" stroke={K.field} stroke-dasharray="3 4" />
        </g>
        <g class="ind-flow"><Flow d="M30 92 V40 H60 L90 40 H210 V150 H30 V102" dur={0.8} /></g>
        <Lbl x={165} y={84}>bobina</Lbl>
        <path d="M232 150 H326 M232 150 V60" stroke={K.part} />
        <Lbl x={326} y={164} a="end" s={9}>tempo</Lbl><Lbl x={236} y={56} a="start" s={9}>corrente</Lbl>
        <path d="M240 150 V70 H322" fill="none" stroke={K.text} stroke-width="1.4" stroke-dasharray="3 3" />
        <Lbl x={298} y={98} s={9}>resistenza</Lbl>
        <path class="ind-curve" d="M240 150 C250 100 268 76 322 72" pathLength="100" fill="none" stroke={K.cur} stroke-width="2.2" />
        <Lbl x={300} y={116} c={K.cur} s={9}>bobina</Lbl>
      </Svg>
    </Fig>
  )
}

/* Giunzione PN: usata da diodo e LED */
function Junction ({ forward, led }) {
  const w = forward ? 10 : 40 // zona di svuotamento
  const L = 168 - w / 2; const R = 168 + w / 2
  return (
    <g>
      <rect x="60" y="70" width="216" height="64" rx="6" fill={K.body} stroke={K.part} />
      <rect x={L} y="70" width={w} height="64" fill="#0B0D12" class="k-ease" />
      <Lbl x={100} y={64} c={K.hole}>P</Lbl><Lbl x={236} y={64} c={K.el}>N</Lbl>
      <g class={forward ? 'pn-holes' : ''}>
        {[0, 1, 2].map(r => [0, 1, 2, 3, 4].map(c => {
          const x = forward ? 72 + c * 18 : 66 + c * 14
          return <circle key={r + '-' + c} cx={x} cy={84 + r * 18} r="4" fill="none" stroke={K.hole} stroke-width="1.6" />
        }))}
      </g>
      <g class={forward ? 'pn-els' : ''}>
        {[0, 1, 2].map(r => [0, 1, 2, 3, 4].map(c => {
          const x = forward ? 192 + c * 18 : 214 + c * 14
          return <circle key={r + '-' + c} cx={x} cy={84 + r * 18} r="4" fill={K.el} />
        }))}
      </g>
      {led && forward && <g class="led-rays">{[150, 168, 186].map((x, i) => <g key={x}><path d={`M${x} 66 Q${x - 4} 56 ${x} 48 T${x} 30`} fill="none" stroke={K.light} stroke-width="2" /><path d={`M${x - 4} 34 L${x} 28 L${x + 4} 34`} fill="none" stroke={K.light} stroke-width="2" /></g>)}</g>}
    </g>
  )
}

/* Diodo: conduce in un solo verso */
export function Diodo ({ mode }) {
  const [dir, setDir] = useAuto(mode, ['diretta', 'inversa'], 3000)
  const fw = dir === 'diretta'
  return (
    <Fig caption="○ lacune · ● elettroni · in diretta si muovono verso la giunzione e si incontrano; in inversa la zona vuota si allarga e non passa corrente"
      controls={mode === 'play' && <Seg label="Collegamento della pila" value={dir} set={setDir} options={[['diretta', '+ su P (diretta)'], ['inversa', '+ su N (inversa)']]} />}>
      <Svg h={190} label={fw ? 'Polarizzazione diretta: lacune ed elettroni si muovono verso la giunzione, il diodo conduce' : 'Polarizzazione inversa: le cariche si allontanano dalla giunzione, la zona di svuotamento si allarga, nessuna corrente'}>
        <Wire d="M60 102 H30 V170 H156 M180 170 H306 V102 H276" />
        <circle cx="168" cy="170" r="12" fill={K.body} stroke={K.ink} stroke-width="1.4" />
        <Lbl x={162} y={174} c={fw ? K.plus : K.minus} s={11}>{fw ? '+' : '−'}</Lbl><Lbl x={175} y={174} c={fw ? K.minus : K.plus} s={11}>{fw ? '−' : '+'}</Lbl>
        <Lbl x={168} y={188} s={9}>pila</Lbl>
        <Junction forward={fw} />
        {fw && <Flow d="M156 170 H30 V102 H60 M276 102 H306 V170 H180" dur={0.9} />}
        <Lbl x={168} y={24} c={fw ? K.cur : K.text} s={11}>{fw ? 'conduce: passa corrente' : 'non conduce: corrente ≈ 0'}</Lbl>
        <g transform="translate(150 40)"><path d="M0 0 L22 10 L0 20 Z M22 0 V20" fill="none" stroke={K.ink} stroke-width="1.6" /><path d="M-14 10 H0 M22 10 H36" stroke={K.ink} stroke-width="1.6" /></g>
        <Lbl x={120} y={54} s={9}>anodo</Lbl><Lbl x={216} y={54} s={9}>catodo</Lbl>
      </Svg>
    </Fig>
  )
}

/* LED */
export function Led () {
  return (
    <Fig caption="schema semplificato · quando un elettrone incontra una lacuna nella giunzione libera un fotone: il colore dipende dal semiconduttore">
      <Svg h={190} label="In un LED alimentato in diretta, elettroni e lacune si incontrano nella giunzione e liberano luce">
        <Wire d="M60 102 H30 V170 H60 M120 170 H188 M212 170 H306 V102 H276" />
        <Resistor x={60} y={170} len={60} />
        <circle cx="200" cy="170" r="12" fill={K.body} stroke={K.ink} stroke-width="1.4" />
        <Lbl x={194} y={174} c={K.plus} s={11}>+</Lbl><Lbl x={207} y={174} c={K.minus} s={11}>−</Lbl>
        <Junction forward led />
        <Flow d="M188 170 H30 V102 H60 M276 102 H306 V170 H212" dur={0.9} />
        <Lbl x={90} y={188} s={9}>resistenza</Lbl><Lbl x={200} y={188} s={9}>pila</Lbl>
      </Svg>
    </Fig>
  )
}

/* Transistor NPN: piccola corrente di base, grande corrente di collettore */
export function Bjt ({ mode }) {
  const [ib, setIb] = useAuto(mode, [0, 0.05, 0.1, 0.2, 0.3], 1800)
  const ic = Math.min(ib * 100, 20) // β = 100, saturazione a 20 mA (9 V su 450 Ω)
  const sat = ib * 100 > 20
  return (
    <Fig caption="guadagno β ≈ 100 (valore tipico, varia molto tra modelli) · il carico limita la corrente a 20 mA: oltre, il transistor è saturo"
      readout={<Readout items={[['corrente di base', ib.toFixed(2) + ' mA'], ['corrente di collettore', ic.toFixed(0) + ' mA' + (sat ? ' (max)' : ''), K.cur]]} />}
      controls={mode === 'play' && <Slider id="ib" label="Corrente di base:" show={ib.toFixed(2) + ' mA'} min={0} max={0.3} step={0.05} value={ib} set={setIb} />}>
      <Svg h={190} label={`Una corrente di base di ${ib.toFixed(2)} milliampere controlla una corrente di collettore di ${ic.toFixed(0)} milliampere`}>
        <Wire d="M300 95 V20 H240 V36 M240 60 V92 M240 128 V170 H300 V105 M40 125 V110 H120 M180 110 H222 M240 170 H40 V135" />
        <Battery x={300} y={95} label="9 V" />
        <Battery x={40} y={125} />
        <Lamp x={240} y={48} glow={ic / 20} />
        <Resistor x={120} y={110} len={60} label="Rb" />
        <circle cx="236" cy="110" r="26" fill={K.body} stroke={K.ink} stroke-width="1.4" />
        <path d="M222 94 V126 M222 103 L240 92 M222 117 L240 128" stroke={K.ink} stroke-width="2" fill="none" />
        <path d="M231 121 L240 128 L229 129" fill="none" stroke={K.ink} stroke-width="2" />
        <Lbl x={250} y={90} a="start" s={9}>C</Lbl><Lbl x={250} y={136} a="start" s={9}>E</Lbl><Lbl x={210} y={104} a="end" s={9}>B</Lbl>
        {ic > 0 && <Flow d="M300 95 V20 H240 V92 M240 128 V170 H300 V105" dur={Math.max(0.35, 6 / ic)} w={2 + ic / 5} />}
        {ib > 0 && <Flow d="M40 125 V110 H222 M240 170 H40 V135" dur={Math.max(0.8, 0.5 / ib)} w={1.6} />}
        <Lbl x={150} y={130} s={9} c={K.cur}>{ib > 0 ? 'piccola corrente' : ''}</Lbl>
        <Lbl x={222} y={52} s={9} c={K.cur} a="end">{ic > 0 ? 'grande corrente' : ''}</Lbl>
      </Svg>
    </Fig>
  )
}

/* MOSFET a canale N */
export function Mosfet ({ mode }) {
  const [on, setOn] = useAuto(mode, [false, true], 2600)
  return (
    <Fig caption="sezione semplificata · la striscia grigia sotto il gate è un velo di ossido isolante: il gate non assorbe corrente, agisce solo con il suo campo elettrico"
      controls={mode === 'play' && <Seg label="Tensione sul gate" value={on} set={setOn} options={[[false, 'Gate a 0 V'], [true, 'Gate + 5 V']]} />}>
      <Svg h={180} label={on ? 'Con tensione positiva sul gate si forma un canale di elettroni tra source e drain e passa corrente' : 'Senza tensione sul gate non c\'è canale: tra source e drain non passa corrente'}>
        <rect x="40" y="80" width="256" height="80" rx="4" fill="#241A1C" stroke={K.part} />
        <Lbl x={168} y={154} c={K.hole} s={9}>substrato P</Lbl>
        <rect x="52" y="80" width="64" height="34" rx="4" fill="#1A2238" stroke={K.el} /><Lbl x={84} y={102} c={K.el}>N+</Lbl>
        <rect x="220" y="80" width="64" height="34" rx="4" fill="#1A2238" stroke={K.el} /><Lbl x={252} y={102} c={K.el}>N+</Lbl>
        <rect x="108" y="70" width="120" height="8" fill="#5C6A7E" />
        <rect x="108" y="52" width="120" height="12" rx="2" fill={on ? K.plus : '#3A4050'} class="k-ease" />
        <Lbl x={168} y={44} c={on ? K.plus : K.text}>{on ? 'GATE  +5 V' : 'GATE  0 V'}</Lbl>
        <Lbl x={84} y={70}>S</Lbl><Lbl x={252} y={70}>D</Lbl>
        <rect x="116" y="80" width="104" height="8" fill={K.el} opacity={on ? 0.9 : 0} class="k-ease" />
        {on && <Electrons d="M224 92 H112" dur={0.9} r={4} />}
        {on && <><Arrow x1={200} y1={174} x2={136} y2={174} c={K.cur} w={1.8} head={6} /><Lbl x={168} y={168} c={K.cur} s={9}>I: dal drain al source</Lbl></>}
        <Lbl x={168} y={128} c={on ? K.el : K.text} s={9}>{on ? 'canale di elettroni: conduce' : 'nessun canale: non conduce'}</Lbl>
      </Svg>
    </Fig>
  )
}

/* Potenziometro: partitore di tensione */
export function Potenziometro ({ mode }) {
  const [p, setP] = useAuto(mode, [20, 50, 80], 1800)
  const a0 = 225; const sweep = 270
  const ang = (a0 - sweep * p / 100) * Math.PI / 180
  const cx = 110, cy = 100, r = 60
  const pt = (deg) => [cx + r * Math.cos(deg * Math.PI / 180), cy - r * Math.sin(deg * Math.PI / 180)]
  const [sx, sy] = pt(a0); const [ex, ey] = pt(a0 - sweep); const wx = cx + r * Math.cos(ang); const wy = cy - r * Math.sin(ang)
  const big = sweep * p / 100 > 180 ? 1 : 0
  const vout = 5 * p / 100
  return (
    <Fig caption="la spazzola divide la pista in due parti: la tensione in uscita è proporzionale alla posizione"
      readout={<Readout items={[['ingresso', '5,0 V'], ['posizione', p + ' %'], ['uscita', vout.toFixed(1).replace('.', ',') + ' V', K.cur]]} />}
      controls={mode === 'play' && <Slider id="pot" label="Ruota la manopola:" show={p + ' %'} min={0} max={100} step={5} value={p} set={setP} />}>
      <Svg h={190} label={`Spazzola al ${p} per cento: in uscita ${vout.toFixed(1)} volt su 5`}>
        <path d={`M${sx} ${sy} A${r} ${r} 0 1 1 ${ex} ${ey}`} fill="none" stroke="#3A3426" stroke-width="12" />
        <path d={`M${sx} ${sy} A${r} ${r} 0 ${big} 1 ${wx} ${wy}`} fill="none" stroke="#8FA8FF" stroke-width="5" opacity=".75" />
        <circle cx={cx} cy={cy} r="8" fill={K.part} />
        <path d={`M${cx} ${cy} L${wx} ${wy}`} stroke={K.cur} stroke-width="3" stroke-linecap="round" />
        <circle cx={wx} cy={wy} r="5" fill={K.cur} />
        <Lbl x={sx - 10} y={sy + 22} c={K.minus} s={9}>0 V</Lbl><Lbl x={ex + 10} y={ey + 22} c={K.plus} s={9}>5 V</Lbl>
        <Lbl x={cx} y={cy + 28} s={9}>spazzola</Lbl>
        <path d="M230 30 V160" stroke={K.part} />
        <rect x="250" y={160 - 120 * p / 100} width="40" height={120 * p / 100} fill="#8FA8FF" opacity=".7" class="k-ease" />
        <rect x="250" y="40" width="40" height="120" fill="none" stroke={K.part} />
        <Lbl x={270} y={176} s={9}>uscita</Lbl>
        <Lbl x={270} y={34} s={9}>5 V</Lbl>
      </Svg>
    </Fig>
  )
}

/* Quarzo */
export function Quarzo () {
  return (
    <Fig caption="vibrazione molto esagerata e rallentata · un quarzo da orologio vibra 32 768 volte al secondo">
      <Svg h={170} label="La tensione alternata sugli elettrodi fa vibrare il cristallo di quarzo a una frequenza precisissima, che il circuito usa come metronomo">
        <rect x="40" y="60" width="16" height="70" fill="#B0B8C8" /><rect x="132" y="60" width="16" height="70" fill="#B0B8C8" />
        <g class="qz-slab"><rect x="58" y="66" width="72" height="58" rx="3" fill="#C9D7EA" fill-opacity=".35" stroke="#C9D7EA" /></g>
        <Lbl x={94} y={150}>cristallo di quarzo</Lbl>
        <g class="qz-a"><Lbl x={48} y={52} c={K.plus} s={12}>+</Lbl><Lbl x={140} y={52} c={K.minus} s={12}>−</Lbl></g>
        <g class="qz-b"><Lbl x={48} y={52} c={K.minus} s={12}>−</Lbl><Lbl x={140} y={52} c={K.plus} s={12}>+</Lbl></g>
        <path d="M180 30 V140 M180 85 H326" stroke={K.part} />
        <clipPath id="qzc"><rect x="180" y="20" width="150" height="130" /></clipPath><g clip-path="url(#qzc)"><g class="qz-wave"><path d="M180 85 q12 -40 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" fill="none" stroke={K.cur} stroke-width="2" /></g></g>
        <Lbl x={254} y={150} s={9}>segnale: frequenza costante</Lbl>
      </Svg>
    </Fig>
  )
}

/* Fusibile */
export function Fusibile ({ mode }) {
  const [x, setX] = useAuto(mode, [0.5, 1, 2, 2, 0.5], 1800)
  const [blown, setBlown] = useState(false)
  useEffect(() => { if (x >= 2) setBlown(true); else if (mode === 'auto') setBlown(false) }, [x])
  const heat = blown ? 1 : Math.min(1, x / 1.6)
  const fil = blown ? '#5A6378' : `rgb(${Math.round(120 + 135 * heat)},${Math.round(120 + 60 * heat)},${Math.round(130 - 90 * heat)})`
  return (
    <Fig caption="schema semplificato · un fusibile vero interviene tanto più in fretta quanto più la corrente supera il valore nominale"
      readout={<Readout items={[['corrente', (x * 1).toFixed(1).replace('.', ',') + ' × nominale'], ['stato', blown ? 'interrotto' : x > 1 ? 'si scalda' : 'normale', blown ? K.hole : K.cur]]} />}
      controls={mode === 'play' && (blown ? <button class="btn" onClick={() => { setBlown(false); setX(0.5) }}>Sostituisci il fusibile</button> : <Seg label="Corrente" value={x} set={setX} options={[[0.5, 'Metà'], [1, 'Nominale'], [2, 'Doppia']]} />)}>
      <Svg h={150} label={blown ? 'Corrente eccessiva: il filo del fusibile si è fuso e il circuito è aperto' : 'Il fusibile lascia passare la corrente; il filo si scalda di più quando la corrente cresce'}>
        <Wire d="M30 70 V30 H110 M226 30 H306 V120 H30 V82" />
        <Battery x={30} y={70} />
        <rect x="110" y="16" width="116" height="28" rx="12" fill="#C9D7EA" fill-opacity=".12" stroke="#C9D7EA" />
        <rect x="104" y="18" width="14" height="24" rx="3" fill="#B0B8C8" /><rect x="218" y="18" width="14" height="24" rx="3" fill="#B0B8C8" />
        {blown
          ? <><path d="M118 30 Q140 26 158 31" stroke={fil} stroke-width="2.4" fill="none" /><path d="M178 29 Q200 34 218 30" stroke={fil} stroke-width="2.4" fill="none" /><circle cx="168" cy="30" r="10" fill={K.heat} opacity=".25" /></>
          : <path d="M118 30 Q143 24 168 30 T218 30" stroke={fil} stroke-width="2.4" fill="none" />}
        {!blown && <Flow d="M30 70 V30 H306 V120 H30 V82" dur={1 / x} />}
        <Lamp x={306} y={75} glow={blown ? 0 : Math.min(1, x / 1)} />
        <Lbl x={168} y={64} s={9}>filo sottile del fusibile</Lbl>
      </Svg>
    </Fig>
  )
}
