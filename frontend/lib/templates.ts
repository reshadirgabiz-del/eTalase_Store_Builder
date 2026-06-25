export type TemplateId =
  | "classic"
  | "modern"
  | "pastel"
  | "pastel-bauhaus"
  | "bauhaus"
  | "mosaic"
  | "cyber"
  | "editorial"
  | "brutalist"
  | "glass"
  | "artisan"
  | "custom-upload";

export type TemplateLayout = "full-home" | "catalogue-first";

export const TEMPLATE_LAYOUT_LABEL: Record<TemplateLayout, string> = {
  "full-home": "Beranda lengkap",
  "catalogue-first": "Fokus katalog",
};

export const TEMPLATE_LAYOUT_DESCRIPTION: Record<TemplateLayout, string> = {
  "full-home": "Halaman beranda penuh dengan hero, kategori, dan produk unggulan sebelum katalog.",
  "catalogue-first": "Modal intro singkat lalu langsung ke katalog produk.",
};

export type BuilderTemplate = {
  id: TemplateId;
  name: string;
  source: string;
  status: "ready" | "review";
  description: string;
  sdkReference: string;
  capabilities: string[];
  layout?: TemplateLayout;
  defaultColorSchemeId?: string;
};

export const templates: BuilderTemplate[] = [
  {
    id: "classic",
    name: "Classic",
    source: "../Storepage test/my-app",
    status: "ready",
    layout: "full-home",
    defaultColorSchemeId: "teal-gold",
    description:
      "Template Next.js yang sudah diuji dengan alur SDK eTalase lokal. Builder dapat mengubah warna dan teks utama halaman sebelum deploy.",
    sdkReference: "../eTalase Module",
    capabilities: ["Hero katalog", "Bagian kategori", "Sidebar keranjang", "Halaman katalog"],
  },
  {
    id: "modern",
    name: "Modern",
    source: "../Storepage test/template-2",
    status: "ready",
    layout: "full-home",
    defaultColorSchemeId: "bauhaus-cobalt",
    description:
      "Template modern-minimalis dengan inspirasi Bauhaus, geometri tegas, tata letak grid rapi, animasi halus, dan fokus katalog e-commerce.",
    sdkReference: "../eTalase Module",
    capabilities: ["Hero Bauhaus modern", "Grid kategori blok", "Katalog produk animatif", "Sidebar keranjang"],
  },
  {
    id: "pastel",
    name: "Pastel",
    source: "../Storepage test/template-3",
    status: "ready",
    layout: "catalogue-first",
    defaultColorSchemeId: "rose-cream",
    description:
      "Template pastel dengan kartu kategori besar, intro produk bergaya fan gallery, dan katalog visual yang ringan untuk toko lifestyle.",
    sdkReference: "../eTalase Module",
    capabilities: ["Fan hero produk", "Kartu kategori pastel", "Katalog kartu lembut", "Halaman detail produk"],
  },
  {
    id: "pastel-bauhaus",
    name: "Pastel Bauhaus",
    source: "../Storepage test/template-5",
    status: "ready",
    layout: "catalogue-first",
    defaultColorSchemeId: "bauhaus-primary",
    description:
      "Varian dari template pastel dengan estetika Bauhaus: warna primer berani, bentuk geometris tegas, garis hairline, dan kartu kategori berwarna blok. Layout tetap mengikuti template pastel.",
    sdkReference: "../eTalase Module",
    capabilities: ["Hero opening Bauhaus", "Kartu kategori warna blok", "Katalog kartu kotak", "Detail produk geometris"],
  },
  {
    id: "mosaic",
    name: "Mosaic Market",
    source: "frontend/app/components/pastel-template.tsx",
    status: "ready",
    layout: "catalogue-first",
    defaultColorSchemeId: "ocean-sunset",
    description:
      "Template bergaya pasar kreatif dengan mosaik produk rapat, header seperti label toko, warna aksen berlapis, dan kartu katalog yang terasa seperti ubin display butik.",
    sdkReference: "../eTalase Module",
    capabilities: ["Mosaik produk", "Header label toko", "Kategori ubin besar", "Katalog editorial padat"],
  },
  {
    id: "cyber",
    name: "Cyber Glitch",
    source: "../Storepage test/template-4",
    status: "ready",
    layout: "full-home",
    defaultColorSchemeId: "cyber-bone",
    description:
      "Template minimalis cyberpunk dengan kanvas off-white, sentuhan neon magenta dan cyan, efek RGB-shift saat hover, dan judul bergaya glitch untuk toko bernuansa edgy dan futuristik.",
    sdkReference: "../eTalase Module",
    capabilities: ["Hero glitch chromatic", "Kartu kategori neon", "Katalog kartu hairline", "Sidebar keranjang"],
  },
  {
    id: "editorial",
    name: "Editorial",
    source: "frontend/app/components/editorial-template.tsx",
    status: "ready",
    layout: "full-home",
    defaultColorSchemeId: "editorial-ivory",
    description:
      "Template bergaya majalah dengan tipografi serif besar, tata letak asimetris, dan nomor edisi. Cocok untuk toko butik dengan narasi visual yang kuat dan presentasi produk seperti spread editorial.",
    sdkReference: "../eTalase Module",
    capabilities: ["Hero editorial spread", "Kategori bernomor", "Katalog dua kolom asimetris", "Detail produk magazine"],
  },
  {
    id: "brutalist",
    name: "Neon Brutalist",
    source: "frontend/app/components/brutalist-template.tsx",
    status: "ready",
    layout: "full-home",
    defaultColorSchemeId: "brutalist-acid",
    description:
      "Template brutalist dengan tipografi sans super besar, blok warna mentah, bayangan keras, dan sorotan neon. Untuk toko yang ingin tampil berani, ekspresif, dan tidak takut menonjol.",
    sdkReference: "../eTalase Module",
    capabilities: ["Hero blok warna besar", "Kategori sticker neon", "Katalog kartu shadow keras", "Detail produk kontras tinggi"],
  },
  {
    id: "glass",
    name: "Aurora Glass",
    source: "frontend/app/components/glass-template.tsx",
    status: "ready",
    layout: "full-home",
    defaultColorSchemeId: "aurora-glass",
    description:
      "Glassmorphism penuh dengan latar gradient aurora, kartu produk frosted, blur halus, dan tepi bersinar tipis. Cocok untuk brand teknologi, beauty, atau premium digital lifestyle yang ingin terasa ringan dan modern.",
    sdkReference: "../eTalase Module",
    capabilities: ["Hero gradient aurora", "Kartu kategori glassy", "Katalog frosted card", "Detail produk floating glass"],
  },
  {
    id: "artisan",
    name: "Artisan Atelier",
    source: "frontend/app/components/artisan-template.tsx",
    status: "ready",
    layout: "catalogue-first",
    defaultColorSchemeId: "artisan-paper",
    description:
      "Estetika handmade dan craft: tekstur kertas, palet bumi hangat, stempel nomor edisi, dan kartu yang terasa seperti kartu pos butik. Cocok untuk produk artisanal, ceramic, kopi spesial, atau koleksi terbatas.",
    sdkReference: "../eTalase Module",
    capabilities: ["Hero kartu pos", "Stempel kategori", "Katalog edisi terbatas", "Detail produk tag jahit"],
  },
  {
    id: "custom-upload",
    name: "Aplikasi JavaScript Unggahan",
    source: "Zip dari pengguna",
    status: "review",
    description:
      "Template non-standar memerlukan review admin dan proses deploy. Pengguna harus menguji alur utama storefront sebelum mengunggah.",
    sdkReference: "../eTalase Module",
    capabilities: ["QA manual diperlukan", "Deploy oleh admin", "Review biasanya: 1 minggu"],
  },
];

