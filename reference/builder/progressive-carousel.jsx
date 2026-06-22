// ProgressiveCarousel — a stacked deck of template cards. The front card is
// full-size; the rest fan out behind it, scaled + offset. Click the deck (or
// a back card, or the dots) to advance. Inspired by ui-layouts/progressive-carousel.

function ProgressiveCarousel({ templates, onPreview, autoplay = true, cardW = 300, cardH = 392 }) {
  const n = templates.length;
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (!autoplay || paused) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const t = setInterval(() => setActive((a) => (a + 1) % n), 3200);
    return () => clearInterval(t);
  }, [autoplay, paused, n]);

  const VISIBLE = Math.min(4, n);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, userSelect: 'none' }}
    >
      <div style={{
        position: 'relative',
        width: cardW + 130, height: cardH + 28,
        perspective: '1400px',
      }}>
        {templates.map((tpl, i) => {
          const offset = (i - active + n) % n; // 0 = front
          const shown = offset < VISIBLE;
          const front = offset === 0;
          return (
            <div
              key={tpl.id}
              onClick={() => {
                if (front) { onPreview && onPreview(tpl); }
                else setActive(i);
              }}
              style={{
                position: 'absolute', top: 0, left: '50%',
                width: cardW, height: cardH,
                transformOrigin: 'center center',
                transform: `translateX(-50%) translateX(${offset * 42}px) translateY(${offset * 6}px) scale(${1 - offset * 0.07})`,
                opacity: shown ? (front ? 1 : 0.55 - offset * 0.06) : 0,
                zIndex: n - offset,
                pointerEvents: shown ? 'auto' : 'none',
                cursor: front ? 'zoom-in' : 'pointer',
                transition: 'transform 0.6s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ease',
                filter: front ? 'none' : 'saturate(0.9)',
              }}
            >
              <div style={{
                width: '100%', height: '100%',
                borderRadius: 16, overflow: 'hidden',
                background: 'var(--hi-card)',
                border: '1px solid var(--hi-line)',
                boxShadow: front
                  ? '0 40px 80px -36px rgba(28,26,20,0.55)'
                  : '0 20px 50px -30px rgba(28,26,20,0.4)',
                display: 'flex', flexDirection: 'column',
              }}>
                <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                  <TemplatePreview tpl={tpl} />
                  {front && (
                    <div className="pc-hint" style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'color-mix(in oklch, var(--hi-ink) 30%, transparent)',
                      opacity: 0, transition: 'opacity 0.25s ease',
                    }}>
                      <span style={{
                        padding: '9px 18px', borderRadius: 999,
                        background: 'var(--hi-paper)', color: 'var(--hi-ink)',
                        fontFamily: 'var(--hi-sans)', fontSize: 13, fontWeight: 500,
                        boxShadow: '0 10px 30px -12px rgba(0,0,0,0.5)',
                      }}>Pratinjau penuh →</span>
                    </div>
                  )}
                </div>
                <div style={{
                  flex: 'none', padding: '11px 14px',
                  borderTop: '1px solid var(--hi-line)', background: 'var(--hi-paper)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontFamily: 'var(--hi-serif)', fontSize: 17, color: 'var(--hi-ink)', lineHeight: 1 }}>{tpl.name}</div>
                    <div style={{ fontFamily: 'var(--hi-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--hi-muted)', marginTop: 3, textTransform: 'uppercase' }}>{tpl.cat} · {tpl.tag}</div>
                  </div>
                  <span style={{
                    width: 30, height: 30, borderRadius: 999, flex: 'none',
                    background: 'color-mix(in oklch, var(--accent) 14%, var(--hi-paper))',
                    color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14,
                  }}>↗</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* dots */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {templates.map((tpl, i) => (
          <button
            key={tpl.id}
            onClick={() => setActive(i)}
            aria-label={tpl.name}
            style={{
              width: i === active ? 26 : 8, height: 8, borderRadius: 999, border: 'none', padding: 0,
              background: i === active ? 'var(--accent)' : 'var(--hi-line)',
              cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

const CAROUSEL_CSS = `
.pc-hint:hover { opacity: 1 !important; }
`;

Object.assign(window, { ProgressiveCarousel, CAROUSEL_CSS });
