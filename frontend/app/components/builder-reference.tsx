"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import etalaseLogo from "../../assets/logo.png";
import templateClassicShot from "../../assets/templateScreenshots/storefront-classic.png";
import templateModernShot from "../../assets/templateScreenshots/storefront-modern.png";
import templatePastelShot from "../../assets/templateScreenshots/storefront-pastel.png";
import templateCyberShot from "../../assets/templateScreenshots/storefront-cyber-glitch.png";
import { templates as realTemplates, type TemplateId } from "@/lib/templates";

const REAL_TEMPLATE_SCREENSHOTS: Partial<Record<TemplateId, { src: string }>> = {
  "storefront-classic": templateClassicShot,
  "storefront-modern": templateModernShot,
  "storefront-bauhaus": templateModernShot,
  "storefront-pastel": templatePastelShot,
  "storefront-pastel-bauhaus": templatePastelShot,
  "storefront-cyber": templateCyberShot,
  "storefront-editorial": templateClassicShot,
  "storefront-brutalist": templateModernShot,
};

const STANDARD_TEMPLATES = realTemplates.filter((t) => t.id !== "custom-upload");

type Template = {
  id: string;
  name: string;
  cat: "Fashion" | "Beauty" | "Makanan" | "Aksesori" | "Live";
  kind: "editorial" | "grid" | "split" | "lookbook";
  palette: [string, string, string];
  tag: string;
  blurb: string;
};

const TEMPLATES: Template[] = [
  { id: "mocca", name: "Mocca", cat: "Fashion", kind: "editorial", palette: ["#f4ede0", "#c97e6e", "#1c1a14"], tag: "Editorial", blurb: "Lookbook hangat untuk label fashion modest. Tipografi serif besar, banyak ruang putih." },
  { id: "garden", name: "Garden", cat: "Beauty", kind: "grid", palette: ["#f1efe6", "#5d6b40", "#1c1a14"], tag: "Katalog", blurb: "Grid produk rapi untuk skincare & perawatan. Fokus ke foto produk dan harga." },
  { id: "marigold", name: "Marigold", cat: "Makanan", kind: "split", palette: ["#fff7e2", "#e8b85a", "#1c1a14"], tag: "Split", blurb: "Hero terbelah dua dengan cerita brand di kiri dan menu hari ini di kanan. Cocok untuk F&B." },
  { id: "senja", name: "Senja", cat: "Fashion", kind: "lookbook", palette: ["#fbeee2", "#b65a30", "#1c1a14"], tag: "Full-bleed", blurb: "Satu foto besar penuh layar dengan judul melayang. Berani dan sinematik." },
  { id: "pasar", name: "Pasar", cat: "Aksesori", kind: "grid", palette: ["#fbf6ec", "#1c1a14", "#1c1a14"], tag: "Monokrom", blurb: "Hitam-putih tegas untuk aksesori & barang craft. Minimal, biar produknya bicara." },
  { id: "studio", name: "Studio", cat: "Beauty", kind: "split", palette: ["#1c1a14", "#e8b85a", "#f4ede0"], tag: "Gelap", blurb: "Mode gelap mewah untuk brand premium. Aksen emas, kontras tinggi." },
  { id: "kebon", name: "Kebon", cat: "Makanan", kind: "editorial", palette: ["#e8e4d3", "#5d6b40", "#1c1a14"], tag: "Organik", blurb: "Nuansa sage natural untuk produk segar, organik, dan homemade." },
  { id: "bazaar", name: "Bazaar", cat: "Fashion", kind: "grid", palette: ["#efe7d6", "#a8553a", "#1c1a14"], tag: "Padat", blurb: "Grid rapat untuk toko dengan banyak SKU. Pelanggan cepat menemukan pilihan." },
  { id: "lumen", name: "Lumen", cat: "Beauty", kind: "lookbook", palette: ["#f6f1ea", "#6e6757", "#1c1a14"], tag: "Minimal", blurb: "Sangat lapang dan tenang. Satu produk hero, banyak nafas. Untuk brand clean-beauty." },
  { id: "sorga", name: "Sorga", cat: "Live", kind: "split", palette: ["#fbeae6", "#c97e6e", "#1c1a14"], tag: "Live", blurb: "Banner sesi live dan daftar produk yang sedang dibahas. Dibuat untuk jualan live." },
  { id: "kanvas", name: "Kanvas", cat: "Aksesori", kind: "editorial", palette: ["#eef0e8", "#5d6b40", "#1c1a14"], tag: "Galeri", blurb: "Tata letak galeri untuk karya seni, custom, dan made-to-order." },
  { id: "pelangi", name: "Pelangi", cat: "Live", kind: "grid", palette: ["#fff4e2", "#b65a30", "#1c1a14"], tag: "Ceria", blurb: "Warna hangat dan playful untuk toko yang ramai dan sering flash sale." },
];

const STORE_ID_STORAGE_KEY = "etalase-builder-store-id";
const PUBLIC_STORE_KEY_STORAGE_KEY = "etalase-builder-public-store-key";
const STORE_NAME_STORAGE_KEY = "etalase-builder-store-name";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function setBuilderCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function getBuilderCookie(name: string) {
  const raw = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");
  return raw ? decodeURIComponent(raw) : "";
}

function persistBuilderCredentials(storeId: string, publicKey: string, storeName: string) {
  window.localStorage.setItem(STORE_ID_STORAGE_KEY, storeId);
  window.localStorage.setItem(PUBLIC_STORE_KEY_STORAGE_KEY, publicKey);
  window.localStorage.setItem(STORE_NAME_STORAGE_KEY, storeName);
  setBuilderCookie(STORE_ID_STORAGE_KEY, storeId);
  setBuilderCookie(PUBLIC_STORE_KEY_STORAGE_KEY, publicKey);
  setBuilderCookie(STORE_NAME_STORAGE_KEY, storeName);
}

const CATEGORIES = ["Semua", "Fashion", "Beauty", "Makanan", "Aksesori", "Live"] as const;

const SAMPLE: Record<Template["cat"], [string, string][]> = {
  Fashion: [["Hijab Voal", "Rp 89rb"], ["Outer Linen", "Rp 245rb"], ["Dress Sage", "Rp 320rb"], ["Tunik Mocca", "Rp 175rb"], ["Kaos Premium", "Rp 120rb"], ["Cardigan", "Rp 210rb"]],
  Beauty: [["Serum Glow", "Rp 145rb"], ["Day Cream", "Rp 98rb"], ["Lip Tint", "Rp 65rb"], ["Toner Mist", "Rp 88rb"], ["Sunscreen", "Rp 110rb"], ["Cleanser", "Rp 75rb"]],
  Makanan: [["Kopi Robusta", "Rp 68rb"], ["Granola Jar", "Rp 52rb"], ["Madu Hutan", "Rp 95rb"], ["Keripik Tempe", "Rp 28rb"], ["Sambal Roa", "Rp 45rb"], ["Teh Bunga", "Rp 60rb"]],
  Aksesori: [["Tas Anyam", "Rp 180rb"], ["Bros Pearl", "Rp 35rb"], ["Kalung Kayu", "Rp 72rb"], ["Dompet Kulit", "Rp 150rb"], ["Anting Mini", "Rp 40rb"], ["Scarf Sutra", "Rp 130rb"]],
  Live: [["Bundle Hemat", "Rp 99rb"], ["Flash Item", "Rp 49rb"], ["Paket Live", "Rp 145rb"], ["Spesial Hari Ini", "Rp 79rb"], ["Limited", "Rp 165rb"], ["Giveaway+", "Rp 25rb"]],
};

