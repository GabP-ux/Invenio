// Schemi degli attuatori. Regole: skill "invenio-schemi".
import { K, Svg, Lbl, Wire, Flow, Arrow, Battery, Lamp, Fig, Seg, Slider, Readout, useAuto } from './kit'
import './attuatori2.css'

/* Motore DC visto di fronte: il filo con la corrente che esce (⊙) è spinto su, quello con la corrente che entra (⊗) giù */
export function MotoreDc () {
  // B va da N (sinistra) a S (destra): +x. Lato sinistro ⊙ (corrente verso di noi, +z): F = z × x = +y (in alto).
  // Lato destro ⊗ (−z): F = −y (in basso). Rotazione oraria. Il collettore inverte la corrente quando la spira è verticale.
  return (
    <Fig caption="vista di fronte, schema semplificato · ⊙ corrente verso di noi, ⊗ corrente che entra nello schermo. A ogni mezzo giro il collettore inverte la corrente, così la spinta resta nello stesso verso">
      <Svg h={190} label="Il campo va dal polo nord al polo sud; il lato della spira con la corrente uscente è spinto in alto, quello con la corrente entrante in basso: la spira gira in senso orario">
        <rect x="14" y="40" width="44" height="110" rx="6" fill="#4A2A2A" stroke={K.heat} /><Lbl x={36} y={100} c={K.heat} s={16}>N</Lbl>
        <rect x="278" y="40" width="44" height="110" rx="6" fill="#22304A" stroke={K.minus} /><Lbl x={300} y={100} c={K.minus} s={16}>S</Lbl>
        {[60, 95, 130].map(y => <g key={y}><path d={`M62 ${y} H274`} stroke={K.field} stroke-dasharray="4 5" /><path d={`M266 ${y - 4} L274 ${y} L266 ${y + 4}`} fill="none" stroke={K.field} /></g>)}
        <Lbl x={168} y={30} c={K.field} s={9}>campo magnetico B</Lbl>
        <g class="dc-rot">
          <path d="M98 95 H238" stroke="#D9B45A" stroke-width="4" />
          <g class="dc-counter"><circle cx="98" cy="95" r="10" fill={K.body} stroke={K.ink} /><circle cx="98" cy="95" r="2.5" fill={K.ink} /></g>
          <g class="dc-counter"><circle cx="238" cy="95" r="10" fill={K.body} stroke={K.ink} /><path d="M231 88 L245 102 M245 88 L231 102" stroke={K.ink} stroke-width="1.6" /></g>
        </g>
        <Arrow x1={78} y1={88} x2={78} y2={56} c={K.force} /><Lbl x={68} y={52} a="end" c={K.force} s={10}>F</Lbl>
        <Arrow x1={258} y1={102} x2={258} y2={134} c={K.force} /><Lbl x={268} y={142} a="start" c={K.force} s={10}>F</Lbl>
        <Lbl x={168} y={180} s={10}>la spira gira in senso orario ↻</Lbl>
      </Svg>
    </Fig>
  )
}

/* Brushless: le bobine si accendono in sequenza, il rotore le insegue */
export function Bldc () {
  const coils = [0, 60, 120, 180, 240, 300]
  return (
    <Fig caption="schema semplificato · il controllore accende le coppie di bobine una dopo l'altra (A, B, C), sempre un po' davanti alla calamita del rotore">
      <Svg h={190} label="Sei bobine fisse intorno al rotore si accendono a coppie in sequenza; la calamita del rotore viene attirata e gira continuamente">
        <circle cx="168" cy="95" r="76" fill="none" stroke={K.part} />
        {coils.map((a, i) => {
          const ph = 'ABC'[i % 3]
          return <g key={a} transform={`rotate(${a} 168 95)`}>
            <rect class={'bl-c bl-' + ph} x="226" y="83" width="26" height="24" rx="4" fill="#1A1F2A" stroke={K.light} stroke-width="1.3" />
            <Lbl x={239} y={99} s={11} c={K.ink} stroke="#0B0D12" stroke-width="3" paint-order="stroke" transform={`rotate(${-a} 239 95)`}>{ph}</Lbl>
          </g>
        })}
        <circle cx="168" cy="95" r="42" fill={K.body} stroke={K.part} />
        <g class="bl-rot">
          <path d="M168 95 V57" stroke={K.heat} stroke-width="10" /><path d="M168 95 V133" stroke={K.minus} stroke-width="10" />
          <Lbl x={168} y={70} c={K.ink} s={9}>N</Lbl><Lbl x={168} y={127} c={K.ink} s={9}>S</Lbl>
        </g>
        <circle cx="168" cy="95" r="5" fill={K.ink} />
      </Svg>
    </Fig>
  )
}

