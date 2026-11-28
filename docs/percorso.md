# Percorso degli argomenti di Invenio

Il filo logico segue la strada di chi costruisce un oggetto elettronico: **capire che cosa scorre nei fili → conoscere i pezzi → collegarli e alimentarli → fargli sentire il mondo e muovere cose → dargli un cervello → farlo comunicare e mostrare → misurare e riparare**.

Ogni livello usa quello prima: i sensori hanno senso solo dopo resistenze e partitori, i microcontrollori solo dopo sensori e attuatori, i protocolli solo dopo i microcontrollori. Le categorie dentro ogni livello restano quelle dei cataloghi dei distributori (DigiKey).

Legenda: ✅ già nell'app · ⬜ da fare

## 1 · Fondamenti — che cosa scorre nei fili
- ✅ Tensione e corrente
- ✅ Collegamento in serie e in parallelo
- ✅ Corrente alternata
- ⬜ Potenza ed energia (watt e wattora)
- ⬜ Massa e riferimento

## 2 · Strumenti — misurare, montare, riparare
- ✅ Multimetro · ✅ Oscilloscopio · ✅ Saldatore · ✅ Alimentatore da banco
- ⬜ Analizzatore logico · ⬜ Basetta millefori e circuito stampato

## 3 · Componenti passivi
- ✅ Resistore · ✅ Potenziometro · ✅ Condensatore · ✅ Induttore · ✅ Quarzo · ✅ Fusibile
- ✅ Trasformatore · ✅ Pulsante e interruttore
- ⬜ Supercondensatore · ⬜ Ferrite e filtri

## 4 · Semiconduttori
- ✅ Diodo · ✅ LED · ✅ Transistor BJT · ✅ MOSFET · ✅ Ponte raddrizzatore
- ✅ Diodo Zener · ✅ Optoaccoppiatore · ✅ Amplificatore operazionale · ✅ Timer 555 · ✅ Porte logiche

## 5 · Collegare
- ✅ Morsetti a leva e a vite · ✅ Crimpaggio · ✅ Header e Dupont · ✅ USB-C · ✅ Jack DC · ✅ Coassiale · ✅ Breadboard · ✅ Guaina termorestringente
- ⬜ Sezione dei cavi (AWG e mm²)

## 6 · Alimentare
- ✅ Regolatore lineare · ✅ Step-down · ✅ Step-up · ✅ Batteria al litio · ✅ Ricarica TP4056 · ✅ Cella solare · ✅ Pila alcalina
- ⬜ Protezione batterie (BMS) · ⬜ Alimentatore switching da rete

## 7 · Sentire — sensori
- ✅ 15 sensori (distanza, movimento, Hall, temperatura, luce, forza, encoder, GPS…) · ✅ 6 sensori ambientali
- ⬜ IMU e giroscopio · ⬜ Magnetometro (bussola) · ⬜ Microfono MEMS · ⬜ Sensore di corrente · ⬜ Touch capacitivo · ⬜ Cella di carico + HX711 · ⬜ Ricevitore IR · ⬜ Reed e finecorsa

## 8 · Muovere — attuatori
- ✅ 14 attuatori (motori DC, BLDC, passo-passo, servo, solenoide, relè, piezo, Peltier, ponte H…)
- ⬜ Driver per passo-passo (A4988) · ⬜ ESC per motori brushless · ⬜ Ventola · ⬜ Pompa

## 9 · Pensare — elaborazione
- ✅ Microcontrollore · ✅ Convertitore analogico-digitale (ADC) · ✅ PWM · ⬜ Interrupt e timer · ⬜ Memorie (flash, EEPROM) · ⬜ Computer a scheda singola (Raspberry Pi)

## 10 · Comunicare
- ✅ Seriale UART · ✅ I²C · ✅ SPI · ✅ Wi-Fi e Bluetooth (ESP32) · ⬜ LoRa · ⬜ RFID e NFC

## 11 · Mostrare e suonare — interfacce
- ✅ LED indirizzabili (WS2812) · ⬜ Display LCD · ⬜ OLED · ⬜ E-paper · ⬜ Display a 7 segmenti · ⬜ Amplificatore audio in classe D · ⬜ DAC

## Ordine delle prossime ondate
1. ✅ **Fondamenti e strumenti**: erano il buco più grande alla base. Tutte le schede già presenti citano tensione, corrente, misure e saldature.
2. ✅ **Pensare + comunicare**: microcontrollore, ADC, PWM, UART, I²C, SPI, ESP32, LED indirizzabili. Collega sensori e attuatori già presenti.
3. ✅ **Semiconduttori 2**: Zener, optoaccoppiatore, amplificatore operazionale, 555, porte logiche.
4. **Interfacce** ← prossima: display, e-paper, 7 segmenti, audio (microfono, classe D, DAC).
5. **Sensori 2 e attuatori 2**: IMU, magnetometro, corrente, touch, cella di carico, IR, driver passo-passo, ESC, ventole e pompe.
6. **Radio e completamenti**: LoRa, RFID/NFC, BMS, alimentatore da rete, potenza ed energia, massa.

Ogni scheda nuova: testo dalla voce di Wikipedia citata, foto da Wikimedia Commons controllate a occhio, 1–2 domande di quiz, uno schema di funzionamento secondo la skill `invenio-schemi`.

## Percorsi tematici
Oltre al feed, l'app propone percorsi con un obiettivo concreto (definiti in `tools/content/percorsi.py`): Il tuo primo circuito · Accendere e regolare la luce · Stazione meteo connessa · Far muovere un robot · Un progetto a batteria · Il banco da lavoro · Magneti, bobine e motori · Segnali e logica · Dal sensore al telefono. Ogni passo è una scheda con una riga che spiega perché viene lì; il passo si completa con la spunta "studiato". Quando arrivano schede nuove, si aggiungono ai percorsi adatti o se ne crea uno nuovo.
