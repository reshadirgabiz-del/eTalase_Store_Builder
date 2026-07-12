"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, X } from "lucide-react";
import etalaseLogo from "../../assets/logo.png";

import type {
  HiddenConfig,
  PreviewPage,
  Product,
  ProductTextOverride,
  ProductTextOverrides,
  SectionId,
  Settings,
  TextConfig,
  TextField,
} from "./storefront-preview";
import {
  EditableText,
  INITIAL_TEXT,
  effectivePrice,
  formatPrice,
  groupByCategory,
  productGallery,
  productThumbnail,
} from "./storefront-preview";

const ETALASE_CHECKOUT_HOST = "https://app.e-talase.com";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=2070&auto=format&fit=crop";

type Props = {
  storeName: string;
  logoUrl: string;
  storeId?: string;
  settings: Settings | null;
  products: Product[];
  productTextOverrides?: ProductTextOverrides;
  texts: TextConfig;
  hidden: HiddenConfig;
  currency: string;
  editable: boolean;
  textEditMode?: boolean;
  selectedSection: SectionId;
  onSelectSection: (id: SectionId) => void;
  onToggleHidden: (id: SectionId, value?: boolean) => void;
  onUpdateText: (id: SectionId, field: TextField, value: string) => void;
  onUpdateProductText?: (productId: string, field: keyof ProductTextOverride, value: string) => void;
  page: PreviewPage;
  onNavigate: (page: PreviewPage) => void;
  badgeEditable?: boolean;
  heroImageOverride?: string | null;
};

function stockLimit(product: Product) {
  return typeof product.stock === "number" ? Math.max(0, product.stock) : 99;
}

function boundedQuantity(next: number, max?: number | null) {
  if (Number.isNaN(next)) return 1;
  const upper = Math.max(1, max ?? 99);
  return Math.max(1, Math.min(upper, next));
}

function encodeCheckoutItems(items: { productId: string; quantity: number }[]) {
  const json = JSON.stringify(items);
  return window.btoa(unescape(encodeURIComponent(json)));
}

function ordinal(n: number) {
  return n.toString().padStart(3, "0");
}

const paperBg: CSSProperties = {
  backgroundColor: "var(--c-bg)",
  backgroundImage:
    "radial-gradient(at 8% 12%, color-mix(in oklab, var(--c-accent) 12%, transparent), transparent 45%)," +
    "radial-gradient(at 90% 80%, color-mix(in oklab, var(--c-brand) 10%, transparent), transparent 45%)," +
    "repeating-linear-gradient(0deg, color-mix(in oklab, var(--c-ink) 4%, transparent) 0 1px, transparent 1px 4px)," +
    "repeating-linear-gradient(90deg, color-mix(in oklab, var(--c-ink) 3%, transparent) 0 1px, transparent 1px 4px)",
};

const cardBase: CSSProperties = {
  background: "var(--c-surface)",
  border: "1px solid color-mix(in oklab, var(--c-ink) 14%, transparent)",
  boxShadow: "0 1px 0 color-mix(in oklab, var(--c-ink) 6%, transparent), 0 14px 28px -22px color-mix(in oklab, var(--c-ink) 80%, transparent)",
};

const stampBase: CSSProperties = {
  border: "2px dashed color-mix(in oklab, var(--c-brand) 55%, transparent)",
  color: "var(--c-brand-strong)",
  padding: "4px 10px",
  borderRadius: 6,
  fontFamily: "var(--font-heading)",
  fontSize: 11,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  display: "inline-block",
  background: "color-mix(in oklab, var(--c-accent) 12%, white)",
};

