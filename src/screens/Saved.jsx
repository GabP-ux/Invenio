import { useEffect, useRef, useState } from 'preact/hooks'
import { byId, index, breadcrumb, areaById, subById } from '../data'
import { state, moveToFolder, addFolder, renameFolder, deleteFolder, toggleSave } from '../store'
import { Icon, WImg, Sheet } from '../components/ui'


function Row ({ id, onMove }) {
  const c = byId.value[id]; if (!c) return null
  const im = c.images[0]
  return (
    <div class="list-row">
      <a href={'#/t/' + id} style="display:flex;align-items:center;gap:12px;min-width:0;flex:1;text-decoration:none;color:inherit">
        {im ? <WImg class="thumb" src={im.thumb} alt="" /> : <div class="thumb" />}
        <span style="min-width:0"><b style="font-size:15px">{c.name}</b><small>{breadcrumb(c)}</small></span>
      </a>
      <button class="btn small" onClick={() => onMove(id)}>Sposta</button>
    </div>
  )
}

function MoveSheet ({ id, onClose }) {
  const [name, setName] = useState('')
  if (!id) return <Sheet open={false} onClose={onClose} />
  const c = byId.value[id]; const cur = state.value.saved[id]?.folder ?? null
  const choose = (f) => { moveToFolder(id, f); onClose() }
  return (
    <Sheet open onClose={onClose} label="Sposta in una cartella">
      <div style="font-family:var(--display);font-size:18px;font-weight:600">Sposta "{c?.name}"</div>
      {[{ id: null, name: 'Senza cartella' }, ...state.value.folders].map(f =>
        <button key={f.id ?? 'none'} class={'btn' + (cur === f.id ? ' on' : '')} style="justify-content:flex-start" onClick={() => choose(f.id)}><Icon.folder />{f.name}</button>)}
      <form class="field" onSubmit={(e) => { e.preventDefault(); if (name.trim()) choose(addFolder(name)) }}>
        <input value={name} onInput={e => setName(e.currentTarget.value)} placeholder="Nuova cartella di progetto…" aria-label="Nome nuova cartella" />
        <button class="btn primary" type="submit">Crea</button>
      </form>
      <button class="btn" style="color:#F28C6B;border-color:#3A2A26" onClick={() => { toggleSave(id); onClose() }}>Togli dai salvati</button>
    </Sheet>
  )
}

function Projects ({ onMove }) {
  const [open, setOpen] = useState(null)
  const [editing, setEditing] = useState(null)
  const saved = state.value.saved
  const ids = Object.keys(saved).sort((a, b) => saved[b].at - saved[a].at)
  const loose = ids.filter(id => !saved[id].folder)
  return (
    <div style="display:flex;flex-direction:column;gap:10px">
      <h2 class="section-title" style="margin:0">Cartelle di progetto</h2>
      {state.value.folders.length === 0 && <div class="muted" style="font-size:13px">Nessuna cartella. Creane una per raccogliere le idee di un progetto.</div>}
      {state.value.folders.map(f => {
        const items = ids.filter(id => saved[id].folder === f.id); const isOpen = open === f.id
        return (
          <div key={f.id} class="card" style="overflow:hidden">
            <button class="folder" style="background:none;border:0" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : f.id)}>
              <span style="display:flex;align-items:center;justify-content:space-between;width:100%">
                <span style="display:flex;align-items:center;gap:10px;font-size:15px;font-weight:600"><Icon.folder />{f.name}</span>
                <span class="muted" style="font-size:12px">{items.length} {items.length === 1 ? 'scheda' : 'schede'}</span>
              </span>
              {!isOpen && items.length > 0 && <span class="chips">{items.slice(0, 4).map(id => <span key={id} class="chip">{byId.value[id]?.name}</span>)}</span>}
            </button>
            {isOpen && (
              <div style="padding:0 12px 12px;display:flex;flex-direction:column;gap:8px">
                {items.length > 0 ? <div class="list">{items.map(id => <Row key={id} id={id} onMove={onMove} />)}</div> : <div class="muted" style="font-size:13px">Cartella vuota: aggiungi schede con "Sposta".</div>}
                {editing === f.id
                  ? <form class="field" onSubmit={(e) => { e.preventDefault(); const v = e.currentTarget.elements.n.value; if (v.trim()) renameFolder(f.id, v); setEditing(null) }}>
                    <input name="n" defaultValue={f.name} aria-label="Nuovo nome" /><button class="btn primary" type="submit">OK</button></form>
                  : <div style="display:flex;gap:8px"><button class="btn small" onClick={() => setEditing(f.id)}>Rinomina</button>
                    <button class="btn small" style="color:#F28C6B" onClick={() => { if (confirm(`Eliminare la cartella "${f.name}"? Le schede restano nei salvati.`)) deleteFolder(f.id) }}>Elimina</button></div>}
              </div>
            )}
          </div>
        )
      })}
      <h2 class="section-title" style="margin:8px 0 0">Senza cartella</h2>
      {loose.length ? <div class="list">{loose.map(id => <Row key={id} id={id} onMove={onMove} />)}</div>
        : <div class="muted" style="font-size:13px">Qui finiscono le schede che salvi dal feed.</div>}
    </div>
  )
}

