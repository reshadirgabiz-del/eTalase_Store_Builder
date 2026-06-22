// Template catalogue data + a single scalable storefront-preview renderer.
// TemplatePreview sizes everything in container-query units (cqw), so the
// EXACT same markup scales cleanly from a small grid thumbnail up to a
// full-size modal preview just by changing the container's width.

const TEMPLATES = [
  { id: 'mocca',    name: 'Mocca',    cat: 'Fashion',   kind: 'editorial', palette: ['#f4ede0', '#c97e6e', '#1c1a14'], tag: 'Editorial',  blurb: 'Lookbook hangat untuk label fashion modest. Tipografi serif besar, banyak ruang putih.' },
  { id: 'garden',   name: 'Garden',   cat: 'Beauty',    kind: 'grid',      palette: ['#f1efe6', '#5d6b40', '#1c1a14'], tag: 'Katalog',    blurb: 'Grid produk rapi untuk skincare & perawatan. Fokus ke foto produk dan harga.' },
  { id: 'marigold', name: 'Marigold', cat: 'Makanan',   kind: 'split',     palette: ['#fff7e2', '#e8b85a', '#1c1a14'], tag: 'Split',      blurb: 'Hero terbelah dua — cerita brand di kiri, menu hari ini di kanan. Cocok untuk F&B.' },
  { id: 'senja',    name: 'Senja',    cat: 'Fashion',   kind: 'lookbook',  palette: ['#fbeee2', '#b65a30', '#1c1a14'], tag: 'Full-bleed', blurb: 'Satu foto besar penuh layar dengan judul melayang. Berani dan sinematik.' },
  { id: 'pasar',    name: 'Pasar',    cat: 'Aksesori',  kind: 'grid',      palette: ['#fbf6ec', '#1c1a14', '#1c1a14'], tag: 'Monokrom',   blurb: 'Hitam-putih tegas untuk aksesori & barang craft. Minimal, biar produknya bicara.' },
  { id: 'studio',   name: 'Studio',   cat: 'Beauty',    kind: 'split',     palette: ['#1c1a14', '#e8b85a', '#f4ede0'], tag: 'Gelap',      blurb: 'Mode gelap mewah untuk brand premium. Aksen emas, kontras tinggi.' },
  { id: 'kebon',    name: 'Kebon',    cat: 'Makanan',   kind: 'editorial', palette: ['#e8e4d3', '#5d6b40', '#1c1a14'], tag: 'Organik',    blurb: 'Nuansa sage natural untuk produk segar, organik, dan homemade.' },
  { id: 'bazaar',   name: 'Bazaar',   cat: 'Fashion',   kind: 'grid',      palette: ['#efe7d6', '#a8553a', '#1c1a14'], tag: 'Padat',      blurb: 'Grid rapat untuk toko dengan banyak SKU. Pelanggan cepat menemukan pilihan.' },
  { id: 'lumen',    name: 'Lumen',    cat: 'Beauty',    kind: 'lookbook',  palette: ['#f6f1ea', '#6e6757', '#1c1a14'], tag: 'Minimal',    blurb: 'Sangat lapang dan tenang. Satu produk hero, banyak nafas. Untuk brand clean-beauty.' },
  { id: 'sorga',    name: 'Sorga',    cat: 'Live',      kind: 'split',     palette: ['#fbeae6', '#c97e6e', '#1c1a14'], tag: 'Live',       blurb: 'Banner sesi live + daftar produk yang sedang dibahas. Dibuat untuk jualan live.' },
  { id: 'kanvas',   name: 'Kanvas',   cat: 'Aksesori',  kind: 'editorial', palette: ['#eef0e8', '#5d6b40', '#1c1a14'], tag: 'Galeri',     blurb: 'Tata letak galeri untuk karya seni, custom, dan made-to-order.' },
  { id: 'pelangi',  name: 'Pelangi',  cat: 'Live',      kind: 'grid',      palette: ['#fff4e2', '#b65a30', '#1c1a14'], tag: 'Ceria',      blurb: 'Warna hangat dan playful untuk toko yang ramai dan sering flash sale.' },
];

const CATEGORIES = ['Semua', 'Fashion', 'Beauty', 'Makanan', 'Aksesori', 'Live'];