export function ArtisanTemplate({
  storeName,
  logoUrl,
  storeId,
  settings,
  products,
  productTextOverrides = {},
  texts,
  hidden,
  currency,
  editable,
  textEditMode,
  selectedSection,
  onSelectSection,
  onToggleHidden,
  onUpdateText,
  onUpdateProductText = () => undefined,
  page,
  onNavigate,
  badgeEditable = false,
  heroImageOverride = null,
}: Props) {
  const isTextEditMode = editable && textEditMode !== false;
  const editableLabel = editable && !isTextEditMode;
  const categories = useMemo(() => Array.from(groupByCategory(products).entries()), [products]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<Record<string, number>>({});
  const [productQuantity, setProductQuantity] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [heroModalOpen, setHeroModalOpen] = useState(() => !hidden.hero);

  const filteredProducts = selectedCategory
    ? products.filter((p) => (p.tags ?? []).includes(selectedCategory))
    : products;
  const showcase = products.slice(0, 6);
  const featured = activeProductId ? products.find((p) => p.id === activeProductId) ?? products[0] : products[0];
  const cartProducts = useMemo(
    () =>
      Object.entries(cartItems)
        .map(([id, qty]) => {
          const product = products.find((p) => p.id === id);
          return product ? { product, quantity: qty } : null;
        })
        .filter((item): item is { product: Product; quantity: number } => Boolean(item)),
    [cartItems, products],
  );
  const cartCount = cartProducts.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cartProducts.reduce((s, i) => s + effectivePrice(i.product) * i.quantity, 0);

  function productText(product: Product) {
    const override = productTextOverrides[product.id] ?? {};
    return {
      name: override.name ?? product.name,
      subtitle: override.subtitle ?? product.subtitle ?? "",
      description: override.description ?? product.description ?? "",
    };
  }

  function addToCart(product: Product, quantity = 1) {
    setCartItems((current) => {
      const next = (current[product.id] ?? 0) + quantity;
      return { ...current, [product.id]: Math.min(next, stockLimit(product)) };
    });
    setCartOpen(true);
  }
  function goCatalogue(category?: string | null) {
    setHeroModalOpen(false);
    setSelectedCategory(category ?? null);
    onNavigate("catalogue");
  }
  function goProduct(id: string) {
    setActiveProductId(id);
    setProductQuantity(1);
    onNavigate("product");
  }

  const homeLabel = texts.hero.navHome || INITIAL_TEXT.hero.navHome || "Beranda";
  const catalogueLabel = texts.hero.navCatalogue || INITIAL_TEXT.hero.navCatalogue || "Katalog";
  const cartLabel = texts.hero.cartLabel || INITIAL_TEXT.hero.cartLabel || "Keranjang";

  const heroImage =
    heroImageOverride ||
    productThumbnail(showcase[0] ?? products[0] ?? ({} as Product)) ||
    FALLBACK_IMAGE;

  const edition = new Date().getFullYear();

  return (
    <div
      className="artisan-page"
      style={{
        ...paperBg,
        minHeight: "100%",
        color: "var(--c-ink)",
        fontFamily: "var(--font-body)",
      }}
    >
      <header
        style={{
          padding: "20px clamp(20px, 5vw, 60px)",
          borderBottom: "1px solid color-mix(in oklab, var(--c-ink) 14%, transparent)",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--c-muted)", fontFamily: "var(--font-heading)" }}>
          <span>Atelier · est. {edition - 6}</span>
          <span>{new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</span>
          <span>Vol. {edition}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <button
            type="button"
            onClick={() => onNavigate("home")}
            style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "transparent", border: "none", cursor: "pointer", color: "inherit" }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover", border: "1px solid color-mix(in oklab, var(--c-ink) 18%, transparent)" }} />
            ) : (
              <span style={{ width: 36, height: 36, borderRadius: 6, display: "grid", placeItems: "center", background: "var(--c-brand)", color: "var(--c-button-text)", fontFamily: "var(--font-heading)", fontWeight: 700 }}>
                {storeName.charAt(0)}
              </span>
            )}
            <EditableText
              as="strong"
              value={texts.hero.storeName || storeName}
              editable={editable}
              onChange={(v) => onUpdateText("hero", "storeName", v)}
              style={{ fontFamily: "var(--font-heading)", fontSize: 24, letterSpacing: "0.04em" }}
            />
          </button>
          <nav style={{ display: "flex", gap: 22, alignItems: "center" }}>
            {[
              { key: "home" as PreviewPage, label: homeLabel, field: "navHome" as TextField },
              { key: "catalogue" as PreviewPage, label: catalogueLabel, field: "navCatalogue" as TextField },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => onNavigate(tab.key)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: page === tab.key ? "var(--c-brand-strong)" : "var(--c-ink)",
                  fontFamily: "var(--font-heading)",
                  fontSize: 14,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  borderBottom: page === tab.key ? "2px solid var(--c-brand)" : "2px solid transparent",
                  paddingBottom: 4,
                }}
              >
                <EditableText value={tab.label} editable={editableLabel} onChange={(v) => onUpdateText("hero", tab.field, v)} />
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                background: "var(--c-ink)",
                color: "var(--c-bg)",
                border: "none",
                fontFamily: "var(--font-heading)",
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                cursor: "pointer",
                borderRadius: 4,
              }}
            >
              <ShoppingBag size={13} />
              <EditableText value={cartLabel} editable={editableLabel} onChange={(v) => onUpdateText("hero", "cartLabel", v)} />
              {cartCount > 0 ? <span style={{ marginLeft: 4, background: "var(--c-accent)", color: "var(--c-ink)", borderRadius: 4, padding: "1px 7px", fontSize: 11 }}>{cartCount}</span> : null}
            </button>
          </nav>
        </div>
      </header>

      <main style={{ padding: "44px clamp(20px, 5vw, 60px) 80px" }}>
        {page === "home" ? (
          <HomeView
            texts={texts}
            hidden={hidden}
            heroImage={heroImage}
            showcase={showcase}
            categories={categories}
            editable={editable}
            isTextEditMode={isTextEditMode}
            editableLabel={editableLabel}
            onSelectSection={onSelectSection}
            onToggleHidden={onToggleHidden}
            onUpdateText={onUpdateText}
            onAddToCart={addToCart}
            onGoCatalogue={goCatalogue}
            onOpenProduct={goProduct}
            currency={currency}
            productText={productText}
            edition={edition}
            storeName={storeName}
          />
        ) : null}

        {page === "catalogue" ? (
          <CatalogueView
            texts={texts}
            categories={categories.map(([k]) => k)}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            products={filteredProducts}
            currency={currency}
            onOpenProduct={goProduct}
            onAddToCart={addToCart}
            productText={productText}
            editable={editable}
            editableLabel={editableLabel}
            onUpdateText={onUpdateText}
          />
        ) : null}

        {page === "product" && featured ? (
          <ProductDetailView
            product={featured}
            quantity={productQuantity}
            onQuantityChange={(n) => setProductQuantity(boundedQuantity(n, stockLimit(featured)))}
            onBack={() => onNavigate("catalogue")}
            onAddToCart={(qty) => addToCart(featured, qty)}
            texts={texts}
            currency={currency}
            productText={productText}
            editable={editable}
            editableLabel={editableLabel}
            onUpdateText={onUpdateText}
            products={products}
            edition={edition}
          />
        ) : null}
      </main>

      {!hidden.footer ? (
        <footer
          onClick={() => editable && onSelectSection("footer")}
          style={{
            borderTop: "1px solid color-mix(in oklab, var(--c-ink) 14%, transparent)",
            padding: "36px clamp(20px, 5vw, 60px)",
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr",
            gap: 24,
            position: "relative",
          }}
        >
          <div>
            <span style={stampBase}>handcrafted in Indonesia</span>
            <EditableText
              as="h3"
              value={texts.footer.title}
              editable={isTextEditMode}
              onChange={(v) => onUpdateText("footer", "title", v)}
              style={{ marginTop: 14, fontFamily: "var(--font-heading)", fontSize: 26, letterSpacing: "0.02em", margin: 0 }}
            />
            <EditableText
              as="p"
              value={texts.footer.body}
              editable={isTextEditMode}
              onChange={(v) => onUpdateText("footer", "body", v)}
              style={{ marginTop: 10, color: "var(--c-muted)", maxWidth: 500, fontStyle: "italic" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, fontSize: 12, color: "var(--c-muted)" }}>
            <span style={{ fontFamily: "var(--font-heading)" }}>— signed, {storeName.toLowerCase()} —</span>
            <span>© {edition}. Edisi {ordinal(edition % 1000)}.</span>
            <a href="https://e-talase.com" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--c-muted)" }}>
              powered by <img src={etalaseLogo.src} alt="e-talase" style={{ height: 14 }} />
            </a>
          </div>
        </footer>
      ) : null}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartProducts}
        total={cartTotal}
        currency={currency}
        texts={texts}
        editable={editableLabel}
        onUpdateText={onUpdateText}
        productText={productText}
        onChangeQuantity={(id, qty) =>
          setCartItems((c) => {
            const copy = { ...c };
            if (qty <= 0) delete copy[id];
            else copy[id] = qty;
            return copy;
          })
        }
        storeId={storeId}
      />

      {page === "home" && !hidden.hero && heroModalOpen ? (
        <ArtisanOpeningModal
          texts={texts}
          heroImageOverride={heroImageOverride}
          fallbackImage={heroImage}
          isTextEditMode={isTextEditMode}
          badgeEditable={badgeEditable || editable}
          edition={edition}
          storeName={storeName}
          onClose={() => setHeroModalOpen(false)}
          onCta={() => goCatalogue(null)}
          onUpdateText={onUpdateText}
        />
      ) : null}
    </div>
  );
}

