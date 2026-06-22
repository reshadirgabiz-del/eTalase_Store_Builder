// Builder landing page app.

const LANDING_CSS = `
.bld-login input::placeholder { color: color-mix(in oklch, var(--hi-muted) 80%, transparent); }
.bld-login input:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 3px color-mix(in oklch, var(--accent) 18%, transparent); }
.bld-upload-only-mobile { display: none; }
.bld-th-grid { display: grid; grid-template-columns: minmax(0,1.05fr) minmax(0,0.95fr); gap: 56px; align-items: center; }
@media (max-width: 880px) {
  .bld-th-grid { grid-template-columns: 1fr; gap: 40px; }
  .bld-upload-desktop { display: none !important; }
  .bld-upload-only-mobile { display: flex !important; }
}
@media (max-width: 720px) { .bld-hero-decor { display: none !important; } }
`;

// ── Blueprint + floating-tiles hero decoration (direction C + A) ──────
function BlueprintDecor() {
  const ticks = [[300, 150], [1030, 470], [170, 560], [1130, 200]];
  return (
    <div className="bld-hero-decor" aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {/* fine + major grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(93,107,64,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(93,107,64,0.09) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(93,107,64,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(93,107,64,0.16) 1px, transparent 1px)', backgroundSize: '160px 160px', maskImage: 'radial-gradient(ellipse 80% 78% at 50% 44%, transparent 32%, #000 88%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 78% at 50% 44%, transparent 32%, #000 88%)' }} />
      {/* soft glow behind headline */}
      <div style={{ position: 'absolute', top: '34%', left: '50%', transform: 'translate(-50%,-50%)', width: 620, height: 380, borderRadius: 999, background: 'radial-gradient(ellipse, color-mix(in oklch, var(--c-butter) 22%, transparent), transparent 70%)', filter: 'blur(24px)' }} />

      {/* outline circle + rotated square (top-right) */}
      <div style={{ position: 'absolute', top: 78, right: 120, width: 150, height: 150, borderRadius: 999, border: '1.5px solid var(--c-terra)', opacity: 0.5 }} />
      <div style={{ position: 'absolute', top: 112, right: 154, width: 82, height: 82, border: '1.5px solid var(--c-terra)', opacity: 0.38, transform: 'rotate(18deg)' }} />
      {/* triangle outline (bottom-left) */}
      <div style={{ position: 'absolute', bottom: 120, left: 130, width: 0, height: 0, borderLeft: '34px solid transparent', borderRight: '34px solid transparent', borderBottom: '58px solid color-mix(in oklch, var(--c-sage) 26%, transparent)' }} />

      {/* crosshair ticks */}
      {ticks.map(([x, y], i) => (
        <div key={i} style={{ position: 'absolute', left: x, top: y }}>
          <div style={{ position: 'absolute', width: 16, height: 1.5, background: 'var(--c-terra)', opacity: 0.7, top: 7, left: -8 }} />
          <div style={{ position: 'absolute', height: 16, width: 1.5, background: 'var(--c-terra)', opacity: 0.7, left: 7, top: -8 }} />
        </div>
      ))}

      {/* coordinate labels */}
      <div style={{ position: 'absolute', top: 18, left: 24, whiteSpace: 'nowrap', fontFamily: 'var(--hi-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'color-mix(in oklch, var(--c-sage) 55%, var(--hi-muted))' }}>E-TALASE · BUILDER / v1.0 — [ HALAMAN TOKO ]</div>
      <div style={{ position: 'absolute', bottom: 16, right: 24, whiteSpace: 'nowrap', fontFamily: 'var(--hi-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'color-mix(in oklch, var(--c-sage) 55%, var(--hi-muted))' }}>FIG.01 — CONNECT & PILIH</div>

      {/* floating brand tiles (A) */}
      <div style={{ position: 'absolute', top: 84, left: 78, transform: 'rotate(-12deg)' }}>
        <div style={{ width: 62, height: 62, borderRadius: 18, background: 'var(--c-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 18px 36px -16px var(--c-rose)', color: 'var(--hi-paper)', fontFamily: 'var(--hi-serif)', fontStyle: 'italic', fontSize: 30 }}>e</div>
      </div>
      <div style={{ position: 'absolute', bottom: 130, right: 96, transform: 'rotate(14deg)' }}>
        <div style={{ width: 54, height: 54, borderRadius: 15, background: 'var(--c-butter)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 32px -16px var(--c-butter)', color: 'var(--hi-ink)', fontFamily: 'var(--hi-serif)', fontStyle: 'italic', fontSize: 26 }}>e</div>
      </div>
      <div style={{ position: 'absolute', bottom: 170, left: 96, width: 38, height: 38, borderRadius: 999, background: 'var(--c-terra)', boxShadow: '0 14px 28px -12px var(--c-terra)' }} />
      <div style={{ position: 'absolute', top: 330, right: 210, width: 30, height: 30 }}>
        <div style={{ position: 'absolute', top: '45%', left: 0, width: '100%', height: 3, background: 'var(--c-sage)' }} />
        <div style={{ position: 'absolute', left: '45%', top: 0, height: '100%', width: 3, background: 'var(--c-sage)' }} />
      </div>
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────
function LandingHero({ onLogin, store }) {
  const [storeId, setStoreId] = React.useState('');
  const [pubKey, setPubKey] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!storeId.trim() || !pubKey.trim()) { setError('Isi Store ID dan Public Key kamu.'); return; }
    setError(''); setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const pretty = storeId.trim().replace(/[-_]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
      onLogin(pretty || 'Toko Kamu');
    }, 1100);
  };

  const field = (label, val, set, ph, mono) => (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontFamily: 'var(--hi-mono)', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--hi-muted)', marginBottom: 6 }}>{label}</span>
      <input
        value={val} onChange={(e) => { set(e.target.value); setError(''); }}
        placeholder={ph} disabled={!!store || loading}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 12,
          border: '1px solid var(--hi-line)', background: 'var(--hi-paper)',
          fontFamily: mono ? 'var(--hi-mono)' : 'var(--hi-sans)',
          fontSize: mono ? 13 : 14, color: 'var(--hi-ink)', outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
      />
    </label>
  );

  return (
    <section style={{ padding: 'clamp(56px, 9vw, 104px) var(--gutter) 88px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <BlueprintDecor />

      <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999,
          background: 'color-mix(in oklch, var(--c-sage) 12%, var(--hi-paper))',
          border: '1px solid color-mix(in oklch, var(--c-sage) 30%, var(--hi-line))',
          fontFamily: 'var(--hi-mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--c-sage)', marginBottom: 26, whiteSpace: 'nowrap',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--c-sage)', animation: 'bld-pulse 2s ease-in-out infinite' }} />
          PEMBUAT HALAMAN TOKO
        </div>

        <h1 style={{
          fontFamily: 'var(--hi-serif)', fontSize: 'var(--h1)', fontWeight: 400,
          letterSpacing: '-0.02em', lineHeight: 1.04, color: 'var(--hi-ink)', margin: '0 0 22px',
        }}>
          Halaman toko untuk<br />
          <TextRotate words={['fashion', 'skincare', 'kopi & kue', 'jualan live', 'brand kamu']} />
        </h1>

        <p style={{ fontFamily: 'var(--hi-sans)', fontSize: 'var(--lead)', color: 'var(--hi-muted)', lineHeight: 1.55, maxWidth: 520, margin: '0 auto 34px' }}>
          Masuk pakai Store ID dan Public Key kamu. Pilih dari template siap pakai, atau unggah desainmu sendiri — server, domain, dan teknisnya kami yang urus.
        </p>

        {/* Login card */}
        <form onSubmit={submit} className="bld-login" style={{
          maxWidth: 440, margin: '0 auto', textAlign: 'left',
          background: 'var(--hi-card)', border: '1px solid var(--hi-line)',
          borderRadius: 20, padding: 24,
          boxShadow: '0 30px 70px -40px rgba(28,26,20,0.4)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {field('Store ID', storeId, setStoreId, 'toko-rina', false)}
            {field('Public Key', pubKey, setPubKey, 'pk_live_a1b2c3d4e5f6', true)}
          </div>
          {error && (
            <div style={{ marginTop: 12, fontFamily: 'var(--hi-sans)', fontSize: 12.5, color: 'var(--c-terra)' }}>{error}</div>
          )}
          <button type="submit" disabled={!!store || loading} style={{
            width: '100%', marginTop: 18, padding: '13px 18px', borderRadius: 12, border: 'none',
            background: store ? 'var(--c-sage)' : 'var(--accent)', color: 'var(--accent-on)',
            fontFamily: 'var(--hi-sans)', fontSize: 14.5, fontWeight: 500,
            cursor: store ? 'default' : 'pointer', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', gap: 9,
          }}>
            {loading && <span style={{ width: 15, height: 15, borderRadius: 999, border: '2px solid color-mix(in oklch, var(--accent-on) 40%, transparent)', borderTopColor: 'var(--accent-on)', animation: 'bld-spin 0.7s linear infinite' }} />}
            {store ? '✓ Masuk sebagai ' + store : loading ? 'Memverifikasi…' : 'Masuk & pilih template →'}
          </button>
          <div style={{ marginTop: 12, fontFamily: 'var(--hi-mono)', fontSize: 9.5, letterSpacing: '0.06em', color: 'var(--hi-muted)', textAlign: 'center', lineHeight: 1.6 }}>
            BUTUH KREDENSIAL? ADA DI DASHBOARD E-TALASE · PENGATURAN · API
          </div>
        </form>
      </div>
    </section>
  );
}

// ── Upload zone ──────────────────────────────────────────────────────
function UploadZone() {
  const [file, setFile] = React.useState(null);
  const [drag, setDrag] = React.useState(false);
  const inputRef = React.useRef(null);

  const onFiles = (fl) => { if (fl && fl[0]) setFile(fl[0].name); };

  return (
    <div className="bld-upload-desktop"
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
      onClick={() => inputRef.current && inputRef.current.click()}
      style={{
        borderRadius: 20, padding: '40px 28px', cursor: 'pointer',
        border: `2px dashed ${drag ? 'var(--accent)' : 'color-mix(in oklch, var(--hi-ink) 22%, var(--hi-line))'}`,
        background: drag ? 'color-mix(in oklch, var(--accent) 9%, var(--hi-card))' : 'var(--hi-card)',
        textAlign: 'center', transition: 'all 0.2s', minHeight: 392,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
      }}>
      <input ref={inputRef} type="file" accept=".html,.zip,.fig,.png,.jpg,.pdf" style={{ display: 'none' }} onChange={(e) => onFiles(e.target.files)} />
      <div style={{
        width: 60, height: 60, borderRadius: 16, flex: 'none',
        background: 'color-mix(in oklch, var(--c-terra) 14%, var(--hi-paper))',
        border: '1px solid color-mix(in oklch, var(--c-terra) 30%, var(--hi-line))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26, color: 'var(--c-terra)',
      }}>{file ? '✓' : '↑'}</div>
      {file ? (
        <React.Fragment>
          <div style={{ fontFamily: 'var(--hi-serif)', fontSize: 22, color: 'var(--hi-ink)' }}>File diterima</div>
          <div style={{ fontFamily: 'var(--hi-mono)', fontSize: 12, color: 'var(--c-sage)', wordBreak: 'break-all' }}>{file}</div>
          <div style={{ fontFamily: 'var(--hi-sans)', fontSize: 13, color: 'var(--hi-muted)', maxWidth: 280, lineHeight: 1.5 }}>Tim kami akan menata ulang desainmu jadi halaman toko yang siap jalan.</div>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div style={{ fontFamily: 'var(--hi-serif)', fontSize: 24, color: 'var(--hi-ink)', lineHeight: 1.1 }}>Punya desain sendiri?</div>
          <div style={{ fontFamily: 'var(--hi-sans)', fontSize: 14, color: 'var(--hi-muted)', maxWidth: 300, lineHeight: 1.55 }}>
            Seret file ke sini, atau klik untuk memilih. Kami terima HTML, Figma, ZIP, atau gambar.
          </div>
          <span style={{ marginTop: 4, padding: '9px 18px', borderRadius: 999, background: 'var(--hi-ink)', color: 'var(--hi-paper)', fontFamily: 'var(--hi-sans)', fontSize: 13, fontWeight: 500 }}>Pilih file</span>
          <div style={{ fontFamily: 'var(--hi-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--hi-muted)', textTransform: 'uppercase' }}>Maks 25 MB</div>
        </React.Fragment>
      )}
    </div>
  );
}

function UploadMobileLock() {
  return (
    <div className="bld-upload-only-mobile" style={{
      borderRadius: 20, padding: '32px 24px', minHeight: 200,
      border: '1px solid var(--hi-line)', background: 'var(--hi-chrome)',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center',
    }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--hi-paper)', border: '1px solid var(--hi-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--hi-muted)' }}>⌥</div>
      <div style={{ fontFamily: 'var(--hi-serif)', fontSize: 20, color: 'var(--hi-ink)' }}>Unggah desain di desktop</div>
      <div style={{ fontFamily: 'var(--hi-sans)', fontSize: 13.5, color: 'var(--hi-muted)', maxWidth: 280, lineHeight: 1.55 }}>
        Upload file sendiri hanya tersedia di layar besar. Di HP, pilih saja salah satu template di samping.
      </div>
    </div>
  );
}

// ── Template hero section ────────────────────────────────────────────
function TemplateHero({ unlocked, store, sectionRef }) {
  const carouselTpls = TEMPLATES.slice(0, 6);
  return (
    <section ref={sectionRef} style={{
      padding: 'var(--gutter) var(--gutter) clamp(64px,9vw,100px)',
      borderTop: '1px solid var(--hi-line)',
      background: 'color-mix(in oklch, var(--c-sage) 5%, var(--hi-paper))',
      position: 'relative', scrollMarginTop: 70,
    }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 48px' }}>
          <Kicker color="var(--c-sage)">{unlocked ? 'Langkah 2 · pilih tampilan' : 'Langkah 2 · terkunci'}</Kicker>
          <h2 style={{ fontFamily: 'var(--hi-serif)', fontSize: 'var(--h2)', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.05, color: 'var(--hi-ink)', margin: '12px 0 14px' }}>
            Mulai dari template, <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>atau desainmu sendiri.</em>
          </h2>
          <p style={{ fontFamily: 'var(--hi-sans)', fontSize: 'var(--body)', color: 'var(--hi-muted)', lineHeight: 1.55, margin: 0 }}>
            {store ? <React.Fragment>Toko <strong style={{ color: 'var(--hi-ink)' }}>{store}</strong> sudah terhubung. </React.Fragment> : null}
            Geser deck di kiri untuk melihat gaya, klik kartu depan untuk pratinjau penuh. Atau unggah file kamu di kanan.
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          <div className="bld-th-grid" style={{ filter: unlocked ? 'none' : 'blur(5px)', opacity: unlocked ? 1 : 0.5, pointerEvents: unlocked ? 'auto' : 'none', transition: 'filter 0.5s ease, opacity 0.5s ease' }}>
            <div>
              <ProgressiveCarousel templates={carouselTpls} onPreview={() => { window.location.href = 'Template Catalogue.html'; }} />
            </div>
            <div className="bld-upload-side">
              <UploadZone />
              <UploadMobileLock />
            </div>
          </div>

          {!unlocked && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
              <div style={{
                background: 'var(--hi-card)', border: '1px solid var(--hi-line)', borderRadius: 16,
                padding: '20px 26px', textAlign: 'center', boxShadow: '0 30px 70px -40px rgba(28,26,20,0.5)', maxWidth: 320,
              }}>
                <div style={{ fontFamily: 'var(--hi-mono)', fontSize: 22, color: 'var(--hi-muted)', marginBottom: 8 }}>⦿</div>
                <div style={{ fontFamily: 'var(--hi-serif)', fontSize: 21, color: 'var(--hi-ink)', marginBottom: 6 }}>Masuk dulu, ya</div>
                <div style={{ fontFamily: 'var(--hi-sans)', fontSize: 13, color: 'var(--hi-muted)', lineHeight: 1.5 }}>Masukkan Store ID & Public Key di atas untuk membuka pemilihan template.</div>
              </div>
            </div>
          )}
        </div>

        {/* CTA to full catalogue */}
        <div style={{ textAlign: 'center', marginTop: 52 }}>
          <a href="Template Catalogue.html" style={{
            display: 'inline-flex', alignItems: 'center', gap: 12, padding: '15px 30px', borderRadius: 999,
            background: unlocked ? 'var(--hi-ink)' : 'var(--hi-chrome)',
            color: unlocked ? 'var(--hi-paper)' : 'var(--hi-muted)',
            fontFamily: 'var(--hi-sans)', fontSize: 15, fontWeight: 500, textDecoration: 'none',
            pointerEvents: unlocked ? 'auto' : 'none', whiteSpace: 'nowrap',
            boxShadow: unlocked ? '0 20px 40px -22px rgba(28,26,20,0.6)' : 'none', transition: 'all 0.4s',
          }}>
            Lihat semua {TEMPLATES.length} template
            <span style={{ fontFamily: 'var(--hi-mono)', fontSize: 12, opacity: 0.8 }}>→</span>
          </a>
          <div style={{ marginTop: 14, fontFamily: 'var(--hi-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--hi-muted)', textTransform: 'uppercase' }}>
            Katalog lengkap · pratinjau · pilih · langsung tayang
          </div>
        </div>
      </div>
    </section>
  );
}

function BuilderFooter() {
  return (
    <footer style={{ padding: '34px var(--gutter)', borderTop: '1px solid var(--hi-line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
      <BracketWordmark size={20} />
      <div style={{ fontFamily: 'var(--hi-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--hi-muted)' }}>© 2026 · PEMBUAT HALAMAN · DIBUAT DI INDONESIA</div>
    </footer>
  );
}

function LandingApp() {
  const [store, setStore] = React.useState(null);
  const sectionRef = React.useRef(null);

  const handleLogin = (name) => {
    setStore(name);
    setTimeout(() => {
      const el = sectionRef.current;
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 56;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 350);
  };

  return (
    <div className="bld" style={{ minHeight: '100vh' }}>
      <style>{BUILDER_CSS}{TEXT_ROTATE_CSS}{CAROUSEL_CSS}{LANDING_CSS}</style>
      <BuilderNav store={store} />
      <LandingHero onLogin={handleLogin} store={store} />
      <TemplateHero unlocked={!!store} store={store} sectionRef={sectionRef} />
      <BuilderFooter />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<LandingApp />);
