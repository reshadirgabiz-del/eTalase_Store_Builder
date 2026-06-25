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
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop";

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

const glassBase: CSSProperties = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0.25))",
  border: "1px solid rgba(255,255,255,0.55)",
  backdropFilter: "blur(22px) saturate(160%)",
  WebkitBackdropFilter: "blur(22px) saturate(160%)",
  boxShadow: "0 18px 60px rgba(31, 38, 135, 0.18), inset 0 1px 0 rgba(255,255,255,0.55)",
};

const auroraBg: CSSProperties = {
  background:
    "radial-gradient(60% 60% at 12% 10%, color-mix(in oklab, var(--c-brand) 70%, transparent), transparent 60%)," +
    "radial-gradient(55% 55% at 90% 20%, color-mix(in oklab, var(--c-accent) 65%, transparent), transparent 60%)," +
    "radial-gradient(60% 60% at 50% 100%, color-mix(in oklab, var(--c-brand-strong) 55%, transparent), transparent 60%)," +
    "var(--c-bg)",
};

export function GlassTemplate({
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

  return (
    <div className="glass-page" style={{ ...auroraBg, minHeight: "100%", color: "var(--c-ink)", fontFamily: "var(--font-body)" }}>
      <header
        className="glass-header"
        style={{
          ...glassBase,
          margin: "16px clamp(16px, 4vw, 40px)",
          padding: "12px 20px",
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          position: "sticky",
          top: 12,
          zIndex: 20,
        }}
      >
        <button
          type="button"
          onClick={() => onNavigate("home")}
          style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "transparent", border: "none", cursor: "pointer", color: "inherit" }}
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              background: "color-mix(in oklab, var(--c-brand) 30%, white)",
              display: "grid",
              placeItems: "center",
              color: "white",
              fontWeight: 700,
            }}
          >
            {logoUrl ? <img src={logoUrl} alt="" style={{ width: 32, height: 32, borderRadius: 16, objectFit: "cover" }} /> : storeName.charAt(0)}
          </span>
          <EditableText
            as="strong"
            value={texts.hero.storeName || storeName}
            editable={editable}
            onChange={(v) => onUpdateText("hero", "storeName", v)}
            style={{ fontFamily: "var(--font-heading)", fontSize: 16, letterSpacing: "-0.01em" }}
          />
        </button>
        <nav style={{ display: "flex", gap: 6 }}>
          {[
            { key: "home" as PreviewPage, label: homeLabel, field: "navHome" as TextField },
            { key: "catalogue" as PreviewPage, label: catalogueLabel, field: "navCatalogue" as TextField },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onNavigate(tab.key)}
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                border: "1px solid transparent",
                background: page === tab.key ? "color-mix(in oklab, var(--c-brand) 22%, white)" : "transparent",
                color: page === tab.key ? "var(--c-brand-strong)" : "var(--c-ink)",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <EditableText value={tab.label} editable={editableLabel} onChange={(v) => onUpdateText("hero", tab.field, v)} />
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 999,
            border: "1px solid color-mix(in oklab, var(--c-brand) 35%, white)",
            background: "color-mix(in oklab, var(--c-brand) 18%, white)",
            color: "var(--c-brand-strong)",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          <ShoppingBag size={15} />
          <EditableText value={cartLabel} editable={editableLabel} onChange={(v) => onUpdateText("hero", "cartLabel", v)} />
          {cartCount > 0 ? <span style={{ marginLeft: 4, background: "var(--c-brand)", color: "var(--c-button-text)", borderRadius: 999, padding: "2px 8px", fontSize: 11 }}>{cartCount}</span> : null}
        </button>
      </header>

      <main style={{ padding: "12px clamp(16px, 4vw, 40px) 80px" }}>
        {page === "home" ? (
          <HomeView
            texts={texts}
            hidden={hidden}
            heroImage={heroImage}
            showcase={showcase}
            categories={categories}
            editable={editable}
            isTextEditMode={isTextEditMode}
            selectedSection={selectedSection}
            onSelectSection={onSelectSection}
            onToggleHidden={onToggleHidden}
            onUpdateText={onUpdateText}
            onAddToCart={addToCart}
            onGoCatalogue={goCatalogue}
            onOpenProduct={goProduct}
            currency={currency}
            productText={productText}
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
          />
        ) : null}
      </main>

      {!hidden.footer ? (
        <footer
          style={{
            ...glassBase,
            margin: "0 clamp(16px, 4vw, 40px) 28px",
            padding: "28px 32px",
            borderRadius: 28,
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 24,
          }}
          onClick={() => editable && onSelectSection("footer")}
        >
          <div>
            <EditableText
              as="h3"
              value={texts.footer.title}
              editable={isTextEditMode}
              onChange={(v) => onUpdateText("footer", "title", v)}
              style={{ fontFamily: "var(--font-heading)", fontSize: 22, margin: 0 }}
            />
            <EditableText
              as="p"
              value={texts.footer.body}
              editable={isTextEditMode}
              onChange={(v) => onUpdateText("footer", "body", v)}
              style={{ marginTop: 8, color: "var(--c-muted)", maxWidth: 480 }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, fontSize: 12, color: "var(--c-muted)" }}>
            <span>© {new Date().getFullYear()} {storeName}</span>
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
  selectedSection,
  onSelectSection,
  onToggleHidden,
  onUpdateText,
  onAddToCart,
  onGoCatalogue,
  onOpenProduct,
  currency,
  productText,
}: {
  texts: TextConfig;
  hidden: HiddenConfig;
  heroImage: string;
  showcase: Product[];
  categories: [string, Product[]][];
  editable: boolean;
  isTextEditMode: boolean;
  selectedSection: SectionId;
  onSelectSection: (id: SectionId) => void;
  onToggleHidden: (id: SectionId, v?: boolean) => void;
  onUpdateText: (id: SectionId, field: TextField, v: string) => void;
  onAddToCart: (p: Product) => void;
  onGoCatalogue: (cat?: string | null) => void;
  onOpenProduct: (id: string) => void;
  currency: string;
  productText: (p: Product) => { name: string; subtitle: string; description: string };
}) {
  return (
    <>
      {!hidden.hero ? (
        <section
          onClick={() => editable && onSelectSection("hero")}
          style={{
            ...glassBase,
            borderRadius: 32,
            padding: "clamp(28px, 5vw, 56px)",
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr",
            gap: 36,
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div>
            <EditableText
              value={texts.hero.eyebrow || ""}
              editable={isTextEditMode}
              onChange={(v) => onUpdateText("hero", "eyebrow", v)}
              style={{
                display: "inline-block",
                padding: "6px 14px",
                borderRadius: 999,
                background: "color-mix(in oklab, var(--c-accent) 24%, white)",
                color: "var(--c-brand-strong)",
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            />
            <EditableText
              as="h1"
              value={texts.hero.title}
              editable={isTextEditMode}
              onChange={(v) => onUpdateText("hero", "title", v)}
              style={{
                marginTop: 18,
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(34px, 5vw, 58px)",
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
                margin: 0,
              }}
            />
            <EditableText
              as="p"
              value={texts.hero.body}
              editable={isTextEditMode}
              onChange={(v) => onUpdateText("hero", "body", v)}
              style={{ marginTop: 18, color: "var(--c-muted)", maxWidth: 520, fontSize: 16, lineHeight: 1.55 }}
            />
            <button
              type="button"
              onClick={() => onGoCatalogue(null)}
              style={{
                marginTop: 28,
                padding: "14px 26px",
                borderRadius: 999,
                background: "var(--c-brand)",
                color: "var(--c-button-text)",
                border: "1px solid color-mix(in oklab, var(--c-brand-strong) 50%, white)",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                boxShadow: "0 10px 30px color-mix(in oklab, var(--c-brand) 35%, transparent)",
              }}
            >
              <EditableText value={texts.hero.ctaLabel || ""} editable={isTextEditMode} onChange={(v) => onUpdateText("hero", "ctaLabel", v)} />
              <ArrowRight size={16} />
            </button>
          </div>
          <div style={{ position: "relative", aspectRatio: "1/1", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(255,255,255,0.6)" }}>
            <img src={heroImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ ...glassBase, position: "absolute", bottom: 16, left: 16, right: 16, padding: "10px 14px", borderRadius: 16, fontSize: 12, color: "var(--c-ink)" }}>
              {showcase[0] ? `${productText(showcase[0]).name} · ${formatPrice(effectivePrice(showcase[0]), currency)}` : "Featured"}
            </div>
          </div>
          {editable ? (
            <SectionToggle hidden={hidden.hero} onToggle={(v) => onToggleHidden("hero", v)} />
          ) : null}
        </section>
      ) : null}

      {!hidden.categories && categories.length > 0 ? (
        <section
          onClick={() => editable && onSelectSection("categories")}
          style={{ marginTop: 56 }}
        >
          <EditableText
            as="h2"
            value={texts.categories.title}
            editable={isTextEditMode}
            onChange={(v) => onUpdateText("categories", "title", v)}
            style={{ fontFamily: "var(--font-heading)", fontSize: 28, letterSpacing: "-0.02em", margin: 0 }}
          />
          <EditableText
            as="p"
            value={texts.categories.body}
            editable={isTextEditMode}
            onChange={(v) => onUpdateText("categories", "body", v)}
            style={{ marginTop: 8, color: "var(--c-muted)" }}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 22 }}>
            {categories.map(([name, items]) => (
              <button
                key={name}
                type="button"
                onClick={() => onGoCatalogue(name)}
                style={{
                  ...glassBase,
                  borderRadius: 20,
                  padding: 20,
                  textAlign: "left",
                  cursor: "pointer",
                  color: "var(--c-ink)",
                  fontFamily: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <span style={{ fontFamily: "var(--font-heading)", fontSize: 18 }}>{name}</span>
                <span style={{ fontSize: 12, color: "var(--c-muted)" }}>{items.length} {texts.categories.productCountSuffix || "produk"}</span>
              </button>
            ))}
          </div>
          {editable ? <SectionToggle hidden={hidden.categories} onToggle={(v) => onToggleHidden("categories", v)} /> : null}
        </section>
      ) : null}

      {!hidden.catalogue ? (
        <section
          onClick={() => editable && onSelectSection("catalogue")}
          style={{ marginTop: 56 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
            <div>
              <EditableText
                as="h2"
                value={texts.catalogue.title}
                editable={isTextEditMode}
                onChange={(v) => onUpdateText("catalogue", "title", v)}
                style={{ fontFamily: "var(--font-heading)", fontSize: 28, letterSpacing: "-0.02em", margin: 0 }}
              />
              <EditableText
                as="p"
                value={texts.catalogue.body}
                editable={isTextEditMode}
                onChange={(v) => onUpdateText("catalogue", "body", v)}
                style={{ marginTop: 8, color: "var(--c-muted)" }}
              />
            </div>
            <button
              type="button"
              onClick={() => onGoCatalogue(null)}
              style={{ background: "transparent", border: "1px solid color-mix(in oklab, var(--c-brand) 40%, white)", color: "var(--c-brand-strong)", padding: "8px 14px", borderRadius: 999, fontWeight: 600, cursor: "pointer" }}
            >
              <EditableText value={texts.catalogue.viewAllLabel || ""} editable={editable && !isTextEditMode} onChange={(v) => onUpdateText("catalogue", "viewAllLabel", v)} /> →
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18, marginTop: 22 }}>
            {showcase.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                currency={currency}
                onOpen={() => onOpenProduct(p.id)}
                onAdd={() => onAddToCart(p)}
                name={productText(p).name}
                addLabel={texts.catalogue.addToCartLabel || "Tambah"}
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
  addLabel,
}: {
  product: Product;
  currency: string;
  onOpen: () => void;
  onAdd: () => void;
  name: string;
  addLabel: string;
}) {
  const image = productThumbnail(product) || FALLBACK_IMAGE;
  const price = effectivePrice(product);
  return (
    <motion.article
      whileHover={{ y: -4 }}
      style={{ ...glassBase, borderRadius: 22, padding: 12, display: "flex", flexDirection: "column", gap: 10, cursor: "pointer" }}
      onClick={onOpen}
    >
      <div style={{ aspectRatio: "1/1", borderRadius: 16, overflow: "hidden", background: "rgba(255,255,255,0.4)" }}>
        <img src={image} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ padding: "0 4px" }}>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, lineHeight: 1.2 }}>{name}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
          <span style={{ color: "var(--c-brand-strong)", fontWeight: 700, fontSize: 14 }}>{formatPrice(price, currency)}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            style={{ background: "var(--c-brand)", color: "var(--c-button-text)", border: "none", borderRadius: 999, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            {addLabel}
          </button>
        </div>
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
    <section style={{ marginTop: 24 }}>
      <EditableText
        as="h1"
        value={texts.catalogue.title}
        editable={editable}
        onChange={(v) => onUpdateText("catalogue", "title", v)}
        style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-0.02em", margin: 0 }}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "1px solid color-mix(in oklab, var(--c-brand) 30%, white)",
            background: !selectedCategory ? "color-mix(in oklab, var(--c-brand) 20%, white)" : "transparent",
            color: !selectedCategory ? "var(--c-brand-strong)" : "var(--c-ink)",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
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
              padding: "8px 16px",
              borderRadius: 999,
              border: "1px solid color-mix(in oklab, var(--c-brand) 30%, white)",
              background: selectedCategory === cat ? "color-mix(in oklab, var(--c-brand) 20%, white)" : "transparent",
              color: selectedCategory === cat ? "var(--c-brand-strong)" : "var(--c-ink)",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {cat}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18, marginTop: 24 }}>
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            currency={currency}
            onOpen={() => onOpenProduct(p.id)}
            onAdd={() => onAddToCart(p)}
            name={productText(p).name}
            addLabel={texts.catalogue.addToCartLabel || "Tambah"}
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
}) {
  const gallery = productGallery(product);
  const hero = gallery[0] ?? productThumbnail(product) ?? FALLBACK_IMAGE;
  const info = productText(product);
  const max = stockLimit(product);
  return (
    <section style={{ marginTop: 16 }}>
      <button
        type="button"
        onClick={onBack}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: "var(--c-muted)", cursor: "pointer", marginBottom: 16 }}
      >
        <ArrowLeft size={14} />
        <EditableText value={texts.catalogue.backLabel || ""} editable={editableLabel} onChange={(v) => onUpdateText("catalogue", "backLabel", v)} />
      </button>
      <div style={{ ...glassBase, borderRadius: 32, padding: "clamp(20px, 4vw, 36px)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div style={{ borderRadius: 24, overflow: "hidden", aspectRatio: "1/1", border: "1px solid rgba(255,255,255,0.55)" }}>
          <img src={hero} alt={info.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(28px, 3.5vw, 40px)", margin: 0, letterSpacing: "-0.02em" }}>{info.name}</h1>
          {info.subtitle ? <p style={{ color: "var(--c-muted)", marginTop: 8 }}>{info.subtitle}</p> : null}
          <div style={{ marginTop: 16, fontSize: 24, fontWeight: 700, color: "var(--c-brand-strong)" }}>{formatPrice(effectivePrice(product), currency)}</div>
          <p style={{ marginTop: 16, lineHeight: 1.6, color: "var(--c-ink)" }}>{info.description || texts.catalogue.productFallback || ""}</p>
          <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, ...glassBase, borderRadius: 999, padding: "6px 12px" }}>
              <button type="button" onClick={() => onQuantityChange(quantity - 1)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "inherit" }}>
                <Minus size={14} />
              </button>
              <span style={{ minWidth: 24, textAlign: "center", fontWeight: 600 }}>{quantity}</span>
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
                borderRadius: 999,
                background: max === 0 ? "color-mix(in oklab, var(--c-muted) 40%, white)" : "var(--c-brand)",
                color: "var(--c-button-text)",
                border: "none",
                fontWeight: 700,
                cursor: max === 0 ? "not-allowed" : "pointer",
                boxShadow: "0 10px 24px color-mix(in oklab, var(--c-brand) 30%, transparent)",
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
          ...glassBase,
          borderRadius: "24px 0 0 24px",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          zIndex: 30,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <EditableText
            as="h3"
            value={texts.catalogue.cartTitle || "Keranjang"}
            editable={editable}
            onChange={(v) => onUpdateText("catalogue", "cartTitle", v)}
            style={{ fontFamily: "var(--font-heading)", fontSize: 22, margin: 0 }}
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
                style={{ display: "block" }}
              />
              <EditableText
                as="p"
                value={texts.catalogue.cartEmptyBody || ""}
                editable={editable}
                onChange={(v) => onUpdateText("catalogue", "cartEmptyBody", v)}
                style={{ marginTop: 8, fontSize: 13 }}
              />
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div key={product.id} style={{ ...glassBase, borderRadius: 16, padding: 12, display: "flex", gap: 12 }}>
                <img
                  src={productThumbnail(product) || FALLBACK_IMAGE}
                  alt=""
                  style={{ width: 56, height: 56, borderRadius: 12, objectFit: "cover" }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{productText(product).name}</div>
                  <div style={{ fontSize: 13, color: "var(--c-brand-strong)", marginTop: 2 }}>
                    {formatPrice(effectivePrice(product) * quantity, currency)}
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                    <button type="button" onClick={() => onChangeQuantity(product.id, quantity - 1)} style={{ background: "transparent", border: "1px solid color-mix(in oklab, var(--c-muted) 30%, transparent)", borderRadius: 999, width: 22, height: 22, cursor: "pointer", color: "inherit" }}>
                      <Minus size={11} />
                    </button>
                    <span style={{ fontSize: 13, fontWeight: 600, minWidth: 16, textAlign: "center" }}>{quantity}</span>
                    <button type="button" onClick={() => onChangeQuantity(product.id, quantity + 1)} style={{ background: "transparent", border: "1px solid color-mix(in oklab, var(--c-muted) 30%, transparent)", borderRadius: 999, width: 22, height: 22, cursor: "pointer", color: "inherit" }}>
                      <Plus size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div style={{ borderTop: "1px solid color-mix(in oklab, var(--c-muted) 25%, transparent)", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <EditableText value={texts.catalogue.totalLabel || "Total"} editable={editable} onChange={(v) => onUpdateText("catalogue", "totalLabel", v)} style={{ color: "var(--c-muted)" }} />
          <strong style={{ fontSize: 18, color: "var(--c-brand-strong)" }}>{formatPrice(total, currency)}</strong>
        </div>
        <button
          type="button"
          onClick={checkout}
          disabled={!items.length}
          style={{ background: "var(--c-brand)", color: "var(--c-button-text)", border: "none", borderRadius: 999, padding: "14px 18px", fontWeight: 700, cursor: items.length ? "pointer" : "not-allowed", opacity: items.length ? 1 : 0.6 }}
        >
          <EditableText value={texts.catalogue.checkoutLabel || "Checkout"} editable={editable} onChange={(v) => onUpdateText("catalogue", "checkoutLabel", v)} />
        </button>
      </motion.aside>

      {confirmOpen ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "grid", placeItems: "center", zIndex: 40 }}>
          <div style={{ ...glassBase, borderRadius: 24, padding: 28, maxWidth: 360 }}>
            <h3 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 20 }}>
              <EditableText value={texts.catalogue.confirmTitle || ""} editable={editable} onChange={(v) => onUpdateText("catalogue", "confirmTitle", v)} />
            </h3>
            <p style={{ marginTop: 8, color: "var(--c-muted)", fontSize: 13 }}>
              <EditableText value={texts.catalogue.confirmBody || ""} editable={editable} onChange={(v) => onUpdateText("catalogue", "confirmBody", v)} />
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button type="button" onClick={() => setConfirmOpen(false)} style={{ background: "transparent", border: "1px solid color-mix(in oklab, var(--c-muted) 40%, transparent)", borderRadius: 999, padding: "8px 14px", cursor: "pointer", color: "inherit" }}>
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  confirmRedirect();
                }}
                style={{ background: "var(--c-brand)", color: "var(--c-button-text)", border: "none", borderRadius: 999, padding: "8px 16px", cursor: "pointer", fontWeight: 600 }}
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
        ...glassBase,
        borderRadius: 999,
        padding: "6px 12px",
        fontSize: 11,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {hidden ? "Tampilkan" : "Sembunyikan"}
    </button>
  );
}
