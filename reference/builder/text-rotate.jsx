// TextRotate — rotating words with a colored box that smoothly resizes to
// each word, and per-character staggered slide-up entrance.
// Inspired by danielpetho/text-rotate (21st.dev).

function TextRotate({
  words,
  interval = 2400,
  boxColor = 'var(--accent)',
  textColor = 'var(--accent-on)',
}) {
  const [index, setIndex] = React.useState(0);
  const [boxW, setBoxW] = React.useState(null);
  const measureRef = React.useRef(null);

  React.useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return; // hold on first word
    const t = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);

  // Measure the rendered word and animate the box width to fit it.
  React.useLayoutEffect(() => {
    if (measureRef.current) setBoxW(measureRef.current.offsetWidth);
  }, [index]);

  const word = words[index];
  const chars = Array.from(word);

  return (
    <span style={{ display: 'inline-flex', verticalAlign: 'baseline' }}>
      <span
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: boxColor, color: textColor,
          borderRadius: '0.18em', padding: '0.04em 0.28em',
          overflow: 'hidden', position: 'relative',
          width: boxW != null ? boxW : 'auto',
          transition: 'width 0.5s cubic-bezier(0.22,1,0.36,1)',
          boxShadow: '0 10px 30px -16px color-mix(in oklch, ' + boxColor + ' 80%, transparent)',
        }}
      >
        {/* hidden measurer — same metrics, no animation */}
        <span
          ref={measureRef}
          aria-hidden="true"
          style={{
            position: 'absolute', visibility: 'hidden', whiteSpace: 'nowrap',
            padding: '0 0.28em', left: 0, top: 0, pointerEvents: 'none',
          }}
        >{word}</span>

        <span key={index} aria-label={word} style={{ display: 'inline-flex', whiteSpace: 'nowrap', lineHeight: 1.05 }}>
          {chars.map((ch, i) => (
            <span
              key={i}
              aria-hidden="true"
              style={{
                display: 'inline-block',
                animation: `tr-char-in 0.55s cubic-bezier(0.22,1,0.36,1) ${i * 0.028}s both`,
                whiteSpace: 'pre',
              }}
            >{ch === ' ' ? '\u00A0' : ch}</span>
          ))}
        </span>
      </span>
    </span>
  );
}

const TEXT_ROTATE_CSS = `
@keyframes tr-char-in {
  0%   { transform: translateY(115%); opacity: 0; }
  100% { transform: translateY(0);    opacity: 1; }
}
`;

Object.assign(window, { TextRotate, TEXT_ROTATE_CSS });
