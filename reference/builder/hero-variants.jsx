// Four hero directions for the e-talase Page Builder — modern, developer-leaning,
// each with a distinct shape/asset system. Same brand cream + serif + mono.

const HV_W = 1280;
const HV_H = 760;

// ── Shared compact login ────────────────────────────────────────────────
function MiniLogin({ theme = 'light', cta = 'Masuk & pilih template' }) {
  const dark = theme === 'dark';
  const glass = theme === 'glass';
  const cardBg = dark ? 'rgba(244,237,224,0.04)' : glass ? 'rgba(251,246,236,0.55)' : 'var(--hi-card)';
  const cardBorder = dark ? 'rgba(244,237,224,0.14)' : glass ? 'rgba(255,255,255,0.6)' : 'var(--hi-line)';
  const inkC = dark ? 'var(--hi-paper)' : 'var(--hi-ink)';
  const mutedC = dark ? 'rgba(244,237,224,0.55)' : 'var(--hi-muted)';
  const inputBg = dark ? 'rgba(244,237,224,0.06)' : glass ? 'rgba(255,255,255,0.5)' : 'var(--hi-paper)';
  const fields = [['STORE_ID', 'toko-rina', false], ['PUBLIC_KEY', 'pk_live_a1b2c3d4', true]];
  return (
    <div style={{
      width: '100%', maxWidth: 420, background: cardBg,
      border: `1px solid ${cardBorder}`, borderRadius: 18, padding: 20,
      backdropFilter: glass ? 'blur(16px)' : 'none', WebkitBackdropFilter: glass ? 'blur(16px)' : 'none',
      boxShadow: dark ? '0 30px 70px -40px rgba(0,0,0,0.7)' : '0 30px 70px -44px rgba(28,26,20,0.4)',
      textAlign: 'left',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ width: 7, height: 7, borderRadius: 999, flex: 'none', background: 'var(--c-sage)', boxShadow: '0 0 0 3px color-mix(in oklch, var(--c-sage) 28%, transparent)' }} />
        <span style={{ fontFamily: 'var(--hi-mono)', fontSize: 10, letterSpacing: '0.1em', color: mutedC, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>// hubungkan toko</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {fields.map(([label, ph, mono]) => (
          <div key={label}>
            <div style={{ fontFamily: 'var(--hi-mono)', fontSize: 9, letterSpacing: '0.12em', color: mutedC, marginBottom: 5 }}>{label}</div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '11px 13px', borderRadius: 11,
              background: inputBg, border: `1px solid ${cardBorder}`,
            }}>
              <span style={{ fontFamily: 'var(--hi-mono)', fontSize: 13, color: mono ? 'var(--c-terra)' : inkC, whiteSpace: 'nowrap' }}>{ph}</span>
            </div>
          </div>
        ))}
      </div>
      <button style={{
        width: '100%', marginTop: 16, padding: '12px 16px', borderRadius: 11, border: 'none',
        background: dark ? 'var(--c-butter)' : 'var(--accent)', color: dark ? 'var(--hi-ink)' : 'var(--accent-on)',
        fontFamily: 'var(--hi-sans)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>{cta} <span style={{ fontFamily: 'var(--hi-mono)' }}>→</span></button>
    </div>
  );
}

function HvBadge({ children, theme = 'light' }) {
  const dark = theme === 'dark';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999,
      background: dark ? 'rgba(232,184,90,0.12)' : 'color-mix(in oklch, var(--c-sage) 12%, var(--hi-paper))',
      border: `1px solid ${dark ? 'rgba(232,184,90,0.3)' : 'color-mix(in oklch, var(--c-sage) 30%, var(--hi-line))'}`,
      fontFamily: 'var(--hi-mono)', fontSize: 10, letterSpacing: '0.14em',
      color: dark ? 'var(--c-butter)' : 'var(--c-sage)', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: 999, background: 'currentColor', animation: 'bld-pulse 2s ease-in-out infinite' }} />
      {children}
    </div>
  );
}

function HvHeadline({ color = 'var(--hi-ink)', accent = 'var(--accent)', textColor = 'var(--accent-on)' }) {
  return (
    <h1 style={{ fontFamily: 'var(--hi-serif)', fontSize: 64, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.05, color, margin: '20px 0 18px' }}>
      Halaman toko untuk<br />
      <TextRotate words={['fashion', 'skincare', 'jualan live', 'brand kamu']} boxColor={accent} textColor={textColor} />
    </h1>
  );
}