// product names per category, for flavour
const SAMPLE = {
  Fashion:  [['Hijab Voal', 'Rp 89rb'], ['Outer Linen', 'Rp 245rb'], ['Dress Sage', 'Rp 320rb'], ['Tunik Mocca', 'Rp 175rb'], ['Kaos Premium', 'Rp 120rb'], ['Cardigan', 'Rp 210rb']],
  Beauty:   [['Serum Glow', 'Rp 145rb'], ['Day Cream', 'Rp 98rb'], ['Lip Tint', 'Rp 65rb'], ['Toner Mist', 'Rp 88rb'], ['Sunscreen', 'Rp 110rb'], ['Cleanser', 'Rp 75rb']],
  Makanan:  [['Kopi Robusta', 'Rp 68rb'], ['Granola Jar', 'Rp 52rb'], ['Madu Hutan', 'Rp 95rb'], ['Keripik Tempe', 'Rp 28rb'], ['Sambal Roa', 'Rp 45rb'], ['Teh Bunga', 'Rp 60rb']],
  Aksesori: [['Tas Anyam', 'Rp 180rb'], ['Bros Pearl', 'Rp 35rb'], ['Kalung Kayu', 'Rp 72rb'], ['Dompet Kulit', 'Rp 150rb'], ['Anting Mini', 'Rp 40rb'], ['Scarf Sutra', 'Rp 130rb']],
  Live:     [['Bundle Hemat', 'Rp 99rb'], ['Flash Item', 'Rp 49rb'], ['Paket Live', 'Rp 145rb'], ['Spesial Hari Ini', 'Rp 79rb'], ['Limited', 'Rp 165rb'], ['Giveaway+', 'Rp 25rb']],
};

function tiles(cat) { return SAMPLE[cat] || SAMPLE.Fashion; }

