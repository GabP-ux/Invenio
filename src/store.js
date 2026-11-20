// Stato personale di Invenio: resta solo sul telefono (IndexedDB).
import { get, set } from 'idb-keyval'
import { signal, effect } from '@preact/signals'

const KEY = 'invenio-stato-v1'

const empty = () => ({
  seen: {},          // id scheda -> timestamp della prima visione
  saved: {},         // id scheda -> { folder: id cartella | null, at }
  folders: [],       // [{ id, name }]
  quiz: {},          // "idScheda:indice" -> { box, due }
  persistAsked: false
})

export const state = signal(empty())
export const ready = signal(false)

export async function loadState () {
  try {
    const s = await get(KEY)
    if (s) state.value = { ...empty(), ...s }
  } catch (e) { /* storage non disponibile: si lavora in memoria */ }
  ready.value = true
  effect(() => {
    const v = state.value
    if (ready.value) set(KEY, v).catch(() => {})
  })
}

const update = (fn) => { const s = structuredClone(state.value); fn(s); state.value = s }

async function askPersist () {
  if (state.value.persistAsked) return
  update(s => { s.persistAsked = true })
  try { if (navigator.storage && navigator.storage.persist) await navigator.storage.persist() } catch (e) {}
}

export const markSeen = (id) => {
  if (state.value.seen[id]) return
  update(s => { s.seen[id] = Date.now() })
}

export const isSaved = (id) => !!state.value.saved[id]

export const toggleSave = (id) => {
  let nowSaved = false
  update(s => {
    if (s.saved[id]) delete s.saved[id]
    else { s.saved[id] = { folder: null, at: Date.now() }; nowSaved = true }
  })
  if (nowSaved) askPersist()
  return nowSaved
}

export const moveToFolder = (id, folder) => update(s => {
  if (!s.saved[id]) s.saved[id] = { folder, at: Date.now() }
  else s.saved[id].folder = folder
})

export const addFolder = (name) => {
  const id = 'f' + Date.now().toString(36)
  update(s => { s.folders.push({ id, name: name.trim() }) })
  return id
}
export const renameFolder = (id, name) => update(s => {
  const f = s.folders.find(f => f.id === id); if (f) f.name = name.trim()
})
export const deleteFolder = (id) => update(s => {
  s.folders = s.folders.filter(f => f.id !== id)
  Object.values(s.saved).forEach(v => { if (v.folder === id) v.folder = null })
})

// Ripasso a "scatole" (metodo Leitner): ogni risposta giusta sposta la domanda
// in una scatola che torna dopo più giorni; una sbagliata la riporta all'inizio.
const DAYS = [0, 1, 3, 7, 16, 35]
const DAY = 86400000
export const answerQuiz = (key, correct) => update(s => {
  const cur = s.quiz[key] || { box: 0, due: 0 }
  const box = correct ? Math.min(cur.box + 1, DAYS.length - 1) : 1
  const wait = correct ? DAYS[box] : 1
  s.quiz[key] = { box, due: Date.now() + wait * DAY }
})

// Backup: esporta e importa lo stato in un file
export function exportBackup () {
  const blob = new Blob([JSON.stringify({ app: 'invenio', v: 1, at: new Date().toISOString(), state: state.value }, null, 1)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'invenio-backup-' + new Date().toISOString().slice(0, 10) + '.json'
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}
export async function importBackup (file) {
  const data = JSON.parse(await file.text())
  if (data.app !== 'invenio' || !data.state) throw new Error('File non valido')
  state.value = { ...empty(), ...data.state }
}
