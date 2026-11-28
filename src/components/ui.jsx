import { useEffect, useRef, useState } from 'preact/hooks'
import { route } from '../router'

const S = { fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' }
export const Icon = {
  feed: () => <svg width="22" height="22" viewBox="0 0 24 24" {...S}><rect x="5" y="3" width="14" height="18" rx="3" /><path d="M9 8h6M9 12h6M9 16h3" /></svg>,
  map: (p = {}) => <svg width={p.s || 22} height={p.s || 22} viewBox="0 0 24 24" {...S}><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="7" r="2.5" /><circle cx="12" cy="18" r="2.5" /><path d="M8.3 7.1l7.3.6M7.2 8.2l3.6 7.6M16.9 9.2l-3.8 6.8" /></svg>,
  quiz: () => <svg width="22" height="22" viewBox="0 0 24 24" {...S}><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14" /><path d="M12 17.5h.01" /></svg>,
  bookmark: (p = {}) => <svg width={p.s || 22} height={p.s || 22} viewBox="0 0 24 24" {...S} fill={p.filled ? 'currentColor' : 'none'}><path d="M6 3h12v18l-6-4-6 4z" /></svg>,
  back: () => <svg width="20" height="20" viewBox="0 0 24 24" {...S} stroke-width="2"><path d="M15 6l-6 6 6 6" /></svg>,
  arrow: () => <svg width="18" height="18" viewBox="0 0 24 24" {...S} stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>,
  folder: () => <svg width="20" height="20" viewBox="0 0 24 24" {...S} stroke="#8FA8FF"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>,
  plus: () => <svg width="16" height="16" viewBox="0 0 24 24" {...S} stroke-width="2"><path d="M12 5v14M5 12h14" /></svg>,
  more: () => <svg width="22" height="22" viewBox="0 0 24 24" {...S}><circle cx="5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="19" cy="12" r="1.3" /></svg>,
  gear: () => <svg width="22" height="22" viewBox="0 0 24 24" {...S}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>,
  check: (p = {}) => <svg width={p.s || 18} height={p.s || 18} viewBox="0 0 24 24" {...S} stroke-width="2.4"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>,
  logo: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8FA8FF" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="9" stroke-opacity=".4" /></svg>
}

export function Nav ({ current }) {
  const items = [['feed', 'Feed', Icon.feed], ['mappa', 'Mappa', Icon.map], ['quiz', 'Quiz', Icon.quiz], ['salvati', 'Salvati', Icon.bookmark]]
  return (
    <nav class="nav" aria-label="Navigazione principale">
      {items.map(([k, label, I]) => (
        <a key={k} href={'#/' + k} aria-current={current === k ? 'page' : undefined}>
          <span class="pill">{k === 'salvati' ? <I filled={current === k} /> : <I />}</span>{label}
        </a>
      ))}
    </nav>
  )
}

// Immagine da Wikimedia: caricamento pigro e riserva se non si carica
export function WImg ({ src, alt, class: cls, style }) {
  const [err, setErr] = useState(false)
  if (err) return <div class={cls} style={(style || '') + ';display:flex;align-items:center;justify-content:center;color:#A0A7B4;font-size:12px;text-align:center;padding:8px'} role="img" aria-label={alt}>{alt ? 'Immagine non disponibile' : ''}</div>
  return <img src={src} alt={alt} class={cls} style={style} loading="lazy" decoding="async" onError={() => setErr(true)} />
}

export function Crumb ({ color, text }) {
  return <div class="crumb"><span class="dot" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />{text}</div>
}

export function Back ({ to = 'feed', label = 'Indietro' }) {
  return (
    <button class="btn small" style="border:0;padding:0 8px" onClick={() => history.length > 1 ? history.back() : route(to)}>
      <Icon.back />{label}
    </button>
  )
}

// Foglio dal basso (dialog nativo)
export function Sheet ({ open, onClose, children, label }) {
  const ref = useRef()
  useEffect(() => { const d = ref.current; if (!d) return; if (open && !d.open) d.showModal(); if (!open && d.open) d.close() }, [open])
  return <dialog ref={ref} class="sheet-dlg" aria-label={label} onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose() }}><div class="dlg">{children}</div></dialog>
}
