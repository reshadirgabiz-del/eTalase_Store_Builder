// Template catalogue page — grid of all templates, filter by category,
// click a card to open a full preview modal, then select.

const CAT_CSS = `
.cat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
@media (max-width: 980px) { .cat-grid { grid-template-columns: repeat(2, 1fr); gap: 18px; } }
@media (max-width: 600px) { .cat-grid { grid-template-columns: 1fr; } }
.cat-card { cursor: pointer; transition: transform 0.25s cubic-bezier(0.22,1,0.36,1); }
.cat-card:hover { transform: translateY(-5px); }
.cat-card:hover .cat-overlay { opacity: 1; }
.cat-card:hover .cat-thumb { box-shadow: 0 32px 60px -30px rgba(28,26,20,0.5); }
.cat-modal-grid { display: grid; grid-template-columns: minmax(0,1.45fr) minmax(0,1fr); }
@media (max-width: 840px) { .cat-modal-grid { grid-template-columns: 1fr; } }
.cat-chip { cursor: pointer; transition: all 0.2s; white-space: nowrap; }
@keyframes cat-modal-in { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: none; } }
@keyframes cat-fade { from { opacity: 0; } to { opacity: 1; } }
`;

function CatToolbar() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: 'var(--nav-py) var(--gutter)', borderBottom: '1px solid var(--hi-line)',
      background: 'color-mix(in oklch, var(--hi-paper) 86%, transparent)',
      backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      position: 'sticky', top: 0, zIndex: 40,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <a href="Builder Landing.html" style={{
          display: 'inline-flex', alignItems: 'center', gap: 7, textDecoration: 'none',
          padding: '7px 13px', borderRadius: 999, border: '1px solid var(--hi-line)',
          background: 'var(--hi-card)', color: 'var(--hi-ink)',
          fontFamily: 'var(--hi-sans)', fontSize: 13,
        }}><span style={{ fontFamily: 'var(--hi-mono)' }}>←</span> Kembali</a>
        <BracketWordmark size={22} />
      </div>
      <span style={{
        padding: '3px 9px', borderRadius: 999,
        border: '1px solid color-mix(in oklch, var(--c-sage) 38%, var(--hi-line))',
        background: 'color-mix(in oklch, var(--c-sage) 12%, var(--hi-paper))',
        color: 'var(--c-sage)', fontFamily: 'var(--hi-mono)', fontSize: 9,
        letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap',
      }}>Katalog Template</span>
    </div>
  );
}

function CatCard({ tpl, onOpen }) {
  return (
    <div className="cat-card" onClick={() => onOpen(tpl)}>
      <div className="cat-thumb" style={{
        position: 'relative', borderRadius: 14, overflow: 'hidden',
        border: '1px solid var(--hi-line)', background: 'var(--hi-card)',
        aspectRatio: '4 / 5', transition: 'box-shadow 0.25s',
      }}>
        <TemplatePreview tpl={tpl} />
        <div className="cat-overlay" style={{
          position: 'absolute', inset: 0, opacity: 0, transition: 'opacity 0.25s',
          background: 'linear-gradient(180deg, color-mix(in oklch, var(--hi-ink) 8%, transparent), color-mix(in oklch, var(--hi-ink) 40%, transparent))',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 20,
        }}>
          <span style={{
            padding: '10px 20px', borderRadius: 999, background: 'var(--hi-paper)', color: 'var(--hi-ink)',
            fontFamily: 'var(--hi-sans)', fontSize: 13.5, fontWeight: 500,
            boxShadow: '0 14px 34px -14px rgba(0,0,0,0.5)',
          }}>Pratinjau & pilih →</span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 12, padding: '0 2px' }}>
        <div>
          <div style={{ fontFamily: 'var(--hi-serif)', fontSize: 19, color: 'var(--hi-ink)', lineHeight: 1 }}>{tpl.name}</div>
          <div style={{ fontFamily: 'var(--hi-sans)', fontSize: 12.5, color: 'var(--hi-muted)', marginTop: 5 }}>{tpl.blurb.split('.')[0]}.</div>
        </div>
        <span style={{
          flex: 'none', padding: '4px 9px', borderRadius: 999,
          background: 'color-mix(in oklch, var(--accent) 12%, var(--hi-paper))',
          color: 'var(--accent)', fontFamily: 'var(--hi-mono)', fontSize: 9,
          letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>{tpl.cat}</span>
      </div>
    </div>
  );
}