/* Servomotore: retroazione verso la posizione richiesta */
export function Servo ({ mode }) {
  const [a, setA] = useAuto(mode, [30, 150, 90], 2400)
  const ms = 1 + a / 180
  return (
    <Fig caption="il circuito confronta la posizione richiesta (tratteggio) con quella letta dal potenziometro e muove il motore finché coincidono"
      readout={<Readout items={[['posizione richiesta', a + '°'], ['impulso', ms.toFixed(2).replace('.', ',') + ' ms', K.cur]]} />}
      controls={mode === 'play' && <Slider id="servo" label="Posizione richiesta:" show={a + '°'} min={0} max={180} step={15} value={a} set={setA} />}>
      <Svg h={170} label={`Il braccio del servo ruota fino a ${a} gradi`}>
        <path d="M60 130 A70 70 0 0 1 200 130" fill="none" stroke={K.part} stroke-dasharray="3 4" />
        <Lbl x={52} y={146} s={9}>0°</Lbl><Lbl x={130} y={52} s={9}>90°</Lbl><Lbl x={208} y={146} s={9}>180°</Lbl>
        <rect x="96" y="120" width="68" height="40" rx="6" fill={K.body} stroke={K.part} />
        <path d={`M130 130 L${130 - 74 * Math.cos(a * Math.PI / 180)} ${130 - 74 * Math.sin(a * Math.PI / 180)}`} stroke={K.cur} stroke-width="1.4" stroke-dasharray="4 4" />
        <g class="k-ease" style={{ transform: `rotate(${a}deg)`, transformOrigin: '130px 130px', transformBox: 'view-box' }}>
          <path d="M130 130 L64 130" stroke={K.ink} stroke-width="7" stroke-linecap="round" />
        </g>
        <circle cx="130" cy="130" r="8" fill={K.part} />
        <g transform="translate(236 30)">
          <rect x="0" y="0" width="88" height="22" rx="4" fill={K.body} stroke={K.part} /><Lbl x={44} y={15} s={9}>impulso</Lbl>
          <rect x="0" y="40" width="88" height="22" rx="4" fill={K.body} stroke={K.cur} /><Lbl x={44} y={55} s={9} c={K.cur}>confronto</Lbl>
          <rect x="0" y="80" width="88" height="22" rx="4" fill={K.body} stroke={K.part} /><Lbl x={44} y={95} s={9}>motore</Lbl>
          <rect x="0" y="120" width="88" height="22" rx="4" fill={K.body} stroke={K.part} /><Lbl x={44} y={135} s={9}>potenziom.</Lbl>
          <Arrow x1={44} y1={22} x2={44} y2={39} c={K.text} w={1.4} head={5} />
          <Arrow x1={44} y1={62} x2={44} y2={79} c={K.text} w={1.4} head={5} />
          <Arrow x1={44} y1={102} x2={44} y2={119} c={K.text} w={1.4} head={5} />
          <path d="M88 131 H96 V51 H90" fill="none" stroke={K.text} stroke-width="1.4" /><path d="M95 47 L89 51 L95 55" fill="none" stroke={K.text} stroke-width="1.4" />
        </g>
      </Svg>
    </Fig>
  )
}