function ArtisanOpeningModal({
  texts,
  heroImageOverride,
  fallbackImage,
  isTextEditMode,
  badgeEditable,
  edition,
  storeName,
  onClose,
  onCta,
  onUpdateText,
}: {
  texts: TextConfig;
  heroImageOverride: string | null;
  fallbackImage: string;
  isTextEditMode: boolean;
  badgeEditable: boolean;
  edition: number;
  storeName: string;
  onClose: () => void;
  onCta: () => void;
  onUpdateText: (id: SectionId, field: TextField, v: string) => void;
}) {
  const hasHeroBackground = Boolean(heroImageOverride);
  return (
    <div className="pastel-modal is-artisan" role="dialog" aria-modal="true" aria-label="Opening highlight">
      <button className="pastel-modal-scrim" type="button" aria-label="Close opening modal" onClick={onClose} />
      <motion.section
        className={`pastel-opening is-artisan${hasHeroBackground ? " has-hero-bg" : ""}`}
        style={hasHeroBackground ? undefined : { ...paperBg }}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.38, ease: "easeOut" }}
      >
        {hasHeroBackground ? <img className="pastel-opening-bg-image" src={heroImageOverride ?? undefined} alt="" /> : null}
        {hasHeroBackground ? <span className="pastel-opening-overlay" aria-hidden="true" /> : null}
        <button className="pastel-modal-close" type="button" aria-label="Close opening modal" onClick={onClose}>
          <X size={18} />
        </button>
        <span
          className="artisan-opening-stamp"
          style={{
            position: "absolute",
            top: 22,
            left: 22,
            zIndex: 2,
            fontFamily: "var(--font-heading)",
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: hasHeroBackground ? "#fff" : "var(--c-brand-strong)",
            border: `1px solid ${hasHeroBackground ? "rgba(255,255,255,0.55)" : "color-mix(in oklab, var(--c-brand) 55%, transparent)"}`,
            padding: "4px 10px",
            borderRadius: 6,
            background: hasHeroBackground ? "rgba(0,0,0,0.18)" : "transparent",
          }}
        >
          Edisi {ordinal(edition % 1000)}
        </span>
        <div
          className="pastel-opening-copy-zone"
          style={{
            placeItems: "center",
            textAlign: "center",
          }}
        >
          <div
            className="pastel-hero-copy"
            style={{
              maxWidth: 560,
              color: hasHeroBackground ? "#fff" : "var(--c-ink)",
              fontFamily: "var(--font-body)",
              display: "grid",
              gap: 18,
              justifyItems: "center",
            }}
          >
            <span
              style={{
                ...stampBase,
                color: hasHeroBackground ? "#fff" : "var(--c-brand-strong)",
                background: hasHeroBackground ? "rgba(0,0,0,0.22)" : "color-mix(in oklab, var(--c-accent) 12%, white)",
                borderColor: hasHeroBackground ? "rgba(255,255,255,0.55)" : "color-mix(in oklab, var(--c-brand) 55%, transparent)",
              }}
            >
              <EditableText
                value={texts.hero.eyebrow || INITIAL_TEXT.hero.eyebrow || "Handcrafted"}
                editable={badgeEditable || isTextEditMode}
                onChange={(v) => onUpdateText("hero", "eyebrow", v)}
              />
            </span>
            <EditableText
              as="h1"
              value={texts.hero.title || storeName}
              editable={isTextEditMode}
              onChange={(v) => onUpdateText("hero", "title", v)}
              style={{
                margin: 0,
                fontFamily: "var(--font-heading)",
                fontStyle: "italic",
                fontSize: "clamp(36px, 6vw, 64px)",
                lineHeight: 1.04,
                letterSpacing: "-0.01em",
                color: "inherit",
              }}
            />
            <EditableText
              as="p"
              value={texts.hero.body}
              editable={isTextEditMode}
              onChange={(v) => onUpdateText("hero", "body", v)}
              multiline
              style={{
                margin: 0,
                fontSize: 16,
                lineHeight: 1.6,
                color: hasHeroBackground ? "rgba(255,255,255,0.86)" : "var(--c-muted)",
              }}
            />
            <button
              type="button"
              onClick={onCta}
              style={{
                marginTop: 8,
                padding: "14px 26px",
                background: hasHeroBackground ? "#fff" : "var(--c-brand)",
                color: hasHeroBackground ? "var(--c-ink)" : "var(--c-button-text)",
                border: "1px solid color-mix(in oklab, var(--c-brand-strong) 60%, transparent)",
                fontFamily: "var(--font-heading)",
                fontSize: 13,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                borderRadius: 4,
              }}
            >
              <EditableText
                value={texts.hero.ctaLabel || INITIAL_TEXT.hero.ctaLabel || "Lihat katalog"}
                editable={isTextEditMode}
                onChange={(v) => onUpdateText("hero", "ctaLabel", v)}
              />
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
        {hasHeroBackground ? null : (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: 28,
              right: 28,
              width: 96,
              height: 96,
              borderRadius: 999,
              background: "var(--c-accent)",
              color: "var(--c-ink)",
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--font-heading)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.1em",
              transform: "rotate(-12deg)",
              border: "2px solid var(--c-ink)",
              lineHeight: 1.05,
              textAlign: "center",
              padding: 8,
              zIndex: 1,
            }}
          >
            Made by hand
          </span>
        )}
        {!hasHeroBackground && fallbackImage ? (
          <img
            src={fallbackImage}
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 28,
              bottom: 28,
              width: "min(220px, 28%)",
              aspectRatio: "4/5",
              objectFit: "cover",
              borderRadius: 4,
              transform: "rotate(-2.2deg)",
              border: "1px solid color-mix(in oklab, var(--c-ink) 14%, transparent)",
              boxShadow: "0 14px 28px -16px rgba(46, 31, 18, 0.6)",
              zIndex: 1,
            }}
          />
        ) : null}
      </motion.section>
    </div>
  );
}