const builderCss = `
.bld {
  --hi-paper: #f4ede0;
  --hi-card: #fbf6ec;
  --hi-chrome: #efe7d6;
  --hi-ink: #1c1a14;
  --hi-muted: #6e6757;
  --hi-line: rgba(28,26,20,0.12);
  --accent: #5d6b40;
  --accent-on: #f4ede0;
  --c-sage: #5d6b40;
  --c-terra: #b65a30;
  --c-butter: #e8b85a;
  --c-rose: #c97e6e;
  --hi-serif: var(--font-fraunces), var(--font-cormorant), ui-serif, Georgia, serif;
  --hi-sans: var(--font-hanken), ui-sans-serif, system-ui, sans-serif;
  --hi-mono: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
  --gutter: 64px;
  --nav-py: 18px;
  --h1: 80px;
  --h2: 52px;
  --h3: 30px;
  --lead: 18px;
  --body: 15px;
  min-height: 100vh;
  overflow-x: clip;
  background: var(--hi-paper);
  color: var(--hi-ink);
  font-family: var(--hi-sans);
}
.bld * { box-sizing: border-box; }
.bld button, .bld input { font-family: inherit; }
.bld input::placeholder { color: color-mix(in oklch, var(--hi-muted) 80%, transparent); }
.bld input:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 3px color-mix(in oklch, var(--accent) 18%, transparent); }
.bld-th-grid { display: grid; grid-template-columns: minmax(0,1.05fr) minmax(0,0.95fr); gap: 56px; align-items: center; }
.bld-upload-only-mobile { display: none; }
.pc-hint:hover { opacity: 1 !important; }
.cat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
.cat-card { cursor: pointer; transition: transform 0.25s cubic-bezier(0.22,1,0.36,1); }
.cat-card:hover { transform: translateY(-5px); }
.cat-card:hover .cat-overlay { opacity: 1; }
.cat-card:hover .cat-thumb { box-shadow: 0 32px 60px -30px rgba(28,26,20,0.5); }
.cat-modal-grid { display: grid; grid-template-columns: minmax(0,1.45fr) minmax(0,1fr); }
.cat-chip { cursor: pointer; transition: all 0.2s; white-space: nowrap; }
@keyframes bld-pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.18); opacity: .65; } }
@keyframes bld-fade-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes bld-spin { to { transform: rotate(360deg); } }
@keyframes tr-char-in { 0% { transform: translateY(115%); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
@keyframes cat-modal-in { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: none; } }
@keyframes cat-fade { from { opacity: 0; } to { opacity: 1; } }
@media (max-width: 1099px) { .bld { --gutter: 40px; --h1: 60px; --h2: 42px; --h3: 26px; } }
@media (max-width: 980px) { .cat-grid { grid-template-columns: repeat(2, 1fr); gap: 18px; } }
@media (max-width: 880px) {
  .bld-th-grid { grid-template-columns: 1fr; gap: 40px; }
  .bld-upload-desktop { display: none !important; }
  .bld-upload-only-mobile { display: flex !important; }
  .cat-modal-grid { grid-template-columns: 1fr; }
}
@media (max-width: 720px) {
  .bld { --gutter: 20px; --nav-py: 14px; --h1: 40px; --h2: 30px; --h3: 22px; --lead: 15px; --body: 14px; }
  .bld-hero-decor { display: none !important; }
}
@media (max-width: 600px) { .cat-grid { grid-template-columns: 1fr; } }
`;

function BuilderStyles() {
  return <style>{builderCss}</style>;
}

function BracketWordmark({ size = 24 }: { size?: number }) {
  return (
    <a
      href="https://e-talase.com"
      aria-label="e-talase"
      style={{ display: "inline-flex", alignItems: "center", lineHeight: 1, whiteSpace: "nowrap" }}
    >
      <img
        src={etalaseLogo.src}
        alt="e-talase"
        style={{ height: size * 1.3, width: "auto", display: "block" }}
      />
    </a>
  );
}

function Kicker({ children, color = "var(--hi-muted)", style = {} }: { children: React.ReactNode; color?: string; style?: CSSProperties }) {
  return <div style={{ fontFamily: "var(--hi-mono)", fontSize: 10, letterSpacing: "0.14em", color, textTransform: "uppercase", ...style }}>{children}</div>;
}

function BuilderNav({ store = null, onChangeStore }: { store?: string | null; onChangeStore?: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--nav-py) var(--gutter)", borderBottom: "1px solid var(--hi-line)", background: "color-mix(in oklch, var(--hi-paper) 86%, transparent)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <BracketWordmark size={24} />
        <span style={{ padding: "3px 9px", borderRadius: 999, border: "1px solid color-mix(in oklch, var(--c-sage) 38%, var(--hi-line))", background: "color-mix(in oklch, var(--c-sage) 12%, var(--hi-paper))", color: "var(--c-sage)", fontFamily: "var(--hi-mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>Storefront builder</span>
      </div>
      {store ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 26, height: 26, borderRadius: 999, flex: "none", background: "var(--accent)", color: "var(--accent-on)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--hi-serif)", fontSize: 14 }}>{store.slice(0, 1).toUpperCase()}</span>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--hi-ink)" }}>{store}</div>
            <div style={{ fontFamily: "var(--hi-mono)", fontSize: 8.5, letterSpacing: "0.1em", color: "var(--c-sage)" }}>TERHUBUNG</div>
          </div>
          {onChangeStore ? (
            <button
              type="button"
              onClick={onChangeStore}
              style={{ marginLeft: 6, padding: "7px 13px", borderRadius: 999, border: "1px solid var(--hi-line)", background: "var(--hi-card)", color: "var(--hi-ink)", fontSize: 12.5, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, transition: "border-color 180ms ease, background 180ms ease" }}
              aria-label="Ubah Store ID"
              title="Ubah Store ID"
            >
              <span style={{ fontFamily: "var(--hi-mono)", fontSize: 11 }}>↻</span>
              Ubah Store ID
            </button>
          ) : null}
        </div>
      ) : (
        <span style={{ fontFamily: "var(--hi-mono)", fontSize: 11, letterSpacing: "0.08em", color: "var(--hi-muted)" }}>v1.0 · BETA</span>
      )}
    </div>
  );
}