function PreviewModal({ tpl, onClose }) {
  const [chosen, setChosen] = React.useState(false);
  const [device, setDevice] = React.useState('desktop');
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  const features = [
    'Responsif di HP, tablet, dan desktop',
    'Domain & hosting sudah termasuk',
    'Foto produk dan teks bisa diganti sendiri',
    'Siap tayang dalam hitungan menit',
  ];

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100, padding: 'clamp(12px, 4vw, 40px)',
      background: 'color-mix(in oklch, var(--hi-ink) 55%, transparent)',
      backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'cat-fade 0.25s ease',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 'min(1120px, 100%)', maxHeight: '92vh', overflow: 'hidden',
        background: 'var(--hi-paper)', borderRadius: 22, border: '1px solid var(--hi-line)',
        boxShadow: '0 50px 120px -40px rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column',
        animation: 'cat-modal-in 0.4s cubic-bezier(0.22,1,0.36,1)',
      }}>
        <div className="cat-modal-grid" style={{ flex: 1, minHeight: 0 }}>
          {/* Preview pane */}
          <div style={{ background: 'var(--hi-chrome)', padding: 'clamp(16px,3vw,30px)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <Kicker color="var(--hi-muted)">Pratinjau langsung</Kicker>
              <div style={{ display: 'flex', gap: 4, background: 'var(--hi-paper)', borderRadius: 999, padding: 3, border: '1px solid var(--hi-line)' }}>
                {[['desktop', 'Desktop'], ['mobile', 'HP']].map(([d, l]) => (
                  <button key={d} onClick={() => setDevice(d)} style={{
                    padding: '5px 13px', borderRadius: 999, border: 'none', cursor: 'pointer',
                    background: device === d ? 'var(--hi-ink)' : 'transparent',
                    color: device === d ? 'var(--hi-paper)' : 'var(--hi-muted)',
                    fontFamily: 'var(--hi-sans)', fontSize: 12, fontWeight: 500,
                  }}>{l}</button>
                ))}
              </div>
            </div>
            {/* browser/device frame */}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
              <div style={{
                width: device === 'mobile' ? 280 : '100%', maxWidth: '100%',
                display: 'flex', flexDirection: 'column',
                borderRadius: device === 'mobile' ? 26 : 12, overflow: 'hidden',
                border: '1px solid var(--hi-line)', background: 'var(--hi-card)',
                boxShadow: '0 30px 60px -34px rgba(28,26,20,0.5)',
                transition: 'width 0.4s cubic-bezier(0.22,1,0.36,1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px', borderBottom: '1px solid var(--hi-line)', background: 'var(--hi-chrome)', flex: 'none' }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 999, background: '#e0a0a0' }} />
                    <span style={{ width: 9, height: 9, borderRadius: 999, background: '#e0c98a' }} />
                    <span style={{ width: 9, height: 9, borderRadius: 999, background: '#a8c594' }} />
                  </div>
                  <div style={{ flex: 1, height: 20, borderRadius: 6, background: 'var(--hi-paper)', border: '1px solid var(--hi-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--hi-mono)', fontSize: 9.5, color: 'var(--hi-muted)' }}>
                    {tpl.id}.e-talase.com
                  </div>
                </div>
                <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', background: tpl.palette[0] }}>
                  <TemplatePreview tpl={tpl} scroll />
                </div>
              </div>
            </div>
          </div>

          {/* Detail pane */}
          <div style={{ padding: 'clamp(20px,3vw,32px)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                padding: '4px 11px', borderRadius: 999,
                background: 'color-mix(in oklch, var(--accent) 12%, var(--hi-paper))',
                color: 'var(--accent)', fontFamily: 'var(--hi-mono)', fontSize: 9.5,
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>{tpl.cat} · {tpl.tag}</span>
              <button onClick={onClose} aria-label="Tutup" style={{
                width: 34, height: 34, borderRadius: 999, border: '1px solid var(--hi-line)',
                background: 'var(--hi-card)', color: 'var(--hi-muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1,
              }}>✕</button>
            </div>
            <h2 style={{ fontFamily: 'var(--hi-serif)', fontSize: 40, fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--hi-ink)', margin: '18px 0 10px', lineHeight: 1 }}>{tpl.name}</h2>
            <p style={{ fontFamily: 'var(--hi-sans)', fontSize: 14.5, color: 'var(--hi-muted)', lineHeight: 1.6, margin: '0 0 22px' }}>{tpl.blurb}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 26 }}>
              {features.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                  <span style={{
                    flex: 'none', marginTop: 1, width: 19, height: 19, borderRadius: 999,
                    background: 'color-mix(in oklch, var(--c-sage) 18%, var(--hi-paper))', color: 'var(--c-sage)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                  }}>✓</span>
                  <span style={{ fontFamily: 'var(--hi-sans)', fontSize: 13.5, color: 'var(--hi-ink)', lineHeight: 1.45 }}>{f}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {chosen ? (
                <div style={{
                  padding: '16px 18px', borderRadius: 14,
                  background: 'color-mix(in oklch, var(--c-sage) 12%, var(--hi-paper))',
                  border: '1px solid color-mix(in oklch, var(--c-sage) 30%, var(--hi-line))',
                  display: 'flex', alignItems: 'center', gap: 13,
                }}>
                  <span style={{ width: 30, height: 30, borderRadius: 999, flex: 'none', background: 'var(--c-sage)', color: 'var(--hi-paper)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>✓</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--hi-sans)', fontSize: 14, fontWeight: 500, color: 'var(--hi-ink)' }}>"{tpl.name}" dipilih</div>
                    <div style={{ fontFamily: 'var(--hi-mono)', fontSize: 10, letterSpacing: '0.06em', color: 'var(--c-sage)', marginTop: 2 }}>MENYIAPKAN EDITOR…</div>
                  </div>
                  <a href="#" style={{ flex: 'none', padding: '9px 15px', borderRadius: 999, background: 'var(--hi-ink)', color: 'var(--hi-paper)', textDecoration: 'none', fontFamily: 'var(--hi-sans)', fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap' }}>Buka editor →</a>
                </div>
              ) : (
                <button onClick={() => setChosen(true)} style={{
                  width: '100%', padding: '15px 20px', borderRadius: 14, border: 'none',
                  background: 'var(--accent)', color: 'var(--accent-on)', cursor: 'pointer',
                  fontFamily: 'var(--hi-sans)', fontSize: 15.5, fontWeight: 500,
                  boxShadow: '0 18px 40px -20px color-mix(in oklch, var(--accent) 80%, transparent)',
                }}>Pakai template "{tpl.name}" →</button>
              )}
              <div style={{ fontFamily: 'var(--hi-mono)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--hi-muted)', textAlign: 'center', textTransform: 'uppercase' }}>
                Bisa ganti template kapan saja
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CatalogueApp() {
  const [cat, setCat] = React.useState('Semua');
  const [open, setOpen] = React.useState(null);
  const list = cat === 'Semua' ? TEMPLATES : TEMPLATES.filter((t) => t.cat === cat);

  return (
    <div className="bld" style={{ minHeight: '100vh' }}>
      <style>{BUILDER_CSS}{CAT_CSS}</style>
      <CatToolbar />

      <section style={{ padding: 'clamp(44px,6vw,76px) var(--gutter) 36px', textAlign: 'center' }}>
        <Kicker color="var(--c-sage)">Langkah 2 · katalog lengkap</Kicker>
        <h1 style={{ fontFamily: 'var(--hi-serif)', fontSize: 'var(--h2)', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.04, color: 'var(--hi-ink)', margin: '12px 0 14px' }}>
          Pilih tampilan toko, <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>lalu jadikan milikmu.</em>
        </h1>
        <p style={{ fontFamily: 'var(--hi-sans)', fontSize: 'var(--lead)', color: 'var(--hi-muted)', lineHeight: 1.55, maxWidth: 540, margin: '0 auto 30px' }}>
          {TEMPLATES.length} template siap pakai untuk berbagai jenis toko. Klik mana saja untuk pratinjau penuh — desktop maupun HP — sebelum memilih.
        </p>
        <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', justifyContent: 'center' }}>
          {CATEGORIES.map((c) => {
            const n = c === 'Semua' ? TEMPLATES.length : TEMPLATES.filter((t) => t.cat === c).length;
            const on = cat === c;
            return (
              <button key={c} className="cat-chip" onClick={() => setCat(c)} style={{
                padding: '9px 16px', borderRadius: 999,
                border: `1px solid ${on ? 'var(--hi-ink)' : 'var(--hi-line)'}`,
                background: on ? 'var(--hi-ink)' : 'var(--hi-card)',
                color: on ? 'var(--hi-paper)' : 'var(--hi-ink)',
                fontFamily: 'var(--hi-sans)', fontSize: 13.5, fontWeight: 500,
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
                {c}
                <span style={{ fontFamily: 'var(--hi-mono)', fontSize: 10, opacity: 0.6 }}>{n}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section style={{ padding: '12px var(--gutter) clamp(60px,8vw,96px)' }}>
        <div className="cat-grid" style={{ maxWidth: 1180, margin: '0 auto' }}>
          {list.map((tpl) => <CatCard key={tpl.id} tpl={tpl} onOpen={setOpen} />)}
        </div>
      </section>

      <footer style={{ padding: '34px var(--gutter)', borderTop: '1px solid var(--hi-line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <BracketWordmark size={20} />
        <div style={{ fontFamily: 'var(--hi-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--hi-muted)' }}>© 2026 · PEMBUAT HALAMAN · DIBUAT DI INDONESIA</div>
      </footer>

      {open && <PreviewModal tpl={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<CatalogueApp />);