function HomeView({
  texts,
  hidden,
  heroImage,
  showcase,
  categories,
  editable,
  isTextEditMode,
  editableLabel,
  onSelectSection,
  onToggleHidden,
  onUpdateText,
  onAddToCart,
  onGoCatalogue,
  onOpenProduct,
  currency,
  productText,
  edition,
  storeName,
}: {
  texts: TextConfig;
  hidden: HiddenConfig;
  heroImage: string;
  showcase: Product[];
  categories: [string, Product[]][];
  editable: boolean;
  isTextEditMode: boolean;
  editableLabel: boolean;
  onSelectSection: (id: SectionId) => void;
  onToggleHidden: (id: SectionId, v?: boolean) => void;
  onUpdateText: (id: SectionId, field: TextField, v: string) => void;
  onAddToCart: (p: Product) => void;
  onGoCatalogue: (cat?: string | null) => void;
  onOpenProduct: (id: string) => void;
  currency: string;
  productText: (p: Product) => { name: string; subtitle: string; description: string };
  edition: number;
  storeName: string;
}) {
  return (
    <>
      {!hidden.hero ? (
        <section
          onClick={() => editable && onSelectSection("hero")}
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "1.05fr 1fr",
            gap: 40,
            alignItems: "center",
            paddingBottom: 36,
            borderBottom: "1px solid color-mix(in oklab, var(--c-ink) 14%, transparent)",
          }}
        >
          <div>
            <span style={stampBase}>
              <EditableText value={texts.hero.eyebrow || ""} editable={isTextEditMode} onChange={(v) => onUpdateText("hero", "eyebrow", v)} />
            </span>
            <EditableText
              as="h1"
              value={texts.hero.title}
              editable={isTextEditMode}
              onChange={(v) => onUpdateText("hero", "title", v)}
              style={{
                marginTop: 18,
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(36px, 5.5vw, 64px)",
                lineHeight: 1.02,
                letterSpacing: "-0.01em",
                fontStyle: "italic",
                margin: 0,
              }}
            />
            <EditableText
              as="p"
              value={texts.hero.body}
              editable={isTextEditMode}
              onChange={(v) => onUpdateText("hero", "body", v)}
              style={{ marginTop: 20, color: "var(--c-muted)", maxWidth: 480, fontSize: 16, lineHeight: 1.6 }}
            />
            <button
              type="button"
              onClick={() => onGoCatalogue(null)}
              style={{
                marginTop: 26,
                padding: "14px 24px",
                background: "var(--c-brand)",
                color: "var(--c-button-text)",
                border: "1px solid color-mix(in oklab, var(--c-brand-strong) 60%, transparent)",
                fontFamily: "var(--font-heading)",
                fontSize: 13,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                borderRadius: 4,
              }}
            >
              <EditableText value={texts.hero.ctaLabel || ""} editable={isTextEditMode} onChange={(v) => onUpdateText("hero", "ctaLabel", v)} />
              <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <div
              style={{
                ...cardBase,
                borderRadius: 8,
                padding: 10,
                transform: "rotate(-2.2deg)",
                position: "relative",
              }}
            >
              <div style={{ aspectRatio: "4/5", overflow: "hidden", borderRadius: 4, background: "color-mix(in oklab, var(--c-muted) 20%, white)" }}>
                <img src={heroImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.92)" }} />
              </div>
              <div style={{ position: "absolute", top: 14, right: 14, padding: "6px 10px", background: "var(--c-bg)", border: "1px solid color-mix(in oklab, var(--c-ink) 25%, transparent)", borderRadius: 4, fontFamily: "var(--font-heading)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--c-brand-strong)" }}>
                Edisi {ordinal(edition % 1000)}
              </div>
              <div style={{ marginTop: 12, paddingInline: 4, paddingBottom: 4, display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: "var(--font-heading)", fontSize: 12 }}>
                <span style={{ fontStyle: "italic" }}>— {storeName.toLowerCase()}</span>
                <span style={{ color: "var(--c-muted)" }}>{showcase[0] ? formatPrice(effectivePrice(showcase[0]), currency) : ""}</span>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                bottom: -18,
                left: -16,
                width: 80,
                height: 80,
                borderRadius: 999,
                background: "var(--c-accent)",
                color: "var(--c-ink)",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--font-heading)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.1em",
                transform: "rotate(-12deg)",
                border: "2px solid var(--c-ink)",
                lineHeight: 1.05,
                textAlign: "center",
                padding: 8,
              }}
            >
              Made by hand
            </div>
          </div>
          {editable ? <SectionToggle hidden={hidden.hero} onToggle={(v) => onToggleHidden("hero", v)} /> : null}
        </section>
      ) : null}

      {!hidden.categories && categories.length > 0 ? (
        <section
          onClick={() => editable && onSelectSection("categories")}
          style={{ marginTop: 56, position: "relative" }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--c-brand)" }}>· 01 ·</span>
            <EditableText
              as="h2"
              value={texts.categories.title}
              editable={isTextEditMode}
              onChange={(v) => onUpdateText("categories", "title", v)}
              style={{ fontFamily: "var(--font-heading)", fontSize: 30, letterSpacing: "0.01em", margin: 0, fontStyle: "italic" }}
            />
          </div>
          <EditableText
            as="p"
            value={texts.categories.body}
            editable={isTextEditMode}
            onChange={(v) => onUpdateText("categories", "body", v)}
            style={{ marginTop: 10, color: "var(--c-muted)", maxWidth: 540 }}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18, marginTop: 22 }}>
            {categories.map(([name, items], idx) => (
              <button
                key={name}
                type="button"
                onClick={() => onGoCatalogue(name)}
                style={{
                  ...cardBase,
                  borderRadius: 6,
                  padding: 20,
                  textAlign: "left",
                  cursor: "pointer",
                  color: "var(--c-ink)",
                  fontFamily: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  position: "relative",
                  transform: `rotate(${idx % 2 === 0 ? "-0.6" : "0.6"}deg)`,
                }}
              >
                <span style={{ fontFamily: "var(--font-heading)", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--c-brand)" }}>
                  No. {ordinal(idx + 1)}
                </span>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontStyle: "italic" }}>{name}</span>
                <span style={{ fontSize: 12, color: "var(--c-muted)" }}>{items.length} {texts.categories.productCountSuffix || "produk"}</span>
                <ArrowRight size={14} style={{ position: "absolute", right: 14, bottom: 14, color: "var(--c-brand)" }} />
              </button>
            ))}
          </div>
          {editable ? <SectionToggle hidden={hidden.categories} onToggle={(v) => onToggleHidden("categories", v)} /> : null}
        </section>
      ) : null}

      {!hidden.catalogue ? (
        <section
          onClick={() => editable && onSelectSection("catalogue")}
          style={{ marginTop: 56, position: "relative" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--c-brand)" }}>· 02 ·</span>
                <EditableText
                  as="h2"
                  value={texts.catalogue.title}
                  editable={isTextEditMode}
                  onChange={(v) => onUpdateText("catalogue", "title", v)}
                  style={{ fontFamily: "var(--font-heading)", fontSize: 30, letterSpacing: "0.01em", margin: 0, fontStyle: "italic" }}
                />
              </div>
              <EditableText
                as="p"
                value={texts.catalogue.body}
                editable={isTextEditMode}
                onChange={(v) => onUpdateText("catalogue", "body", v)}
                style={{ marginTop: 10, color: "var(--c-muted)", maxWidth: 540 }}
              />
            </div>
            <button
              type="button"
              onClick={() => onGoCatalogue(null)}
              style={{ background: "transparent", border: "none", color: "var(--c-brand-strong)", padding: 0, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-heading)", letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 12, borderBottom: "1px solid var(--c-brand-strong)" }}
            >
              <EditableText value={texts.catalogue.viewAllLabel || ""} editable={editableLabel} onChange={(v) => onUpdateText("catalogue", "viewAllLabel", v)} /> →
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(220px, calc(50% - 11px)), 1fr))", gap: 22, marginTop: 26 }}>
            {showcase.map((p, idx) => (
              <ProductCard
                key={p.id}
                product={p}
                currency={currency}
                onOpen={() => onOpenProduct(p.id)}
                onAdd={() => onAddToCart(p)}
                name={productText(p).name}
                index={idx}
              />
            ))}
          </div>
          {editable ? <SectionToggle hidden={hidden.catalogue} onToggle={(v) => onToggleHidden("catalogue", v)} /> : null}
        </section>
      ) : null}
    </>
  );
}