function BlueprintDecor() {
  const ticks = [
    [300, 150],
    [1030, 470],
    [170, 560],
    [1130, 200],
  ];

  return (
    <div className="bld-hero-decor" aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(93,107,64,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(93,107,64,0.09) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(93,107,64,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(93,107,64,0.16) 1px, transparent 1px)", backgroundSize: "160px 160px", maskImage: "radial-gradient(ellipse 80% 78% at 50% 44%, transparent 32%, #000 88%)", WebkitMaskImage: "radial-gradient(ellipse 80% 78% at 50% 44%, transparent 32%, #000 88%)" }} />
      <div style={{ position: "absolute", top: "34%", left: "50%", transform: "translate(-50%,-50%)", width: 620, height: 380, borderRadius: 999, background: "radial-gradient(ellipse, color-mix(in oklch, var(--c-butter) 22%, transparent), transparent 70%)", filter: "blur(24px)" }} />

      <div style={{ position: "absolute", top: 78, right: 120, width: 150, height: 150, borderRadius: 999, border: "1.5px solid var(--c-terra)", opacity: 0.5 }} />
      <div style={{ position: "absolute", top: 112, right: 154, width: 82, height: 82, border: "1.5px solid var(--c-terra)", opacity: 0.38, transform: "rotate(18deg)" }} />
      <div style={{ position: "absolute", bottom: 120, left: 130, width: 0, height: 0, borderLeft: "34px solid transparent", borderRight: "34px solid transparent", borderBottom: "58px solid color-mix(in oklch, var(--c-sage) 26%, transparent)" }} />

      {ticks.map(([x, y], i) => (
        <div key={i} style={{ position: "absolute", left: x, top: y }}>
          <div style={{ position: "absolute", width: 16, height: 1.5, background: "var(--c-terra)", opacity: 0.7, top: 7, left: -8 }} />
          <div style={{ position: "absolute", height: 16, width: 1.5, background: "var(--c-terra)", opacity: 0.7, left: 7, top: -8 }} />
        </div>
      ))}

      <div style={{ position: "absolute", top: 18, left: 24, whiteSpace: "nowrap", fontFamily: "var(--hi-mono)", fontSize: 10, letterSpacing: "0.1em", color: "color-mix(in oklch, var(--c-sage) 55%, var(--hi-muted))" }}>E-TALASE · BUILDER / v1.0 — [ HALAMAN TOKO ]</div>
      <div style={{ position: "absolute", bottom: 16, right: 24, whiteSpace: "nowrap", fontFamily: "var(--hi-mono)", fontSize: 10, letterSpacing: "0.1em", color: "color-mix(in oklch, var(--c-sage) 55%, var(--hi-muted))" }}>FIG.01 — CONNECT & SELECT</div>

      <div style={{ position: "absolute", top: 84, left: 78, transform: "rotate(-12deg)" }}>
        <div style={{ width: 62, height: 62, borderRadius: 18, background: "var(--c-rose)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 18px 36px -16px var(--c-rose)", color: "var(--hi-paper)", fontFamily: "var(--hi-serif)", fontStyle: "italic", fontSize: 30 }}>e</div>
      </div>
      <div style={{ position: "absolute", bottom: 130, right: 96, transform: "rotate(14deg)" }}>
        <div style={{ width: 54, height: 54, borderRadius: 15, background: "var(--c-butter)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 16px 32px -16px var(--c-butter)", color: "var(--hi-ink)", fontFamily: "var(--hi-serif)", fontStyle: "italic", fontSize: 26 }}>e</div>
      </div>
      <div style={{ position: "absolute", bottom: 170, left: 96, width: 38, height: 38, borderRadius: 999, background: "var(--c-terra)", boxShadow: "0 14px 28px -12px var(--c-terra)" }} />
      <div style={{ position: "absolute", top: 330, right: 210, width: 30, height: 30 }}>
        <div style={{ position: "absolute", top: "45%", left: 0, width: "100%", height: 3, background: "var(--c-sage)" }} />
        <div style={{ position: "absolute", left: "45%", top: 0, height: "100%", width: 3, background: "var(--c-sage)" }} />
      </div>
    </div>
  );
}

function TextRotate({ words, interval = 2400 }: { words: string[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  const [boxW, setBoxW] = useState<number | null>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => window.clearInterval(t);
  }, [interval, words.length]);

  useLayoutEffect(() => {
    if (measureRef.current) setBoxW(measureRef.current.offsetWidth);
  }, [index]);

  const word = words[index];
  return (
    <span style={{ display: "inline-flex", verticalAlign: "baseline" }}>
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: "var(--accent)", color: "var(--accent-on)", borderRadius: "0.18em", padding: "0.04em 0.28em", overflow: "hidden", position: "relative", width: boxW ?? "auto", transition: "width 0.5s cubic-bezier(0.22,1,0.36,1)", boxShadow: "0 10px 30px -16px color-mix(in oklch, var(--accent) 80%, transparent)" }}>
        <span ref={measureRef} aria-hidden="true" style={{ position: "absolute", visibility: "hidden", whiteSpace: "nowrap", padding: "0 0.28em", left: 0, top: 0, pointerEvents: "none" }}>{word}</span>
        <span key={index} aria-label={word} style={{ display: "inline-flex", whiteSpace: "nowrap", lineHeight: 1.05 }}>
          {Array.from(word).map((ch, i) => <span key={`${ch}-${i}`} aria-hidden="true" style={{ display: "inline-block", animation: `tr-char-in 0.55s cubic-bezier(0.22,1,0.36,1) ${i * 0.028}s both`, whiteSpace: "pre" }}>{ch === " " ? "\u00A0" : ch}</span>)}
        </span>
      </span>
    </span>
  );
}

