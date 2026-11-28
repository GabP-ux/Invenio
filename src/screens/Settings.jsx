// Impostazioni: percorso, preferenze, backup e azzeramento dei progressi.
import { useEffect, useState } from 'preact/hooks'
import { cards, index } from '../data'
import { state, setSetting, resetProgress, exportBackup, importBackup } from '../store'
import { session } from './Quiz'
import { Back, Sheet, Icon } from '../components/ui'

function Toggle ({ label, desc, on, set }) {
  return (
    <button class="set-row" role="switch" aria-checked={on} onClick={() => set(!on)}>
      <span style="display:flex;flex-direction:column;gap:2px;text-align:left"><b>{label}</b>{desc && <small>{desc}</small>}</span>
      <span class={'switch' + (on ? ' on' : '')} aria-hidden="true"><span /></span>
    </button>
  )
}

export function Settings () {
  const s = state.value
  const total = cards.value.length
  const seen = Object.keys(s.seen).length, studied = Object.keys(s.studied).length, answered = Object.keys(s.quiz).length
  const [msg, setMsg] = useState(''); const [usage, setUsage] = useState('')
  const [reset, setReset] = useState(false); const [alsoSaved, setAlsoSaved] = useState(false); const [done, setDone] = useState(false)
  useEffect(() => { navigator.storage?.estimate?.().then(e => setUsage(`${(e.usage / 1048576).toFixed(1)} MB usati sul telefono`)).catch(() => {}) }, [])
  const bar = (n) => <div class="bar"><div style={{ width: (total ? n / total * 100 : 0) + '%', background: 'var(--accent)' }} /></div>
  return (
    <div class="screen">
      <header class="topbar" style="padding:6px 8px;border-bottom:1px solid var(--line-soft)">
        <Back label="Indietro" />
        <span class="mono muted" style="font-size:12px;text-transform:uppercase">Impostazioni</span>
        <span style="width:40px" />
      </header>
      <main class="scroll hide-sb settings">
        <section>
          <h2 class="section-title">Il tuo percorso</h2>
          <div class="card set-card">
            <div class="set-stat"><span>Schede viste</span><b class="mono">{seen} / {total}</b></div>{bar(seen)}
            <div class="set-stat"><span>Concetti studiati</span><b class="mono">{studied} / {total}</b></div>{bar(studied)}
            <div class="set-stat"><span>Domande del quiz affrontate</span><b class="mono">{answered}</b></div>
            <a class="btn small" href="#/mappa" onClick={() => { try { localStorage.setItem('mapTab', 'areas') } catch (e) {} }} style="align-self:flex-start">Vedi i livelli del percorso <Icon.arrow /></a>
          </div>
        </section>

        <section>
          <h2 class="section-title">Preferenze</h2>
          <div class="card set-card" style="gap:0;padding:4px 14px">
            <Toggle label="Feed nell'ordine del percorso" desc={'Le schede nuove arrivano dai fondamenti in su. Se spento, ordine casuale ogni giorno.'} on={s.settings.feedOrder === 'percorso'} set={(v) => setSetting('feedOrder', v ? 'percorso' : 'casuale')} />
            <Toggle label="Riduci le animazioni" desc="Ferma il movimento degli schemi e della costellazione." on={s.settings.calm} set={(v) => setSetting('calm', v)} />
          </div>
        </section>

        <section>
          <h2 class="section-title">Backup</h2>
          <div class="card set-card">
            <p class="muted" style="margin:0;font-size:13px;line-height:1.5">Progressi, spunte, salvati e cartelle restano solo su questo telefono. Esporta un file ogni tanto per non perderli.</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <button class="btn primary" onClick={exportBackup}>Esporta backup</button>
              <label class="btn" style="cursor:pointer">Importa
                <input type="file" accept="application/json" style="display:none" onChange={async (e) => { try { await importBackup(e.currentTarget.files[0]); setMsg('Backup importato.') } catch (err) { setMsg('File non valido.') } }} />
              </label>
            </div>
            {msg && <div role="status" style="font-size:13px">{msg}</div>}
            {usage && <div class="mono muted" style="font-size:11px">{usage}</div>}
          </div>
        </section>

        <section>
          <h2 class="section-title" style="color:#F28C6B">Azzera</h2>
          <div class="card set-card danger">
            <p style="margin:0;font-size:13px;line-height:1.5;color:var(--text-2)">Ricomincia da capo: cancella schede viste, concetti studiati, risultati e record dei quiz.</p>
            <button class="btn danger-btn" onClick={() => { setDone(false); setReset(true) }}>Azzera tutti i progressi</button>
            {done && <div role="status" style="font-size:13px;color:#6FD3C1">Progressi azzerati.</div>}
          </div>
        </section>

        <section class="muted" style="font-size:12px;line-height:1.55">
          Invenio · {total} schede in {index.value.packs.length} pacchetti. Testi basati su Wikipedia; foto da Wikimedia Commons, con autore e licenza indicati sotto ogni immagine. Schemi disegnati per l'app.
        </section>
      </main>

      <Sheet open={reset} onClose={() => setReset(false)} label="Azzera i progressi">
        <div style="font-family:var(--display);font-size:18px;font-weight:600">Azzerare tutti i progressi?</div>
        <p style="margin:0;font-size:13px;line-height:1.5;color:var(--text-2)">Verranno cancellati: {seen} schede viste, {studied} concetti studiati, i risultati di {answered} domande e il record del quiz Lampo. Non si può annullare: se vuoi, esporta prima un backup.</p>
        <label class="set-check"><input type="checkbox" checked={alsoSaved} onChange={(e) => setAlsoSaved(e.currentTarget.checked)} /> Cancella anche salvati e cartelle ({Object.keys(s.saved).length} schede, {s.folders.length} cartelle)</label>
        <button class="btn" onClick={exportBackup}>Esporta prima un backup</button>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <button class="btn" onClick={() => setReset(false)}>Annulla</button>
          <button class="btn danger-btn" onClick={() => { resetProgress(alsoSaved); session.value = null; setReset(false); setDone(true); setAlsoSaved(false) }}>Azzera</button>
        </div>
      </Sheet>
    </div>
  )
}
