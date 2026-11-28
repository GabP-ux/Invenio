import { useEffect } from 'preact/hooks'
import { byId, breadcrumb, areaColor, principleById } from '../data'
import { state, markSeen, toggleSave, toggleStudied } from '../store'
import { VIS, Visual } from '../diagrams/registry'
import { Icon, WImg, Crumb, Back } from '../components/ui'

export function Detail ({ id }) {
  const c = byId.value[id]
  useEffect(() => { if (c) { markSeen(c.id); document.querySelector('.detail-scroll')?.scrollTo(0, 0) } }, [id])
  if (!c) return <div class="screen"><div class="topbar"><Back /></div><div class="empty">Scheda non trovata.</div></div>
  const saved = !!state.value.saved[c.id]
  const v = c.diagram && VIS[c.diagram]
  return (
    <div class="screen">
      <header class="topbar" style="padding:6px 8px;border-bottom:1px solid var(--line-soft)">
        <Back label="Indietro" />
        <span class="mono muted" style="font-size:12px;text-transform:uppercase">Scheda</span>
        <button class="icon-btn" style="color:#8FA8FF" aria-label={saved ? 'Togli dai salvati' : 'Salva la scheda'} aria-pressed={saved} onClick={() => toggleSave(c.id)}>
          <Icon.bookmark filled={saved} />
        </button>
      </header>
      <main class="scroll detail-scroll hide-sb">
        <div class="detail">
          <section style="display:flex;flex-direction:column;gap:8px">
            <Crumb color={areaColor(c)} text={breadcrumb(c)} />
            <h1>{c.name}</h1>
            {c.aka && <div class="muted" style="font-size:13px">{c.aka}</div>}
            <p style="margin:6px 0 0;font-size:15px;line-height:1.55;color:var(--text-2)">{c.short}</p>
          </section>

          {v && (v.interactive
            ? <section><h2 class="section-title">Prova tu</h2><Visual k={c.diagram} mode="play" /></section>
            : <Visual k={c.diagram} mode="play" />)}

          <section>
            <h2 class="section-title">Come funziona{c.principles.length ? ' · ' + principleById.value[c.principles[0]]?.name : ''}</h2>
            <div style="display:flex;flex-direction:column;gap:12px">
              {c.steps.map((s, i) => <div class="step" key={i}><span class="n">{i + 1}</span><p>{s}</p></div>)}
              {c.formula && <div class="card formula" style="border-radius:14px">{c.formula}</div>}
            </div>
          </section>

          {c.images.length > 0 && (
            <section>
              <h2 class="section-title">Nella realtà</h2>
              <div class="gallery hide-sb">
                {c.images.map(im => (
                  <figure key={im.file}>
                    <WImg class="gimg" src={im.src} alt={im.cap} style={im.fit === 'contain' ? `object-fit:contain;background:${im.bg};padding:12px` : ''} />
                    <figcaption>{im.cap}<br /><a href={im.page} target="_blank" rel="noopener">Foto: {im.credit} · Wikimedia Commons</a></figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}

          {c.variants.length > 0 && (
            <section>
              <h2 class="section-title">Ne esistono di vari tipi</h2>
              <div style="display:flex;flex-direction:column;gap:8px">
                {c.variants.map(v => <div class="card variant" key={v.name}><b>{v.name}</b><span>{v.text}</span></div>)}
              </div>
            </section>
          )}

          {c.note && <div class="card" style="padding:12px 14px;border-radius:14px;font-size:13px;line-height:1.5;color:#C9CED8;border-color:#3A3420;background:rgba(240,180,76,.06)"><b style="color:#F0B44C">Da sapere · </b>{c.note}</div>}

          {c.uses.length > 0 && (
            <section>
              <h2 class="section-title">Dove lo trovi</h2>
              <div class="chips">{c.uses.map(u => <span class="chip" key={u}>{u}</span>)}</div>
            </section>
          )}

          <section>
            <h2 class="section-title">Principio</h2>
            {c.principles.map(pid => {
              const p = principleById.value[pid]
              return p && (
                <a key={pid} href={'#/mappa/' + pid} class="card" style="display:block;padding:12px 14px;border-radius:14px;text-decoration:none;color:var(--text);margin-bottom:8px">
                  <b style="font-family:var(--display)">{p.name}</b>
                  <div style="font-size:13px;line-height:1.45;color:#A0A7B4;margin-top:4px">{p.text}</div>
                </a>
              )
            })}
          </section>

          {c.related.length > 0 && (
            <section>
              <h2 class="section-title">Collegato a</h2>
              <div class="rel">
                {c.related.map(r => {
                  const rc = byId.value[r]; if (!rc) return null
                  const seen = !!state.value.seen[r]
                  return <a key={r} href={'#/t/' + r} class={seen ? '' : 'unseen'}><b style="font-size:14px">{rc.name}</b><small>{seen ? 'già vista' : 'da scoprire'}</small></a>
                })}
              </div>
            </section>
          )}

          <Studied id={c.id} />
          <a class="btn" style="border-color:#8FA8FF;color:#8FA8FF" href={'#/mappa/' + c.id}><Icon.map s={18} />Vedi sulla mappa</a>
          <div style="font-size:12px;color:#A0A7B4;border-top:1px solid var(--line-soft);padding-top:14px">
            Testo basato su: <a href={c.source.url} target="_blank" rel="noopener">{c.source.title}</a>
          </div>
        </div>
      </main>
    </div>
  )
}

// A fine scheda: sei tu a confermare di aver capito e studiato il concetto
function Studied ({ id }) {
  const at = state.value.studied[id]
  const date = at && new Date(at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })
  return (
    <section class={'studied' + (at ? ' on' : '')}>
      <button role="checkbox" aria-checked={!!at} onClick={() => toggleStudied(id)}>
        <span class="box">{at && <Icon.check s={20} />}</span>
        <span style="display:flex;flex-direction:column;gap:2px;text-align:left">
          <b>{at ? 'Concetto studiato' : 'Ho capito e studiato questo concetto'}</b>
          <small>{at ? `Spuntato il ${date} · tocca per togliere la spunta` : 'Spunta quando sapresti spiegarlo con parole tue'}</small>
        </span>
      </button>
    </section>
  )
}
