// Shared design tokens + primitives for the e-talase Page Builder.
// Inherits the editorial-cream system from the main site.

const BUILDER_CSS = `
:root {
  --hi-paper:   #f4ede0;
  --hi-card:    #fbf6ec;
  --hi-chrome:  #efe7d6;
  --hi-ink:     #1c1a14;
  --hi-muted:   #6e6757;
  --hi-line:    rgba(28,26,20,0.12);
  --accent:     #5d6b40;
  --accent-on:  #f4ede0;
  --c-sage:     #5d6b40;
  --c-terra:    #b65a30;
  --c-butter:   #e8b85a;
  --c-rose:     #c97e6e;
  --hi-serif:   'Instrument Serif', ui-serif, Georgia, serif;
  --hi-sans:    'Geist', ui-sans-serif, system-ui, sans-serif;
  --hi-mono:    'JetBrains Mono', ui-monospace, monospace;
}

.bld {
  --gutter:      64px;
  --nav-py:      18px;
  --h1:          80px;
  --h2:          52px;
  --h3:          30px;
  --lead:        18px;
  --body:        15px;
}

@media (max-width: 1099px) {
  .bld { --gutter: 40px; --h1: 60px; --h2: 42px; --h3: 26px; }
}
@media (max-width: 720px) {
  .bld {
    --gutter: 20px; --nav-py: 14px;
    --h1: 40px; --h2: 30px; --h3: 22px; --lead: 15px; --body: 14px;
  }
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; background: var(--hi-paper); color: var(--hi-ink); font-family: var(--hi-sans); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
.bld { overflow-x: clip; }
button, input { font-family: inherit; }

@keyframes bld-pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.18); opacity: .65; } }
@keyframes bld-fade-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes bld-spin { to { transform: rotate(360deg); } }
`;

function BracketWordmark({ size = 24, talaseColor = 'var(--hi-ink)', bracketColor = 'var(--accent)', eColor = 'var(--accent)', dotColor = 'var(--accent)' }) {
  return (
    <span style={{
      fontFamily: 'var(--hi-serif)', fontSize: size, letterSpacing: '-0.01em',
      lineHeight: 1, color: talaseColor, display: 'inline-flex',
      alignItems: 'baseline', whiteSpace: 'nowrap',
    }}>
      <span style={{ color: bracketColor, fontWeight: 300 }}>[</span>
      <span style={{ color: eColor, fontStyle: 'italic' }}>e</span>
      <span style={{ color: bracketColor, fontWeight: 300 }}>]</span>
      <span style={{
        display: 'inline-block', width: size * 0.13, height: size * 0.13,
        borderRadius: 999, background: dotColor,
        margin: `0 ${size * 0.12}px`, position: 'relative', top: -size * 0.05,
      }} />
      <span>talase</span>
    </span>
  );
}

function Kicker({ children, color = 'var(--hi-muted)', style = {} }) {
  return (
    <div style={{
      fontFamily: 'var(--hi-mono)', fontSize: 10, letterSpacing: '0.14em',
      color, textTransform: 'uppercase', ...style,
    }}>{children}</div>
  );
}

// Shared top nav. `store` = logged-in store label (optional).
function BuilderNav({ store = null, active = 'builder' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: 'var(--nav-py) var(--gutter)',
      borderBottom: '1px solid var(--hi-line)',
      background: 'color-mix(in oklch, var(--hi-paper) 86%, transparent)',
      backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      position: 'sticky', top: 0, zIndex: 40,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <BracketWordmark size={24} />
        <span style={{
          padding: '3px 9px', borderRadius: 999,
          border: '1px solid color-mix(in oklch, var(--c-sage) 38%, var(--hi-line))',
          background: 'color-mix(in oklch, var(--c-sage) 12%, var(--hi-paper))',
          color: 'var(--c-sage)', fontFamily: 'var(--hi-mono)', fontSize: 9,
          letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>Pembuat Halaman</span>
      </div>
      <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
        {store ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{
              width: 26, height: 26, borderRadius: 999, flex: 'none',
              background: 'var(--accent)', color: 'var(--accent-on)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--hi-serif)', fontSize: 14,
            }}>{store.slice(0, 1).toUpperCase()}</span>
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontFamily: 'var(--hi-sans)', fontSize: 13, fontWeight: 500, color: 'var(--hi-ink)' }}>{store}</div>
              <div style={{ fontFamily: 'var(--hi-mono)', fontSize: 8.5, letterSpacing: '0.1em', color: 'var(--c-sage)' }}>● TERHUBUNG</div>
            </div>
          </div>
        ) : (
          <span style={{ fontFamily: 'var(--hi-mono)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--hi-muted)' }}>v1.0 · BETA</span>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { BUILDER_CSS, BracketWordmark, Kicker, BuilderNav });
