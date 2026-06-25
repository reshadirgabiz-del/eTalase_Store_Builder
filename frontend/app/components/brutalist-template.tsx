"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Minus, Plus, ShoppingBag, Star, X, Zap } from "lucide-react";
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
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop";

type CartItem = { product: Product; quantity: number };

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

const STICKER_TONES = ["pink", "lime", "cyan", "yellow", "purple"] as const;

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

function titleCase(value: string) {
  return value
    .split(/(\s+)/)
    .map((part) => (part.trim() ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : part))
    .join("");
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function MarqueeStrip({
  children,
  paused = false,
}: {
  children: React.ReactNode;
  paused?: boolean;
}) {
  return (
    <div className="brutal-marquee" aria-hidden={paused ? undefined : "true"}>
      <motion.div
        className="brutal-marquee-track"
        animate={paused ? { x: "0%" } : { x: ["0%", "-50%"] }}
        transition={paused ? { duration: 0 } : { ease: "linear", duration: 22, repeat: Infinity }}
      >
        {Array.from({ length: 2 }).map((_, copy) => (
          <span className="brutal-marquee-row" key={copy}>
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function Header({
  storeName,
  logoUrl,
  page,
  cartCount,
  texts,
  editable,
  onNavigate,
  onCartClick,
  onUpdateText,
}: {
  storeName: string;
  logoUrl: string;
  page: PreviewPage;
  cartCount: number;
  texts: TextConfig;
  editable: boolean;
  onNavigate: (page: PreviewPage) => void;
  onCartClick: () => void;
  onUpdateText: (id: SectionId, field: TextField, value: string) => void;
}) {
  const homeLabel = texts.hero.navHome || INITIAL_TEXT.hero.navHome || "Beranda";
  const catalogueLabel = texts.hero.navCatalogue || INITIAL_TEXT.hero.navCatalogue || "Katalog";
  const cartLabel = texts.hero.cartLabel || INITIAL_TEXT.hero.cartLabel || "Keranjang";
  return (
    <header className="brutal-header">
      <button type="button" className="brutal-logo" onClick={() => onNavigate("home")}>
        <span className="brutal-logo-mark" aria-hidden="true">
          {logoUrl ? <img src={logoUrl} alt="" /> : <Zap size={18} strokeWidth={3} />}
        </span>
        <EditableText
          as="strong"
          value={texts.hero.storeName || storeName}
          editable={editable}
          onChange={(value) => onUpdateText("hero", "storeName", value)}
        />
      </button>
      <nav className="brutal-nav">
        <button type="button" className={page === "home" ? "is-active" : ""} onClick={() => onNavigate("home")}>
          <EditableText as="span" value={homeLabel} editable={editable} onChange={(value) => onUpdateText("hero", "navHome", value)} />
        </button>
        <button type="button" className={page === "catalogue" ? "is-active" : ""} onClick={() => onNavigate("catalogue")}>
          <EditableText
            as="span"
            value={catalogueLabel}
            editable={editable}
            onChange={(value) => onUpdateText("hero", "navCatalogue", value)}
          />
        </button>
      </nav>
      <button type="button" className="brutal-cart" onClick={onCartClick}>
        <ShoppingBag size={16} strokeWidth={2.4} />
        <EditableText as="span" value={cartLabel} editable={editable} onChange={(value) => onUpdateText("hero", "cartLabel", value)} />
        <span className="brutal-cart-count">{cartCount}</span>
      </button>
    </header>
  );
}

function CartDrawer({
  open,
  items,
  currency,
  total,
  storeId,
  texts,
  productText,
  onClose,
}: {
  open: boolean;
  items: CartItem[];
  currency: string;
  total: number;
  storeId?: string;
  texts: TextConfig;
  productText: (product: Product) => { name: string };
  onClose: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  function handleCheckoutClick() {
    if (!storeId) {
      window.alert("Checkout belum dikonfigurasi. Store ID tidak ditemukan.");
      return;
    }
    const checkoutItems = items.map(({ product, quantity }) => ({ productId: product.id, quantity }));
    if (checkoutItems.length === 0) return;
    setRedirectUrl(
      `${ETALASE_CHECKOUT_HOST}/${encodeURIComponent(storeId)}/checkout?items=${encodeURIComponent(
        encodeCheckoutItems(checkoutItems),
      )}`,
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
    <div className={`cart-overlay brutal-cart-overlay ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <button className="cart-scrim" type="button" onClick={onClose} aria-label="Tutup keranjang" />
      <aside className="cart-drawer brutal-drawer" aria-label="Keranjang">
        <div className="brutal-drawer-head">
          <div>
            <span className="brutal-eyebrow">{texts.catalogue.cartTitle || "Keranjang"}</span>
            <strong>{items.length} item</strong>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup">
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>
        {items.length > 0 ? (
          <>
            <div className="brutal-drawer-items">
              {items.map(({ product, quantity }) => (
                <div className="brutal-drawer-item" key={product.id}>
                  <div className="brutal-drawer-thumb">
                    {productThumbnail(product) ? (
                      <img src={productThumbnail(product)} alt={productText(product).name} />
                    ) : (
                      <span>{productText(product).name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="brutal-drawer-meta">
                    <strong>{productText(product).name}</strong>
                    <span>×{quantity}</span>
                  </div>
                  <b>{formatPrice(effectivePrice(product) * quantity, currency)}</b>
                </div>
              ))}
            </div>
            <div className="brutal-drawer-summary">
              <span>{texts.catalogue.totalLabel || "Total"}</span>
              <strong>{formatPrice(total, currency)}</strong>
            </div>
            <button className="brutal-primary brutal-drawer-cta" type="button" onClick={handleCheckoutClick}>
              {texts.catalogue.checkoutLabel || "Checkout"}
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </>
        ) : (
          <div className="brutal-drawer-empty">
            <ShoppingBag size={22} />
            <strong>{texts.catalogue.cartEmptyTitle || "Keranjang Anda kosong"}</strong>
            <span>{texts.catalogue.cartEmptyBody || "Tambahkan produk untuk meninjaunya di sini."}</span>
          </div>
        )}
      </aside>
      {confirmOpen ? (
        <div className="checkout-confirm" role="alertdialog" aria-modal="true">
          <div className="checkout-confirm-card brutal-confirm">
            <h3>{texts.catalogue.confirmTitle || "Mengalihkan ke e-talase"}</h3>
            <p>{texts.catalogue.confirmBody || "Anda akan diarahkan ke halaman e-talase untuk menyelesaikan checkout."}</p>
            <button type="button" onClick={confirmRedirect}>
              {texts.catalogue.confirmButton || "Oke"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function BrutalistTemplate({
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
  onUpdateText,
  onUpdateProductText = () => undefined,
  page,
  onNavigate,
  badgeEditable = false,
  heroImageOverride = null,
}: Props) {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const canEditText = editable;

  const categories = useMemo(() => Array.from(groupByCategory(products).entries()), [products]);
  const featured = products.slice(0, 6);
  const featuredProduct = products.find((product) => product.id === selectedProductId) ?? products[0];
  const displayStoreName = texts.hero.storeName || storeName;
  const heroProduct = featured[0];
  const heroImage =
    heroImageOverride || (heroProduct ? productThumbnail(heroProduct) || FALLBACK_IMAGE : FALLBACK_IMAGE);

  const filteredProducts = selectedCategory
    ? products.filter((product) => (product.tags ?? []).includes(selectedCategory))
    : products;

  const cartProducts = useMemo<CartItem[]>(
    () =>
      Object.entries(cartItems)
        .map(([id, quantity]) => {
          const product = products.find((item) => item.id === id);
          return product ? { product, quantity } : null;
        })
        .filter((item): item is CartItem => Boolean(item)),
    [cartItems, products],
  );
  const cartCount = cartProducts.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartProducts.reduce((sum, item) => sum + effectivePrice(item.product) * item.quantity, 0);

  function productText(product: Product) {
    const override = productTextOverrides[product.id] ?? {};
    return {
      name: override.name ?? product.name,
      subtitle: override.subtitle ?? product.subtitle ?? "",
      description: override.description ?? product.description ?? "",
    };
  }

  function addToCart(product: Product, quantity = 1) {
    const limit = stockLimit(product);
    setCartItems((current) => {
      const currentQuantity = current[product.id] ?? 0;
      const remaining = Math.max(0, limit - currentQuantity);
      if (remaining <= 0) return current;
      const safeQuantity = Math.min(boundedQuantity(quantity, remaining), remaining);
      return { ...current, [product.id]: currentQuantity + safeQuantity };
    });
    setCartOpen(true);
  }

  function go(nextPage: PreviewPage) {
    onNavigate(nextPage);
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    }
  }

  function goCatalogue(category?: string | null) {
    setSelectedCategory(category ?? null);
    go("catalogue");
  }

  function goProduct(productId: string) {
    setSelectedProductId(productId);
    setProductQuantity(1);
    go("product");
  }

  const header = (
    <Header
      storeName={displayStoreName}
      logoUrl={logoUrl}
      page={page}
      cartCount={cartCount}
      texts={texts}
      editable={canEditText}
      onNavigate={(next) => {
        if (next === "catalogue") goCatalogue(null);
        else go(next);
      }}
      onCartClick={() => setCartOpen(true)}
      onUpdateText={onUpdateText}
    />
  );

  const footer = !hidden.footer ? (
    <footer className="brutal-footer">
      <MarqueeStrip>
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="brutal-marquee-item">
            {displayStoreName.toUpperCase()} <Star size={14} strokeWidth={2.6} fill="currentColor" />
          </span>
        ))}
      </MarqueeStrip>
      <div className="brutal-footer-grid">
        <div className="brutal-footer-col">
          <span className="brutal-eyebrow">Toko</span>
          <EditableText
            as="strong"
            value={displayStoreName}
            editable={canEditText}
            onChange={(value) => onUpdateText("hero", "storeName", value)}
          />
          <EditableText
            as="p"
            value={texts.footer.body}
            editable={canEditText}
            onChange={(value) => onUpdateText("footer", "body", value)}
            multiline
          />
        </div>
        <div className="brutal-footer-col">
          <span className="brutal-eyebrow">Navigasi</span>
          <button type="button" onClick={() => go("home")}>Beranda →</button>
          <button type="button" onClick={() => goCatalogue(null)}>Katalog →</button>
        </div>
        <div className="brutal-footer-col">
          <span className="brutal-eyebrow">Sosial</span>
          {(settings?.socialLinks ?? []).length > 0 ? (
            (settings?.socialLinks ?? []).map((link) => (
              <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
                {titleCase(link.platform)} <ArrowUpRight size={12} strokeWidth={2.4} />
              </a>
            ))
          ) : (
            <span className="brutal-muted">Belum ada tautan.</span>
          )}
        </div>
      </div>
      <div className="brutal-footer-bottom">
        <small>© {new Date().getFullYear()} {displayStoreName}.</small>
        <a className="brutal-powered" href="https://app.e-talase.com" target="_blank" rel="noreferrer">
          Powered by <img src={etalaseLogo.src} alt="e-talase" />
        </a>
      </div>
    </footer>
  ) : null;

  const cartDrawer = (
    <CartDrawer
      open={cartOpen}
      items={cartProducts}
      currency={currency}
      total={cartTotal}
      storeId={storeId}
      texts={texts}
      productText={productText}
      onClose={() => setCartOpen(false)}
    />
  );

  if (page === "catalogue") {
    return (
      <div className="brutal-page">
        {header}
        <main className="brutal-main">
          <section className="brutal-catalogue-head">
            <span className="brutal-eyebrow">
              {selectedCategory ? `Filter // ${titleCase(selectedCategory)}` : "Indeks"}
            </span>
            <EditableText
              as="h1"
              className="brutal-display"
              value={selectedCategory ? titleCase(selectedCategory) : texts.catalogue.title || "Katalog"}
              editable={canEditText && !selectedCategory}
              onChange={(value) => onUpdateText("catalogue", "title", value)}
            />
            <EditableText
              as="p"
              className="brutal-lede"
              value={texts.catalogue.body || `${filteredProducts.length} produk siap dikirim.`}
              editable={canEditText}
              onChange={(value) => onUpdateText("catalogue", "body", value)}
              multiline
            />
            {categories.length > 0 ? (
              <div className="brutal-tabs">
                <button
                  type="button"
                  className={!selectedCategory ? "is-active" : ""}
                  onClick={() => setSelectedCategory(null)}
                >
                  {texts.catalogue.allLabel || "Semua"}
                </button>
                {categories.map(([category]) => (
                  <button
                    key={category}
                    type="button"
                    className={selectedCategory === category ? "is-active" : ""}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {titleCase(category)}
                  </button>
                ))}
              </div>
            ) : null}
          </section>
          <ProductGrid
            products={filteredProducts}
            currency={currency}
            editable={canEditText}
            productText={productText}
            onUpdateProductText={onUpdateProductText}
            onProduct={goProduct}
            cartItems={cartItems}
            onAddToCart={(product) => addToCart(product, 1)}
            addLabel={texts.catalogue.addToCartLabel || "Beli"}
            soldOutLabel={texts.catalogue.soldOutLabel || "Habis"}
          />
        </main>
        {footer}
        {cartDrawer}
      </div>
    );
  }

  if (page === "product") {
    const gallery = featuredProduct ? productGallery(featuredProduct) : [];
    const copy = featuredProduct ? productText(featuredProduct) : null;
    const stock = featuredProduct ? stockLimit(featuredProduct) : 0;
    const safeQuantity = boundedQuantity(productQuantity, Math.max(1, stock));
    const featuredIndex = featuredProduct ? products.findIndex((p) => p.id === featuredProduct.id) + 1 : 1;
    return (
      <div className="brutal-page">
        {header}
        <main className="brutal-main">
          <section className="brutal-detail">
            <button className="brutal-back" type="button" onClick={() => go("catalogue")}>
              <ArrowLeft size={14} strokeWidth={2.5} /> {texts.catalogue.backLabel || "Kembali ke katalog"}
            </button>
            {featuredProduct && copy ? (
              <div className="brutal-detail-grid">
                <div className="brutal-detail-gallery">
                  <div className="brutal-detail-main">
                    <img src={gallery[0] || FALLBACK_IMAGE} alt={copy.name} />
                    <span className="brutal-detail-tag">#{pad(featuredIndex)}</span>
                  </div>
                  {gallery.length > 1 ? (
                    <div className="brutal-detail-thumbs">
                      {gallery.slice(1, 5).map((src, index) => (
                        <div key={`${src}-${index}`}>
                          <img src={src} alt="" />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                <aside className="brutal-detail-copy">
                  <span className="brutal-eyebrow">Produk</span>
                  <EditableText
                    as="h1"
                    className="brutal-display"
                    value={copy.name}
                    editable={canEditText}
                    onChange={(value) => onUpdateProductText(featuredProduct.id, "name", value)}
                  />
                  {copy.subtitle ? (
                    <EditableText
                      as="p"
                      className="brutal-subtitle"
                      value={copy.subtitle}
                      editable={canEditText}
                      onChange={(value) => onUpdateProductText(featuredProduct.id, "subtitle", value)}
                      multiline
                    />
                  ) : null}
                  <div className="brutal-price-row">
                    <strong>{formatPrice(effectivePrice(featuredProduct), currency)}</strong>
                    {featuredProduct.discountedPrice ? (
                      <s>{formatPrice(featuredProduct.price, currency)}</s>
                    ) : null}
                  </div>
                  <EditableText
                    as="p"
                    className="brutal-description"
                    value={copy.description || texts.catalogue.productFallback || "Deskripsi produk akan tampil di sini."}
                    editable={canEditText}
                    onChange={(value) => onUpdateProductText(featuredProduct.id, "description", value)}
                    multiline
                  />
                  <div className="brutal-qty">
                    <button
                      type="button"
                      aria-label="Kurangi"
                      disabled={safeQuantity <= 1}
                      onClick={() => setProductQuantity(safeQuantity - 1)}
                    >
                      <Minus size={14} strokeWidth={2.6} />
                    </button>
                    <input
                      value={safeQuantity}
                      min={1}
                      max={Math.max(1, stock)}
                      type="number"
                      onChange={(event) => setProductQuantity(Number(event.currentTarget.value))}
                    />
                    <button
                      type="button"
                      aria-label="Tambah"
                      disabled={safeQuantity >= stock || stock === 0}
                      onClick={() => setProductQuantity(safeQuantity + 1)}
                    >
                      <Plus size={14} strokeWidth={2.6} />
                    </button>
                  </div>
                  <button
                    className="brutal-primary brutal-detail-cta"
                    type="button"
                    disabled={stock === 0}
                    onClick={() => addToCart(featuredProduct, safeQuantity)}
                  >
                    <ShoppingBag size={16} strokeWidth={2.4} />
                    {stock === 0
                      ? texts.catalogue.soldOutLabel || "Stok habis"
                      : `${texts.catalogue.addToCartLabel || "Tambah ke keranjang"} · ${formatPrice(
                          effectivePrice(featuredProduct) * safeQuantity,
                          currency,
                        )}`}
                  </button>
                </aside>
              </div>
            ) : (
              <p className="brutal-empty">Belum ada produk tersedia.</p>
            )}
          </section>
        </main>
        {footer}
        {cartDrawer}
      </div>
    );
  }

  return (
    <div className="brutal-page">
      {header}
      <main className="brutal-main">
        {!hidden.hero ? (
          <section className="brutal-hero">
            <div className="brutal-hero-frame">
              <div className="brutal-hero-copy">
                <EditableText
                  as="span"
                  className="brutal-eyebrow"
                  value={texts.hero.eyebrow || INITIAL_TEXT.hero.eyebrow || "Drop Baru // 2026"}
                  editable={badgeEditable || canEditText}
                  onChange={(value) => onUpdateText("hero", "eyebrow", value)}
                />
                <EditableText
                  as="h1"
                  className="brutal-display brutal-hero-title"
                  value={texts.hero.title}
                  editable={canEditText}
                  onChange={(value) => onUpdateText("hero", "title", value)}
                />
                <EditableText
                  as="p"
                  className="brutal-lede"
                  value={texts.hero.body}
                  editable={canEditText}
                  onChange={(value) => onUpdateText("hero", "body", value)}
                  multiline
                />
                <div className="brutal-hero-actions">
                  <button type="button" className="brutal-primary" onClick={() => goCatalogue(null)}>
                    <EditableText
                      as="span"
                      value={texts.hero.ctaLabel || INITIAL_TEXT.hero.ctaLabel || "Belanja Sekarang"}
                      editable={canEditText}
                      onChange={(value) => onUpdateText("hero", "ctaLabel", value)}
                    />
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </button>
                  <span className="brutal-hero-sub">
                    {products.length} produk · Stok terbatas
                  </span>
                </div>
              </div>
              <motion.div
                className="brutal-hero-stage"
                initial={{ opacity: 0, rotate: -2, y: 16 }}
                animate={{ opacity: 1, rotate: 0, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <div className="brutal-hero-image">
                  <img src={heroImage} alt={heroProduct ? productText(heroProduct).name : displayStoreName} />
                </div>
                <span className="brutal-hero-sticker tone-lime">
                  <Star size={14} strokeWidth={2.6} fill="currentColor" /> Pilihan
                </span>
                <span className="brutal-hero-sticker tone-cyan bottom">{products.length} ITEM</span>
              </motion.div>
            </div>
            <MarqueeStrip paused={canEditText}>
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className="brutal-marquee-item">
                  <EditableText
                    as="span"
                    value={texts.hero.banner || INITIAL_TEXT.hero.banner || ""}
                    editable={canEditText}
                    onChange={(value) => onUpdateText("hero", "banner", value)}
                  />
                </span>
              ))}
            </MarqueeStrip>
          </section>
        ) : null}

        {!hidden.categories ? (
          <section className="brutal-section brutal-categories">
            <header className="brutal-section-head">
              <div>
                <span className="brutal-eyebrow">
                  <EditableText
                    as="span"
                    value={texts.categories.eyebrow || "Kategori"}
                    editable={canEditText}
                    onChange={(value) => onUpdateText("categories", "eyebrow", value)}
                  />
                </span>
                <EditableText
                  as="h2"
                  className="brutal-headline"
                  value={texts.categories.title}
                  editable={canEditText}
                  onChange={(value) => onUpdateText("categories", "title", value)}
                />
              </div>
              <EditableText
                as="p"
                className="brutal-lede"
                value={texts.categories.body}
                editable={canEditText}
                onChange={(value) => onUpdateText("categories", "body", value)}
                multiline
              />
            </header>
            {categories.length > 0 ? (
              <div className="brutal-category-grid">
                {categories.slice(0, 8).map(([category, items], index) => {
                  const tone = STICKER_TONES[index % STICKER_TONES.length];
                  return (
                    <button
                      type="button"
                      key={category}
                      className={`brutal-category-card tone-${tone}`}
                      onClick={() => goCatalogue(category)}
                    >
                      <span className="brutal-category-num">#{pad(index + 1)}</span>
                      <strong>{titleCase(category)}</strong>
                      <span className="brutal-category-meta">
                        {items.length} {texts.categories.productCountSuffix || "produk"}
                      </span>
                      <span className="brutal-category-arrow">
                        <ArrowUpRight size={20} strokeWidth={2.6} />
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="brutal-empty">Belum ada kategori — tambah produk untuk memunculkannya.</p>
            )}
          </section>
        ) : null}

        {!hidden.catalogue ? (
          <section className="brutal-section brutal-featured">
            <header className="brutal-section-head split">
              <div>
                <span className="brutal-eyebrow">Pilihan</span>
                <EditableText
                  as="h2"
                  className="brutal-headline"
                  value={texts.catalogue.title || "Trending sekarang"}
                  editable={canEditText}
                  onChange={(value) => onUpdateText("catalogue", "title", value)}
                />
              </div>
              <button type="button" className="brutal-link" onClick={() => goCatalogue(null)}>
                {texts.catalogue.viewAllLabel || "Lihat semua"}
                <ArrowRight size={14} strokeWidth={2.6} />
              </button>
            </header>
            <ProductGrid
              products={featured}
              currency={currency}
              editable={canEditText}
              productText={productText}
              onUpdateProductText={onUpdateProductText}
              onProduct={goProduct}
              cartItems={cartItems}
              onAddToCart={(product) => addToCart(product, 1)}
              addLabel={texts.catalogue.addToCartLabel || "Beli"}
              soldOutLabel={texts.catalogue.soldOutLabel || "Habis"}
            />
          </section>
        ) : null}
      </main>
      {footer}
      {cartDrawer}
    </div>
  );
}

function ProductGrid({
  products,
  currency,
  editable,
  productText,
  onUpdateProductText,
  onProduct,
  cartItems,
  onAddToCart,
  addLabel,
  soldOutLabel,
}: {
  products: Product[];
  currency: string;
  editable: boolean;
  productText: (product: Product) => { name: string; subtitle: string; description: string };
  onUpdateProductText: (productId: string, field: keyof ProductTextOverride, value: string) => void;
  onProduct: (id: string) => void;
  cartItems: Record<string, number>;
  onAddToCart: (product: Product) => void;
  addLabel: string;
  soldOutLabel: string;
}) {
  if (!products.length) return <div className="brutal-empty">Tidak ada produk pada filter ini.</div>;
  return (
    <ul className="brutal-product-grid">
      {products.map((product, index) => {
        const copy = productText(product);
        const description = copy.subtitle || copy.description || "Bagian dari koleksi terbaru.";
        const limit = stockLimit(product);
        const inCart = cartItems[product.id] ?? 0;
        const disabled = limit === 0 || limit - inCart <= 0;
        const tone = STICKER_TONES[index % STICKER_TONES.length];
        return (
          <li key={product.id}>
            <motion.article
              className="brutal-product-card"
              whileHover={{ x: -4, y: -4 }}
              onClick={() => onProduct(product.id)}
              role="button"
              tabIndex={0}
            >
              <div className="brutal-product-image">
                <img src={productThumbnail(product) || FALLBACK_IMAGE} alt={copy.name} />
                <span className={`brutal-product-sticker tone-${tone}`}>#{pad(index + 1)}</span>
                {product.discountedPrice ? <b className="brutal-product-flag">Sale</b> : null}
              </div>
              <div className="brutal-product-body">
                <EditableText
                  as="h3"
                  value={copy.name}
                  editable={editable}
                  onChange={(value) => onUpdateProductText(product.id, "name", value)}
                />
                <EditableText
                  as="p"
                  value={description}
                  editable={editable}
                  onChange={(value) =>
                    onUpdateProductText(product.id, copy.subtitle ? "subtitle" : "description", value)
                  }
                  multiline
                />
                <div className="brutal-product-foot">
                  <strong>{formatPrice(effectivePrice(product), currency)}</strong>
                  {product.discountedPrice ? <s>{formatPrice(product.price, currency)}</s> : null}
                  <button
                    type="button"
                    className="brutal-card-add"
                    disabled={disabled}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (disabled) return;
                      onAddToCart(product);
                    }}
                    aria-label={disabled ? soldOutLabel : "Tambah"}
                  >
                    {disabled ? null : <ShoppingBag size={12} strokeWidth={2.6} />}
                    {disabled ? soldOutLabel : "Tambah"}
                  </button>
                </div>
              </div>
            </motion.article>
          </li>
        );
      })}
    </ul>
  );
}