// ════════════════════════════════════════════════════════════════════════
// A · DOT-GRID + FLOATING TILES
// ════════════════════════════════════════════════════════════════════════
function HeroDotGrid() {
  const shapes = [
    { type: 'mark', c: 'var(--c-rose)',   x: 90,  y: 90,  s: 64,  r: -12 },
    { type: 'ring', c: 'var(--c-sage)',   x: 1080, y: 110, s: 92,  r: 0 },
    { type: 'mark', c: 'var(--c-butter)', x: 1140, y: 470, s: 56,  r: 14 },
    { type: 'dot',  c: 'var(--c-terra)',  x: 120, y: 540, s: 40,  r: 0 },
    { type: 'plus', c: 'var(--c-sage)',   x: 980, y: 600, s: 34,  r: 0 },
    { type: 'tri',  c: 'var(--c-terra)',  x: 200, y: 300, s: 0,  r: 0 },
  ];
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--hi-paper)', overflow: 'hidden' }}>
      {/* dot grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(28,26,20,0.10) 1.4px, transparent 1.4px)', backgroundSize: '26px 26px', maskImage: 'radial-gradient(ellipse 70% 70% at 50% 45%, #000 55%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 45%, #000 55%, transparent 100%)' }} />
      {/* glow */}
      <div style={{ position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%,-50%)', width: 560, height: 360, borderRadius: 999, background: 'radial-gradient(ellipse, color-mix(in oklch, var(--c-butter) 26%, transparent), transparent 70%)', filter: 'blur(20px)' }} />
      {/* floating shapes */}
      {shapes.map((sh, i) => (
        <div key={i} style={{ position: 'absolute', left: sh.x, top: sh.y, transform: `rotate(${sh.r}deg)`, opacity: 0.92 }}>
          {sh.type === 'mark' && (
            <div style={{ width: sh.s, height: sh.s, borderRadius: sh.s * 0.28, background: sh.c, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 18px 36px -16px ${sh.c}`, color: 'var(--hi-paper)', fontFamily: 'var(--hi-serif)', fontStyle: 'italic', fontSize: sh.s * 0.5 }}>e</div>
          )}
          {sh.type === 'ring' && (<div style={{ width: sh.s, height: sh.s, borderRadius: 999, border: `2px dashed ${sh.c}`, opacity: 0.7 }} />)}
          {sh.type === 'dot' && (<div style={{ width: sh.s, height: sh.s, borderRadius: 999, background: sh.c, boxShadow: `0 14px 30px -12px ${sh.c}` }} />)}
          {sh.type === 'plus' && (<div style={{ position: 'relative', width: sh.s, height: sh.s }}><div style={{ position: 'absolute', top: '45%', left: 0, width: '100%', height: 3, background: sh.c }} /><div style={{ position: 'absolute', left: '45%', top: 0, height: '100%', width: 3, background: sh.c }} /></div>)}
          {sh.type === 'tri' && (<div style={{ width: 0, height: 0, borderLeft: '26px solid transparent', borderRight: '26px solid transparent', borderBottom: `46px solid ${sh.c}`, opacity: 0.5 }} />)}
        </div>
      ))}
      <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 64px' }}>
        <HvBadge>PEMBUAT HALAMAN · API-FIRST</HvBadge>
        <HvHeadline />
        <p style={{ fontFamily: 'var(--hi-sans)', fontSize: 17, color: 'var(--hi-muted)', lineHeight: 1.55, maxWidth: 480, margin: '0 0 28px' }}>
          Masuk dengan Store ID dan Public Key. Pilih template siap pakai, atau unggah desainmu sendiri — teknisnya kami yang urus.
        </p>
        <MiniLogin />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// B · API CONSOLE (split, dark code panel)
// ════════════════════════════════════════════════════════════════════════
function HeroApiConsole() {
  const codeLines = [
    [['k', 'POST'], ['p', ' /v1/connect']],
    [['b', '{']],
    [['key', '  "store_id"'], ['p', ':   '], ['s', '"toko-rina"'], ['p', ',']],
    [['key', '  "public_key"'], ['p', ': '], ['s', '"pk_live_•••"'], ['p', ',']],
    [['key', '  "template"'], ['p', ':   '], ['s', '"auto"']],
    [['b', '}']],
    [],
    [['c', '→ 200 · store connected']],
    [['c', '→ 12 templates ready']],
  ];
  const col = { k: 'var(--c-terra)', p: 'rgba(244,237,224,0.65)', key: 'var(--c-butter)', s: 'var(--c-sage)', b: 'rgba(244,237,224,0.85)', c: 'rgba(168,197,148,0.9)' };
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--hi-paper)', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* faint grid on left */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(28,26,20,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(28,26,20,0.05) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      {/* left */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 56px' }}>
        <HvBadge>DEVELOPER PREVIEW · v1</HvBadge>
        <h1 style={{ fontFamily: 'var(--hi-serif)', fontSize: 60, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.04, color: 'var(--hi-ink)', margin: '20px 0 16px' }}>
          Halaman toko untuk<br /><TextRotate words={['fashion', 'skincare', 'jualan live', 'brand kamu']} />
        </h1>
        <p style={{ fontFamily: 'var(--hi-sans)', fontSize: 16, color: 'var(--hi-muted)', lineHeight: 1.55, maxWidth: 420, margin: '0 0 26px' }}>
          Dua kredensial, satu panggilan. Hubungkan tokomu lalu pilih template atau unggah desain sendiri.
        </p>
        <MiniLogin />
      </div>
      {/* right: dark code panel */}
      <div style={{ position: 'relative', background: 'var(--hi-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* glow + floating dots */}
        <div style={{ position: 'absolute', top: -80, right: -60, width: 320, height: 320, borderRadius: 999, background: 'radial-gradient(circle, color-mix(in oklch, var(--c-terra) 40%, transparent), transparent 70%)', filter: 'blur(30px)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: 40, width: 240, height: 240, borderRadius: 999, background: 'radial-gradient(circle, color-mix(in oklch, var(--c-sage) 38%, transparent), transparent 70%)', filter: 'blur(30px)' }} />
        <div style={{ position: 'relative', width: 440, borderRadius: 16, background: 'rgba(20,18,13,0.9)', border: '1px solid rgba(244,237,224,0.12)', boxShadow: '0 40px 90px -40px rgba(0,0,0,0.8)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid rgba(244,237,224,0.1)' }}>
            <span style={{ display: 'flex', gap: 6 }}>
              <span style={{ width: 11, height: 11, borderRadius: 999, background: '#e0a0a0' }} />
              <span style={{ width: 11, height: 11, borderRadius: 999, background: '#e0c98a' }} />
              <span style={{ width: 11, height: 11, borderRadius: 999, background: '#a8c594' }} />
            </span>
            <span style={{ marginLeft: 8, fontFamily: 'var(--hi-mono)', fontSize: 11, color: 'rgba(244,237,224,0.45)' }}>connect.sh</span>
          </div>
          <div style={{ padding: '18px 20px', fontFamily: 'var(--hi-mono)', fontSize: 13, lineHeight: 2.0 }}>
            {codeLines.map((line, i) => (
              <div key={i} style={{ display: 'flex', minHeight: 14, whiteSpace: 'nowrap' }}>
                <span style={{ width: 24, flex: 'none', color: 'rgba(244,237,224,0.22)', userSelect: 'none' }}>{line.length ? i + 1 : ''}</span>
                <span style={{ whiteSpace: 'pre' }}>{line.map(([t, txt], j) => <span key={j} style={{ color: col[t] }}>{txt}</span>)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// C · BLUEPRINT GRID (engineering line-work)
// ════════════════════════════════════════════════════════════════════════
function HeroBlueprint() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--hi-card)', overflow: 'hidden' }}>
      {/* fine grid + major grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(93,107,64,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(93,107,64,0.10) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(93,107,64,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(93,107,64,0.18) 1px, transparent 1px)', backgroundSize: '160px 160px' }} />
      {/* outline shapes */}
      <div style={{ position: 'absolute', top: 96, right: 150, width: 150, height: 150, borderRadius: 999, border: '1.5px solid var(--c-terra)', opacity: 0.55 }} />
      <div style={{ position: 'absolute', top: 130, right: 184, width: 82, height: 82, border: '1.5px solid var(--c-terra)', opacity: 0.4, transform: 'rotate(18deg)' }} />
      <div style={{ position: 'absolute', bottom: 110, left: 120, width: 0, height: 0, borderLeft: '40px solid transparent', borderRight: '40px solid transparent', borderBottom: '70px solid transparent', borderBottomColor: 'color-mix(in oklch, var(--c-sage) 30%, transparent)' }} />
      {/* crosshair ticks */}
      {[[300, 180], [1000, 520], [180, 600], [1120, 200]].map(([x, y], i) => (
        <div key={i} style={{ position: 'absolute', left: x, top: y }}>
          <div style={{ position: 'absolute', width: 18, height: 1.5, background: 'var(--c-terra)', top: 8, left: -9 }} />
          <div style={{ position: 'absolute', height: 18, width: 1.5, background: 'var(--c-terra)', left: 8, top: -9 }} />
        </div>
      ))}
      {/* coordinate labels */}
      <div style={{ position: 'absolute', top: 24, left: 28, fontFamily: 'var(--hi-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'color-mix(in oklch, var(--c-sage) 60%, var(--hi-muted))' }}>E-TALASE · BUILDER / v1.0 — [ 1280 × 760 ]</div>
      <div style={{ position: 'absolute', bottom: 22, right: 28, fontFamily: 'var(--hi-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'color-mix(in oklch, var(--c-sage) 60%, var(--hi-muted))' }}>FIG.01 — HALAMAN TOKO</div>

      <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 96px', maxWidth: 720 }}>
        <HvBadge>BLUEPRINT MODE · SIAP DEPLOY</HvBadge>
        <h1 style={{ fontFamily: 'var(--hi-serif)', fontSize: 66, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.03, color: 'var(--hi-ink)', margin: '20px 0 16px' }}>
          Halaman toko untuk<br /><TextRotate words={['fashion', 'skincare', 'jualan live', 'brand kamu']} />
        </h1>
        <p style={{ fontFamily: 'var(--hi-sans)', fontSize: 16, color: 'var(--hi-muted)', lineHeight: 1.55, maxWidth: 430, margin: '0 0 26px' }}>
          Rancang sekali, tayang di mana saja. Masuk dengan Store ID & Public Key untuk mulai menyusun.
        </p>
        <MiniLogin />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// D · GLASS + SOFT MESH
// ════════════════════════════════════════════════════════════════════════
function HeroGlass() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--hi-paper)', overflow: 'hidden' }}>
      {/* soft color blobs */}
      <div style={{ position: 'absolute', top: -120, left: -60, width: 460, height: 460, borderRadius: 999, background: 'radial-gradient(circle, color-mix(in oklch, var(--c-sage) 50%, transparent), transparent 68%)', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', bottom: -160, right: -40, width: 520, height: 520, borderRadius: 999, background: 'radial-gradient(circle, color-mix(in oklch, var(--c-terra) 42%, transparent), transparent 68%)', filter: 'blur(70px)' }} />
      <div style={{ position: 'absolute', top: 120, right: 220, width: 300, height: 300, borderRadius: 999, background: 'radial-gradient(circle, color-mix(in oklch, var(--c-butter) 50%, transparent), transparent 68%)', filter: 'blur(60px)' }} />
      {/* crisp glass shards */}
      <div style={{ position: 'absolute', top: 110, left: 150, width: 120, height: 120, borderRadius: 28, background: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', transform: 'rotate(-14deg)' }} />
      <div style={{ position: 'absolute', bottom: 130, right: 170, width: 90, height: 90, borderRadius: 999, background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} />

      <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 64px' }}>
        <HvBadge theme="glass">MODERN · GLASS UI</HvBadge>
        <HvHeadline />
        <p style={{ fontFamily: 'var(--hi-sans)', fontSize: 17, color: 'var(--hi-ink)', lineHeight: 1.55, maxWidth: 470, margin: '0 0 28px', opacity: 0.7 }}>
          Login mulus, template cantik, dan deploy instan. Cukup Store ID dan Public Key kamu.
        </p>
        <MiniLogin theme="glass" />
      </div>
    </div>
  );
}

const HERO_VARIANTS = [
  { id: 'dotgrid',  label: 'A · Dot-grid + Tiles',  cmp: HeroDotGrid,    note: 'Latar dot-grid teknis + bentuk geometris brand yang melayang. Centered, ramah & modern.' },
  { id: 'console',  label: 'B · API Console',        cmp: HeroApiConsole, note: 'Split: teks + login di kiri, panel kode gelap di kanan. Paling “developer”.' },
  { id: 'blueprint',label: 'C · Blueprint Grid',     cmp: HeroBlueprint,  note: 'Estetika cetak biru rekayasa: grid garis, crosshair, bentuk outline. Terstruktur.' },
  { id: 'glass',    label: 'D · Glass + Mesh',       cmp: HeroGlass,      note: 'Blob warna lembut + kartu kaca. Paling “SaaS modern”, lebih banyak warna.' },
];

function HeroExplorations() {
  return (
    <DesignCanvas>
      <style>{BUILDER_CSS}{TEXT_ROTATE_CSS}</style>
      <DCSection id="heroes" title="Hero — arah desain" subtitle="Pilih satu (atau campur). Lebih modern, lebih banyak bentuk, terasa developer-first.">
        {HERO_VARIANTS.map((v) => (
          <DCArtboard key={v.id} id={v.id} label={v.label} width={HV_W} height={HV_H}>
            <div className="bld" style={{ width: '100%', height: '100%' }}>
              <v.cmp />
            </div>
          </DCArtboard>
        ))}
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<HeroExplorations />);
