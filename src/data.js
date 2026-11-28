// Caricamento dei contenuti: indice + pacchetti di schede (file JSON statici).
import { signal, computed } from '@preact/signals'

export const index = signal(null)
export const cards = signal([])
export const loadError = signal(null)

const BASE = import.meta.env.BASE_URL + 'data/'

export async function loadData () {
  try {
    const idx = await (await fetch(BASE + 'index.json')).json()
    const packs = await Promise.all(idx.packs.map(p => fetch(BASE + p.file).then(r => r.json())))
    index.value = idx
    cards.value = packs.flatMap(p => p.cards)
  } catch (e) {
    loadError.value = 'Non riesco a caricare i contenuti. Controlla la connessione e riprova.'
  }
}

export const byId = computed(() => Object.fromEntries(cards.value.map(c => [c.id, c])))
export const areaById = computed(() => Object.fromEntries((index.value?.areas || []).map(a => [a.id, a])))
export const subById = computed(() => Object.fromEntries((index.value?.subs || []).map(s => [s.id, s])))
export const principleById = computed(() => Object.fromEntries((index.value?.principles || []).map(p => [p.id, p])))

export const breadcrumb = (c) => {
  const a = areaById.value[c.area]; const s = subById.value[c.sub]
  return [a?.name, s?.name].filter(Boolean).join(' › ')
}
export const areaColor = (c) => areaById.value[c.area]?.color || '#F0B44C'

// Livello del percorso (0 = Fondamenti …) a cui appartiene l'area di una scheda
export const levelIndexOfArea = computed(() => {
  const m = {}; (index.value?.levels || []).forEach((l, i) => l.areas.forEach(a => { m[a] = i })); return m
})
export const levelOf = (c) => levelIndexOfArea.value[c.area] ?? 99