function TemplatePreview({ tpl, scroll = false }: { tpl: Template; scroll?: boolean }) {
  const [bg, accent, ink] = tpl.palette;
  const onDark = bg === "#1c1a14";
  const soft = onDark ? "rgba(244,237,224,0.10)" : "rgba(28,26,20,0.06)";
  const line = onDark ? "rgba(244,237,224,0.16)" : "rgba(28,26,20,0.12)";
  const muted = onDark ? "rgba(244,237,224,0.6)" : "rgba(28,26,20,0.5)";
  const items = SAMPLE[tpl.cat];

  const productGrid = (cols = 3, count = 6) => (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "2.5cqw" }}>
      {items.slice(0, count).map(([name, price], i) => (
        <div key={name} style={{ display: "flex", flexDirection: "column", gap: "1.4cqw" }}>
          <div style={{ aspectRatio: "1 / 1", borderRadius: "1.6cqw", background: i % 3 === 0 ? `color-mix(in srgb, ${accent} 60%, ${bg})` : soft, border: `0.3cqw solid ${line}` }} />
          <div style={{ fontSize: "3cqw", fontWeight: 500, color: ink, lineHeight: 1.1 }}>{name}</div>
          <div style={{ fontFamily: "var(--hi-mono)", fontSize: "2.5cqw", color: muted }}>{price}</div>
        </div>
      ))}
    </div>
  );

  const pill = (children: string) => <span style={{ display: "inline-block", padding: "2.2cqw 4.5cqw", borderRadius: 999, background: accent, color: onDark ? ink : bg, fontSize: "2.8cqw", fontWeight: 500 }}>{children}</span>;

  let hero: React.ReactNode;
  if (tpl.kind === "editorial") {
    hero = (
      <div style={{ padding: "7cqw 5cqw 5cqw" }}>
        <div style={{ fontFamily: "var(--hi-mono)", fontSize: "2.4cqw", letterSpacing: "0.16em", color: accent, textTransform: "uppercase", marginBottom: "2.5cqw" }}>Koleksi Baru</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4cqw", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--hi-serif)", fontSize: "6.2cqw", lineHeight: 1.05, letterSpacing: 0, color: ink, marginBottom: "4cqw" }}>Koleksi <span style={{ fontStyle: "italic", color: accent }}>pilihan.</span></div>
            {pill("Belanja →")}
          </div>
          <div style={{ aspectRatio: "4 / 5", borderRadius: "2cqw", background: `color-mix(in srgb, ${accent} 55%, ${bg})`, border: `0.3cqw solid ${line}` }} />
        </div>
      </div>
    );
  } else if (tpl.kind === "split") {
    hero = (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "48cqw" }}>
        <div style={{ background: accent, color: onDark ? ink : bg, padding: "6cqw 5cqw", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3.5cqw" }}>
          <div style={{ fontFamily: "var(--hi-serif)", fontSize: "6cqw", lineHeight: 1.06, letterSpacing: 0 }}>{tpl.cat === "Makanan" ? "Segar tiap hari." : tpl.cat === "Live" ? "Live malam ini." : "Halo, selamat datang."}</div>
          <span style={{ display: "inline-block", width: "fit-content", padding: "2.2cqw 4.5cqw", borderRadius: 999, background: bg, color: ink, fontSize: "2.8cqw", fontWeight: 500 }}>Lihat menu →</span>
        </div>
        <div style={{ padding: "6cqw 5cqw", display: "flex", flexDirection: "column", justifyContent: "center" }}>{productGrid(2, 4)}</div>
      </div>
    );
  } else if (tpl.kind === "lookbook") {
    hero = (
      <div style={{ position: "relative", height: "52cqw", background: `color-mix(in srgb, ${accent} 65%, ${bg})`, display: "flex", alignItems: "flex-end", padding: "6cqw" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 40%, ${onDark ? "rgba(0,0,0,0.55)" : "rgba(28,26,20,0.42)"})` }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: "var(--hi-mono)", fontSize: "2.4cqw", letterSpacing: "0.18em", color: "#fff", opacity: 0.9, marginBottom: "2cqw" }}>SS · 2026</div>
          <div style={{ fontFamily: "var(--hi-serif)", fontSize: "9.5cqw", lineHeight: 1, letterSpacing: 0, color: "#fff" }}>{tpl.name} <span style={{ fontStyle: "italic" }}>Lookbook</span></div>
        </div>
      </div>
    );
  } else {
    hero = (
      <div style={{ padding: "6cqw 5cqw 3cqw", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--hi-mono)", fontSize: "2.4cqw", letterSpacing: "0.18em", color: accent, textTransform: "uppercase", marginBottom: "2cqw" }}>Etalase · {tpl.cat}</div>
        <div style={{ fontFamily: "var(--hi-serif)", fontSize: "6.6cqw", lineHeight: 1.04, letterSpacing: 0, color: ink, marginBottom: "3cqw" }}>Semua koleksi, <span style={{ fontStyle: "italic", color: accent }}>satu tempat.</span></div>
        {pill("Jelajahi katalog →")}
      </div>
    );
  }

  return (
    <div style={{ containerType: "inline-size", width: "100%", height: "100%", background: bg, color: ink, overflow: scroll ? "auto" : "hidden", fontFamily: "var(--hi-sans)" } as CSSProperties}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4cqw 5cqw", borderBottom: `0.3cqw solid ${line}` }}>
        <div style={{ fontFamily: "var(--hi-serif)", fontSize: "5cqw", letterSpacing: 0, color: ink }}>{tpl.name}</div>
        <div style={{ display: "flex", gap: "3cqw", alignItems: "center" }}>
          {["Toko", "Tentang", "Kontak"].map((n) => <span key={n} style={{ fontSize: "2.6cqw", color: muted }}>{n}</span>)}
          <span style={{ width: "6cqw", height: "6cqw", borderRadius: 999, background: accent, display: "inline-block" }} />
        </div>
      </div>
      {hero}
      <div style={{ padding: "5cqw" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3.5cqw" }}>
          <div style={{ fontFamily: "var(--hi-serif)", fontSize: "4.6cqw", color: ink }}>Produk pilihan</div>
          <div style={{ fontFamily: "var(--hi-mono)", fontSize: "2.4cqw", color: muted }}>Lihat semua →</div>
        </div>
        {productGrid(3, 6)}
      </div>
      <div style={{ padding: "5cqw", borderTop: `0.3cqw solid ${line}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--hi-serif)", fontSize: "3.4cqw", color: ink }}>{tpl.name}</span>
        <span style={{ fontFamily: "var(--hi-mono)", fontSize: "2.2cqw", color: muted, letterSpacing: "0.08em" }}>© 2026 · E-TALASE</span>
      </div>
    </div>
  );
}