export const defaultBuilderText = {
  heroTitle: "Storefront Anda, disesuaikan dengan cara Anda berjualan",
  heroSubtitle: "Luncurkan halaman eTalase bermerek dengan produk aktif, alur checkout jelas, dan teks yang dapat diedit.",
  ctaLabel: "Lihat katalog",
};

export type ColorScheme = {
  id: string;
  name: string;
  fontBody?: string;
  fontHeading?: string;
  brand: string;
  brandStrong: string;
  buttonText: string;
  accent: string;
  pageBg: string;
  surface: string;
  ink: string;
  muted: string;
};

export const colorSchemes: ColorScheme[] = [
  {
    id: "teal-gold",
    name: "Bosque Blush",
    fontBody: "var(--font-hanken), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    fontHeading: "var(--font-bricolage), var(--font-hanken), sans-serif",
    brand: "#6f4246",
    brandStrong: "#563136",
    buttonText: "#ffffff",
    accent: "#c45f67",
    pageBg: "#fcf7f5",
    surface: "#fffdfb",
    ink: "#3e3033",
    muted: "#75646a",
  },
  {
    id: "graphite-lime",
    name: "Graphite Lime",
    brand: "#364152",
    brandStrong: "#1f2937",
    buttonText: "#ffffff",
    accent: "#84cc16",
    pageBg: "#f7f8f5",
    surface: "#ffffff",
    ink: "#18202a",
    muted: "#5a6473",
  },
  {
    id: "indigo-coral",
    name: "Indigo Coral",
    brand: "#3730a3",
    brandStrong: "#312e81",
    buttonText: "#ffffff",
    accent: "#fb7185",
    pageBg: "#f7f7fb",
    surface: "#ffffff",
    ink: "#1f1d2b",
    muted: "#6b6a7c",
  },
  {
    id: "forest-sky",
    name: "Forest Sky",
    brand: "#166534",
    brandStrong: "#14532d",
    buttonText: "#ffffff",
    accent: "#38bdf8",
    pageBg: "#f7faf8",
    surface: "#ffffff",
    ink: "#15251b",
    muted: "#54665a",
  },
  {
    id: "midnight-amber",
    name: "Midnight Amber",
    brand: "#1e1b4b",
    brandStrong: "#0f0c2e",
    buttonText: "#ffffff",
    accent: "#fbbf24",
    pageBg: "#0f172a",
    surface: "#1e293b",
    ink: "#f1f5f9",
    muted: "#94a3b8",
  },
  {
    id: "rose-cream",
    name: "Rose Cream",
    brand: "#be185d",
    brandStrong: "#9f1239",
    buttonText: "#ffffff",
    accent: "#fde68a",
    pageBg: "#fff7ed",
    surface: "#ffffff",
    ink: "#3d1322",
    muted: "#8b6b6b",
  },
  {
    id: "ocean-sunset",
    name: "Ocean Sunset",
    brand: "#0369a1",
    brandStrong: "#075985",
    buttonText: "#ffffff",
    accent: "#f97316",
    pageBg: "#f0f9ff",
    surface: "#ffffff",
    ink: "#0c1e2a",
    muted: "#5a6e7d",
  },
  {
    id: "minimal-mono",
    name: "Minimal Mono",
    brand: "#171717",
    brandStrong: "#000000",
    buttonText: "#ffffff",
    accent: "#737373",
    pageBg: "#fafafa",
    surface: "#ffffff",
    ink: "#0a0a0a",
    muted: "#525252",
  },
  {
    id: "bauhaus-primary",
    name: "Bauhaus Primary",
    fontBody: "var(--font-space-grotesk), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    fontHeading: "var(--font-space-grotesk), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    brand: "#e63946",
    brandStrong: "#b8202d",
    buttonText: "#ffffff",
    accent: "#ffd400",
    pageBg: "#f4f1ea",
    surface: "#ffffff",
    ink: "#0a0a0a",
    muted: "#4b4b4b",
  },
  {
    id: "bauhaus-cobalt",
    name: "Bauhaus Cobalt",
    fontBody: "var(--font-inter), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    fontHeading: "var(--font-inter), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    brand: "#1e40af",
    brandStrong: "#1e3a8a",
    buttonText: "#ffffff",
    accent: "#f97316",
    pageBg: "#fefcf5",
    surface: "#ffffff",
    ink: "#0a0a0a",
    muted: "#475569",
  },
  {
    id: "bauhaus-sunshine",
    name: "Bauhaus Sunshine",
    fontBody: "var(--font-dm-sans), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    fontHeading: "var(--font-dm-sans), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    brand: "#0a0a0a",
    brandStrong: "#000000",
    buttonText: "#ffd400",
    accent: "#1e40af",
    pageBg: "#ffd400",
    surface: "#ffffff",
    ink: "#0a0a0a",
    muted: "#3f3f46",
  },
  {
    id: "bauhaus-mint",
    name: "Bauhaus Mint",
    fontBody: "var(--font-manrope), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    fontHeading: "var(--font-manrope), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    brand: "#0f9d58",
    brandStrong: "#0a7a44",
    buttonText: "#ffffff",
    accent: "#d946ef",
    pageBg: "#f0fdf4",
    surface: "#ffffff",
    ink: "#0a0a0a",
    muted: "#3f4a44",
  },
  {
    id: "bauhaus-electric",
    name: "Bauhaus Electric",
    fontBody: "var(--font-urbanist), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    fontHeading: "var(--font-urbanist), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    brand: "#ec4899",
    brandStrong: "#be185d",
    buttonText: "#ffffff",
    accent: "#06b6d4",
    pageBg: "#fef3f8",
    surface: "#ffffff",
    ink: "#0a0a0a",
    muted: "#52525b",
  },
  {
    id: "cyber-bone",
    name: "Cyber Bone",
    fontBody: "var(--font-space-grotesk), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    fontHeading: "var(--font-space-grotesk), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    brand: "#ff006e",
    brandStrong: "#c5005a",
    buttonText: "#f5f5f0",
    accent: "#00f0ff",
    pageBg: "#f5f5f0",
    surface: "#ffffff",
    ink: "#0a0a0f",
    muted: "#5a5a66",
  },
  {
    id: "editorial-ivory",
    name: "Editorial Ivory",
    fontBody: "var(--font-source-serif), Georgia, serif",
    fontHeading: "var(--font-playfair), Georgia, serif",
    brand: "#1f1d1a",
    brandStrong: "#0a0a0a",
    buttonText: "#fbf8f1",
    accent: "#b04a2a",
    pageBg: "#fbf8f1",
    surface: "#ffffff",
    ink: "#181612",
    muted: "#7a6f63",
  },
  {
    id: "editorial-slate",
    name: "Editorial Slate",
    fontBody: "var(--font-lora), Georgia, serif",
    fontHeading: "var(--font-fraunces), Georgia, serif",
    brand: "#1e2a3a",
    brandStrong: "#0c1726",
    buttonText: "#f6f4ef",
    accent: "#c7a85a",
    pageBg: "#f6f4ef",
    surface: "#ffffff",
    ink: "#101820",
    muted: "#6b7280",
  },
  {
    id: "brutalist-acid",
    name: "Brutalist Acid",
    fontBody: "var(--font-space-grotesk), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    fontHeading: "var(--font-space-grotesk), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    brand: "#0a0a0a",
    brandStrong: "#000000",
    buttonText: "#ccff00",
    accent: "#ccff00",
    pageBg: "#f2f2ed",
    surface: "#ffffff",
    ink: "#0a0a0a",
    muted: "#525252",
  },
  {
    id: "brutalist-hot",
    name: "Brutalist Hot",
    fontBody: "var(--font-urbanist), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    fontHeading: "var(--font-urbanist), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    brand: "#ff3366",
    brandStrong: "#cc1a4d",
    buttonText: "#ffffff",
    accent: "#00d1b2",
    pageBg: "#fffaf3",
    surface: "#ffffff",
    ink: "#0a0a0a",
    muted: "#4b4b4b",
  },
  {
    id: "aurora-glass",
    name: "Aurora Glass",
    fontBody: "var(--font-plus-jakarta), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    fontHeading: "var(--font-plus-jakarta), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    brand: "#6366f1",
    brandStrong: "#4338ca",
    buttonText: "#ffffff",
    accent: "#22d3ee",
    pageBg: "#eef2ff",
    surface: "#ffffff",
    ink: "#1e1b4b",
    muted: "#64748b",
  },
  {
    id: "artisan-paper",
    name: "Artisan Paper",
    fontBody: "var(--font-lora), Georgia, serif",
    fontHeading: "var(--font-fraunces), Georgia, serif",
    brand: "#8a5a3b",
    brandStrong: "#5e3a22",
    buttonText: "#fbf6ec",
    accent: "#c97b3f",
    pageBg: "#f5ecdc",
    surface: "#fbf6ec",
    ink: "#2e1f12",
    muted: "#7a604b",
  },
  {
    id: "cyber-night",
    name: "Cyber Night",
    fontBody: "var(--font-space-grotesk), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    fontHeading: "var(--font-space-grotesk), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    brand: "#ff2bd6",
    brandStrong: "#cc1fa9",
    buttonText: "#0a0a0f",
    accent: "#00f0ff",
    pageBg: "#0a0a0f",
    surface: "#13131c",
    ink: "#f5f5f0",
    muted: "#9a9aa8",
  },
];