// ── The scalable preview ──────────────────────────────────────────────
function TemplatePreview({ tpl, scroll = false }) {
  const [bg, accent, ink] = tpl.palette;
  const onDark = bg === '#1c1a14';
  const soft = onDark ? 'rgba(244,237,224,0.10)' : 'rgba(28,26,20,0.06)';
  const line = onDark ? 'rgba(244,237,224,0.16)' : 'rgba(28,26,20,0.12)';
  const muted = onDark ? 'rgba(244,237,224,0.6)' : 'rgba(28,26,20,0.5)';
  const items = tiles(tpl.cat);

  const wrap = {
    containerType: 'inline-size',
    width: '100%', height: '100%',
    background: bg, color: ink,
    overflow: scroll ? 'auto' : 'hidden',
    fontFamily: 'var(--hi-sans)',
  };

  const ProductGrid = ({ cols = 3, count = 6 }) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '2.5cqw' }}>
      {items.slice(0, count).map(([nm, pr], i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '1.4cqw' }}>
          <div style={{
            aspectRatio: '1 / 1', borderRadius: '1.6cqw',
            background: i % 3 === 0 ? `color-mix(in srgb, ${accent} 60%, ${bg})` : soft,
            border: `0.3cqw solid ${line}`,
          }} />
          <div style={{ fontFamily: 'var(--hi-sans)', fontSize: '3cqw', fontWeight: 500, color: ink, lineHeight: 1.1 }}>{nm}</div>
          <div style={{ fontFamily: 'var(--hi-mono)', fontSize: '2.5cqw', color: muted }}>{pr}</div>
        </div>
      ))}
    </div>
  );

  const Header = () => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '4cqw 5cqw', borderBottom: `0.3cqw solid ${line}`,
    }}>
      <div style={{ fontFamily: 'var(--hi-serif)', fontSize: '5cqw', letterSpacing: '-0.01em', color: ink }}>{tpl.name}</div>
      <div style={{ display: 'flex', gap: '3cqw', alignItems: 'center' }}>
        {['Toko', 'Tentang', 'Kontak'].map((n) => (
          <span key={n} style={{ fontFamily: 'var(--hi-sans)', fontSize: '2.6cqw', color: muted }}>{n}</span>
        ))}
        <span style={{ width: '6cqw', height: '6cqw', borderRadius: 999, background: accent, display: 'inline-block' }} />
      </div>
    </div>
  );

  const Pill = ({ children }) => (
    <span style={{
      display: 'inline-block', padding: '2.2cqw 4.5cqw', borderRadius: 999,
      background: accent, color: onDark ? ink : bg,
      fontFamily: 'var(--hi-sans)', fontSize: '2.8cqw', fontWeight: 500,
    }}>{children}</span>
  );

  const Footer = () => (
    <div style={{
      padding: '5cqw', borderTop: `0.3cqw solid ${line}`,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <span style={{ fontFamily: 'var(--hi-serif)', fontSize: '3.4cqw', color: ink }}>{tpl.name}</span>
      <span style={{ fontFamily: 'var(--hi-mono)', fontSize: '2.2cqw', color: muted, letterSpacing: '0.08em' }}>© 2026 · E-TALASE</span>
    </div>
  );

  let hero = null;
  if (tpl.kind === 'editorial') {
    hero = (
      <div style={{ padding: '7cqw 5cqw 5cqw' }}>
        <div style={{ fontFamily: 'var(--hi-mono)', fontSize: '2.4cqw', letterSpacing: '0.16em', color: accent, textTransform: 'uppercase', marginBottom: '2.5cqw' }}>Koleksi Baru</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4cqw', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--hi-serif)', fontSize: '6.2cqw', lineHeight: 1.05, letterSpacing: '-0.02em', color: ink, marginBottom: '4cqw' }}>
              Koleksi <span style={{ fontStyle: 'italic', color: accent }}>pilihan.</span>
            </div>
            <Pill>Belanja →</Pill>
          </div>
          <div style={{ aspectRatio: '4 / 5', borderRadius: '2cqw', background: `color-mix(in srgb, ${accent} 55%, ${bg})`, border: `0.3cqw solid ${line}` }} />
        </div>
      </div>
    );
  } else if (tpl.kind === 'split') {
    hero = (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '48cqw' }}>
        <div style={{ background: accent, color: onDark ? ink : bg, padding: '6cqw 5cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '3.5cqw' }}>
          <div style={{ fontFamily: 'var(--hi-serif)', fontSize: '6cqw', lineHeight: 1.06, letterSpacing: '-0.02em' }}>
            {tpl.cat === 'Makanan' ? 'Segar tiap hari.' : tpl.cat === 'Live' ? 'Live malam ini.' : 'Halo, selamat datang.'}
          </div>
          <span style={{ display: 'inline-block', width: 'fit-content', padding: '2.2cqw 4.5cqw', borderRadius: 999, background: bg, color: ink, fontSize: '2.8cqw', fontWeight: 500 }}>Lihat menu →</span>
        </div>
        <div style={{ padding: '6cqw 5cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <ProductGrid cols={2} count={4} />
        </div>
      </div>
    );
  } else if (tpl.kind === 'lookbook') {
    hero = (
      <div style={{ position: 'relative', height: '52cqw', background: `color-mix(in srgb, ${accent} 65%, ${bg})`, display: 'flex', alignItems: 'flex-end', padding: '6cqw' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, transparent 40%, ${onDark ? 'rgba(0,0,0,0.55)' : 'rgba(28,26,20,0.42)'})` }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: 'var(--hi-mono)', fontSize: '2.4cqw', letterSpacing: '0.18em', color: '#fff', opacity: 0.9, marginBottom: '2cqw' }}>SS · 2026</div>
          <div style={{ fontFamily: 'var(--hi-serif)', fontSize: '9.5cqw', lineHeight: 1.0, letterSpacing: '-0.02em', color: '#fff' }}>
            {tpl.name} <span style={{ fontStyle: 'italic' }}>Lookbook</span>
          </div>
        </div>
      </div>
    );
  } else { // grid
    hero = (
      <div style={{ padding: '6cqw 5cqw 3cqw', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--hi-mono)', fontSize: '2.4cqw', letterSpacing: '0.18em', color: accent, textTransform: 'uppercase', marginBottom: '2cqw' }}>Etalase · {tpl.cat}</div>
        <div style={{ fontFamily: 'var(--hi-serif)', fontSize: '6.6cqw', lineHeight: 1.04, letterSpacing: '-0.02em', color: ink, marginBottom: '3cqw' }}>
          Semua koleksi, <span style={{ fontStyle: 'italic', color: accent }}>satu tempat.</span>
        </div>
        <Pill>Jelajahi katalog →</Pill>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <Header />
      {hero}
      <div style={{ padding: '5cqw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3.5cqw' }}>
          <div style={{ fontFamily: 'var(--hi-serif)', fontSize: '4.6cqw', color: ink }}>Produk pilihan</div>
          <div style={{ fontFamily: 'var(--hi-mono)', fontSize: '2.4cqw', color: muted }}>Lihat semua →</div>
        </div>
        <ProductGrid cols={3} count={6} />
      </div>
      <Footer />
    </div>
  );
}

Object.assign(window, { TEMPLATES, CATEGORIES, TemplatePreview, tiles });