/* Relè: comando separato dal carico */
export function Rele ({ mode }) {
  const [on, setOn] = useAuto(mode, [false, true], 2400)
  return (
    <Fig caption="due circuiti separati: a sinistra il comando (bobina, bassa tensione), a destra il carico. La lamina sposta il contatto comune (COM) da NC a NA"
      controls={mode === 'play' && <Seg label="Comando" value={on} set={setOn} options={[[false, 'Comando spento'], [true, 'Comando acceso']]} />}>
      <Svg h={190} label={on ? 'La bobina è alimentata: attira la lamina, il contatto si chiude su NA e la lampadina si accende' : 'La bobina è spenta: la molla tiene il contatto su NC e la lampadina è spenta'}>
        <Wire d="M30 92 V74 H140 M160 116 H176 V160 H30 V102" />
        <Battery x={30} y={92} label="5 V" />
        <rect x="140" y="70" width="20" height="50" rx="3" fill="#3A3426" />
        {[0, 1, 2, 3].map(i => <path key={i} d={`M136 ${76 + i * 11} H164`} stroke="#D9B45A" stroke-width="2.4" />)}
        {on && <Flow d="M30 92 V74 H140 M160 116 H176 V160 H30 V102" dur={0.9} w={2} />}
        <Lbl x={90} y={178} s={9}>comando</Lbl>
        <path d="M196 26 H234 M196 60 H234" stroke={K.ink} stroke-width="2.4" />
        <Lbl x={240} y={30} a="start" s={9}>NC</Lbl><Lbl x={240} y={56} a="start" s={9}>NA</Lbl>
        <Wire d="M110 40 V10 H300 V48 M300 72 V110 M300 120 V170 H234 V60" />
        <Lamp x={300} y={60} glow={on ? 1 : 0} />
        <Battery x={300} y={110} />
        <path class="k-ease" d="M110 40 L200 40" stroke="#B0B8C8" stroke-width="5" stroke-linecap="round" style={{ transform: on ? 'rotate(13deg)' : 'rotate(-9deg)', transformOrigin: '110px 40px', transformBox: 'view-box' }} />
        <circle cx="110" cy="40" r="4" fill={K.ink} />
        {on && <Flow d="M300 110 V72 M300 48 V10 H110 V40 L198 60 H234 V170 H300 V120" dur={0.6} />}
        <Lbl x={104} y={58} a="end" s={9}>COM</Lbl><Lbl x={268} y={186} s={9}>carico</Lbl>
      </Svg>
    </Fig>
  )
}

/* Motore a vibrazione */
export function Vibrazione () {
  return (
    <Fig caption="il peso fuori centro tira l'albero sempre verso di sé mentre gira: il motore (e l'oggetto intorno) viene scosso in cerchio. Movimento esagerato">
      <Svg h={170} label="Un peso a mezzaluna montato fuori centro sull'albero gira e fa tremare il motore">
        <g class="vb-body">
          <rect x="60" y="60" width="140" height="56" rx="10" fill={K.body} stroke={K.part} />
          <Lbl x={130} y={92}>motore</Lbl>
          <path d="M200 88 H232" stroke="#B0B8C8" stroke-width="4" />
          <g class="k-spin" style={{ transformOrigin: '246px 88px', '--dur': '.35s' }}>
            <path d="M246 88 m-22 0 a22 22 0 0 1 44 0 Z" fill="#B0B8C8" />
            <circle cx="246" cy="88" r="3" fill={K.part} />
          </g>
        </g>
        <Lbl x={246} y={140} s={9}>peso sbilanciato</Lbl>
        {[0, 1].map(i => <path key={i} class="vb-wave" d={`M${30 - i * 10} 70 q-6 18 0 36`} fill="none" stroke={K.text} style={{ animationDelay: i * 0.15 + 's' }} />)}
      </Svg>
    </Fig>
  )
}

