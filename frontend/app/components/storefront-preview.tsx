"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
} from "react";
import { Alert } from "@mantine/core";
import {
  ArrowRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Minus,
  PanelRightOpen,
  Plus,
  ShoppingBag,
} from "lucide-react";
import etalaseLogo from "../../assets/logo.png";
import type { ColorScheme } from "@/lib/templates";

export type SectionId = "hero" | "categories" | "catalogue" | "footer";
export type PreviewPage = "home" | "catalogue" | "product";

export type StoreInfo = {
  storeId?: string | null;
  storeName: string;
  storePhotoUrl?: string | null;
  publicKey?: string | null;
};

export type Settings = {
  storeName?: string;
  storeDescription?: string;
  logoUrl?: string;
  originAddress?: string;
  hideLocation?: boolean;
  currency?: string;
  socialLinks?: { platform: string; url: string }[];
};

export type ProductImage = {
  imageUrl?: string | null;
  sortOrder?: number;
  isThumbnail?: boolean;
};

export type Product = {
  id: string;
  name: string;
  subtitle?: string | null;
  description?: string | null;
  price: number;
  discountedPrice?: number | null;
  stock?: number | null;
  storeId?: string | null;
  imageUrl?: string | null;
  image_url?: string | null;
  tags?: string[];
  images?: ProductImage[];
};

type SectionText = { title: string; body: string; eyebrow?: string };
export type TextField = keyof SectionText;

export type TextConfig = Record<SectionId, SectionText>;
export type HiddenConfig = Record<SectionId, boolean>;

const ETALASE_CHECKOUT_HOST = "https://app.e-talase.com";

export const EDITABLE_SECTIONS: SectionId[] = ["hero", "categories", "catalogue", "footer"];

export const SECTION_LABEL: Record<SectionId, string> = {
  hero: "Hero",
  categories: "Kategori",
  catalogue: "Katalog",
  footer: "Footer",
};

export const PAGE_LABEL: Record<PreviewPage, string> = {
  home: "Beranda",
  catalogue: "Katalog",
  product: "Detail produk",
};

export const INITIAL_TEXT: TextConfig = {
  hero: {
    eyebrow: "Storefront unggulan",
    title: "Temukan pilihan favorit Anda berikutnya",
    body: "Belanja produk terbaru dari toko eTalase ini, dengan data katalog aktif dan storefront yang siap checkout.",
  },
  categories: {
    title: "Belanja berdasarkan kategori",
    body: "Jelajahi koleksi pilihan dari toko kami.",
  },
  catalogue: {
    title: "Lihat katalog",
    body: "Lihat semua produk dalam koleksi kami dan filter berdasarkan kategori.",
  },
  footer: {
    title: "Jelajahi katalog",
    body: "Ikuti toko dan lanjutkan melihat produk unggulan.",
  },
};

export const EMPTY_HIDDEN: HiddenConfig = {
  hero: false,
  categories: false,
  catalogue: false,
  footer: false,
};

export const fallbackProducts: Product[] = [
  { id: "sample-1", name: "Tote travel signature", description: "Tas harian berstruktur dengan tali kulit rapi dan ruang untuk laptop 13 inci beserta kebutuhan lainnya.", price: 420000, tags: ["Tas"] },
  { id: "sample-2", name: "Set keramik harian", description: "Peralatan makan batch kecil dengan sentuhan akhir matte, aman untuk mesin cuci piring, dan bertekstur hangat.", price: 185000, tags: ["Rumah"] },
  { id: "sample-3", name: "Kemeja linen terbatas", description: "Potongan santai untuk hari hangat, linen Eropa yang ringan dengan kerah lembut.", price: 310000, tags: ["Pakaian"] },
  { id: "sample-4", name: "Lampu meja ringkas", description: "Cahaya fokus untuk ruang kecil, suhu warna dapat disesuaikan, dan input USB-C di bagian belakang.", price: 265000, tags: ["Rumah"] },
  { id: "sample-5", name: "Bundel notebook saku", description: "Tiga notebook harian tahan lama dengan sampul linen arsip dan jahitan lay-flat.", price: 95000, tags: ["Alat tulis"] },
  { id: "sample-6", name: "Sling pouch minimal", description: "Organizer travel ringan dari nilon tahan air dengan penutup magnet.", price: 220000, tags: ["Tas"] },
];

export function productThumbnail(product: Product) {
  const thumb = product.images?.find((image) => image.isThumbnail);
  return thumb?.imageUrl ?? product.imageUrl ?? product.image_url ?? "";
}

export function productGallery(product: Product) {
  const gallery =
    product.images
      ?.slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((image) => image.imageUrl)
      .filter((url): url is string => Boolean(url)) ?? [];
  return gallery.length > 0 ? gallery : productThumbnail(product) ? [productThumbnail(product)] : [];
}