function ProductCard({
  product,
  currency,
  onOpen,
  onAdd,
  name,
  index,
}: {
  product: Product;
  currency: string;
  onOpen: () => void;
  onAdd: () => void;
  name: string;
  index: number;
}) {
  const image = productThumbnail(product) || FALLBACK_IMAGE;
  const price = effectivePrice(product);
  return (
    <motion.article
      whileHover={{ y: -3, rotate: 0 }}
      style={{
        ...cardBase,
        borderRadius: 6,
        padding: 10,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        cursor: "pointer",
        position: "relative",
        transform: `rotate(${index % 2 === 0 ? "-0.5" : "0.6"}deg)`,
      }}
      onClick={onOpen}
    >
      <div style={{ aspectRatio: "4/5", overflow: "hidden", borderRadius: 4, background: "color-mix(in oklab, var(--c-muted) 18%, white)" }}>
        <img src={image} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.94)" }} />
      </div>
      <div style={{ padding: "0 4px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--c-brand)" }}>№ {ordinal(index + 1)}</span>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14, color: "var(--c-brand-strong)" }}>{formatPrice(price, currency)}</span>
        </div>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 17, lineHeight: 1.2, fontStyle: "italic", marginTop: 4, overflow: "hidden", display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2 }}>{name}</div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          aria-label="Tambah"
          style={{ marginTop: 10, width: "100%", background: "var(--c-ink)", color: "var(--c-bg)", border: "none", borderRadius: 4, padding: "8px 12px", fontFamily: "var(--font-heading)", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <ShoppingBag size={12} />
          Tambah
        </button>
      </div>
    </motion.article>
  );
}