/* Attuatore lineare */
export function Lineare ({ mode }) {
  const [out, setOut] = useAuto(mode, [true, false], 2600)
  return (
    <Fig caption="la vite gira, il dado non può ruotare e scorre lungo la vite trascinando l'asta"
      controls={mode === 'play' && <Seg label="Movimento" value={out} set={setOut} options={[[true, 'Esce →'], [false, '← Rientra']]} />}>
      <Svg h={150} label={out ? 'Il motore fa girare la vite e l\'asta esce' : 'Il motore gira al contrario e l\'asta rientra'}>
        <rect x="20" y="50" width="56" height="50" rx="6" fill={K.body} stroke={K.part} /><Lbl x={48} y={79}>motore</Lbl>
        <clipPath id="linc"><rect x="76" y="66" width="200" height="18" /></clipPath>
        <g clip-path="url(#linc)"><g class={out ? 'ln-thr' : 'ln-thr ln-rev'}>
          {Array.from({ length: 30 }).map((_, i) => <path key={i} d={`M${60 + i * 9} 66 l7 18`} stroke="#8C96AA" stroke-width="2" />)}
        </g></g>
        <rect x="76" y="66" width="200" height="18" fill="none" stroke={K.part} />
        <g class="k-ease" style={{ transform: `translateX(${out ? 110 : 0}px)` }}>
          <rect x="96" y="56" width="30" height="38" rx="4" fill="#5A6378" stroke="#8C96AA" /><Lbl x={111} y={106} s={9}>dado</Lbl>
          <rect x="126" y="70" width="110" height="10" fill="#B0B8C8" /><Lbl x={200} y={64} s={9}>asta</Lbl>
        </g>
        <Arrow x1={out ? 250 : 300} y1={128} x2={out ? 300 : 250} y2={128} c={K.ink} />
      </Svg>
    </Fig>
  )
}

/* Buzzer piezo */
export function Piezo () {
  return (
    <Fig caption="sezione del disco, flessione molto esagerata · la tensione si inverte migliaia di volte al secondo e la lamina vibra">
      <Svg h={170} label="Quando la tensione cambia segno, la ceramica si deforma nel verso opposto e la lamina si piega su e giù producendo suono">
        <g class="pz-bend">
          <path d="M60 100 Q168 70 276 100" fill="none" stroke="#D9B45A" stroke-width="5" />
          <path d="M110 92 Q168 76 226 92" fill="none" stroke="#E8EAF0" stroke-width="6" />
        </g>
        <path d="M52 100 H60 M276 100 H284" stroke={K.part} stroke-width="6" />
        <Lbl x={168} y={140} s={9}>ceramica (bianca) incollata sulla lamina (ottone)</Lbl>
        <g class="pz-a"><Lbl x={34} y={104} c={K.plus} s={13}>+</Lbl><Lbl x={302} y={104} c={K.minus} s={13}>−</Lbl></g>
        <g class="pz-b"><Lbl x={34} y={104} c={K.minus} s={13}>−</Lbl><Lbl x={302} y={104} c={K.plus} s={13}>+</Lbl></g>
        {[0, 1, 2].map(i => <path key={i} class="pz-snd" d={`M${138 - i * 4} ${48 - i * 10} Q168 ${36 - i * 12} ${198 + i * 4} ${48 - i * 10}`} fill="none" stroke={K.sound} stroke-width="1.8" style={{ animationDelay: i * 0.2 + 's' }} />)}
      </Svg>
    </Fig>
  )
}