function ByCategory ({ onMove }) {
  const [area, setArea] = useState('tutte')
  const ids = Object.keys(state.value.saved).filter(id => byId.value[id])
  const areas = index.value.areas.filter(a => ids.some(id => byId.value[id].area === a.id))
  const shown = ids.filter(id => area === 'tutte' || byId.value[id].area === area)
  const groups = {}
  shown.forEach(id => { const c = byId.value[id]; (groups[c.area + '|' + c.sub] ||= []).push(id) })
  return (
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="chips" role="group" aria-label="Filtra per area">
        {[{ id: 'tutte', name: 'Tutte' }, ...areas].map(a => {
          const n = a.id === 'tutte' ? ids.length : ids.filter(id => byId.value[id].area === a.id).length
          return <button key={a.id} class="btn small" aria-pressed={area === a.id} style={area === a.id ? 'background:#ECEEF3;color:#0B0D12;border-color:#ECEEF3;font-weight:600' : ''} onClick={() => setArea(a.id)}>{a.name} · {n}</button>
        })}
      </div>
      {Object.entries(groups).map(([k, list]) => {
        const [a, s] = k.split('|')
        return (
          <section key={k} style="display:flex;flex-direction:column;gap:6px">
            <div class="crumb"><span class="dot" style={{ background: areaById.value[a]?.color }} />{areaById.value[a]?.name} › {subById.value[s]?.name}</div>
            <div class="list">{list.map(id => <Row key={id} id={id} onMove={onMove} />)}</div>
          </section>
        )
      })}
    </div>
  )
}

export function Saved () {
  const [tab, setTab] = useState('progetti')
  const [moving, setMoving] = useState(null)
  const [newF, setNewF] = useState(false)
  const count = Object.keys(state.value.saved).length
  return (
    <div class="screen">
      <header class="topbar">
        <h1>Salvati</h1>
        <div style="display:flex;gap:4px">
          <button class="btn small" onClick={() => setNewF(true)}><Icon.plus />Cartella</button>
          <a class="icon-btn" aria-label="Impostazioni e backup" href="#/impostazioni" style="color:#A0A7B4"><Icon.gear /></a>
        </div>
      </header>
      <div style="padding:0 16px 12px">
        <div class="seg" role="group" aria-label="Organizza i salvati">
          <button aria-pressed={tab === 'progetti'} onClick={() => setTab('progetti')}>Progetti</button>
          <button aria-pressed={tab === 'categoria'} onClick={() => setTab('categoria')}>Per categoria</button>
        </div>
      </div>
      <main class="scroll hide-sb" style="padding:0 16px 20px">
        {count === 0 && tab === 'categoria'
          ? <div class="empty">Ancora nessuna scheda salvata.<br />Tocca "Salva" nel feed o in una scheda.</div>
          : tab === 'progetti' ? <Projects onMove={setMoving} /> : <ByCategory onMove={setMoving} />}
      </main>
      <MoveSheet id={moving} onClose={() => setMoving(null)} />
      <Sheet open={newF} onClose={() => setNewF(false)} label="Nuova cartella">
        <div style="font-family:var(--display);font-size:18px;font-weight:600">Nuova cartella di progetto</div>
        <form class="field" onSubmit={(e) => { e.preventDefault(); const v = e.currentTarget.elements.n.value; if (v.trim()) { addFolder(v); setNewF(false); e.currentTarget.reset() } }}>
          <input name="n" placeholder="es. Stazione meteo" aria-label="Nome cartella" /><button class="btn primary" type="submit">Crea</button>
        </form>
      </Sheet>
    </div>
  )
}