function CatalogueView({
  texts,
  categories,
  selectedCategory,
  onSelectCategory,
  products,
  currency,
  onOpenProduct,
  onAddToCart,
  productText,
  editable,
  editableLabel,
  onUpdateText,
}: {
  texts: TextConfig;
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  products: Product[];
  currency: string;
  onOpenProduct: (id: string) => void;
  onAddToCart: (p: Product) => void;
  productText: (p: Product) => { name: string; subtitle: string; description: string };
  editable: boolean;
  editableLabel: boolean;
  onUpdateText: (id: SectionId, field: TextField, v: string) => void;
}) {
  const allLabel = texts.catalogue.allLabel || INITIAL_TEXT.catalogue.allLabel || "Semua";
  return (
    <section>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--c-brand)" }}>Katalog</span>
        <EditableText
          as="h1"
          value={texts.catalogue.title}
          editable={editable}
          onChange={(v) => onUpdateText("catalogue", "title", v)}
          style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(34px, 5vw, 52px)", letterSpacing: "0.01em", margin: 0, fontStyle: "italic" }}
        />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 22 }}>
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          style={{
            padding: "6px 14px",
            border: "1px solid color-mix(in oklab, var(--c-ink) 25%, transparent)",
            background: !selectedCategory ? "var(--c-ink)" : "transparent",
            color: !selectedCategory ? "var(--c-bg)" : "var(--c-ink)",
            fontFamily: "var(--font-heading)",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            cursor: "pointer",
            borderRadius: 3,
          }}
        >
          <EditableText value={allLabel} editable={editableLabel} onChange={(v) => onUpdateText("catalogue", "allLabel", v)} />
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            style={{
              padding: "6px 14px",
              border: "1px solid color-mix(in oklab, var(--c-ink) 25%, transparent)",
              background: selectedCategory === cat ? "var(--c-ink)" : "transparent",
              color: selectedCategory === cat ? "var(--c-bg)" : "var(--c-ink)",
              fontFamily: "var(--font-heading)",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: "pointer",
              borderRadius: 3,
            }}
          >
            {cat}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(220px, calc(50% - 11px)), 1fr))", gap: 22, marginTop: 28 }}>
        {products.map((p, idx) => (
          <ProductCard
            key={p.id}
            product={p}
            currency={currency}
            onOpen={() => onOpenProduct(p.id)}
            onAdd={() => onAddToCart(p)}
            name={productText(p).name}
            index={idx}
          />
        ))}
      </div>
    </section>
  );
}