/* Filo a memoria di forma */
export function MemoriaForma ({ mode }) {
  const [on, setOn] = useAuto(mode, [false, true], 3000)
  return (
    <Fig caption="accorciamento esagerato (nella realtà qualche percento) · si scalda in fretta, ma per riallungarsi deve prima raffreddarsi"
      controls={mode === 'play' && <Seg label="Corrente nel filo" value={on} set={setOn} options={[[false, 'Corrente spenta'], [true, 'Corrente accesa']]} />}>
      <Svg h={190} label={on ? 'La corrente scalda il filo, che si accorcia e solleva il peso' : 'Il filo si raffredda e il peso lo riallunga'}>
        <path d="M40 18 H296" stroke={K.part} stroke-width="6" />
        <path d="M168 20 V140" stroke={on ? K.heat : '#8C96AA'} stroke-width="3" style={{ transform: `scaleY(${on ? 0.8 : 1})`, transformOrigin: '168px 20px', transformBox: 'view-box', transition: on ? 'transform 1s ease, stroke .6s' : 'transform 2.6s ease, stroke 2.6s' }} />
        <g style={{ transform: `translateY(${on ? -28 : 0}px)`, transition: on ? 'transform 1s ease' : 'transform 2.6s ease' }}>
          <rect x="140" y="140" width="56" height="34" rx="4" fill="#5A6378" stroke="#8C96AA" /><Lbl x={168} y={161} c={K.ink}>peso</Lbl><path d="M140 168 H120 V178" stroke={K.wire} stroke-width="1.6" fill="none" />
        </g>
        <Wire d="M168 20 V10 H60 V60 M60 70 V178 H120" />
        <Battery x={60} y={60} />
        {on && <Flow d="M60 60 V10 H168 V108" dur={0.8} w={2} />}
        <Lbl x={196} y={70} c={on ? K.heat : K.text} s={10} a="start">{on ? 'caldo: si accorcia' : 'freddo: si allunga'}</Lbl>
      </Svg>
    </Fig>
  )
}

/* Elettrovalvola normalmente chiusa */
export function Elettrovalvola () {
  return (
    <Fig caption="valvola normalmente chiusa, schema semplificato · con la corrente la bobina solleva l'otturatore e l'acqua passa; senza corrente la molla richiude">
      <Svg h={190} label="Quando la bobina è alimentata, lo stantuffo sale, apre il foro e l'acqua scorre nel tubo">
        <rect x="128" y="14" width="80" height="70" rx="6" fill="#3A3426" />
        {[0, 1, 2, 3, 4, 5].map(i => <path key={i} d={`M124 ${22 + i * 11} H212`} stroke="#D9B45A" stroke-width="2" />)}
        <g class="ev-plunger"><rect x="156" y="30" width="24" height="102" rx="3" fill="#5A6378" stroke="#8C96AA" /><rect x="152" y="132" width="32" height="8" rx="2" fill="#2C2C2C" /></g>
        <path d="M20 120 H150 M186 120 H316 M20 172 H316 M168 172 V140" fill="none" stroke={K.part} stroke-width="3" />
        <Lbl x={176} y={186} s={8} a="start">setto</Lbl>
        <g class="ev-flow"><path class="k-flow" d="M22 156 H140 Q168 112 196 156 H314" fill="none" stroke={K.cold} stroke-width="5" style={{ '--dur': '.7s' }} /></g>
        <g class="ev-on"><Lbl x={260} y={50} c={K.cur} s={10}>bobina accesa</Lbl></g>
        <g class="ev-off"><Lbl x={260} y={50} s={10}>bobina spenta</Lbl></g>
        <Lbl x={70} y={186} c={K.cold} s={9}>acqua</Lbl>
      </Svg>
    </Fig>
  )
}