export function getTemplateDefaultScheme(templateId: TemplateId | undefined): ColorScheme {
  const template = templates.find((item) => item.id === templateId);
  const target = template?.defaultColorSchemeId;
  if (target) {
    const scheme = colorSchemes.find((preset) => preset.id === target);
    if (scheme) return scheme;
  }
  return colorSchemes[0];
}

export const FONT_OPTIONS = [
  {
    label: "Bricolage / Hanken",
    value: "var(--font-hanken), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    heading: "var(--font-bricolage), var(--font-hanken), sans-serif",
  },
  {
    label: "Inter",
    value: "var(--font-inter), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    heading: "var(--font-inter), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
  },
  {
    label: "Manrope",
    value: "var(--font-manrope), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    heading: "var(--font-manrope), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
  },
  {
    label: "Plus Jakarta Sans",
    value: "var(--font-plus-jakarta), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    heading: "var(--font-plus-jakarta), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
  },
  {
    label: "Outfit",
    value: "var(--font-outfit), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    heading: "var(--font-outfit), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
  },
  {
    label: "DM Sans",
    value: "var(--font-dm-sans), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    heading: "var(--font-dm-sans), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
  },
  {
    label: "Space Grotesk",
    value: "var(--font-space-grotesk), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    heading: "var(--font-space-grotesk), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
  },
  {
    label: "Urbanist",
    value: "var(--font-urbanist), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    heading: "var(--font-urbanist), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
  },
  {
    label: "Montserrat",
    value: "var(--font-montserrat), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    heading: "var(--font-montserrat), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
  },
  {
    label: "System Sans",
    value: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Helvetica, Arial, sans-serif",
    heading: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Helvetica, Arial, sans-serif",
  },
  {
    label: "Playfair Display",
    value: "var(--font-playfair), Georgia, serif",
    heading: "var(--font-playfair), Georgia, serif",
  },
  {
    label: "Cormorant Garamond",
    value: "var(--font-cormorant), Georgia, serif",
    heading: "var(--font-cormorant), Georgia, serif",
  },
  {
    label: "Lora",
    value: "var(--font-lora), Georgia, serif",
    heading: "var(--font-lora), Georgia, serif",
  },
  {
    label: "Merriweather",
    value: "var(--font-merriweather), Georgia, serif",
    heading: "var(--font-merriweather), Georgia, serif",
  },
  {
    label: "Libre Baskerville",
    value: "var(--font-libre), Georgia, serif",
    heading: "var(--font-libre), Georgia, serif",
  },
  {
    label: "Source Serif 4",
    value: "var(--font-source-serif), Georgia, serif",
    heading: "var(--font-source-serif), Georgia, serif",
  },
  {
    label: "Crimson Pro",
    value: "var(--font-crimson), Georgia, serif",
    heading: "var(--font-crimson), Georgia, serif",
  },
  {
    label: "Fraunces",
    value: "var(--font-fraunces), Georgia, serif",
    heading: "var(--font-fraunces), Georgia, serif",
  },
  {
    label: "Georgia",
    value: "Georgia, \"Times New Roman\", serif",
    heading: "Georgia, \"Times New Roman\", serif",
  },
];

export const COLOR_FIELDS: { key: keyof ColorScheme; label: string; help: string }[] = [
  { key: "brand", label: "Brand", help: "Tombol utama, tautan, sorotan" },
  { key: "brandStrong", label: "Brand pekat", help: "Hover, aksen yang lebih kuat" },
  { key: "buttonText", label: "Teks tombol", help: "Warna teks di dalam tombol utama" },
  { key: "accent", label: "Aksen", help: "Warna sorotan sekunder" },
  { key: "pageBg", label: "Latar halaman", help: "Warna kanvas terluar" },
  { key: "surface", label: "Permukaan", help: "Latar kartu dan panel" },
  { key: "ink", label: "Teks", help: "Teks utama dan judul" },
  { key: "muted", label: "Teks redup", help: "Caption dan deskripsi" },
];
