"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Minus, Plus, ShoppingBag, X } from "lucide-react";
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
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop";

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

function ordinal(n: number) {
  return n.toString().padStart(2, "0");
}

function socialLine(platform: string) {
  return titleCase(platform);
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
  edition,
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
  edition: string;
}) {
  const homeLabel = texts.hero.navHome || INITIAL_TEXT.hero.navHome || "Beranda";
  const catalogueLabel = texts.hero.navCatalogue || INITIAL_TEXT.hero.navCatalogue || "Katalog";
  const cartLabel = texts.hero.cartLabel || INITIAL_TEXT.hero.cartLabel || "Keranjang";
  return (
    <header className="editorial-header">
      <div className="editorial-header-row top">
        <span className="editorial-meta">N° {edition}</span>
        <span className="editorial-meta center">
          {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
        </span>
        <span className="editorial-meta right">Edisi Terkini</span>
      </div>
      <div className="editorial-masthead">
        {logoUrl ? (
          <span className="editorial-masthead-mark" aria-hidden="true">
            <img src={logoUrl} alt="" />
          </span>
        ) : null}
        <button type="button" className="editorial-wordmark" onClick={() => onNavigate("home")}>
          <EditableText
            as="span"
            value={texts.hero.storeName || storeName}
            editable={editable}
            onChange={(value) => onUpdateText("hero", "storeName", value)}
          />
        </button>
      </div>
      <div className="editorial-header-row nav">
        <nav className="editorial-nav">
          <button type="button" className={page === "home" ? "is-active" : ""} onClick={() => onNavigate("home")}>
            <EditableText as="span" value={homeLabel} editable={editable} onChange={(value) => onUpdateText("hero", "navHome", value)} />
          </button>
          <span className="editorial-nav-sep" aria-hidden="true">·</span>
          <button type="button" className={page === "catalogue" ? "is-active" : ""} onClick={() => onNavigate("catalogue")}>
            <EditableText
              as="span"
              value={catalogueLabel}
              editable={editable}
              onChange={(value) => onUpdateText("hero", "navCatalogue", value)}
            />
          </button>
        </nav>
        <button type="button" className="editorial-cart" onClick={onCartClick}>
          <EditableText as="span" value={cartLabel} editable={editable} onChange={(value) => onUpdateText("hero", "cartLabel", value)} />
          <span className="editorial-cart-count">{cartCount}</span>
        </button>
      </div>
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
    <div className={`cart-overlay editorial-cart-overlay ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <button className="cart-scrim" type="button" onClick={onClose} aria-label="Tutup keranjang" />
      <aside className="cart-drawer editorial-drawer" aria-label="Keranjang">
        <div className="editorial-drawer-head">
          <div>
            <span className="editorial-eyebrow">{texts.catalogue.cartTitle || "Keranjang"}</span>
            <strong>{items.length} item</strong>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>
        {items.length > 0 ? (
          <>
            <div className="editorial-drawer-items">
              {items.map(({ product, quantity }) => (
                <div className="editorial-drawer-item" key={product.id}>
                  <div className="editorial-drawer-thumb">
                    {productThumbnail(product) ? (
                      <img src={productThumbnail(product)} alt={productText(product).name} />
                    ) : (
                      <span className="editorial-drawer-thumb-fallback">{productText(product).name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="editorial-drawer-meta">
                    <strong>{productText(product).name}</strong>
                    <span>×{quantity}</span>
                  </div>
                  <b>{formatPrice(effectivePrice(product) * quantity, currency)}</b>
                </div>
              ))}
            </div>
            <div className="editorial-drawer-summary">
              <span>{texts.catalogue.totalLabel || "Total"}</span>
              <strong>{formatPrice(total, currency)}</strong>
            </div>
            <button className="editorial-primary editorial-drawer-cta" type="button" onClick={handleCheckoutClick}>
              {texts.catalogue.checkoutLabel || "Checkout"}
              <ArrowUpRight size={16} />
            </button>
          </>
        ) : (
          <div className="editorial-drawer-empty">
            <ShoppingBag size={22} />
            <strong>{texts.catalogue.cartEmptyTitle || "Keranjang Anda kosong"}</strong>
            <span>{texts.catalogue.cartEmptyBody || "Tambahkan produk untuk meninjaunya di sini."}</span>
          </div>
        )}
      </aside>
      {confirmOpen ? (
        <div className="checkout-confirm" role="alertdialog" aria-modal="true">
          <div className="checkout-confirm-card editorial-confirm">
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

export function EditorialTemplate({
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
      edition="01"
    />
  );

  const footer = !hidden.footer ? (
    <footer className="editorial-footer">
      <div className="editorial-footer-rule" aria-hidden="true" />
      <div className="editorial-footer-grid">
        <div className="editorial-footer-col">
          <span className="editorial-eyebrow">Kolofon</span>
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
        <div className="editorial-footer-col">
          <span className="editorial-eyebrow">Arsip</span>
          <button type="button" onClick={() => go("home")}>Beranda</button>
          <button type="button" onClick={() => goCatalogue(null)}>Katalog Lengkap</button>
        </div>
        <div className="editorial-footer-col">
          <span className="editorial-eyebrow">Sambungan</span>
          {(settings?.socialLinks ?? []).length > 0 ? (
            (settings?.socialLinks ?? []).map((link) => (
              <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
                {socialLine(link.platform)} <ArrowUpRight size={12} />
              </a>
            ))
          ) : (
            <span className="editorial-muted">Belum ada tautan sosial.</span>
          )}
        </div>
      </div>
      <div className="editorial-footer-bottom">
        <small>© {new Date().getFullYear()} {displayStoreName}. Hak cipta dilindungi.</small>
        <a className="editorial-powered" href="https://app.e-talase.com" target="_blank" rel="noreferrer">
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
      <div className="editorial-page">
        {header}
        <main className="editorial-main">
          <section className="editorial-catalogue-head">
            <span className="editorial-eyebrow">
              {selectedCategory ? `Bagian / ${titleCase(selectedCategory)}` : "Indeks"}
            </span>
            <EditableText
              as="h1"
              className="editorial-display"
              value={selectedCategory ? titleCase(selectedCategory) : texts.catalogue.title || "Katalog"}
              editable={canEditText && !selectedCategory}
              onChange={(value) => onUpdateText("catalogue", "title", value)}
            />
            <EditableText
              as="p"
              className="editorial-lede"
              value={texts.catalogue.body || `${filteredProducts.length} edisi tersedia, disusun untuk pembaca masa kini.`}
              editable={canEditText}
              onChange={(value) => onUpdateText("catalogue", "body", value)}
              multiline
            />
            {categories.length > 0 ? (
              <div className="editorial-tabs">
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
            addLabel={texts.catalogue.addToCartLabel || "Tambah"}
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
      <div className="editorial-page">
        {header}
        <main className="editorial-main">
          <section className="editorial-detail">
            <button className="editorial-back" type="button" onClick={() => go("catalogue")}>
              <ArrowLeft size={14} /> {texts.catalogue.backLabel || "Kembali ke katalog"}
            </button>
            {featuredProduct && copy ? (
              <div className="editorial-detail-grid">
                <div className="editorial-detail-gallery">
                  <div className="editorial-detail-main">
                    <img src={gallery[0] || FALLBACK_IMAGE} alt={copy.name} />
                    <span className="editorial-detail-folio">Pl. {ordinal(featuredIndex)}</span>
                  </div>
                  {gallery.length > 1 ? (
                    <div className="editorial-detail-thumbs">
                      {gallery.slice(1, 5).map((src, index) => (
                        <div key={`${src}-${index}`}>
                          <img src={src} alt="" />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                <aside className="editorial-detail-copy">
                  <span className="editorial-eyebrow">Lembar Produk</span>
                  <EditableText
                    as="h1"
                    className="editorial-display"
                    value={copy.name}
                    editable={canEditText}
                    onChange={(value) => onUpdateProductText(featuredProduct.id, "name", value)}
                  />
                  {copy.subtitle ? (
                    <EditableText
                      as="p"
                      className="editorial-subtitle"
                      value={copy.subtitle}
                      editable={canEditText}
                      onChange={(value) => onUpdateProductText(featuredProduct.id, "subtitle", value)}
                      multiline
                    />
                  ) : null}
                  <div className="editorial-price-row">
                    <strong>{formatPrice(effectivePrice(featuredProduct), currency)}</strong>
                    {featuredProduct.discountedPrice ? (
                      <s>{formatPrice(featuredProduct.price, currency)}</s>
                    ) : null}
                  </div>
                  <EditableText
                    as="p"
                    className="editorial-description editorial-dropcap"
                    value={
                      copy.description || texts.catalogue.productFallback || "Catatan editor akan tampil di sini."
                    }
                    editable={canEditText}
                    onChange={(value) => onUpdateProductText(featuredProduct.id, "description", value)}
                    multiline
                  />
                  <div className="editorial-qty">
                    <button
                      type="button"
                      aria-label="Kurangi"
                      disabled={safeQuantity <= 1}
                      onClick={() => setProductQuantity(safeQuantity - 1)}
                    >
                      <Minus size={14} />
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
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    className="editorial-primary editorial-detail-cta"
                    type="button"
                    disabled={stock === 0}
                    onClick={() => addToCart(featuredProduct, safeQuantity)}
                  >
                    <ShoppingBag size={16} />
                    {stock === 0
                      ? texts.catalogue.soldOutLabel || "Stok habis"
                      : `${texts.catalogue.addToCartLabel || "Tambah ke keranjang"} · ${formatPrice(
                          effectivePrice(featuredProduct) * safeQuantity,
                          currency,
                        )}`}
                  </button>
                  <div className="editorial-marginalia">
                    <span>Catatan kurator</span>
                    <em>
                      Edisi terkurasi dengan saksama, dikirim langsung dari {displayStoreName}.
                    </em>
                  </div>
                </aside>
              </div>
            ) : (
              <p className="editorial-empty">Belum ada produk tersedia.</p>
            )}
          </section>
        </main>
        {footer}
        {cartDrawer}
      </div>
    );
  }

  return (
    <div className="editorial-page">
      {header}
      <main className="editorial-main">
        {!hidden.hero ? (
          <section className="editorial-hero">
            <div className="editorial-hero-copy">
              <EditableText
                as="span"
                className="editorial-eyebrow"
                value={texts.hero.eyebrow || INITIAL_TEXT.hero.eyebrow || "Volume 01"}
                editable={badgeEditable || canEditText}
                onChange={(value) => onUpdateText("hero", "eyebrow", value)}
              />
              <EditableText
                as="h1"
                className="editorial-display editorial-dropcap"
                value={texts.hero.title}
                editable={canEditText}
                onChange={(value) => onUpdateText("hero", "title", value)}
              />
              <EditableText
                as="p"
                className="editorial-lede"
                value={texts.hero.body}
                editable={canEditText}
                onChange={(value) => onUpdateText("hero", "body", value)}
                multiline
              />
              <div className="editorial-hero-actions">
                <button type="button" className="editorial-primary" onClick={() => goCatalogue(null)}>
                  <EditableText
                    as="span"
                    value={texts.hero.ctaLabel || INITIAL_TEXT.hero.ctaLabel || "Baca katalog"}
                    editable={canEditText}
                    onChange={(value) => onUpdateText("hero", "ctaLabel", value)}
                  />
                  <ArrowRight size={16} />
                </button>
                <span className="editorial-hero-sub">
                  {products.length} judul dalam edisi ini
                </span>
              </div>
            </div>
            <motion.figure
              className="editorial-hero-figure"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="editorial-hero-image">
                <img src={heroImage} alt={heroProduct ? productText(heroProduct).name : displayStoreName} />
              </div>
              <figcaption>
                <span>Plat I</span>
                <em>
                  {heroProduct ? productText(heroProduct).name : displayStoreName}
                </em>
              </figcaption>
            </motion.figure>
          </section>
        ) : null}

        {!hidden.categories ? (
          <section className="editorial-section editorial-categories">
            <header className="editorial-section-head">
              <span className="editorial-eyebrow">
                <EditableText
                  as="span"
                  value={texts.categories.eyebrow || "Bab"}
                  editable={canEditText}
                  onChange={(value) => onUpdateText("categories", "eyebrow", value)}
                />
              </span>
              <EditableText
                as="h2"
                className="editorial-headline"
                value={texts.categories.title}
                editable={canEditText}
                onChange={(value) => onUpdateText("categories", "title", value)}
              />
              <EditableText
                as="p"
                className="editorial-lede"
                value={texts.categories.body}
                editable={canEditText}
                onChange={(value) => onUpdateText("categories", "body", value)}
                multiline
              />
            </header>
            {categories.length > 0 ? (
              <ul className="editorial-category-list">
                {categories.slice(0, 8).map(([category, items], index) => (
                  <li key={category}>
                    <button type="button" onClick={() => goCatalogue(category)}>
                      <span className="editorial-category-num">{ordinal(index + 1)}</span>
                      <span className="editorial-category-name">{titleCase(category)}</span>
                      <span className="editorial-category-count">
                        {items.length} {texts.categories.productCountSuffix || "produk"}
                      </span>
                      <ArrowUpRight size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="editorial-empty">Kategori akan muncul setelah produk dipublikasikan.</p>
            )}
          </section>
        ) : null}

        {!hidden.catalogue ? (
          <section className="editorial-section editorial-featured">
            <header className="editorial-section-head split">
              <div>
                <span className="editorial-eyebrow">Pilihan Editor</span>
                <EditableText
                  as="h2"
                  className="editorial-headline"
                  value={texts.catalogue.title || "Pilihan minggu ini"}
                  editable={canEditText}
                  onChange={(value) => onUpdateText("catalogue", "title", value)}
                />
              </div>
              <button type="button" className="editorial-link" onClick={() => goCatalogue(null)}>
                {texts.catalogue.viewAllLabel || "Lihat semua katalog"}
                <ArrowRight size={14} />
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
              addLabel={texts.catalogue.addToCartLabel || "Tambah"}
              soldOutLabel={texts.catalogue.soldOutLabel || "Habis"}
              variant="featured"
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
  variant = "default",
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
  variant?: "default" | "featured";
}) {
  if (!products.length) return <div className="editorial-empty">Tidak ada produk pada filter ini.</div>;
  return (
    <ul className={`editorial-product-grid ${variant === "featured" ? "is-featured" : ""}`}>
      {products.map((product, index) => {
        const copy = productText(product);
        const description = copy.subtitle || copy.description || "Bagian dari katalog editor.";
        const limit = stockLimit(product);
        const inCart = cartItems[product.id] ?? 0;
        const disabled = limit === 0 || limit - inCart <= 0;
        return (
          <li key={product.id}>
            <motion.article
              className="editorial-product-card"
              whileHover={{ y: -4 }}
              onClick={() => onProduct(product.id)}
              role="button"
              tabIndex={0}
            >
              <div className="editorial-product-image">
                <img src={productThumbnail(product) || FALLBACK_IMAGE} alt={copy.name} />
                <span className="editorial-product-folio">N° {ordinal(index + 1)}</span>
                {product.discountedPrice ? <b className="editorial-product-flag">Sale</b> : null}
              </div>
              <div className="editorial-product-body">
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
                <div className="editorial-product-foot">
                  <strong>{formatPrice(effectivePrice(product), currency)}</strong>
                  {product.discountedPrice ? <s>{formatPrice(product.price, currency)}</s> : null}
                  <button
                    type="button"
                    className="editorial-card-add"
                    disabled={disabled}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (disabled) return;
                      onAddToCart(product);
                    }}
                    aria-label={disabled ? soldOutLabel : "Tambah"}
                  >
                    {disabled ? null : <ShoppingBag size={12} />}
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