/* Altoparlante */
export function Altoparlante () {
  return (
    <Fig caption="sezione semplificata · la corrente del segnale cambia verso di continuo e la bobina, immersa nel campo del magnete, spinge il cono avanti e indietro">
      <Svg h={190} label="La bobina mobile spinta dal magnete fa muovere il cono avanti e indietro, che genera onde di pressione nell'aria">
        <rect x="20" y="60" width="40" height="70" fill="#4A2A2A" stroke={K.heat} /><Lbl x={40} y={146} c={K.heat} s={9}>magnete</Lbl>
        <path d="M60 60 H96 V82 M60 130 H96 V108" fill="none" stroke="#8C96AA" stroke-width="5" />
        <g class="sp-move">
          <rect x="84" y="84" width="22" height="22" fill="#3A3426" stroke="#D9B45A" />
          <path d="M106 84 L200 26 M106 106 L200 164" stroke="#B0B8C8" stroke-width="3" />
          <path d="M200 26 Q206 22 210 28 M200 164 Q206 168 210 162" stroke={K.part} stroke-width="3" fill="none" />
        </g>
        <Lbl x={95} y={78} s={8}>bobina</Lbl><Lbl x={160} y={98} s={9}>cono</Lbl>
        {[0, 1, 2].map(i => <path key={i} class="sp-wave" d="M226 50 Q262 95 226 140" fill="none" stroke={K.sound} stroke-width="2" style={{ animationDelay: (i * 0.4) + 's' }} />)}
        <g class="sp-a"><Lbl x={95} y={150} c={K.cur} s={9}>I →</Lbl></g>
        <g class="sp-b"><Lbl x={95} y={150} c={K.cur} s={9}>← I</Lbl></g>
      </Svg>
    </Fig>
  )
}

/* Cella di Peltier: una coppia N-P */
export function Peltier ({ mode }) {
  const [fw, setFw] = useAuto(mode, [true, false], 3000)
  // corrente su per N, attraverso la piastra in alto, giù per P: il calore viene portato via dall'alto -> alto freddo
  const top = fw ? K.cold : K.heat; const bot = fw ? K.heat : K.cold
  const path = fw ? 'M30 160 H110 V120 V40 H226 V160 H306' : 'M306 160 H226 V40 H110 V160 H30'
  return (
    <Fig caption="una sola coppia N-P (una cella vera ne ha decine in fila) · invertendo la corrente si scambiano il lato freddo e quello caldo"
      readout={<Readout items={[['lato in alto', fw ? 'freddo' : 'caldo', top], ['lato in basso', fw ? 'caldo' : 'freddo', bot]]} />}
      controls={mode === 'play' && <Seg label="Verso della corrente" value={fw} set={setFw} options={[[true, 'Corrente in un verso'], [false, 'Corrente invertita']]} />}>
      <Svg h={190} label={fw ? 'La corrente sale nel blocchetto N e scende nel P: il calore viene portato dalla piastra in alto a quella in basso' : 'Con la corrente invertita il calore va dal basso verso l\'alto'}>
        <rect x="70" y="20" width="196" height="14" rx="3" fill={top} opacity=".85" class="k-ease" />
        <rect x="70" y="166" width="196" height="14" rx="3" fill={bot} opacity=".85" class="k-ease" />
        <Lbl x={168} y={14} c={top} s={9}>{fw ? 'lato freddo' : 'lato caldo'}</Lbl>
        <rect x="92" y="48" width="36" height="104" fill="#1A2238" stroke={K.el} /><Lbl x={80} y={104} c={K.el} s={12}>N</Lbl>
        <rect x="208" y="48" width="36" height="104" fill="#2A1A1A" stroke={K.hole} /><Lbl x={256} y={104} c={K.hole} s={12}>P</Lbl>
        <path d="M92 40 H244" stroke="#C98A4A" stroke-width="6" />
        <path d="M30 160 H128 M208 160 H306" stroke="#C98A4A" stroke-width="6" />
        <Flow d={path} dur={0.9} />
        {[110, 226].map(x => <g key={x} class={fw ? 'pt-down' : 'pt-up'}><path d={`M${x + 22} 60 q4 8 0 16 t0 16 t0 16`} fill="none" stroke={K.heat} stroke-width="2" /></g>)}
        <Lbl x={168} y={120} s={9}>calore</Lbl>
      </Svg>
    </Fig>
  )
}
