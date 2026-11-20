# Invenio

App personale per scoprire come funzionano le tecnologie: feed di schede, mappa delle connessioni, quiz sulle schede già viste e salvati organizzati in cartelle.

È un'**app web installabile** (PWA): si apre dal browser, si aggiunge alla schermata Home e funziona anche offline.

## Come è fatta

| Cartella | Contenuto |
|---|---|
| `src/` | Il codice dell'app (Preact, molto leggero) |
| `src/screens/` | Le schermate: Feed, Scheda, Mappa, Quiz, Salvati |
| `src/diagrams/` | Gli schemi animati e i simulatori |
| `public/data/` | **I contenuti**: `index.json` (aree, categorie, principi) e un file per ogni pacchetto di schede (`sensori.json`) |
| `tools/build_data.py` | Lo script che genera i file in `public/data/` |

I tuoi dati personali (salvati, cartelle, quiz) restano solo sul telefono. Dal menu `•••` in Salvati puoi esportare un backup.

Le immagini non sono dentro l'app: vengono caricate da Wikimedia Commons quando apri una scheda, poi restano in memoria per l'offline (al massimo 400 immagini, le più vecchie si cancellano da sole).

## Pubblicarla (una volta sola)

Ti serve un posto online che serva i file dell'app. La cartella da caricare è il contenuto di **`invenio-app.zip`** (già pronta).

### Opzione A – Hostinger (che usi già)

1. Entra nel pannello di Hostinger e apri il **File Manager** del dominio che vuoi usare.
2. Dentro `public_html` crea una cartella, per esempio `invenio`.
3. Carica il file `invenio-app.zip` dentro quella cartella e usa **Estrai** (Extract). Alla fine nella cartella devi vedere `index.html`, `sw.js`, `manifest.webmanifest` e le cartelle `assets`, `data`, `icons`.
4. L'app sarà su `https://tuodominio/invenio/`. Serve HTTPS (il lucchetto), altrimenti l'offline non funziona.

### Opzione B – GitHub Pages (gratis)

1. Su github.com crea un repository **pubblico** chiamato `invenio`.
2. Clicca **Add file › Upload files** e trascina **il contenuto** di `invenio-app.zip` (estratto), non lo zip.
3. Vai su **Settings › Pages**, in *Source* scegli **Deploy from a branch**, branch `main`, cartella `/ (root)`, e salva.
4. Dopo un minuto l'app è su `https://tuonome.github.io/invenio/`.

Se colleghi GitHub a Claude (Impostazioni di claude.ai › Connettori), le prossime versioni le posso pubblicare io direttamente.

## Installarla sul telefono

### Android (Chrome)
1. Apri **Chrome** e vai all'indirizzo dell'app.
2. Aspetta che la pagina sia caricata del tutto (qualche secondo la prima volta: scarica l'app per l'uso offline).
3. Tocca il menu **⋮** in alto a destra → **Installa app** (su alcuni telefoni la voce si chiama **Aggiungi a schermata Home** → poi **Installa**).
4. Conferma: l'icona di Invenio compare tra le app. Da lì si apre a schermo intero, senza barra del browser.
5. Per provare l'offline: attiva la modalità aereo e apri l'icona. Le schede si vedono; le foto solo se le avevi già aperte.

### iPhone (Safari) – per farla provare a qualcuno
1. Apri l'indirizzo con **Safari** (non con un'altra app o browser).
2. Tocca il tasto **Condividi** (il quadrato con la freccia verso l'alto).
3. Scorri e scegli **Aggiungi alla schermata Home** → **Aggiungi**.
4. Usarla sempre dall'icona: Safari cancella i dati dei siti non aperti per 7 giorni, ma non quelli delle app aggiunte alla Home.

## Aggiornare i contenuti

1. Le nuove schede si aggiungono in `tools/build_data.py` (o in un nuovo pacchetto).
2. `python3 tools/build_data.py` rigenera i file in `public/data/` e controlla che collegamenti, principi e risposte del quiz siano coerenti.
3. `npm install` (solo la prima volta), poi `npm run build`: la cartella `dist/` è la nuova versione da caricare al posto della vecchia.

L'app si aggiorna da sola sul telefono alla prossima apertura con connessione.