function ProductDetailView({
  product,
  quantity,
  onQuantityChange,
  onBack,
  onAddToCart,
  texts,
  currency,
  productText,
  editable,
  editableLabel,
  onUpdateText,
  products,
  edition,
}: {
  product: Product;
  quantity: number;
  onQuantityChange: (n: number) => void;
  onBack: () => void;
  onAddToCart: (qty: number) => void;
  texts: TextConfig;
  currency: string;
  productText: (p: Product) => { name: string; subtitle: string; description: string };
  editable: boolean;
  editableLabel: boolean;
  onUpdateText: (id: SectionId, field: TextField, v: string) => void;
  products: Product[];
  edition: number;
}) {
  const gallery = productGallery(product);
  const hero = gallery[0] ?? productThumbnail(product) ?? FALLBACK_IMAGE;
  const info = productText(product);
  const max = stockLimit(product);
  const idx = Math.max(0, products.findIndex((p) => p.id === product.id));
  return (
    <section>
      <button
        type="button"
        onClick={onBack}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: "var(--c-muted)", cursor: "pointer", marginBottom: 20, fontFamily: "var(--font-heading)", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase" }}
      >
        <ArrowLeft size={14} />
        <EditableText value={texts.catalogue.backLabel || ""} editable={editableLabel} onChange={(v) => onUpdateText("catalogue", "backLabel", v)} />
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
        <div style={{ ...cardBase, borderRadius: 6, padding: 12, transform: "rotate(-1deg)", position: "relative" }}>
          <div style={{ aspectRatio: "4/5", overflow: "hidden", borderRadius: 3, background: "color-mix(in oklab, var(--c-muted) 18%, white)" }}>
            <img src={hero} alt={info.name} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.92)" }} />
          </div>
          <div style={{ position: "absolute", top: 22, right: 22, padding: "6px 10px", background: "var(--c-bg)", border: "1px solid color-mix(in oklab, var(--c-ink) 22%, transparent)", borderRadius: 3, fontFamily: "var(--font-heading)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            № {ordinal(idx + 1)} / {edition}
          </div>
        </div>
        <div>
          <span style={stampBase}>Edisi terbatas</span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(30px, 4vw, 46px)", margin: "18px 0 0", letterSpacing: "0.01em", fontStyle: "italic" }}>{info.name}</h1>
          {info.subtitle ? <p style={{ color: "var(--c-muted)", marginTop: 10, fontStyle: "italic" }}>{info.subtitle}</p> : null}
          <div style={{ marginTop: 18, fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 700, color: "var(--c-brand-strong)" }}>{formatPrice(effectivePrice(product), currency)}</div>
          <p style={{ marginTop: 18, lineHeight: 1.65, color: "var(--c-ink)" }}>{info.description || texts.catalogue.productFallback || ""}</p>
          <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, border: "1px solid color-mix(in oklab, var(--c-ink) 22%, transparent)", borderRadius: 4, padding: "6px 12px" }}>
              <button type="button" onClick={() => onQuantityChange(quantity - 1)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "inherit" }}>
                <Minus size={14} />
              </button>
              <span style={{ minWidth: 22, textAlign: "center", fontWeight: 600 }}>{quantity}</span>
              <button type="button" onClick={() => onQuantityChange(quantity + 1)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "inherit" }}>
                <Plus size={14} />
              </button>
            </div>
            <button
              type="button"
              disabled={max === 0}
              onClick={() => onAddToCart(quantity)}
              style={{
                padding: "12px 22px",
                borderRadius: 4,
                background: max === 0 ? "color-mix(in oklab, var(--c-muted) 45%, white)" : "var(--c-brand)",
                color: "var(--c-button-text)",
                border: "1px solid color-mix(in oklab, var(--c-brand-strong) 60%, transparent)",
                fontFamily: "var(--font-heading)",
                fontSize: 12,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontWeight: 700,
                cursor: max === 0 ? "not-allowed" : "pointer",
              }}
            >
              <EditableText
                value={max === 0 ? texts.catalogue.soldOutLabel || "Stok habis" : texts.catalogue.addToCartLabel || "Tambah ke keranjang"}
                editable={editableLabel}
                onChange={(v) => onUpdateText("catalogue", max === 0 ? "soldOutLabel" : "addToCartLabel", v)}
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CartDrawer({
  open,
  onClose,
  items,
  total,
  currency,
  texts,
  editable,
  onUpdateText,
  productText,
  onChangeQuantity,
  storeId,
}: {
  open: boolean;
  onClose: () => void;
  items: { product: Product; quantity: number }[];
  total: number;
  currency: string;
  texts: TextConfig;
  editable: boolean;
  onUpdateText: (id: SectionId, field: TextField, v: string) => void;
  productText: (p: Product) => { name: string; subtitle: string; description: string };
  onChangeQuantity: (id: string, qty: number) => void;
  storeId?: string;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  function checkout() {
    if (!items.length || !storeId) return;
    setConfirmOpen(true);
  }
  function confirmRedirect() {
    if (!storeId) return;
    const encoded = encodeCheckoutItems(items.map((i) => ({ productId: i.product.id, quantity: i.quantity })));
    window.open(`${ETALASE_CHECKOUT_HOST}/checkout?store=${storeId}&items=${encoded}`, "_blank");
  }
  return (
    <>
      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : 420 }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(420px, 92vw)",
          background: "var(--c-surface)",
          borderLeft: "1px solid color-mix(in oklab, var(--c-ink) 18%, transparent)",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          zIndex: 30,
          boxShadow: "-20px 0 50px -20px color-mix(in oklab, var(--c-ink) 60%, transparent)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid color-mix(in oklab, var(--c-ink) 14%, transparent)", paddingBottom: 12 }}>
          <EditableText
            as="h3"
            value={texts.catalogue.cartTitle || "Keranjang"}
            editable={editable}
            onChange={(v) => onUpdateText("catalogue", "cartTitle", v)}
            style={{ fontFamily: "var(--font-heading)", fontSize: 22, margin: 0, fontStyle: "italic" }}
          />
          <button type="button" onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "inherit" }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: 24, color: "var(--c-muted)" }}>
              <EditableText
                as="strong"
                value={texts.catalogue.cartEmptyTitle || "Keranjang kosong"}
                editable={editable}
                onChange={(v) => onUpdateText("catalogue", "cartEmptyTitle", v)}
                style={{ display: "block", fontFamily: "var(--font-heading)" }}
              />
              <EditableText
                as="p"
                value={texts.catalogue.cartEmptyBody || ""}
                editable={editable}
                onChange={(v) => onUpdateText("catalogue", "cartEmptyBody", v)}
                style={{ marginTop: 8, fontSize: 13, fontStyle: "italic" }}
              />
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div key={product.id} style={{ display: "flex", gap: 12, paddingBottom: 12, borderBottom: "1px dashed color-mix(in oklab, var(--c-ink) 16%, transparent)" }}>
                <img
                  src={productThumbnail(product) || FALLBACK_IMAGE}
                  alt=""
                  style={{ width: 60, height: 76, borderRadius: 3, objectFit: "cover", border: "1px solid color-mix(in oklab, var(--c-ink) 12%, transparent)" }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontStyle: "italic" }}>{productText(product).name}</div>
                  <div style={{ fontSize: 13, color: "var(--c-brand-strong)", marginTop: 4, fontFamily: "var(--font-heading)", fontWeight: 600 }}>
                    {formatPrice(effectivePrice(product) * quantity, currency)}
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <button type="button" onClick={() => onChangeQuantity(product.id, quantity - 1)} style={{ background: "transparent", border: "1px solid color-mix(in oklab, var(--c-ink) 22%, transparent)", borderRadius: 3, width: 22, height: 22, cursor: "pointer", color: "inherit" }}>
                      <Minus size={11} />
                    </button>
                    <span style={{ fontSize: 13, fontWeight: 600, minWidth: 16, textAlign: "center" }}>{quantity}</span>
                    <button type="button" onClick={() => onChangeQuantity(product.id, quantity + 1)} style={{ background: "transparent", border: "1px solid color-mix(in oklab, var(--c-ink) 22%, transparent)", borderRadius: 3, width: 22, height: 22, cursor: "pointer", color: "inherit" }}>
                      <Plus size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div style={{ borderTop: "1px solid color-mix(in oklab, var(--c-ink) 14%, transparent)", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "var(--font-heading)" }}>
          <EditableText value={texts.catalogue.totalLabel || "Total"} editable={editable} onChange={(v) => onUpdateText("catalogue", "totalLabel", v)} style={{ color: "var(--c-muted)", letterSpacing: "0.16em", textTransform: "uppercase", fontSize: 12 }} />
          <strong style={{ fontSize: 20, color: "var(--c-brand-strong)" }}>{formatPrice(total, currency)}</strong>
        </div>
        <button
          type="button"
          onClick={checkout}
          disabled={!items.length}
          style={{ background: "var(--c-brand)", color: "var(--c-button-text)", border: "1px solid color-mix(in oklab, var(--c-brand-strong) 50%, transparent)", borderRadius: 4, padding: "14px 18px", fontFamily: "var(--font-heading)", fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, cursor: items.length ? "pointer" : "not-allowed", opacity: items.length ? 1 : 0.6 }}
        >
          <EditableText value={texts.catalogue.checkoutLabel || "Checkout"} editable={editable} onChange={(v) => onUpdateText("catalogue", "checkoutLabel", v)} />
        </button>
      </motion.aside>

      {confirmOpen ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "grid", placeItems: "center", zIndex: 40 }}>
          <div style={{ background: "var(--c-surface)", border: "1px solid color-mix(in oklab, var(--c-ink) 18%, transparent)", borderRadius: 6, padding: 28, maxWidth: 360 }}>
            <h3 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 22, fontStyle: "italic" }}>
              <EditableText value={texts.catalogue.confirmTitle || ""} editable={editable} onChange={(v) => onUpdateText("catalogue", "confirmTitle", v)} />
            </h3>
            <p style={{ marginTop: 8, color: "var(--c-muted)", fontSize: 13 }}>
              <EditableText value={texts.catalogue.confirmBody || ""} editable={editable} onChange={(v) => onUpdateText("catalogue", "confirmBody", v)} />
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button type="button" onClick={() => setConfirmOpen(false)} style={{ background: "transparent", border: "1px solid color-mix(in oklab, var(--c-ink) 22%, transparent)", borderRadius: 4, padding: "8px 14px", cursor: "pointer", color: "inherit", fontFamily: "var(--font-heading)", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  confirmRedirect();
                }}
                style={{ background: "var(--c-brand)", color: "var(--c-button-text)", border: "1px solid color-mix(in oklab, var(--c-brand-strong) 50%, transparent)", borderRadius: 4, padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontFamily: "var(--font-heading)", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase" }}
              >
                <EditableText value={texts.catalogue.confirmButton || "Oke"} editable={editable} onChange={(v) => onUpdateText("catalogue", "confirmButton", v)} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SectionToggle({ hidden, onToggle }: { hidden: boolean; onToggle: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle(!hidden);
      }}
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        background: "var(--c-surface)",
        border: "1px solid color-mix(in oklab, var(--c-ink) 22%, transparent)",
        borderRadius: 4,
        padding: "6px 12px",
        fontSize: 11,
        fontWeight: 600,
        cursor: "pointer",
        color: "var(--c-ink)",
        fontFamily: "var(--font-heading)",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
      }}
    >
      {hidden ? "Tampilkan" : "Sembunyikan"}
    </button>
  );
}
