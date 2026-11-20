---
name: invenio-schemi
description: Disegna schemi di funzionamento di componenti e tecnologie per l'app Invenio (SVG animati e interattivi, fisicamente corretti). Usala per ogni nuova scheda di Invenio o quando una scheda non ha ancora il suo schema.
---

# Schemi di funzionamento per Invenio

Ogni scheda di Invenio deve avere uno schema che mostri **come funziona** la tecnologia, non solo com'è fatta. Lo schema è un componente Preact che disegna un SVG: animato nel feed, interattivo nella scheda quando ha senso.

Il codice vive nel repository `GabP-ux/Invenio`:
- `src/diagrams/kit.jsx` – i pezzi riutilizzabili e il registro `VIS`
- `src/diagrams/kit.css` – le animazioni generiche
- `src/diagrams/*.jsx` – gli schemi, uno per componente

## 1. Prima di disegnare: capire il meccanismo

1. Rileggi la voce di Wikipedia citata nella scheda (`source`) e scrivi in una riga **la catena causa → effetto** che lo schema deve mostrare (es. "luce → coppie elettrone-lacuna nella giunzione → corrente").
2. Scegli **un solo meccanismo**. Se la tecnologia ne ha di più, mostra il principale e citane gli altri nel testo.
3. Decidi la forma:
   - **animato** (`mode="auto"`): il meccanismo si ripete da solo in un ciclo di 2–5 s;
   - **interattivo** (`mode="play"`): l'utente cambia una grandezza (cursore) o uno stato (pulsanti) e vede l'effetto. Usalo quando c'è una relazione causa → effetto che vale la pena esplorare (Ohm, partitore, transistor, ponte H…).
   Ogni schema interattivo deve funzionare anche in `auto`, facendo scorrere da solo gli stati.

## 2. Linguaggio visivo (sempre uguale in tutta l'app)

| Grandezza | Colore / segno |
|---|---|
| Corrente convenzionale (dal + al −, fuori dal generatore) | giallo `#FFD27A`, linea tratteggiata che scorre, lettera **I** |
| Elettroni | pallini blu `#8FA8FF`, sempre **in verso opposto** a I |
| Lacune (cariche positive nei semiconduttori) | cerchietti vuoti corallo `#F28C6B` |
| Luce emessa | ambra `#F0B44C`; luce riflessa/ricevuta blu chiaro `#B8C8FF` |
| Suono / ultrasuoni | viola `#B9A3FF`, archi concentrici |
| Calore, infrarosso | corallo `#F28C6B`, linea ondulata; freddo `#6FB8FF` |
| Campo magnetico | grigio `#8C96AA`: **×** entra nello schermo, **⊙** esce; linee di campo tratteggiate |
| Forza meccanica | freccia bianca piena `#ECEEF3`, lettera **F** |
| Polo + / − | `+` corallo, `−` blu |
| Materiale in movimento / parti meccaniche | grigi `#5A6378`, `#3A4050` |

Testi nello schema: font monospace 9–11 px, solo etichette brevi (nomi delle parti, unità). Le spiegazioni vanno nella didascalia o nel testo.

## 3. Regole di correttezza (non negoziabili)

- **Ogni freccia indica un verso reale.** Niente frecce decorative.
- Corrente convenzionale dal + al − nel circuito esterno; dentro una pila/alimentatore dal − al +. Elettroni sempre al contrario.
- Forza su un conduttore: **F = I × B** (regola della mano sinistra / prodotto vettoriale). Calcola il verso con le coordinate prima di disegnarlo (in SVG l'asse y punta in basso!).
- Polarità dei semiconduttori: diodo conduce da anodo (P) a catodo (N); NPN: piccola corrente base → emettitore controlla la corrente collettore → emettitore; MOSFET a canale N: tensione positiva gate–source crea il canale, il gate non assorbe corrente continua.
- Se lo schema **semplifica** (meno passi, proporzioni, una sola coppia di zone…), la didascalia lo dice: "schema semplificato: …".
- Se l'animazione è **rallentata o accelerata**, la didascalia lo dice, e il rapporto tempo/grandezza resta costante (es. durata ∝ distanza).
- Numeri mostrati = numeri calcolati con la formula vera (es. I = V/R, t = 2d/c). Niente valori inventati: se non c'è un numero affidabile, usa barre qualitative ("bassa / alta").
- Nessuna etichetta sopra un'altra; nessuna linea che passa dietro un oggetto con cui non è collegata.

## 4. Come si scrive uno schema

```jsx
import { Svg, Wire, Flow, Lbl, Battery, Resistor, useAuto, Controls } from './kit'

export function Resistore ({ mode }) {
  const [r, setR] = useAuto(mode, [1, 2, 4], 1800)   // in auto scorre da solo tra i valori
  const i = 9 / (r * 100)                             // legge di Ohm, numeri veri
  return (
    <Fig caption="…" controls={mode === 'play' && <Slider …/>}>
      <Svg w={336} h={170} label="…descrizione per lettori di schermo…">
        …
      </Svg>
    </Fig>
  )
}
```

Pezzi disponibili in `kit.jsx` (usali invece di ridisegnare):
`Svg`, `Fig` (riquadro con didascalia e controlli), `Lbl`, `Wire` (filo), `Flow` (corrente che scorre lungo un percorso; `speed` proporzionale all'intensità), `Electrons` (pallini lungo un percorso, verso opposto), `Battery`, `Resistor`, `Coil`, `Magnet`, `Arrow`, `Plus`/`Minus`, `Seg` (pulsanti di stato), `Slider`, `useAuto(mode, valori, ms)`.

Animazioni generiche in `kit.css`: `.k-flow` (tratteggio che scorre, velocità con `--dur`), `.k-spin` / `.k-spin-rev` (rotazione, centro con `transformOrigin`), `.k-blink`, `.k-shake`. Per un meccanismo particolare scrivi keyframes dedicati con un prefisso unico.

Registra lo schema nel registro `VIS` con `{ C, caption, interactive }` e metti la chiave nella scheda (`diagram="…"`, e `sim=True` se è interattivo). `tools/build_data.py` blocca la pubblicazione se la chiave non esiste.

## 5. Verifica (sempre, prima di pubblicare)

1. `npm run build` senza errori.
2. Screenshot a 390×844 del feed e della scheda (Playwright con Chrome) in almeno due istanti dell'animazione e, per gli interattivi, per ogni stato.
3. Guarda gli screenshot e controlla, uno per uno: le frecce (verso giusto?), le etichette (si leggono, non si sovrappongono?), i numeri (coincidono con la formula?), la didascalia (dichiara semplificazioni e rallentamenti?).
4. Se qualcosa non torna, correggi e rifai lo screenshot. Solo dopo, pubblica.
5. Le animazioni si spengono con `prefers-reduced-motion`: lo schema deve restare comprensibile anche fermo (stato iniziale significativo).