function ProgressiveCarousel({ templates, onPreview }: { templates: Template[]; onPreview: (tpl: Template) => void }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = templates.length;

  useEffect(() => {
    if (paused || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setActive((a) => (a + 1) % n), 3200);
    return () => window.clearInterval(t);
  }, [n, paused]);

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, userSelect: "none" }}>
      <div style={{ position: "relative", width: "min(430px, 100%)", height: 420, perspective: "1400px" }}>
        {templates.map((tpl, i) => {
          const offset = (i - active + n) % n;
          const shown = offset < Math.min(4, n);
          const front = offset === 0;
          return (
            <div key={tpl.id} onClick={() => front ? onPreview(tpl) : setActive(i)} style={{ position: "absolute", top: 0, left: "50%", width: 300, maxWidth: "78vw", height: 392, transformOrigin: "center center", transform: `translateX(-50%) translateX(${offset * 42}px) translateY(${offset * 6}px) scale(${1 - offset * 0.07})`, opacity: shown ? (front ? 1 : 0.55 - offset * 0.06) : 0, zIndex: n - offset, pointerEvents: shown ? "auto" : "none", cursor: front ? "zoom-in" : "pointer", transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ease", filter: front ? "none" : "saturate(0.9)" }}>
              <div style={{ width: "100%", height: "100%", borderRadius: 16, overflow: "hidden", background: "var(--hi-card)", border: "1px solid var(--hi-line)", boxShadow: front ? "0 40px 80px -36px rgba(28,26,20,0.55)" : "0 20px 50px -30px rgba(28,26,20,0.4)", display: "flex", flexDirection: "column" }}>
                <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
                  <TemplatePreview tpl={tpl} />
                  {front && <div className="pc-hint" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "color-mix(in oklch, var(--hi-ink) 30%, transparent)", opacity: 0, transition: "opacity 0.25s ease" }}><span style={{ padding: "9px 18px", borderRadius: 999, background: "var(--hi-paper)", color: "var(--hi-ink)", fontSize: 13, fontWeight: 500, boxShadow: "0 10px 30px -12px rgba(0,0,0,0.5)" }}>Pratinjau penuh →</span></div>}
                </div>
                <div style={{ flex: "none", padding: "11px 14px", borderTop: "1px solid var(--hi-line)", background: "var(--hi-paper)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontFamily: "var(--hi-serif)", fontSize: 17, color: "var(--hi-ink)", lineHeight: 1 }}>{tpl.name}</div>
                    <div style={{ fontFamily: "var(--hi-mono)", fontSize: 9, letterSpacing: "0.1em", color: "var(--hi-muted)", marginTop: 3, textTransform: "uppercase" }}>{tpl.cat} · {tpl.tag}</div>
                  </div>
                  <span style={{ width: 30, height: 30, borderRadius: 999, flex: "none", background: "color-mix(in oklch, var(--accent) 14%, var(--hi-paper))", color: "var(--accent)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>↗</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {templates.map((tpl, i) => <button key={tpl.id} onClick={() => setActive(i)} aria-label={tpl.name} style={{ width: i === active ? 26 : 8, height: 8, borderRadius: 999, border: "none", padding: 0, background: i === active ? "var(--accent)" : "var(--hi-line)", cursor: "pointer", transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)" }} />)}
      </div>
    </div>
  );
}

function RealTemplateCarousel({ onPreview }: { onPreview: () => void }) {
  const items = STANDARD_TEMPLATES;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = items.length;

  useEffect(() => {
    if (paused || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setActive((a) => (a + 1) % n), 3200);
    return () => window.clearInterval(t);
  }, [n, paused]);

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, userSelect: "none" }}>
      <div style={{ position: "relative", width: "min(430px, 100%)", height: 420, perspective: "1400px" }}>
        {items.map((tpl, i) => {
          const offset = (i - active + n) % n;
          const shown = offset < Math.min(4, n);
          const front = offset === 0;
          const shot = REAL_TEMPLATE_SCREENSHOTS[tpl.id]?.src;
          return (
            <div
              key={tpl.id}
              onClick={() => front ? onPreview() : setActive(i)}
              style={{ position: "absolute", top: 0, left: "50%", width: 300, maxWidth: "78vw", height: 392, transformOrigin: "center center", transform: `translateX(-50%) translateX(${offset * 42}px) translateY(${offset * 6}px) scale(${1 - offset * 0.07})`, opacity: shown ? (front ? 1 : 0.55 - offset * 0.06) : 0, zIndex: n - offset, pointerEvents: shown ? "auto" : "none", cursor: front ? "zoom-in" : "pointer", transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ease", filter: front ? "none" : "saturate(0.9)" }}
            >
              <div style={{ width: "100%", height: "100%", borderRadius: 16, overflow: "hidden", background: "var(--hi-card)", border: "1px solid var(--hi-line)", boxShadow: front ? "0 40px 80px -36px rgba(28,26,20,0.55)" : "0 20px 50px -30px rgba(28,26,20,0.4)", display: "flex", flexDirection: "column" }}>
                <div style={{ flex: 1, minHeight: 0, position: "relative", background: "var(--hi-chrome)" }}>
                  {shot ? (
                    <img src={shot} alt={tpl.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  ) : null}
                  {front && (
                    <div className="pc-hint" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "color-mix(in oklch, var(--hi-ink) 30%, transparent)", opacity: 0, transition: "opacity 0.25s ease" }}>
                      <span style={{ padding: "9px 18px", borderRadius: 999, background: "var(--hi-paper)", color: "var(--hi-ink)", fontSize: 13, fontWeight: 500, boxShadow: "0 10px 30px -12px rgba(0,0,0,0.5)" }}>Pratinjau penuh →</span>
                    </div>
                  )}
                </div>
                <div style={{ flex: "none", padding: "11px 14px", borderTop: "1px solid var(--hi-line)", background: "var(--hi-paper)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontFamily: "var(--hi-serif)", fontSize: 17, color: "var(--hi-ink)", lineHeight: 1 }}>{tpl.name}</div>
                    <div style={{ fontFamily: "var(--hi-mono)", fontSize: 9, letterSpacing: "0.1em", color: "var(--hi-muted)", marginTop: 3, textTransform: "uppercase" }}>{tpl.capabilities[0] ?? tpl.id}</div>
                  </div>
                  <span style={{ width: 30, height: 30, borderRadius: 999, flex: "none", background: "color-mix(in oklch, var(--accent) 14%, var(--hi-paper))", color: "var(--accent)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>↗</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {items.map((tpl, i) => (
          <button key={tpl.id} onClick={() => setActive(i)} aria-label={tpl.name} style={{ width: i === active ? 26 : 8, height: 8, borderRadius: 999, border: "none", padding: 0, background: i === active ? "var(--accent)" : "var(--hi-line)", cursor: "pointer", transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)" }} />
        ))}
      </div>
    </div>
  );
}

function LandingHero({ onLogin, store, resetSignal = 0 }: { onLogin: (name: string) => void; store: string | null; resetSignal?: number }) {
  const [storeId, setStoreId] = useState("");
  const [pubKey, setPubKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedStoreId = window.localStorage.getItem(STORE_ID_STORAGE_KEY) || getBuilderCookie(STORE_ID_STORAGE_KEY);
    const savedPublicKey =
      window.localStorage.getItem(PUBLIC_STORE_KEY_STORAGE_KEY) || getBuilderCookie(PUBLIC_STORE_KEY_STORAGE_KEY);
    if (savedStoreId) setStoreId(savedStoreId);
    if (savedPublicKey) setPubKey(savedPublicKey);
  }, []);

  useEffect(() => {
    if (resetSignal === 0) return;
    setStoreId("");
    setPubKey("");
    setError("");
    setLoading(false);
  }, [resetSignal]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedStoreId = storeId.trim();
    const trimmedKey = pubKey.trim();
    if (!trimmedStoreId || !trimmedKey) {
      setError("Isi Store ID dan Public Key kamu.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: trimmedStoreId, secretKey: trimmedKey }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(json.error ?? "Tidak dapat memverifikasi kredensial.");
      }
      const nextStoreId = typeof json.storeId === "string" && json.storeId ? json.storeId : trimmedStoreId;
      const nextPublicKey =
        typeof json.publicStoreKey === "string" && json.publicStoreKey ? json.publicStoreKey : trimmedKey;
      const pretty = nextStoreId.replace(/[-_]+/g, " ").replace(/\b\w/g, (m: string) => m.toUpperCase());
      const storeName = pretty || "Toko Kamu";
      persistBuilderCredentials(nextStoreId, nextPublicKey, storeName);
      onLogin(storeName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tidak dapat memverifikasi kredensial.");
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, val: string, set: (v: string) => void, ph: string, mono = false) => (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontFamily: "var(--hi-mono)", fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--hi-muted)", marginBottom: 6 }}>{label}</span>
      <input value={val} onChange={(e) => { set(e.target.value); setError(""); }} placeholder={ph} disabled={!!store || loading} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--hi-line)", background: "var(--hi-paper)", fontFamily: mono ? "var(--hi-mono)" : "var(--hi-sans)", fontSize: mono ? 13 : 14, color: "var(--hi-ink)", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s" }} />
    </label>
  );

  return (
    <section style={{ padding: "clamp(56px, 9vw, 104px) var(--gutter) 88px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <BlueprintDecor />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: "color-mix(in oklch, var(--c-sage) 12%, var(--hi-paper))", border: "1px solid color-mix(in oklch, var(--c-sage) 30%, var(--hi-line))", fontFamily: "var(--hi-mono)", fontSize: 10, letterSpacing: "0.14em", color: "var(--c-sage)", marginBottom: 26, whiteSpace: "nowrap" }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: "var(--c-sage)", animation: "bld-pulse 2s ease-in-out infinite" }} />
          PEMBUAT HALAMAN TOKO
        </div>
        <h1 style={{ fontFamily: "var(--hi-serif)", fontSize: "var(--h1)", fontWeight: 400, letterSpacing: 0, lineHeight: 1.04, color: "var(--hi-ink)", margin: "0 0 22px" }}>Halaman toko untuk<br /><TextRotate words={["jualan fashion", "buka pre-order", "jualan online", "brand kamu!"]} /></h1>
        <p style={{ fontSize: "var(--lead)", color: "var(--hi-muted)", lineHeight: 1.55, maxWidth: 520, margin: "0 auto 34px" }}>Masuk pakai Store ID dan Public Key kamu. Pilih dari template, atau unggah desain halaman tokomu sendiri.</p>
        <form onSubmit={submit} style={{ maxWidth: 440, margin: "0 auto", textAlign: "left", background: "var(--hi-card)", border: "1px solid var(--hi-line)", borderRadius: 20, padding: 24, boxShadow: "0 30px 70px -40px rgba(28,26,20,0.4)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {field("Store ID", storeId, setStoreId, "00000000-0000-0000-0000-000000000000", true)}
            {field("Public Key", pubKey, setPubKey, "etalase_pk_live_...", true)}
          </div>
          {error && <div style={{ marginTop: 12, fontSize: 12.5, color: "var(--c-terra)" }}>{error}</div>}
          <button type="submit" disabled={!!store || loading} style={{ width: "100%", marginTop: 18, padding: "13px 18px", borderRadius: 12, border: "none", background: store ? "var(--c-sage)" : "var(--accent)", color: "var(--accent-on)", fontSize: 14.5, fontWeight: 500, cursor: store ? "default" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
            {loading && <span style={{ width: 15, height: 15, borderRadius: 999, border: "2px solid color-mix(in oklch, var(--accent-on) 40%, transparent)", borderTopColor: "var(--accent-on)", animation: "bld-spin 0.7s linear infinite" }} />}
            {store ? `✓ Koneksi ke toko sukses` : loading ? "Memverifikasi…" : "Masuk & pilih template →"}
          </button>
          <div style={{ marginTop: 12, fontFamily: "var(--hi-mono)", fontSize: 9.5, letterSpacing: "0.06em", color: "var(--hi-muted)", textAlign: "center", lineHeight: 1.6 }}>BUTUH KREDENSIAL? ADA DI DASHBOARD E-TALASE · PENGATURAN · API</div>
        </form>
      </div>
    </section>
  );
}

function UploadZone() {
  const [file, setFile] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const onFiles = (files: FileList | null) => { if (files?.[0]) setFile(files[0].name); };

  return (
    <div className="bld-upload-desktop" onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }} onClick={() => inputRef.current?.click()} style={{ borderRadius: 20, padding: "40px 28px", cursor: "pointer", border: `2px dashed ${drag ? "var(--accent)" : "color-mix(in oklch, var(--hi-ink) 22%, var(--hi-line))"}`, background: drag ? "color-mix(in oklch, var(--accent) 9%, var(--hi-card))" : "var(--hi-card)", textAlign: "center", transition: "all 0.2s", minHeight: 392, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <input ref={inputRef} type="file" accept=".html,.zip,.fig,.png,.jpg,.pdf" style={{ display: "none" }} onChange={(e) => onFiles(e.target.files)} />
      <div style={{ width: 60, height: 60, borderRadius: 16, flex: "none", background: "color-mix(in oklch, var(--c-terra) 14%, var(--hi-paper))", border: "1px solid color-mix(in oklch, var(--c-terra) 30%, var(--hi-line))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "var(--c-terra)" }}>{file ? "✓" : "↑"}</div>
      <div style={{ fontFamily: "var(--hi-serif)", fontSize: file ? 22 : 24, color: "var(--hi-ink)", lineHeight: 1.1 }}>{file ? "File diterima" : "Punya desain sendiri?"}</div>
      <div style={{ fontFamily: file ? "var(--hi-mono)" : "var(--hi-sans)", fontSize: file ? 12 : 14, color: file ? "var(--c-sage)" : "var(--hi-muted)", maxWidth: 300, lineHeight: 1.55, wordBreak: file ? "break-all" : "normal" }}>{file ?? "Drag file kamu ke sini, atau klik untuk memilih. Kami terima HTML, Figma, ZIP, atau gambar."}</div>
      {!file && <><span style={{ marginTop: 4, padding: "9px 18px", borderRadius: 999, background: "var(--hi-ink)", color: "var(--hi-paper)", fontSize: 13, fontWeight: 500 }}>Pilih file</span><div style={{ fontFamily: "var(--hi-mono)", fontSize: 9, letterSpacing: "0.1em", color: "var(--hi-muted)", textTransform: "uppercase" }}>Maks 25 MB</div></>}
    </div>
  );
}

function UploadMobileLock() {
  return (
    <div className="bld-upload-only-mobile" style={{ borderRadius: 20, padding: "32px 24px", minHeight: 200, border: "1px solid var(--hi-line)", background: "var(--hi-chrome)", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, textAlign: "center" }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: "var(--hi-paper)", border: "1px solid var(--hi-line)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "var(--hi-muted)" }}>⌥</div>
      <div style={{ fontFamily: "var(--hi-serif)", fontSize: 20, color: "var(--hi-ink)" }}>Unggah desain di desktop</div>
      <div style={{ fontSize: 13.5, color: "var(--hi-muted)", maxWidth: 280, lineHeight: 1.55 }}>Upload file sendiri hanya tersedia di layar besar. Di HP, pilih salah satu template di samping.</div>
    </div>
  );
}

function TemplateHero({ unlocked, store, sectionRef }: { unlocked: boolean; store: string | null; sectionRef: React.RefObject<HTMLElement | null> }) {
  const router = useRouter();
  return (
    <section ref={sectionRef} style={{ padding: "var(--gutter) var(--gutter) clamp(64px,9vw,100px)", borderTop: "1px solid var(--hi-line)", background: "color-mix(in oklch, var(--c-sage) 5%, var(--hi-paper))", position: "relative", scrollMarginTop: 70 }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 48px" }}>
          <Kicker color="var(--c-sage)">{unlocked ? "Pemilihan template atau upload desain" : "Langkah 2 · terkunci"}</Kicker>
          <h2 style={{ fontFamily: "var(--hi-serif)", fontSize: "var(--h2)", fontWeight: 400, letterSpacing: 0, lineHeight: 1.05, color: "var(--hi-ink)", margin: "12px 0 14px" }}>Mulai dari template, <em style={{ fontStyle: "italic", color: "var(--accent)" }}>atau desainmu sendiri.</em></h2>
          <p style={{ fontSize: "var(--body)", color: "var(--hi-muted)", lineHeight: 1.55, margin: 0 }}>{store ? <>Toko kamu sudah terhubung. </> : null}Geser deck di kiri untuk melihat opsi template, klik kartu depan untuk pratinjau. Atau unggah file kamu di kanan.</p>
        </div>
        <div style={{ position: "relative" }}>
          <div className="bld-th-grid" style={{ filter: unlocked ? "none" : "blur(5px)", opacity: unlocked ? 1 : 0.5, pointerEvents: unlocked ? "auto" : "none", transition: "filter 0.5s ease, opacity 0.5s ease" }}>
            <RealTemplateCarousel onPreview={() => router.push("/templates")} />
            <div><UploadZone /><UploadMobileLock /></div>
          </div>
          {!unlocked && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}><div style={{ background: "var(--hi-card)", border: "1px solid var(--hi-line)", borderRadius: 16, padding: "20px 26px", textAlign: "center", boxShadow: "0 30px 70px -40px rgba(28,26,20,0.5)", maxWidth: 320 }}><div style={{ fontFamily: "var(--hi-mono)", fontSize: 22, color: "var(--hi-muted)", marginBottom: 8 }}>⦿</div><div style={{ fontFamily: "var(--hi-serif)", fontSize: 21, color: "var(--hi-ink)", marginBottom: 6 }}>Masuk dulu, ya</div><div style={{ fontSize: 13, color: "var(--hi-muted)", lineHeight: 1.5 }}>Masukkan Store ID & Public Key di atas untuk membuka pemilihan template.</div></div></div>}
        </div>
        <div style={{ textAlign: "center", marginTop: 52 }}>
          <Link href="/templates" style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "15px 30px", borderRadius: 999, background: unlocked ? "var(--hi-ink)" : "var(--hi-chrome)", color: unlocked ? "var(--hi-paper)" : "var(--hi-muted)", fontSize: 15, fontWeight: 500, pointerEvents: unlocked ? "auto" : "none", whiteSpace: "nowrap", boxShadow: unlocked ? "0 20px 40px -22px rgba(28,26,20,0.6)" : "none", transition: "all 0.4s" }}>Lihat semua {STANDARD_TEMPLATES.length} template <span style={{ fontFamily: "var(--hi-mono)", fontSize: 12, opacity: 0.8 }}>→</span></Link>
          <div style={{ marginTop: 14, fontFamily: "var(--hi-mono)", fontSize: 10, letterSpacing: "0.1em", color: "var(--hi-muted)", textTransform: "uppercase" }}>Katalog lengkap · pratinjau · pilih · langsung tayang</div>
        </div>
      </div>
    </section>
  );
}

function BuilderFooter() {
  return <footer style={{ padding: "34px var(--gutter)", borderTop: "1px solid var(--hi-line)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}><BracketWordmark size={20} /><div style={{ fontFamily: "var(--hi-mono)", fontSize: 10, letterSpacing: "0.1em", color: "var(--hi-muted)" }}>© 2026 · STOREFRONT BUILDER · DIBUAT UNTUK MERCHANT E-TALASE</div></footer>;
}

export function BuilderLandingPage() {
  const [store, setStore] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const savedStoreId = window.localStorage.getItem(STORE_ID_STORAGE_KEY) || getBuilderCookie(STORE_ID_STORAGE_KEY);
    const savedPublicKey =
      window.localStorage.getItem(PUBLIC_STORE_KEY_STORAGE_KEY) || getBuilderCookie(PUBLIC_STORE_KEY_STORAGE_KEY);
    const savedStoreName =
      window.localStorage.getItem(STORE_NAME_STORAGE_KEY) || getBuilderCookie(STORE_NAME_STORAGE_KEY);
    if (savedStoreId && savedPublicKey) {
      const pretty =
        savedStoreName ||
        savedStoreId.trim().replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()) ||
        "Toko Kamu";
      setStore(pretty);
    }
  }, []);

  const handleLogin = (name: string) => {
    setStore(name);
    window.setTimeout(() => {
      const el = sectionRef.current;
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY - 56;
      window.scrollTo({ top: y, behavior: "smooth" });
    }, 250);
  };

  const handleChangeStore = () => {
    [STORE_ID_STORAGE_KEY, PUBLIC_STORE_KEY_STORAGE_KEY, STORE_NAME_STORAGE_KEY].forEach((key) => {
      window.localStorage.removeItem(key);
      setBuilderCookie(key, "");
    });
    setStore(null);
    setResetSignal((value) => value + 1);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };

  return (
    <div className="bld">
      <BuilderStyles />
      <BuilderNav store={store} onChangeStore={store ? handleChangeStore : undefined} />
      <LandingHero onLogin={handleLogin} store={store} resetSignal={resetSignal} />
      <TemplateHero unlocked={!!store} store={store} sectionRef={sectionRef} />
      <BuilderFooter />
    </div>
  );
}

function CatToolbar() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--nav-py) var(--gutter)", borderBottom: "1px solid var(--hi-line)", background: "color-mix(in oklch, var(--hi-paper) 86%, transparent)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 13px", borderRadius: 999, border: "1px solid var(--hi-line)", background: "var(--hi-card)", color: "var(--hi-ink)", fontSize: 13 }}><span style={{ fontFamily: "var(--hi-mono)" }}>←</span> Kembali</Link>
        <BracketWordmark size={22} />
      </div>
      <span style={{ padding: "3px 9px", borderRadius: 999, border: "1px solid color-mix(in oklch, var(--c-sage) 38%, var(--hi-line))", background: "color-mix(in oklch, var(--c-sage) 12%, var(--hi-paper))", color: "var(--c-sage)", fontFamily: "var(--hi-mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>Katalog Template</span>
    </div>
  );
}

function CatCard({ tpl, onOpen }: { tpl: Template; onOpen: (tpl: Template) => void }) {
  return (
    <div className="cat-card" onClick={() => onOpen(tpl)}>
      <div className="cat-thumb" style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: "1px solid var(--hi-line)", background: "var(--hi-card)", aspectRatio: "4 / 5", transition: "box-shadow 0.25s" }}>
        <TemplatePreview tpl={tpl} />
        <div className="cat-overlay" style={{ position: "absolute", inset: 0, opacity: 0, transition: "opacity 0.25s", background: "linear-gradient(180deg, color-mix(in oklch, var(--hi-ink) 8%, transparent), color-mix(in oklch, var(--hi-ink) 40%, transparent))", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 20 }}>
          <span style={{ padding: "10px 20px", borderRadius: 999, background: "var(--hi-paper)", color: "var(--hi-ink)", fontSize: 13.5, fontWeight: 500, boxShadow: "0 14px 34px -14px rgba(0,0,0,0.5)" }}>Pratinjau & pilih →</span>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 12, padding: "0 2px", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "var(--hi-serif)", fontSize: 19, color: "var(--hi-ink)", lineHeight: 1 }}>{tpl.name}</div>
          <div style={{ fontSize: 12.5, color: "var(--hi-muted)", marginTop: 5 }}>{tpl.blurb.split(".")[0]}.</div>
        </div>
        <span style={{ flex: "none", padding: "4px 9px", borderRadius: 999, background: "color-mix(in oklch, var(--accent) 12%, var(--hi-paper))", color: "var(--accent)", fontFamily: "var(--hi-mono)", fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{tpl.cat}</span>
      </div>
    </div>
  );
}

function PreviewModal({ tpl, onClose }: { tpl: Template; onClose: () => void }) {
  const [chosen, setChosen] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, padding: "clamp(12px, 4vw, 40px)", background: "color-mix(in oklch, var(--hi-ink) 55%, transparent)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "cat-fade 0.25s ease" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(1120px, 100%)", maxHeight: "92vh", overflow: "hidden", background: "var(--hi-paper)", borderRadius: 22, border: "1px solid var(--hi-line)", boxShadow: "0 50px 120px -40px rgba(0,0,0,0.7)", display: "flex", flexDirection: "column", animation: "cat-modal-in 0.4s cubic-bezier(0.22,1,0.36,1)" }}>
        <div className="cat-modal-grid" style={{ flex: 1, minHeight: 0 }}>
          <div style={{ background: "var(--hi-chrome)", padding: "clamp(16px,3vw,30px)", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <Kicker color="var(--hi-muted)">Pratinjau langsung</Kicker>
              <div style={{ display: "flex", gap: 4, background: "var(--hi-paper)", borderRadius: 999, padding: 3, border: "1px solid var(--hi-line)" }}>
                {(["desktop", "mobile"] as const).map((d) => <button key={d} onClick={() => setDevice(d)} style={{ padding: "5px 13px", borderRadius: 999, border: "none", cursor: "pointer", background: device === d ? "var(--hi-ink)" : "transparent", color: device === d ? "var(--hi-paper)" : "var(--hi-muted)", fontSize: 12, fontWeight: 500 }}>{d === "desktop" ? "Desktop" : "HP"}</button>)}
              </div>
            </div>
            <div style={{ flex: 1, minHeight: 0, display: "flex", justifyContent: "center", overflow: "hidden" }}>
              <div style={{ width: device === "mobile" ? 280 : "100%", maxWidth: "100%", display: "flex", flexDirection: "column", borderRadius: device === "mobile" ? 26 : 12, overflow: "hidden", border: "1px solid var(--hi-line)", background: "var(--hi-card)", boxShadow: "0 30px 60px -34px rgba(28,26,20,0.5)", transition: "width 0.4s cubic-bezier(0.22,1,0.36,1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 13px", borderBottom: "1px solid var(--hi-line)", background: "var(--hi-chrome)", flex: "none" }}>
                  <div style={{ display: "flex", gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 999, background: "#e0a0a0" }} /><span style={{ width: 9, height: 9, borderRadius: 999, background: "#e0c98a" }} /><span style={{ width: 9, height: 9, borderRadius: 999, background: "#a8c594" }} /></div>
                  <div style={{ flex: 1, height: 20, borderRadius: 6, background: "var(--hi-paper)", border: "1px solid var(--hi-line)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--hi-mono)", fontSize: 9.5, color: "var(--hi-muted)" }}>{tpl.id}.e-talase.com</div>
                </div>
                <div style={{ flex: 1, minHeight: 0, overflowY: "auto", background: tpl.palette[0] }}><TemplatePreview tpl={tpl} scroll /></div>
              </div>
            </div>
          </div>
          <div style={{ padding: "clamp(20px,3vw,32px)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ padding: "4px 11px", borderRadius: 999, background: "color-mix(in oklch, var(--accent) 12%, var(--hi-paper))", color: "var(--accent)", fontFamily: "var(--hi-mono)", fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>{tpl.cat} · {tpl.tag}</span>
              <button onClick={onClose} aria-label="Tutup" style={{ width: 34, height: 34, borderRadius: 999, border: "1px solid var(--hi-line)", background: "var(--hi-card)", color: "var(--hi-muted)", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>✕</button>
            </div>
            <h2 style={{ fontFamily: "var(--hi-serif)", fontSize: 40, fontWeight: 400, letterSpacing: 0, color: "var(--hi-ink)", margin: "18px 0 10px", lineHeight: 1 }}>{tpl.name}</h2>
            <p style={{ fontSize: 14.5, color: "var(--hi-muted)", lineHeight: 1.6, margin: "0 0 22px" }}>{tpl.blurb}</p>
            {["Responsif di HP, tablet, dan desktop", "Domain & hosting sudah termasuk", "Foto produk dan teks bisa diganti sendiri", "Siap tayang dalam hitungan menit"].map((f) => <div key={f} style={{ display: "flex", gap: 11, alignItems: "flex-start", marginBottom: 11 }}><span style={{ flex: "none", marginTop: 1, width: 19, height: 19, borderRadius: 999, background: "color-mix(in oklch, var(--c-sage) 18%, var(--hi-paper))", color: "var(--c-sage)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>✓</span><span style={{ fontSize: 13.5, color: "var(--hi-ink)", lineHeight: 1.45 }}>{f}</span></div>)}
            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
              {chosen ? <div style={{ padding: "16px 18px", borderRadius: 14, background: "color-mix(in oklch, var(--c-sage) 12%, var(--hi-paper))", border: "1px solid color-mix(in oklch, var(--c-sage) 30%, var(--hi-line))", display: "flex", alignItems: "center", gap: 13 }}><span style={{ width: 30, height: 30, borderRadius: 999, flex: "none", background: "var(--c-sage)", color: "var(--hi-paper)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>✓</span><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 500, color: "var(--hi-ink)" }}>&quot;{tpl.name}&quot; dipilih</div><div style={{ fontFamily: "var(--hi-mono)", fontSize: 10, letterSpacing: "0.06em", color: "var(--c-sage)", marginTop: 2 }}>MENYIAPKAN EDITOR...</div></div><Link href="/builder" style={{ flex: "none", padding: "9px 15px", borderRadius: 999, background: "var(--hi-ink)", color: "var(--hi-paper)", fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap" }}>Buka editor →</Link></div> : <button onClick={() => setChosen(true)} style={{ width: "100%", padding: "15px 20px", borderRadius: 14, border: "none", background: "var(--accent)", color: "var(--accent-on)", cursor: "pointer", fontSize: 15.5, fontWeight: 500, boxShadow: "0 18px 40px -20px color-mix(in oklch, var(--accent) 80%, transparent)" }}>Pakai template &quot;{tpl.name}&quot; →</button>}
              <div style={{ fontFamily: "var(--hi-mono)", fontSize: 10, letterSpacing: "0.08em", color: "var(--hi-muted)", textAlign: "center", textTransform: "uppercase" }}>Bisa ganti template kapan saja</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TemplateCataloguePage() {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("Semua");
  const [open, setOpen] = useState<Template | null>(null);
  const list = cat === "Semua" ? TEMPLATES : TEMPLATES.filter((t) => t.cat === cat);

  return (
    <div className="bld">
      <BuilderStyles />
      <CatToolbar />
      <section style={{ padding: "clamp(44px,6vw,76px) var(--gutter) 36px", textAlign: "center" }}>
        <Kicker color="var(--c-sage)">Langkah 2 · katalog lengkap</Kicker>
        <h1 style={{ fontFamily: "var(--hi-serif)", fontSize: "var(--h2)", fontWeight: 400, letterSpacing: 0, lineHeight: 1.04, color: "var(--hi-ink)", margin: "12px 0 14px" }}>Pilih tampilan toko, <em style={{ fontStyle: "italic", color: "var(--accent)" }}>lalu jadikan milikmu.</em></h1>
        <p style={{ fontSize: "var(--lead)", color: "var(--hi-muted)", lineHeight: 1.55, maxWidth: 540, margin: "0 auto 30px" }}>{TEMPLATES.length} template siap pakai untuk berbagai jenis toko. Klik mana saja untuk pratinjau penuh sebelum memilih.</p>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap", justifyContent: "center" }}>
          {CATEGORIES.map((c) => {
            const n = c === "Semua" ? TEMPLATES.length : TEMPLATES.filter((t) => t.cat === c).length;
            const on = cat === c;
            return <button key={c} className="cat-chip" onClick={() => setCat(c)} style={{ padding: "9px 16px", borderRadius: 999, border: `1px solid ${on ? "var(--hi-ink)" : "var(--hi-line)"}`, background: on ? "var(--hi-ink)" : "var(--hi-card)", color: on ? "var(--hi-paper)" : "var(--hi-ink)", fontSize: 13.5, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 8 }}>{c}<span style={{ fontFamily: "var(--hi-mono)", fontSize: 10, opacity: 0.6 }}>{n}</span></button>;
          })}
        </div>
      </section>
      <section style={{ padding: "12px var(--gutter) clamp(60px,8vw,96px)" }}>
        <div className="cat-grid" style={{ maxWidth: 1180, margin: "0 auto" }}>{list.map((tpl) => <CatCard key={tpl.id} tpl={tpl} onOpen={setOpen} />)}</div>
      </section>
      <BuilderFooter />
      {open && <PreviewModal tpl={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