export function effectivePrice(product: Product) {
  return product.discountedPrice ?? product.price;
}

export function formatPrice(amount: number, currency = "IDR") {
  try {
    return new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function groupByCategory(products: Product[]) {
  const grouped = new Map<string, Product[]>();
  for (const product of products) {
    for (const tag of product.tags ?? []) {
      const items = grouped.get(tag) ?? [];
      items.push(product);
      grouped.set(tag, items);
    }
  }
  return grouped;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const num = parseInt(value, 16);
  if (Number.isNaN(num)) return [0, 0, 0];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHsl(r: number, g: number, b: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0));
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function readableInk(bg: string) {
  const [r, g, b] = hexToRgb(bg);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0a0a0a" : "#ffffff";
}

function encodeCheckoutItems(items: { productId: string; quantity: number }[]) {
  const json = JSON.stringify(items);
  return window.btoa(unescape(encodeURIComponent(json)));
}

function boundedQuantity(next: number, max?: number | null) {
  if (Number.isNaN(next)) return 1;
  const upper = Math.max(1, max ?? 99);
  return Math.max(1, Math.min(upper, next));
}

function stockLimit(product: Product) {
  return typeof product.stock === "number" ? Math.max(0, product.stock) : 99;
}

function titleCase(value: string) {
  return value
    .split(/(\s+)/)
    .map((part) => (part.trim() ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : part))
    .join("");
}

function socialIcon(platform: string, url: string) {
  const normalized = `${platform} ${url}`.toLowerCase();
  if (normalized.includes("instagram")) return <Instagram size={18} />;
  if (normalized.includes("whatsapp") || normalized.includes("wa.me") || /\bwa\b/.test(normalized)) {
    return <WhatsApp size={18} />;
  }
  return null;
}

function Instagram({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="7" r="1.1" fill="currentColor" />
    </svg>
  );
}

function WhatsApp({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5.2 19.2 6.3 16A7.4 7.4 0 1 1 9 18.6l-3.8.6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.4 8.9c.2-.5.4-.5.7-.5h.5c.2 0 .4.1.5.4l.6 1.4c.1.3 0 .5-.2.7l-.4.5c.5.9 1.2 1.6 2.2 2.1l.5-.6c.2-.2.4-.3.7-.2l1.4.6c.3.1.4.3.4.6v.4c0 .4-.2.7-.6.8-.6.2-1.7.2-3.3-.6-1.8-.9-3.1-2.2-3.9-3.9-.7-1.4-.5-2.4-.2-3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function hexToRgba(hex: string, alpha: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function normalizeFontStack(font?: string) {
  if (!font) return undefined;
  const mappings: [string, string][] = [
    ["Bricolage Grotesque", "var(--font-bricolage), var(--font-hanken), sans-serif"],
    ["Hanken Grotesk", "var(--font-hanken), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"],
    ["Inter", "var(--font-inter), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"],
    ["Manrope", "var(--font-manrope), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"],
    ["Plus Jakarta Sans", "var(--font-plus-jakarta), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"],
    ["Outfit", "var(--font-outfit), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"],
    ["DM Sans", "var(--font-dm-sans), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"],
    ["Space Grotesk", "var(--font-space-grotesk), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"],
    ["Urbanist", "var(--font-urbanist), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"],
    ["Montserrat", "var(--font-montserrat), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"],
    ["Playfair Display", "var(--font-playfair), Georgia, serif"],
    ["Cormorant Garamond", "var(--font-cormorant), Georgia, serif"],
    ["Lora", "var(--font-lora), Georgia, serif"],
    ["Merriweather", "var(--font-merriweather), Georgia, serif"],
    ["Libre Baskerville", "var(--font-libre), Georgia, serif"],
    ["Source Serif 4", "var(--font-source-serif), Georgia, serif"],
    ["Crimson Pro", "var(--font-crimson), Georgia, serif"],
    ["Fraunces", "var(--font-fraunces), Georgia, serif"],
  ];
  return mappings.find(([family]) => font.includes(family))?.[1] ?? font;
}

export function buildThemeStyle(scheme: ColorScheme): CSSProperties {
  const primaryFg = scheme.buttonText || readableInk(scheme.brand);
  const accentFg = readableInk(scheme.accent);
  const surfaceFg = readableInk(scheme.surface);
  const brandHsl = rgbToHsl(...hexToRgb(scheme.brand));
  const accentHsl = rgbToHsl(...hexToRgb(scheme.accent));
  return {
    "--font-body": normalizeFontStack(scheme.fontBody) ?? "var(--font-hanken), -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    "--font-heading": normalizeFontStack(scheme.fontHeading) ?? "var(--font-bricolage), var(--font-hanken), sans-serif",
    "--background": scheme.pageBg,
    "--foreground": scheme.ink,
    "--card": scheme.surface,
    "--card-foreground": surfaceFg,
    "--primary": scheme.brand,
    "--primary-strong": scheme.brandStrong,
    "--primary-foreground": primaryFg,
    "--secondary": hexToRgba(scheme.brand, 0.08),
    "--secondary-foreground": scheme.ink,
    "--muted": hexToRgba(scheme.ink, 0.06),
    "--muted-foreground": scheme.muted,
    "--accent": scheme.accent,
    "--accent-foreground": accentFg,
    "--border": hexToRgba(scheme.ink, 0.14),
    "--ring": scheme.brand,
    "--brand-hsl": `${brandHsl.h} ${brandHsl.s}% ${brandHsl.l}%`,
    "--accent-hsl": `${accentHsl.h} ${accentHsl.s}% ${accentHsl.l}%`,
  } as CSSProperties;
}

type EditableTextProps = {
  value: string;
  editable: boolean;
  onChange: (next: string) => void;
  as?: ElementType;
  className?: string;
  multiline?: boolean;
};

export function EditableText({
  value,
  editable,
  onChange,
  as: Tag = "span",
  className,
  multiline = false,
}: EditableTextProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.innerText !== value) {
      ref.current.innerText = value;
    }
  }, [value]);

  if (!editable) {
    return <Tag className={className}>{value}</Tag>;
  }

  const Element = Tag as ElementType;
  return (
    <Element
      ref={ref}
      className={`${className ?? ""} editable-text`}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      role="textbox"
      tabIndex={0}
      onClick={(event: React.MouseEvent) => event.stopPropagation()}
      onKeyDown={(event: React.KeyboardEvent<HTMLElement>) => {
        if (!multiline && event.key === "Enter") {
          event.preventDefault();
          (event.currentTarget as HTMLElement).blur();
        }
      }}
      onBlur={(event: React.FocusEvent<HTMLElement>) => {
        const next = event.currentTarget.innerText;
        if (next !== value) onChange(next);
      }}
    >
      {value}
    </Element>
  );
}

function EditableSection({
  id,
  selected,
  editable,
  hidden,
  onSelect,
  onToggleHidden,
  textEditMode,
  children,
}: {
  id: SectionId;
  selected: boolean;
  editable: boolean;
  hidden: boolean;
  onSelect: (id: SectionId) => void;
  onToggleHidden: (id: SectionId, value?: boolean) => void;
  textEditMode: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`editable-section ${editable && !textEditMode ? "can-edit" : ""} ${textEditMode ? "text-edit-mode" : ""} ${selected && editable && !textEditMode ? "is-selected" : ""}`}
      onClick={(event) => {
        if (!editable || textEditMode) return;
        event.stopPropagation();
        onSelect(id);
      }}
    >
      {editable && !textEditMode ? (
        <div className="component-chip-bar" onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            className="component-chip"
            onClick={() => onSelect(id)}
            aria-label={`Fokus ${SECTION_LABEL[id]}`}
          >
            <PanelRightOpen size={12} />
            {SECTION_LABEL[id]}
          </button>
          <button
            type="button"
            className="component-chip ghost"
            onClick={() => onToggleHidden(id, !hidden)}
            aria-label={hidden ? `Tampilkan ${SECTION_LABEL[id]}` : `Sembunyikan ${SECTION_LABEL[id]}`}
            title={hidden ? "Tampilkan bagian" : "Sembunyikan bagian"}
          >
            {hidden ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
        </div>
      ) : null}
      {children}
    </div>
  );
}

function StoreHeader({
  storeName,
  logoUrl,
  onNavigate,
  cartCount,
  onCartClick,
}: {
  storeName: string;
  logoUrl: string;
  onNavigate: (page: PreviewPage) => void;
  cartCount: number;
  onCartClick: () => void;
}) {
  const items: { label: string; page: PreviewPage }[] = [
    { label: "Beranda", page: "home" },
    { label: "Katalog", page: "catalogue" },
  ];
  const [cursor, setCursor] = useState({ left: 0, width: 0, opacity: 0 });
  const refs = useRef<Array<HTMLLIElement | null>>([]);

  return (
    <header className="storefront-header">
      <button className="store-brand" onClick={() => onNavigate("home")} type="button">
        {logoUrl ? <img src={logoUrl} alt={`${storeName} logo`} /> : <span>{storeName.charAt(0).toUpperCase()}</span>}
        <strong>{storeName}</strong>
      </button>
      <ul
        className="store-nav"
        onMouseLeave={() => setCursor((current) => ({ ...current, opacity: 0 }))}
      >
        {items.map((item, index) => (
          <li
            key={item.label}
            ref={(node) => {
              refs.current[index] = node;
            }}
            onMouseEnter={() => {
              const node = refs.current[index];
              if (!node) return;
              setCursor({ left: node.offsetLeft, width: node.offsetWidth, opacity: 1 });
            }}
          >
            <button type="button" onClick={() => onNavigate(item.page)}>
              {item.label}
            </button>
          </li>
        ))}
        <span
          className="nav-cursor"
          style={{ left: cursor.left, width: cursor.width, opacity: cursor.opacity }}
        />
      </ul>
      <button className="cart-button" type="button" onClick={onCartClick}>
        <ShoppingBag size={16} />
        Keranjang{cartCount > 0 ? <span>{cartCount}</span> : null}
      </button>
    </header>
  );
}

function HeroCarousel({
  eyebrow,
  title,
  subtitle,
  images,
  editable,
  eyebrowEditable,
  onEyebrowChange,
  onTitleChange,
  onBodyChange,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  images: Product[];
  editable: boolean;
  eyebrowEditable: boolean;
  onEyebrowChange: (next: string) => void;
  onTitleChange: (next: string) => void;
  onBodyChange: (next: string) => void;
}) {
  const safeImages = images;
  const [current, setCurrent] = useState(safeImages.length > 0 ? Math.floor(safeImages.length / 2) : 0);
  useEffect(() => {
    if (safeImages.length < 2) return;
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % safeImages.length);
    }, 4000);
    return () => clearInterval(id);
  }, [safeImages.length]);

  return (
    <section className="store-hero">
      <div className="hero-glow hero-glow-left" />
      <div className="hero-glow hero-glow-right" />
      <div className="hero-content">
        <EditableText
          as="span"
          className="hero-eyebrow"
          value={eyebrow}
          editable={eyebrowEditable}
          onChange={onEyebrowChange}
        />
        <EditableText as="h1" value={title} editable={editable} onChange={onTitleChange} />
        <EditableText as="p" value={subtitle} editable={editable} onChange={onBodyChange} multiline />
      </div>

      {safeImages.length > 0 ? (
        <div className="hero-carousel">
          <div className="hero-stage">
            {safeImages.map((product, index) => {
              const total = safeImages.length;
              const offset = index - current;
              let pos = (offset + total) % total;
              if (pos > Math.floor(total / 2)) pos -= total;
              const isCenter = pos === 0;
              const isAdjacent = Math.abs(pos) === 1;
              const scale = isCenter ? 1 : isAdjacent ? 0.85 : 0.7;
              const transform = `translateX(${pos * 45}%) scale(${scale}) rotateY(${pos * -10}deg)`;
              return (
                <div
                  key={product.id}
                  className="hero-card"
                  style={{
                    transform,
                    zIndex: isCenter ? 10 : isAdjacent ? 5 : 1,
                    opacity: isCenter ? 1 : isAdjacent ? 0.45 : 0,
                    filter: isCenter ? "blur(0px)" : "blur(4px)",
                    visibility: Math.abs(pos) > 1 ? "hidden" : "visible",
                  }}
                >
                  {productThumbnail(product) ? (
                    <img src={productThumbnail(product)} alt={product.name} />
                  ) : (
                    <div className="hero-card-placeholder">{product.name.charAt(0)}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function MarqueeRow({
  products,
  currency,
  reverse = false,
}: {
  products: Product[];
  currency: string;
  reverse?: boolean;
}) {
  return (
    <div className={`marquee-row ${reverse ? "is-reverse" : ""}`}>
      <div className="marquee-track">
        {[...products, ...products].map((product, index) => (
          <a key={`${product.id}-${index}`} href="#" className="mini-product">
            <div>{productThumbnail(product) ? <img src={productThumbnail(product)} alt={product.name} /> : null}</div>
            <strong>{product.name}</strong>
            <span>{formatPrice(effectivePrice(product), currency)}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function FooterBlock({
  storeName,
  settings,
  showcase,
  currency,
  texts,
  editable,
  selected,
  textEditMode,
  onSelect,
  onToggleHidden,
  onUpdateText,
  hidden,
}: {
  storeName: string;
  settings: Settings | null;
  showcase: Product[];
  currency: string;
  texts: TextConfig;
  editable: boolean;
  selected: boolean;
  textEditMode: boolean;
  onSelect: (id: SectionId) => void;
  onToggleHidden: (id: SectionId, value?: boolean) => void;
  onUpdateText: (id: SectionId, field: TextField, value: string) => void;
  hidden: boolean;
}) {
  return (
    <EditableSection
      id="footer"
      selected={selected}
      editable={editable}
      hidden={hidden}
      textEditMode={textEditMode}
      onSelect={onSelect}
      onToggleHidden={onToggleHidden}
    >
      <footer className="store-footer">
        {showcase.length > 0 ? (
          <div className="footer-showcase">
            <EditableText
              as="h3"
              value={texts.footer.title}
              editable={editable && textEditMode}
              onChange={(value) => onUpdateText("footer", "title", value)}
            />
            <MarqueeRow products={showcase} currency={currency} />
            {showcase.length > 4 ? (
              <MarqueeRow products={[...showcase].reverse()} currency={currency} reverse />
            ) : null}
            <div className="marquee-fade marquee-fade-left" />
            <div className="marquee-fade marquee-fade-right" />
          </div>
        ) : null}
        <div className="footer-bottom">
          <div>
            <strong>{storeName}</strong>
            <EditableText
              as="p"
              value={texts.footer.body}
              editable={editable && textEditMode}
              onChange={(value) => onUpdateText("footer", "body", value)}
              multiline
            />
          </div>
          <div className="social-links">
            {(settings?.socialLinks ?? []).map((link) => (
              <a href={link.url} key={link.url} aria-label={link.platform} title={link.platform}>
                {socialIcon(link.platform, link.url) ?? link.platform}
              </a>
            ))}
          </div>
        </div>
        <div className="footer-legal">
          <a className="powered-by" href="https://app.e-talase.com" target="_blank" rel="noreferrer">
            Powered by <img src={etalaseLogo.src} alt="e-talase" />
          </a>
          <small>© {new Date().getFullYear()} {storeName}. All rights reserved.</small>
        </div>
      </footer>
    </EditableSection>
  );
}

export function StorefrontPreview({
  storeName,
  logoUrl,
  storeId,
  settings,
  products,
  texts,
  hidden,
  currency,
  editable,
  textEditMode,
  selectedSection,
  onSelectSection,
  onToggleHidden,
  onUpdateText,
  page,
  onNavigate,
  badgeEditable = false,
}: {
  storeName: string;
  logoUrl: string;
  storeId?: string;
  settings: Settings | null;
  products: Product[];
  texts: TextConfig;
  hidden: HiddenConfig;
  currency: string;
  editable: boolean;
  textEditMode?: boolean;
  selectedSection: SectionId;
  onSelectSection: (id: SectionId) => void;
  onToggleHidden: (id: SectionId, value?: boolean) => void;
  onUpdateText: (id: SectionId, field: TextField, value: string) => void;
  page: PreviewPage;
  onNavigate: (page: PreviewPage) => void;
  badgeEditable?: boolean;
}) {
  const isTextEditMode = editable && textEditMode !== false;
  const categories = Array.from(groupByCategory(products).entries());
  const heroImages = products.filter((product) => productThumbnail(product)).slice(0, 5);
  const showcase = products.slice(0, 8);
  const featuredProduct = products[0];
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<Record<string, number>>({});
  const [productQuantity, setProductQuantity] = useState(1);
  const cartProducts = useMemo(
    () =>
      Object.entries(cartItems)
        .map(([id, quantity]) => {
          const product = products.find((item) => item.id === id);
          return product ? { product, quantity } : null;
        })
        .filter((item): item is { product: Product; quantity: number } => Boolean(item)),
    [cartItems, products],
  );
  const cartCount = cartProducts.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartProducts.reduce((sum, item) => sum + effectivePrice(item.product) * item.quantity, 0);
  const featuredStock = featuredProduct ? stockLimit(featuredProduct) : 0;
  const featuredCartQuantity = featuredProduct ? cartItems[featuredProduct.id] ?? 0 : 0;
  const featuredRemainingStock = Math.max(0, featuredStock - featuredCartQuantity);
  const featuredQuantityMax = Math.max(1, featuredRemainingStock);
  const featuredLowStock = featuredProduct && featuredStock <= 5;
  const featuredUnavailable = Boolean(featuredProduct && featuredStock === 0);
  const featuredSoldOutInCart = Boolean(featuredProduct && featuredStock > 0 && featuredRemainingStock === 0);
  const featuredCannotAdd = featuredUnavailable || featuredSoldOutInCart;
  const selectedProductQuantity = boundedQuantity(productQuantity, featuredQuantityMax);
  const filteredProducts = selectedCategory
    ? products.filter((product) => (product.tags ?? []).includes(selectedCategory))
    : products;

  function addToCart(product: Product, quantity = 1) {
    const limit = stockLimit(product);
    const currentQuantity = cartItems[product.id] ?? 0;
    const remaining = Math.max(0, limit - currentQuantity);
    if (remaining <= 0) {
      setCartOpen(true);
      return;
    }
    setCartItems((current) => {
      const currentProductQuantity = current[product.id] ?? 0;
      const currentRemaining = Math.max(0, limit - currentProductQuantity);
      if (currentRemaining <= 0) return current;
      const safeQuantity = Math.min(boundedQuantity(quantity, currentRemaining), currentRemaining);
      return { ...current, [product.id]: currentProductQuantity + safeQuantity };
    });
    setCartOpen(true);
  }

  function updateProductQuantity(next: number) {
    setProductQuantity(boundedQuantity(next, featuredQuantityMax));
  }

  function navigate(page: PreviewPage) {
    onNavigate(page);
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    }
  }

  function navigateCatalogue(category?: string | null) {
    setSelectedCategory(category ?? null);
    navigate("catalogue");
  }

  const header = (
    <StoreHeader
      storeName={storeName}
      logoUrl={logoUrl}
      onNavigate={(nextPage) => {
        if (nextPage === "catalogue") {
          navigateCatalogue(null);
          return;
        }
        navigate(nextPage);
      }}
      cartCount={cartCount}
      onCartClick={() => setCartOpen(true)}
    />
  );
  const cartDrawer = (
    <CartDrawer
      open={cartOpen}
      items={cartProducts}
      currency={currency}
      total={cartTotal}
      storeId={storeId}
      onClose={() => setCartOpen(false)}
    />
  );

  if (page === "catalogue") {
    return (
      <div className="storefront-page">
        {header}
        <section className="catalogue-page">
          <div className="catalogue-page-header">
            <EditableText
              as="h1"
              value={texts.catalogue.title}
              editable={isTextEditMode}
              onChange={(value) => onUpdateText("catalogue", "title", value)}
            />
            <EditableText
              as="p"
              value={texts.catalogue.body}
              editable={isTextEditMode}
              onChange={(value) => onUpdateText("catalogue", "body", value)}
              multiline
            />
          </div>
          <div className="catalogue-tabs">
            <div className="tab-row">
              <button className={!selectedCategory ? "is-active" : ""} type="button" onClick={() => setSelectedCategory(null)}>
                Semua
              </button>
              {categories.slice(0, 6).map(([category]) => (
                <button
                  key={category}
                  className={selectedCategory === category ? "is-active" : ""}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                >
                  {titleCase(category)}
                </button>
              ))}
            </div>
            <div className="product-card-grid">
              {filteredProducts.map((product) => (
                <article
                  className="place-card"
                  key={product.id}
                  onClick={() => navigate("product")}
                  role="button"
                  tabIndex={0}
                >
                  <div className="place-image">
                    {productGallery(product)[0] ? (
                      <img src={productGallery(product)[0]} alt={product.name} />
                    ) : null}
                    <div className="place-tag-row">
                      {(product.tags ?? []).slice(0, 2).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="place-body">
                    <h3>{product.name}</h3>
                    <p className="place-description">
                      {product.subtitle || product.description || "Produk dari toko eTalase ini."}
                    </p>
                    <strong>{formatPrice(effectivePrice(product), currency)}</strong>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        {!hidden.footer ? (
          <FooterBlock
            storeName={storeName}
            settings={settings}
            showcase={showcase}
            currency={currency}
            texts={texts}
            editable={false}
            selected={false}
            textEditMode={false}
            onSelect={onSelectSection}
            onToggleHidden={onToggleHidden}
            onUpdateText={onUpdateText}
            hidden={hidden.footer}
          />
        ) : null}
        {cartDrawer}
      </div>
    );
  }

  if (page === "product") {
    const gallery = featuredProduct ? productGallery(featuredProduct) : [];
    return (
      <div className="storefront-page">
        {header}
        <section className="product-page">
          <button className="product-back" type="button" onClick={() => navigate("catalogue")}>
            <ChevronLeft size={14} /> Kembali ke katalog
          </button>
          {featuredProduct ? (
            <div className="product-grid">
              <div className="product-gallery">
                <div className="product-hero-image">
                  {gallery[0] ? (
                    <img src={gallery[0]} alt={featuredProduct.name} />
                  ) : (
                    <div className="hero-card-placeholder">{featuredProduct.name.charAt(0)}</div>
                  )}
                </div>
                <div className="product-thumb-row">
                  {gallery.slice(0, 4).map((src, index) => (
                    <div key={`${src}-${index}`} className="product-thumb">
                      <img src={src} alt="" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="product-info">
                {(featuredProduct.tags ?? []).slice(0, 1).map((tag) => (
                  <span key={tag} className="product-pill">
                    {tag}
                  </span>
                ))}
                <h1>{featuredProduct.name}</h1>
                {featuredProduct.subtitle ? <p className="product-subtitle">{featuredProduct.subtitle}</p> : null}
                <div className="product-price-row">
                  <strong>{formatPrice(effectivePrice(featuredProduct), currency)}</strong>
                  {featuredProduct.discountedPrice ? (
                    <s>{formatPrice(featuredProduct.price, currency)}</s>
                  ) : null}
                </div>
                <p className="product-description">
                  {featuredProduct.description ||
                    "Deskripsi produk lengkap akan tampil di storefront aktif, diambil dari data produk eTalase Anda."}
                </p>
                <div className="quantity-row">
                  <span>Jumlah</span>
                  <div className="quantity-stepper">
                    <button
                      type="button"
                      onClick={() => updateProductQuantity(productQuantity - 1)}
                      disabled={selectedProductQuantity <= 1}
                      aria-label="Kurangi jumlah"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={featuredQuantityMax}
                      value={selectedProductQuantity}
                      onChange={(event) => updateProductQuantity(Number(event.currentTarget.value))}
                    />
                    <button
                      type="button"
                      onClick={() => updateProductQuantity(selectedProductQuantity + 1)}
                      disabled={selectedProductQuantity >= featuredQuantityMax || featuredCannotAdd}
                      aria-label="Tambah jumlah"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  {featuredLowStock ? (
                    <span className="stock-badge">
                      {featuredUnavailable
                        ? "Stok habis"
                        : featuredSoldOutInCart
                          ? "Stok maksimum di keranjang"
                          : `Sisa ${featuredRemainingStock}`}
                    </span>
                  ) : null}
                </div>
                <div className="product-cta-row">
                  <button
                    className="product-add"
                    type="button"
                    disabled={featuredCannotAdd}
                    onClick={() => addToCart(featuredProduct, selectedProductQuantity)}
                  >
                    <ShoppingBag size={16} /> {featuredUnavailable ? "Stok habis" : featuredSoldOutInCart ? "Stok maksimum di keranjang" : `Tambah ke keranjang - ${formatPrice(effectivePrice(featuredProduct) * selectedProductQuantity, currency)}`}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Alert color="gray">Belum ada produk tersedia. Tambahkan produk di dashboard eTalase Anda.</Alert>
          )}
        </section>
        {!hidden.footer ? (
          <FooterBlock
            storeName={storeName}
            settings={settings}
            showcase={showcase}
            currency={currency}
            texts={texts}
            editable={false}
            selected={false}
            textEditMode={false}
            onSelect={onSelectSection}
            onToggleHidden={onToggleHidden}
            onUpdateText={onUpdateText}
            hidden={hidden.footer}
          />
        ) : null}
        {cartDrawer}
      </div>
    );
  }

  return (
    <div className="storefront-page">
      {header}

      {!hidden.hero ? (
        <EditableSection
          id="hero"
          selected={selectedSection === "hero"}
          editable={editable}
          hidden={hidden.hero}
          textEditMode={isTextEditMode}
          onSelect={onSelectSection}
          onToggleHidden={onToggleHidden}
        >
          <HeroCarousel
            eyebrow={texts.hero.eyebrow || INITIAL_TEXT.hero.eyebrow || "Storefront unggulan"}
            title={texts.hero.title || storeName}
            subtitle={texts.hero.body}
            images={heroImages}
            editable={isTextEditMode}
            eyebrowEditable={badgeEditable}
            onEyebrowChange={(value) => onUpdateText("hero", "eyebrow", value)}
            onTitleChange={(value) => onUpdateText("hero", "title", value)}
            onBodyChange={(value) => onUpdateText("hero", "body", value)}
          />
        </EditableSection>
      ) : null}

      {!hidden.categories && categories.length >= 2 ? (
        <EditableSection
          id="categories"
          selected={selectedSection === "categories"}
          editable={editable}
          hidden={hidden.categories}
          textEditMode={isTextEditMode}
          onSelect={onSelectSection}
          onToggleHidden={onToggleHidden}
        >
          <section id="categories" className="category-section">
            <div className="section-heading">
              <EditableText
                as="h2"
                value={texts.categories.title}
                editable={isTextEditMode}
                onChange={(value) => onUpdateText("categories", "title", value)}
              />
              <EditableText
                as="p"
                value={texts.categories.body}
                editable={isTextEditMode}
                onChange={(value) => onUpdateText("categories", "body", value)}
                multiline
              />
            </div>
            <div className="category-grid">
              {categories.slice(0, 6).map(([category, items], index) => {
                const cover = items.find((product) => productThumbnail(product)) ?? items[0];
                const themes = [
                  "150 50% 25%",
                  "250 50% 30%",
                  "20 80% 35%",
                  "200 60% 30%",
                  "330 50% 35%",
                  "40 70% 30%",
                ];
                return (
                  <a
                    className="destination-card"
                    href="#"
                    key={category}
                    onClick={(event) => {
                      event.preventDefault();
                      navigateCatalogue(category);
                    }}
                    style={{ "--theme-color": themes[index % themes.length] } as CSSProperties}
                  >
                    {productThumbnail(cover) ? <img src={productThumbnail(cover)} alt={category} /> : null}
                    <div className="destination-overlay" />
                    <div className="destination-body">
                      <h3>{titleCase(category)}</h3>
                      <p>
                        {items.length} produk
                      </p>
                      <div className="destination-cta">
                        <span>Jelajahi</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
            <div className="center-row">
              <button className="outline-button" onClick={() => navigateCatalogue(null)}>
                Lihat semua
              </button>
            </div>
          </section>
        </EditableSection>
      ) : null}

      {!hidden.catalogue ? (
        <EditableSection
          id="catalogue"
          selected={selectedSection === "catalogue"}
          editable={editable}
          hidden={hidden.catalogue}
          textEditMode={isTextEditMode}
          onSelect={onSelectSection}
          onToggleHidden={onToggleHidden}
        >
          <section id="products" className="catalogue-section">
            <div className="catalogue-cta">
              <EditableText
                as="h2"
                value={texts.catalogue.title}
                editable={isTextEditMode}
                onChange={(value) => onUpdateText("catalogue", "title", value)}
              />
              <EditableText
                as="p"
                value={texts.catalogue.body}
                editable={isTextEditMode}
                onChange={(value) => onUpdateText("catalogue", "body", value)}
                multiline
              />
              <button type="button" onClick={() => navigateCatalogue(null)}>
                Lihat katalog
                <ArrowRight size={16} />
              </button>
            </div>
          </section>
        </EditableSection>
      ) : null}

      {!hidden.footer ? (
        <FooterBlock
          storeName={storeName}
          settings={settings}
          showcase={showcase}
          currency={currency}
          texts={texts}
          editable={editable}
          selected={selectedSection === "footer"}
          textEditMode={isTextEditMode}
          onSelect={onSelectSection}
          onToggleHidden={onToggleHidden}
          onUpdateText={onUpdateText}
          hidden={hidden.footer}
        />
      ) : null}
      {cartDrawer}
    </div>
  );
}

function CartDrawer({
  open,
  items,
  currency,
  total,
  storeId,
  onClose,
}: {
  open: boolean;
  items: { product: Product; quantity: number }[];
  currency: string;
  total: number;
  storeId?: string;
  onClose: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  function handleCheckoutClick() {
    if (!storeId) {
      window.alert("Checkout belum dikonfigurasi. Store ID tidak ditemukan.");
      return;
    }

    const checkoutItems = items.map(({ product, quantity }) => ({
      productId: product.id,
      quantity,
    }));
    if (checkoutItems.length === 0) return;

    const encoded = encodeCheckoutItems(checkoutItems);
    setRedirectUrl(
      `${ETALASE_CHECKOUT_HOST}/${encodeURIComponent(storeId)}/checkout?items=${encodeURIComponent(encoded)}`,
    );
    setConfirmOpen(true);
  }

  function confirmRedirect() {
    if (!redirectUrl) return;
    setConfirmOpen(false);
    onClose();
    window.location.href = redirectUrl;
  }

  return (
    <div className={`cart-overlay ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <button className="cart-scrim" type="button" onClick={onClose} aria-label="Tutup keranjang" />
      <aside className="cart-drawer" aria-label="Keranjang">
        <div className="cart-drawer-header">
          <div>
            <span>Keranjang</span>
            <strong>{items.length} item</strong>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup keranjang">
            ×
          </button>
        </div>
        {items.length > 0 ? (
          <>
            <div className="cart-line-items">
              {items.map(({ product, quantity }) => (
                <div className="cart-line-item" key={product.id}>
                  <div className="cart-line-image">
                    {productThumbnail(product) ? <img src={productThumbnail(product)} alt={product.name} /> : null}
                  </div>
                  <div>
                    <strong>{product.name}</strong>
                    <span>Jumlah {quantity}</span>
                    {stockLimit(product) <= 5 ? <em>Maks. {stockLimit(product)} stok tersedia</em> : null}
                  </div>
                  <b>{formatPrice(effectivePrice(product) * quantity, currency)}</b>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <span>Total</span>
              <strong>{formatPrice(total, currency)}</strong>
            </div>
            <button className="cart-checkout" type="button" onClick={handleCheckoutClick}>
              Checkout
            </button>
          </>
        ) : (
          <div className="cart-empty">
            <ShoppingBag size={22} />
            <strong>Keranjang Anda kosong</strong>
            <span>Tambahkan produk untuk meninjaunya di sini.</span>
          </div>
        )}
      </aside>
      {confirmOpen ? (
        <div className="checkout-confirm" role="alertdialog" aria-modal="true" aria-labelledby="checkout-confirm-title">
          <div className="checkout-confirm-card">
            <h3 id="checkout-confirm-title">Mengalihkan ke e-talase</h3>
            <p>Anda akan diarahkan ke halaman e-talase untuk menyelesaikan checkout.</p>
            <button type="button" onClick={confirmRedirect}>
              Oke
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
