"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
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
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop";

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
  variant?: "default" | "bauhaus" | "mosaic" | "noir";
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

function socialIcon(platform: string, url: string) {
  const normalized = `${platform} ${url}`.toLowerCase();
  if (normalized.includes("instagram")) return <InstagramIcon size={16} />;
  if (normalized.includes("whatsapp") || normalized.includes("wa.me") || /\bwa\b/.test(normalized)) {
    return <WhatsAppIcon size={16} />;
  }
  return null;
}

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="7" r="1.1" fill="currentColor" />
    </svg>
  );
}

function WhatsAppIcon({ size = 16 }: { size?: number }) {
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
  const homeLabel = texts.hero.navHome || INITIAL_TEXT.hero.navHome || "Home";
  const catalogueLabel = texts.hero.navCatalogue || INITIAL_TEXT.hero.navCatalogue || "Catalogue";
  return (
    <header className="pastel-header">
      <button className="pastel-brand" type="button" onClick={() => onNavigate("home")}>
        <span className="pastel-logo">{logoUrl ? <img src={logoUrl} alt="" /> : storeName.charAt(0)}</span>
        <EditableText
          as="strong"
          value={texts.hero.storeName || storeName}
          editable={editable}
          onChange={(value) => onUpdateText("hero", "storeName", value)}
        />
      </button>
      <nav className="pastel-nav">
        <button type="button" className={page === "home" ? "active" : ""} onClick={() => onNavigate("home")}>
          <EditableText as="span" value={homeLabel} editable={editable} onChange={(value) => onUpdateText("hero", "navHome", value)} />
        </button>
        <button type="button" className={page === "catalogue" ? "active" : ""} onClick={() => onNavigate("catalogue")}>
          <EditableText as="span" value={catalogueLabel} editable={editable} onChange={(value) => onUpdateText("hero", "navCatalogue", value)} />
        </button>
      </nav>
      <button className="pastel-shop" type="button" onClick={onCartClick}>
        <ShoppingBag size={15} />
        <EditableText
          as="span"
          value={texts.hero.cartLabel || INITIAL_TEXT.hero.cartLabel || "Cart"}
          editable={editable}
          onChange={(value) => onUpdateText("hero", "cartLabel", value)}
        />
        {cartCount > 0 ? <b>{cartCount}</b> : null}
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
  editable,
  productText,
  onUpdateText,
  onClose,
}: {
  open: boolean;
  items: CartItem[];
  currency: string;
  total: number;
  storeId?: string;
  texts: TextConfig;
  editable: boolean;
  productText: (product: Product) => { name: string };
  onUpdateText: (id: SectionId, field: TextField, value: string) => void;
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
      `${ETALASE_CHECKOUT_HOST}/${encodeURIComponent(storeId)}/checkout?items=${encodeURIComponent(encodeCheckoutItems(checkoutItems))}`,
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
      <aside className="cart-drawer pastel-drawer" aria-label="Keranjang">
        <div className="cart-drawer-header">
          <div>
            <EditableText
              as="span"
              value={texts.catalogue.cartTitle || INITIAL_TEXT.catalogue.cartTitle || "Cart"}
              editable={editable}
              onChange={(value) => onUpdateText("catalogue", "cartTitle", value)}
            />
            <strong>{items.length} item</strong>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup keranjang">
            <X size={18} />
          </button>
        </div>
        {items.length > 0 ? (
          <>
            <div className="cart-line-items">
              {items.map(({ product, quantity }) => (
                <div className="cart-line-item" key={product.id}>
                  <div className="cart-line-image">
                    {productThumbnail(product) ? <img src={productThumbnail(product)} alt={productText(product).name} /> : null}
                  </div>
                  <div>
                    <strong>{productText(product).name}</strong>
                    <span>Jumlah {quantity}</span>
                  </div>
                  <b>{formatPrice(effectivePrice(product) * quantity, currency)}</b>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <span>{texts.catalogue.totalLabel || INITIAL_TEXT.catalogue.totalLabel || "Total"}</span>
              <strong>{formatPrice(total, currency)}</strong>
            </div>
            <button className="cart-checkout pastel-primary" type="button" onClick={handleCheckoutClick}>
              {texts.catalogue.checkoutLabel || INITIAL_TEXT.catalogue.checkoutLabel || "Checkout"}
            </button>
          </>
        ) : (
          <div className="cart-empty">
            <ShoppingBag size={22} />
            <strong>{texts.catalogue.cartEmptyTitle || INITIAL_TEXT.catalogue.cartEmptyTitle || "Keranjang Anda kosong"}</strong>
            <span>{texts.catalogue.cartEmptyBody || INITIAL_TEXT.catalogue.cartEmptyBody || "Tambahkan produk untuk meninjaunya di sini."}</span>
          </div>
        )}
      </aside>
      {confirmOpen ? (
        <div className="checkout-confirm" role="alertdialog" aria-modal="true">
          <div className="checkout-confirm-card">
            <h3>{texts.catalogue.confirmTitle || INITIAL_TEXT.catalogue.confirmTitle || "Mengalihkan ke e-talase"}</h3>
            <p>{texts.catalogue.confirmBody || INITIAL_TEXT.catalogue.confirmBody || "Anda akan diarahkan ke halaman e-talase untuk menyelesaikan checkout."}</p>
            <button type="button" onClick={confirmRedirect}>
              {texts.catalogue.confirmButton || INITIAL_TEXT.catalogue.confirmButton || "Oke"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function PastelTemplate({
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
  variant = "default",
}: Props) {
  const variantClass =
    variant === "bauhaus"
      ? "is-bauhaus"
      : variant === "mosaic"
        ? "is-mosaic"
        : variant === "noir"
          ? "is-noir"
          : "";
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [heroModalOpen, setHeroModalOpen] = useState(() => !hidden.hero);
  const canEditText = editable;

  const categories = useMemo(() => Array.from(groupByCategory(products).entries()), [products]);
  const featured = products.slice(0, 8);
  const featuredProduct = products.find((product) => product.id === selectedProductId) ?? products[0];
  const displayStoreName = texts.hero.storeName || storeName;

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
    setHeroModalOpen(false);
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
    <footer className="pastel-footer" id="contact">
      <div className="pastel-footer-copy">
        <EditableText
          as="strong"
          value={displayStoreName}
          editable={canEditText}
          onChange={(value) => onUpdateText("hero", "storeName", value)}
        />
        <EditableText
          as="span"
          value={texts.footer.body}
          editable={canEditText}
          onChange={(value) => onUpdateText("footer", "body", value)}
          multiline
        />
      </div>
      <div className="pastel-footer-actions">
        {(settings?.socialLinks ?? []).length > 0 ? (
          <div className="pastel-footer-links">
            {(settings?.socialLinks ?? []).map((link) => (
              <a href={link.url} key={link.url} aria-label={link.platform}>
                {socialIcon(link.platform, link.url)}
                {titleCase(link.platform)}
              </a>
            ))}
          </div>
        ) : null}
        <a className="pastel-powered" href="https://app.e-talase.com" target="_blank" rel="noreferrer">
          Powered by <img src={etalaseLogo.src} alt="e-talase" />
        </a>
      </div>
    </footer>
  ) : null;

  const openingModal = !hidden.hero && heroModalOpen ? (
    <div className={`pastel-modal ${variantClass}`} role="dialog" aria-modal="true" aria-label="Opening highlight">
      <button className="pastel-modal-scrim" type="button" aria-label="Close opening modal" onClick={() => setHeroModalOpen(false)} />
      <motion.section className="pastel-opening" initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.38, ease: "easeOut" }}>
        <button className="pastel-modal-close" type="button" aria-label="Close opening modal" onClick={() => setHeroModalOpen(false)}>
          <X size={18} />
        </button>
        <span className="pastel-opening-logo" aria-hidden="true">
          {logoUrl ? <img src={logoUrl} alt="" /> : displayStoreName.charAt(0)}
        </span>
        <div className="pastel-opening-copy-zone">
          <div className="pastel-hero-copy">
            <EditableText
              as="span"
              className="pastel-kicker"
              value={texts.hero.eyebrow || INITIAL_TEXT.hero.eyebrow || "New drop"}
              editable={badgeEditable || canEditText}
              onChange={(value) => onUpdateText("hero", "eyebrow", value)}
            />
            <EditableText
              as="h1"
              value={texts.hero.title || displayStoreName}
              editable={canEditText}
              onChange={(value) => onUpdateText("hero", "title", value)}
            />
            <EditableText
              as="p"
              value={texts.hero.body}
              editable={canEditText}
              onChange={(value) => onUpdateText("hero", "body", value)}
              multiline
            />
            <button className="pastel-primary" type="button" onClick={() => goCatalogue(null)}>
              <EditableText
                as="span"
                value={texts.hero.ctaLabel || INITIAL_TEXT.hero.ctaLabel || "View catalogue"}
                editable={canEditText}
                onChange={(value) => onUpdateText("hero", "ctaLabel", value)}
              />
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <FanGallery products={featured} productText={productText} onProduct={goProduct} />
      </motion.section>
    </div>
  ) : null;

  const cartDrawer = (
    <CartDrawer
      open={cartOpen}
      items={cartProducts}
      currency={currency}
      total={cartTotal}
      storeId={storeId}
      texts={texts}
      editable={canEditText}
      productText={productText}
      onUpdateText={onUpdateText}
      onClose={() => setCartOpen(false)}
    />
  );

  if (page === "catalogue") {
    return (
      <div className={`pastel-store ${variantClass}`}>
        {header}
        <main>
          <section className="pastel-page-head">
            <EditableText
              as="span"
              className="pastel-kicker"
              value={selectedCategory ? `Category - ${selectedCategory}` : texts.catalogue.eyebrow || "Catalogue"}
              editable={canEditText && !selectedCategory}
              onChange={(value) => onUpdateText("catalogue", "eyebrow", value)}
            />
            <EditableText
              as="h1"
              value={selectedCategory ? titleCase(selectedCategory) : texts.catalogue.title || "All products"}
              editable={canEditText && !selectedCategory}
              onChange={(value) => onUpdateText("catalogue", "title", value)}
            />
            <EditableText
              as="p"
              value={texts.catalogue.body || `${filteredProducts.length} items ready to ship.`}
              editable={canEditText}
              onChange={(value) => onUpdateText("catalogue", "body", value)}
              multiline
            />
            {categories.length > 0 ? (
              <div className="pastel-tabs">
                <button className={!selectedCategory ? "active" : ""} type="button" onClick={() => setSelectedCategory(null)}>
                  {texts.catalogue.allLabel || INITIAL_TEXT.catalogue.allLabel || "All"}
                </button>
                {categories.map(([category]) => (
                  <button
                    key={category}
                    className={selectedCategory === category ? "active" : ""}
                    type="button"
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
            addLabel={texts.catalogue.addToCartLabel || INITIAL_TEXT.catalogue.addToCartLabel || "Add to cart"}
            soldOutLabel={texts.catalogue.soldOutLabel || INITIAL_TEXT.catalogue.soldOutLabel || "Stok habis"}
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
    return (
      <div className={`pastel-store ${variantClass}`}>
        {header}
        <main>
          <section className="pastel-detail">
            <button className="pastel-back" type="button" onClick={() => go("catalogue")}>
              <ArrowLeft size={14} /> {texts.catalogue.backLabel || INITIAL_TEXT.catalogue.backLabel || "Back to catalogue"}
            </button>
            {featuredProduct && copy ? (
              <div className="pastel-detail-grid">
                <div className="pastel-gallery">
                  <div className="pastel-gallery-main">
                    <img src={gallery[0] || FALLBACK_IMAGE} alt={copy.name} />
                  </div>
                  {gallery.length > 1 ? (
                    <div className="pastel-gallery-thumbs">
                      {gallery.slice(1, 5).map((src, index) => (
                        <div key={`${src}-${index}`}>
                          <img src={src} alt="" />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="pastel-detail-copy">
                  <span className="pastel-kicker">Product</span>
                  <EditableText as="h1" value={copy.name} editable={canEditText} onChange={(value) => onUpdateProductText(featuredProduct.id, "name", value)} />
                  {copy.subtitle ? (
                    <EditableText
                      as="p"
                      className="pastel-subtitle"
                      value={copy.subtitle}
                      editable={canEditText}
                      onChange={(value) => onUpdateProductText(featuredProduct.id, "subtitle", value)}
                      multiline
                    />
                  ) : null}
                  <div className="pastel-price-row">
                    <strong>{formatPrice(effectivePrice(featuredProduct), currency)}</strong>
                    {featuredProduct.discountedPrice ? <s>{formatPrice(featuredProduct.price, currency)}</s> : null}
                  </div>
                  <EditableText
                    as="p"
                    className="pastel-description"
                    value={copy.description || texts.catalogue.productFallback || "Product details will appear here."}
                    editable={canEditText}
                    onChange={(value) => onUpdateProductText(featuredProduct.id, "description", value)}
                    multiline
                  />
                  <div className="pastel-qty">
                    <button type="button" disabled={safeQuantity <= 1} onClick={() => setProductQuantity(safeQuantity - 1)}>
                      <Minus size={14} />
                    </button>
                    <input value={safeQuantity} min={1} max={Math.max(1, stock)} type="number" onChange={(event) => setProductQuantity(Number(event.currentTarget.value))} />
                    <button type="button" disabled={safeQuantity >= stock || stock === 0} onClick={() => setProductQuantity(safeQuantity + 1)}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <button className="pastel-primary detail" type="button" disabled={stock === 0} onClick={() => addToCart(featuredProduct, safeQuantity)}>
                    <ShoppingBag size={16} />
                    {stock === 0
                      ? texts.catalogue.soldOutLabel || INITIAL_TEXT.catalogue.soldOutLabel || "Stok habis"
                      : `${texts.catalogue.addToCartLabel || INITIAL_TEXT.catalogue.addToCartLabel || "Add to cart"} - ${formatPrice(effectivePrice(featuredProduct) * safeQuantity, currency)}`}
                  </button>
                </div>
              </div>
            ) : (
              <p className="pastel-empty">Belum ada produk tersedia.</p>
            )}
          </section>
        </main>
        {footer}
        {cartDrawer}
      </div>
    );
  }

  return (
    <div className={`pastel-store ${variantClass}`}>
      {header}
      <main>
        {!hidden.categories ? (
          <section className="pastel-section">
            <div className="pastel-section-head">
              <EditableText
                as="span"
                className="pastel-kicker"
                value={texts.categories.eyebrow || "Catalogue"}
                editable={canEditText}
                onChange={(value) => onUpdateText("categories", "eyebrow", value)}
              />
              <EditableText
                as="h2"
                value={texts.categories.title}
                editable={canEditText}
                onChange={(value) => onUpdateText("categories", "title", value)}
              />
              <EditableText
                as="p"
                value={texts.categories.body}
                editable={canEditText}
                onChange={(value) => onUpdateText("categories", "body", value)}
                multiline
              />
            </div>
            <CategoryGrid categories={categories} onCategory={goCatalogue} />
          </section>
        ) : null}
      </main>
      {footer}
      {cartDrawer}
      {openingModal}
    </div>
  );
}

function FanGallery({
  products,
  productText,
  onProduct,
}: {
  products: Product[];
  productText: (product: Product) => { name: string };
  onProduct: (id: string) => void;
}) {
  const [centerIndex, setCenterIndex] = useState(0);

  useEffect(() => {
    if (products.length < 2) return;
    const intervalId = window.setInterval(() => {
      setCenterIndex((current) => (current + 1) % products.length);
    }, 2600);
    return () => window.clearInterval(intervalId);
  }, [products.length]);

  if (!products.length) return null;
  const visibleCount = Math.min(products.length, 7);
  const half = Math.floor(visibleCount / 2);
  const centerSlot = (visibleCount - 1) / 2;
  const visibleProducts = Array.from({ length: visibleCount }, (_, slot) => {
    const relative = slot - half;
    const index = (centerIndex + relative + products.length) % products.length;
    return products[index];
  });
  return (
    <div className="pastel-fan" aria-label="Featured products">
      {visibleProducts.map((product, index) => {
        const offset = index - centerSlot;
        const distance = Math.abs(offset);
        return (
          <motion.button
            type="button"
            key={product.id}
            className="pastel-fan-card"
            style={{ zIndex: 10 - distance } as CSSProperties}
            initial={{ opacity: 0, x: "-50%", y: "-42%", rotate: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              x: `calc(-50% + ${offset * 3.6}rem)`,
              y: `calc(-50% + ${distance * distance * 0.42}rem)`,
              rotate: offset * 8,
              scale: 1 - distance * 0.065,
            }}
            transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
            onClick={() => onProduct(product.id)}
          >
            <img src={productThumbnail(product) || FALLBACK_IMAGE} alt={productText(product).name} />
          </motion.button>
        );
      })}
    </div>
  );
}

function CategoryGrid({
  categories,
  onCategory,
}: {
  categories: [string, Product[]][];
  onCategory: (category?: string | null) => void;
}) {
  if (!categories.length) {
    return <div className="pastel-empty">No categories yet - products will appear here once published.</div>;
  }
  return (
    <>
      <div className="pastel-category-grid">
        {categories.slice(0, 12).map(([category, items]) => {
          const image = productThumbnail(items[0]) || FALLBACK_IMAGE;
          return (
            <button type="button" className="pastel-category-card" key={category} onClick={() => onCategory(category)}>
              <img src={image} alt="" />
              <div className="pastel-category-copy">
                <div>
                  <span>Category</span>
                  <strong>{titleCase(category)}</strong>
                  <em>{items.length} item{items.length === 1 ? "" : "s"}</em>
                </div>
                <b>Browse <ArrowRight size={14} /></b>
              </div>
            </button>
          );
        })}
      </div>
      <div className="pastel-see-all-wrap">
        <button type="button" className="pastel-primary pastel-see-all" onClick={() => onCategory(null)}>
          See all <ArrowRight size={16} />
        </button>
      </div>
    </>
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
  if (!products.length) return <div className="pastel-empty">No products match this filter.</div>;
  return (
    <section className="pastel-product-grid">
      {products.map((product) => {
        const copy = productText(product);
        const description = copy.subtitle || copy.description || "Product from this eTalase store.";
        const limit = stockLimit(product);
        const inCart = cartItems[product.id] ?? 0;
        const disabled = limit === 0 || limit - inCart <= 0;
        return (
          <motion.article
            className="pastel-product-card"
            key={product.id}
            whileHover={{ y: -5 }}
            onClick={() => onProduct(product.id)}
            role="button"
            tabIndex={0}
          >
            <div className="pastel-product-image">
              <img src={productThumbnail(product) || FALLBACK_IMAGE} alt={copy.name} />
              <div>
                {(product.tags ?? []).slice(0, 2).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              {product.discountedPrice ? <b>Sale</b> : null}
            </div>
            <div className="pastel-product-body">
              <EditableText as="h3" value={copy.name} editable={editable} onChange={(value) => onUpdateProductText(product.id, "name", value)} />
              <EditableText
                as="p"
                value={description}
                editable={editable}
                onChange={(value) => onUpdateProductText(product.id, copy.subtitle ? "subtitle" : "description", value)}
                multiline
              />
              <div className="pastel-product-foot">
                <strong>{formatPrice(effectivePrice(product), currency)}</strong>
                {product.discountedPrice ? <s>{formatPrice(product.price, currency)}</s> : null}
                <button
                  type="button"
                  className="pastel-card-add"
                  disabled={disabled}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (disabled) return;
                    onAddToCart(product);
                  }}
                  aria-label={disabled ? soldOutLabel : addLabel}
                >
                  {disabled ? soldOutLabel : (
                    <>
                      <ShoppingBag size={14} /> <span>{addLabel}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.article>
        );
      })}
    </section>
  );
}
