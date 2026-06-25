"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, Eye, EyeOff, Minus, PanelRightOpen, Plus, ShoppingBag } from "lucide-react";
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

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const SECTION_LABEL: Record<SectionId, string> = {
  hero: "Hero",
  categories: "Kategori",
  catalogue: "Katalog",
  footer: "Footer",
};

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

function titleCase(value: string) {
  return value
    .split(/(\s+)/)
    .map((part) => (part.trim() ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : part))
    .join("");
}

function encodeCheckoutItems(items: { productId: string; quantity: number }[]) {
  const json = JSON.stringify(items);
  return window.btoa(unescape(encodeURIComponent(json)));
}

function CyberSection({
  id,
  selected,
  editable,
  hidden,
  textEditMode,
  onSelect,
  onToggleHidden,
  children,
}: {
  id: SectionId;
  selected: boolean;
  editable: boolean;
  hidden: boolean;
  textEditMode: boolean;
  onSelect: (id: SectionId) => void;
  onToggleHidden: (id: SectionId, value?: boolean) => void;
  children: React.ReactNode;
}) {
  const showChips = editable && !textEditMode;
  return (
    <div
      className={`cyber-section ${showChips ? "can-edit" : ""} ${textEditMode ? "text-edit-mode" : ""} ${selected && showChips ? "is-selected" : ""}`}
      onClick={(event) => {
        if (!editable || textEditMode) return;
        event.stopPropagation();
        onSelect(id);
      }}
    >
      {showChips ? (
        <div className="cyber-chip-bar" onClick={(event) => event.stopPropagation()}>
          <button type="button" className="cyber-chip" onClick={() => onSelect(id)}>
            <PanelRightOpen size={12} />
            {SECTION_LABEL[id]}
          </button>
          <button
            type="button"
            className="cyber-chip ghost"
            onClick={() => onToggleHidden(id, !hidden)}
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

function GlitchText({
  as: Tag = "h1",
  value,
  editable,
  onChange,
  className = "",
  multiline = false,
}: {
  as?: "h1" | "h2" | "h3" | "span";
  value: string;
  editable: boolean;
  onChange: (next: string) => void;
  className?: string;
  multiline?: boolean;
}) {
  if (editable) {
    return (
      <EditableText
        as={Tag}
        className={`cyber-glitch ${className}`}
        value={value}
        editable
        onChange={onChange}
        multiline={multiline}
      />
    );
  }
  const TagElement = Tag as unknown as React.ElementType;
  return (
    <TagElement className={`cyber-glitch ${className}`} data-text={value}>
      {value}
    </TagElement>
  );
}

function CyberHeader({
  storeName,
  logoUrl,
  page,
  cartCount,
  texts,
  editable,
  onUpdateText,
  onCartClick,
  onNavigate,
}: {
  storeName: string;
  logoUrl: string;
  page: PreviewPage;
  cartCount: number;
  texts: TextConfig;
  editable: boolean;
  onUpdateText: (id: SectionId, field: TextField, value: string) => void;
  onCartClick: () => void;
  onNavigate: (page: PreviewPage) => void;
}) {
  const items: { label: string; page: PreviewPage }[] = [
    { label: texts.hero.navHome || INITIAL_TEXT.hero.navHome || "Beranda", page: "home" },
    { label: texts.hero.navCatalogue || INITIAL_TEXT.hero.navCatalogue || "Katalog", page: "catalogue" },
  ];
  return (
    <motion.header
      className="cyber-header"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <button type="button" className="cyber-brand" onClick={() => onNavigate("home")}>
        <span className="cyber-brand-mark" aria-hidden="true">
          {logoUrl ? <img src={logoUrl} alt="" /> : <em>{storeName.charAt(0).toUpperCase()}</em>}
        </span>
        <EditableText
          as="strong"
          value={texts.hero.storeName || storeName}
          editable={editable}
          onChange={(value) => onUpdateText("hero", "storeName", value)}
        />
      </button>
      <nav className="cyber-nav">
        {items.map((item) => (
          <button
            key={item.page}
            type="button"
            className={page === item.page ? "is-active" : ""}
            onClick={() => onNavigate(item.page)}
          >
            <span className="cyber-nav-glow" aria-hidden="true" />
            <EditableText
              as="span"
              value={item.label}
              editable={editable}
              onChange={(value) => onUpdateText("hero", item.page === "home" ? "navHome" : "navCatalogue", value)}
            />
          </button>
        ))}
      </nav>
      <motion.button type="button" className="cyber-cart" onClick={onCartClick} whileTap={{ scale: 0.97 }}>
        <ShoppingBag size={16} />
        <EditableText
          as="strong"
          value={texts.hero.cartLabel || INITIAL_TEXT.hero.cartLabel || "Keranjang"}
          editable={editable}
          onChange={(value) => onUpdateText("hero", "cartLabel", value)}
        />
        {cartCount > 0 ? <span>{cartCount}</span> : null}
      </motion.button>
    </motion.header>
  );
}

function CyberHero({
  eyebrow,
  title,
  body,
  editable,
  eyebrowEditable,
  onEyebrowChange,
  onTitleChange,
  onBodyChange,
  ctaLabel,
  onCtaLabelChange,
  onCta,
  heroImage,
  productName,
}: {
  eyebrow: string;
  title: string;
  body: string;
  editable: boolean;
  eyebrowEditable: boolean;
  onEyebrowChange: (next: string) => void;
  onTitleChange: (next: string) => void;
  onBodyChange: (next: string) => void;
  ctaLabel: string;
  onCtaLabelChange: (next: string) => void;
  onCta: () => void;
  heroImage: string;
  productName: string;
}) {
  return (
    <motion.section
      className="cyber-hero"
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.35 }}
    >
      <div className="cyber-hero-grid" aria-hidden="true" />
      <div className="cyber-hero-inner">
        <motion.div className="cyber-hero-copy" variants={fadeUp} transition={{ duration: 0.45, ease: "easeOut" }}>
          <span className="cyber-eyebrow">
            <span className="cyber-eyebrow-dot" aria-hidden="true" />
            <EditableText
              as="span"
              value={eyebrow}
              editable={eyebrowEditable}
              onChange={onEyebrowChange}
            />
          </span>
          <GlitchText as="h1" className="cyber-hero-title" value={title} editable={editable} onChange={onTitleChange} />
          <EditableText
            as="p"
            className="cyber-hero-body"
            value={body}
            editable={editable}
            onChange={onBodyChange}
            multiline
          />
          <div className="cyber-hero-actions">
            <motion.button
              type="button"
              className="cyber-button"
              onClick={onCta}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <EditableText as="span" value={ctaLabel} editable={editable} onChange={onCtaLabelChange} />
              <ArrowRight size={16} />
            </motion.button>
            <span className="cyber-coord" aria-hidden="true">
              <em>// LAT 0.000 LON 0.000</em>
            </span>
          </div>
        </motion.div>
        <motion.div className="cyber-hero-art" variants={fadeUp} transition={{ duration: 0.5, ease: "easeOut" }}>
          <div className="cyber-hero-frame">
            <span className="cyber-frame-corner top-left" aria-hidden="true" />
            <span className="cyber-frame-corner top-right" aria-hidden="true" />
            <span className="cyber-frame-corner bottom-left" aria-hidden="true" />
            <span className="cyber-frame-corner bottom-right" aria-hidden="true" />
            {heroImage ? (
              <motion.div
                className="cyber-hero-photo"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              >
                <img src={heroImage} alt={productName} />
                <span className="cyber-scanline" aria-hidden="true" />
              </motion.div>
            ) : (
              <div className="cyber-hero-placeholder">{productName.charAt(0)}</div>
            )}
            <span className="cyber-frame-id" aria-hidden="true">
              ID://00.01
            </span>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

function CartDrawer({
  open,
  items,
  currency,
  total,
  storeId,
  texts,
  productTextOverrides,
  editable,
  onUpdateText,
  onUpdateProductText,
  onClose,
}: {
  open: boolean;
  items: CartItem[];
  currency: string;
  total: number;
  storeId?: string;
  texts: TextConfig;
  productTextOverrides: ProductTextOverrides;
  editable: boolean;
  onUpdateText: (id: SectionId, field: TextField, value: string) => void;
  onUpdateProductText: (productId: string, field: keyof ProductTextOverride, value: string) => void;
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
      <aside className="cart-drawer cyber-cart-drawer" aria-label="Keranjang">
        <div className="cart-drawer-header">
          <div>
            <EditableText
              as="span"
              value={texts.catalogue.cartTitle || INITIAL_TEXT.catalogue.cartTitle || "Keranjang"}
              editable={editable}
              onChange={(value) => onUpdateText("catalogue", "cartTitle", value)}
            />
            <strong>
              {items.length}{" "}
              <EditableText
                as="span"
                value={texts.catalogue.itemLabel || INITIAL_TEXT.catalogue.itemLabel || "item"}
                editable={editable}
                onChange={(value) => onUpdateText("catalogue", "itemLabel", value)}
              />
            </strong>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup keranjang">
            ×
          </button>
        </div>
        {items.length > 0 ? (
          <>
            <div className="cart-line-items">
              {items.map(({ product, quantity }) => {
                const override = productTextOverrides[product.id] ?? {};
                const name = override.name ?? product.name;
                return (
                  <div className="cart-line-item" key={product.id}>
                    <div className="cart-line-image">
                      {productThumbnail(product) ? <img src={productThumbnail(product)} alt={name} /> : null}
                    </div>
                    <div>
                      <EditableText
                        as="strong"
                        value={name}
                        editable={editable}
                        onChange={(value) => onUpdateProductText(product.id, "name", value)}
                      />
                      <span>
                        <EditableText
                          as="span"
                          value={texts.catalogue.lineQuantityLabel || INITIAL_TEXT.catalogue.lineQuantityLabel || "Jumlah"}
                          editable={editable}
                          onChange={(value) => onUpdateText("catalogue", "lineQuantityLabel", value)}
                        />{" "}
                        {quantity}
                      </span>
                    </div>
                    <b>{formatPrice(effectivePrice(product) * quantity, currency)}</b>
                  </div>
                );
              })}
            </div>
            <div className="cart-summary">
              <EditableText
                as="span"
                value={texts.catalogue.totalLabel || INITIAL_TEXT.catalogue.totalLabel || "Total"}
                editable={editable}
                onChange={(value) => onUpdateText("catalogue", "totalLabel", value)}
              />
              <strong>{formatPrice(total, currency)}</strong>
            </div>
            <button className="cart-checkout cyber-button" type="button" onClick={handleCheckoutClick}>
              <EditableText
                as="span"
                value={texts.catalogue.checkoutLabel || INITIAL_TEXT.catalogue.checkoutLabel || "Checkout"}
                editable={editable}
                onChange={(value) => onUpdateText("catalogue", "checkoutLabel", value)}
              />
            </button>
          </>
        ) : (
          <div className="cart-empty">
            <ShoppingBag size={22} />
            <EditableText
              as="strong"
              value={texts.catalogue.cartEmptyTitle || INITIAL_TEXT.catalogue.cartEmptyTitle || "Keranjang Anda kosong"}
              editable={editable}
              onChange={(value) => onUpdateText("catalogue", "cartEmptyTitle", value)}
            />
            <EditableText
              as="span"
              value={texts.catalogue.cartEmptyBody || INITIAL_TEXT.catalogue.cartEmptyBody || "Tambahkan produk untuk meninjaunya di sini."}
              editable={editable}
              onChange={(value) => onUpdateText("catalogue", "cartEmptyBody", value)}
            />
          </div>
        )}
      </aside>
      {confirmOpen ? (
        <div className="checkout-confirm" role="alertdialog" aria-modal="true">
          <div className="checkout-confirm-card">
            <EditableText
              as="h3"
              value={texts.catalogue.confirmTitle || INITIAL_TEXT.catalogue.confirmTitle || "Mengalihkan ke e-talase"}
              editable={editable}
              onChange={(value) => onUpdateText("catalogue", "confirmTitle", value)}
            />
            <EditableText
              as="p"
              value={texts.catalogue.confirmBody || INITIAL_TEXT.catalogue.confirmBody || "Anda akan diarahkan ke halaman e-talase untuk menyelesaikan checkout."}
              editable={editable}
              onChange={(value) => onUpdateText("catalogue", "confirmBody", value)}
              multiline
            />
            <button type="button" onClick={confirmRedirect}>
              <EditableText
                as="span"
                value={texts.catalogue.confirmButton || INITIAL_TEXT.catalogue.confirmButton || "Oke"}
                editable={editable}
                onChange={(value) => onUpdateText("catalogue", "confirmButton", value)}
              />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const CATEGORY_TONES: ("primary" | "accent" | "ink")[] = [
  "primary",
  "accent",
  "ink",
  "accent",
  "primary",
  "ink",
];

export function CyberTemplate({
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
  const canEditText = editable;
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [productQuantity, setProductQuantity] = useState(1);

  const categories = useMemo(() => Array.from(groupByCategory(products).entries()), [products]);
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
  const featured = products.slice(0, 8);
  const featuredProduct = products.find((product) => product.id === selectedProductId) ?? products[0];
  const heroImage = heroImageOverride || products.map(productThumbnail).find(Boolean) || logoUrl || "";
  const displayStoreName = texts.hero.storeName || storeName;
  const filteredProducts = selectedCategory
    ? products.filter((product) => (product.tags ?? []).includes(selectedCategory))
    : products;

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
    <CyberHeader
      storeName={storeName}
      logoUrl={logoUrl}
      page={page}
      cartCount={cartCount}
      texts={texts}
      editable={canEditText}
      onUpdateText={onUpdateText}
      onCartClick={() => setCartOpen(true)}
      onNavigate={(next) => {
        if (next === "catalogue") {
          goCatalogue(null);
          return;
        }
        go(next);
      }}
    />
  );

  const footer = !hidden.footer ? (
    <CyberSection
      id="footer"
      selected={selectedSection === "footer"}
      editable={editable && page === "home"}
      hidden={hidden.footer}
      textEditMode={isTextEditMode}
      onSelect={onSelectSection}
      onToggleHidden={onToggleHidden}
    >
      <footer className="cyber-footer">
        <div className="cyber-footer-grid">
          <div className="cyber-footer-copy">
            <GlitchText
              as="h3"
              className="cyber-footer-title"
              value={texts.footer.title}
              editable={canEditText && page === "home"}
              onChange={(value) => onUpdateText("footer", "title", value)}
            />
            <EditableText
              as="p"
              value={texts.footer.body}
              editable={canEditText && page === "home"}
              onChange={(value) => onUpdateText("footer", "body", value)}
              multiline
            />
            <EditableText
              as="strong"
              className="cyber-footer-store"
              value={displayStoreName}
              editable={canEditText && page === "home"}
              onChange={(value) => onUpdateText("hero", "storeName", value)}
            />
          </div>
          <div className="cyber-footer-links">
            {(settings?.socialLinks ?? []).map((link) => (
              <a href={link.url} key={link.url} aria-label={link.platform}>
                <span aria-hidden="true">//</span> {link.platform}
              </a>
            ))}
          </div>
        </div>
        <div className="cyber-footer-bottom">
          <a className="powered-by" href="https://app.e-talase.com" target="_blank" rel="noreferrer">
            Powered by <img src={etalaseLogo.src} alt="e-talase" />
          </a>
          <small>© {new Date().getFullYear()} {displayStoreName}. All rights reserved.</small>
        </div>
      </footer>
    </CyberSection>
  ) : null;

  const cartDrawer = (
    <CartDrawer
      open={cartOpen}
      items={cartProducts}
      currency={currency}
      total={cartTotal}
      storeId={storeId}
      texts={texts}
      productTextOverrides={productTextOverrides}
      editable={canEditText}
      onUpdateText={onUpdateText}
      onUpdateProductText={onUpdateProductText}
      onClose={() => setCartOpen(false)}
    />
  );

  if (page === "catalogue") {
    return (
      <div className="cyber-page">
        {header}
        <motion.section
          className="cyber-catalogue"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div className="cyber-page-head" variants={fadeUp}>
            <GlitchText
              as="h1"
              className="cyber-h1"
              value={texts.catalogue.title}
              editable={canEditText}
              onChange={(value) => onUpdateText("catalogue", "title", value)}
            />
            <EditableText
              as="p"
              value={texts.catalogue.body}
              editable={canEditText}
              onChange={(value) => onUpdateText("catalogue", "body", value)}
              multiline
            />
          </motion.div>
          {categories.length > 0 ? (
            <div className="cyber-tabs">
              <button type="button" className={!selectedCategory ? "is-active" : ""} onClick={() => setSelectedCategory(null)}>
                <EditableText
                  as="span"
                  value={texts.catalogue.allLabel || INITIAL_TEXT.catalogue.allLabel || "Semua"}
                  editable={canEditText}
                  onChange={(value) => onUpdateText("catalogue", "allLabel", value)}
                />
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
          <motion.div className="cyber-product-grid" variants={stagger}>
            {filteredProducts.map((product, index) => {
              const copy = productText(product);
              const summary = copy.subtitle || copy.description || texts.catalogue.productFallback || INITIAL_TEXT.catalogue.productFallback || "Produk eTalase.";
              const tone = CATEGORY_TONES[index % CATEGORY_TONES.length];
              return (
                <motion.article
                  key={product.id}
                  className={`cyber-product-card tone-${tone}`}
                  onClick={() => goProduct(product.id)}
                  role="button"
                  tabIndex={0}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                >
                  <div className="cyber-product-image">
                    {productGallery(product)[0] ? (
                      <img src={productGallery(product)[0]} alt={copy.name} />
                    ) : (
                      <span className="cyber-product-placeholder">{copy.name.charAt(0)}</span>
                    )}
                    <span className="cyber-product-meta">
                      <em>#{String(index + 1).padStart(3, "0")}</em>
                      {(product.tags ?? []).slice(0, 1).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </span>
                    <span className="cyber-scanline" aria-hidden="true" />
                  </div>
                  <div className="cyber-product-body">
                    <EditableText
                      as="h3"
                      value={copy.name}
                      editable={canEditText}
                      onChange={(value) => onUpdateProductText(product.id, "name", value)}
                    />
                    <EditableText
                      as="p"
                      value={summary}
                      editable={canEditText}
                      onChange={(value) => onUpdateProductText(product.id, copy.subtitle ? "subtitle" : "description", value)}
                      multiline
                    />
                    <div className="cyber-product-foot">
                      <strong>{formatPrice(effectivePrice(product), currency)}</strong>
                      <button
                        type="button"
                        className="cyber-card-add"
                        disabled={(() => { const left = stockLimit(product) - (cartItems[product.id] ?? 0); return stockLimit(product) === 0 || left <= 0; })()}
                        onClick={(event) => {
                          event.stopPropagation();
                          const left = stockLimit(product) - (cartItems[product.id] ?? 0);
                          if (stockLimit(product) === 0 || left <= 0) return;
                          addToCart(product, 1);
                        }}
                        aria-label="Tambah ke keranjang"
                      >
                        <ShoppingBag size={14} />
                        <span>Tambah</span>
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </motion.section>
        {footer}
        {cartDrawer}
      </div>
    );
  }

  if (page === "product") {
    const gallery = featuredProduct ? productGallery(featuredProduct) : [];
    const stock = featuredProduct ? stockLimit(featuredProduct) : 0;
    const safeQuantity = boundedQuantity(productQuantity, Math.max(1, stock));
    const featuredCopy = featuredProduct ? productText(featuredProduct) : null;
    return (
      <div className="cyber-page">
        {header}
        <motion.section className="cyber-product-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button className="cyber-back" type="button" onClick={() => go("catalogue")}>
            <ChevronLeft size={14} />
            <EditableText
              as="span"
              value={texts.catalogue.backLabel || INITIAL_TEXT.catalogue.backLabel || "Kembali ke katalog"}
              editable={canEditText}
              onChange={(value) => onUpdateText("catalogue", "backLabel", value)}
            />
          </button>
          {featuredProduct ? (
            <div className="cyber-product-detail">
              <motion.div className="cyber-detail-gallery" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}>
                <div className="cyber-detail-hero">
                  <span className="cyber-frame-corner top-left" aria-hidden="true" />
                  <span className="cyber-frame-corner top-right" aria-hidden="true" />
                  <span className="cyber-frame-corner bottom-left" aria-hidden="true" />
                  <span className="cyber-frame-corner bottom-right" aria-hidden="true" />
                  {gallery[0] ? (
                    <img src={gallery[0]} alt={featuredCopy?.name ?? featuredProduct.name} />
                  ) : (
                    <span className="cyber-product-placeholder">{(featuredCopy?.name ?? featuredProduct.name).charAt(0)}</span>
                  )}
                  <span className="cyber-scanline" aria-hidden="true" />
                </div>
                <div className="cyber-detail-thumbs">
                  {gallery.slice(0, 4).map((src, i) => (
                    <div key={`${src}-${i}`} className="cyber-detail-thumb">
                      <img src={src} alt="" />
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div className="cyber-detail-info" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}>
                {(featuredProduct.tags ?? []).slice(0, 1).map((tag) => (
                  <span key={tag} className="cyber-pill">
                    <span aria-hidden="true">//</span> {tag}
                  </span>
                ))}
                <GlitchText
                  as="h1"
                  value={featuredCopy?.name ?? featuredProduct.name}
                  editable={canEditText}
                  onChange={(value) => onUpdateProductText(featuredProduct.id, "name", value)}
                />
                {featuredCopy?.subtitle ? (
                  <EditableText
                    as="p"
                    className="cyber-detail-sub"
                    value={featuredCopy.subtitle}
                    editable={canEditText}
                    onChange={(value) => onUpdateProductText(featuredProduct.id, "subtitle", value)}
                    multiline
                  />
                ) : null}
                <div className="cyber-detail-price">
                  <strong>{formatPrice(effectivePrice(featuredProduct), currency)}</strong>
                  {featuredProduct.discountedPrice ? <s>{formatPrice(featuredProduct.price, currency)}</s> : null}
                </div>
                <p className="cyber-detail-desc">
                  <EditableText
                    as="span"
                    value={featuredCopy?.description || texts.catalogue.productFallback || INITIAL_TEXT.catalogue.productFallback || "Deskripsi produk akan tampil di storefront aktif."}
                    editable={canEditText}
                    onChange={(value) => onUpdateProductText(featuredProduct.id, "description", value)}
                    multiline
                  />
                </p>
                <div className="cyber-qty-row">
                  <EditableText
                    as="span"
                    value={texts.catalogue.quantityLabel || INITIAL_TEXT.catalogue.quantityLabel || "Jumlah"}
                    editable={canEditText}
                    onChange={(value) => onUpdateText("catalogue", "quantityLabel", value)}
                  />
                  <div className="cyber-qty">
                    <button
                      type="button"
                      onClick={() => setProductQuantity(safeQuantity - 1)}
                      disabled={safeQuantity <= 1}
                      aria-label="Kurangi jumlah"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={Math.max(1, stock)}
                      value={safeQuantity}
                      onChange={(event) => setProductQuantity(Number(event.currentTarget.value))}
                    />
                    <button
                      type="button"
                      onClick={() => setProductQuantity(safeQuantity + 1)}
                      disabled={safeQuantity >= stock || stock === 0}
                      aria-label="Tambah jumlah"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <motion.button
                  type="button"
                  className="cyber-button cyber-button-block"
                  disabled={stock === 0}
                  onClick={() => addToCart(featuredProduct, safeQuantity)}
                  whileHover={stock === 0 ? undefined : { y: -2 }}
                  whileTap={stock === 0 ? undefined : { scale: 0.98 }}
                >
                  <ShoppingBag size={16} />
                  <EditableText
                    as="span"
                    value={
                      stock === 0
                        ? (texts.catalogue.soldOutLabel || INITIAL_TEXT.catalogue.soldOutLabel || "Stok habis")
                        : (texts.catalogue.addToCartLabel || INITIAL_TEXT.catalogue.addToCartLabel || "Tambah ke keranjang")
                    }
                    editable={canEditText}
                    onChange={(value) =>
                      onUpdateText("catalogue", stock === 0 ? "soldOutLabel" : "addToCartLabel", value)
                    }
                  />
                  {stock === 0 ? null : <span>{formatPrice(effectivePrice(featuredProduct) * safeQuantity, currency)}</span>}
                </motion.button>
              </motion.div>
            </div>
          ) : (
            <p>Belum ada produk tersedia.</p>
          )}
        </motion.section>
        {footer}
        {cartDrawer}
      </div>
    );
  }

  return (
    <div className="cyber-page">
      {header}

      {!hidden.hero ? (
        <CyberSection
          id="hero"
          selected={selectedSection === "hero"}
          editable={editable}
          hidden={hidden.hero}
          textEditMode={isTextEditMode}
          onSelect={onSelectSection}
          onToggleHidden={onToggleHidden}
        >
          <CyberHero
            eyebrow={texts.hero.eyebrow || INITIAL_TEXT.hero.eyebrow || "Storefront unggulan"}
            title={texts.hero.title || displayStoreName}
            body={texts.hero.body}
            editable={canEditText}
            eyebrowEditable={badgeEditable}
            onEyebrowChange={(value) => onUpdateText("hero", "eyebrow", value)}
            onTitleChange={(value) => onUpdateText("hero", "title", value)}
            onBodyChange={(value) => onUpdateText("hero", "body", value)}
            ctaLabel={texts.hero.ctaLabel || INITIAL_TEXT.hero.ctaLabel || "Lihat katalog"}
            onCtaLabelChange={(value) => onUpdateText("hero", "ctaLabel", value)}
            onCta={() => goCatalogue(null)}
            heroImage={heroImage}
            productName={featuredProduct ? productText(featuredProduct).name : displayStoreName}
          />
        </CyberSection>
      ) : null}

      {!hidden.categories && categories.length >= 2 ? (
        <CyberSection
          id="categories"
          selected={selectedSection === "categories"}
          editable={editable}
          hidden={hidden.categories}
          textEditMode={isTextEditMode}
          onSelect={onSelectSection}
          onToggleHidden={onToggleHidden}
        >
          <motion.section
            className="cyber-categories"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div className="cyber-section-head" variants={fadeUp}>
              <GlitchText
                as="h2"
                className="cyber-h2"
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
            </motion.div>
            <motion.div className="cyber-category-grid" variants={stagger}>
              {categories.slice(0, 6).map(([category, items], index) => {
                const tone = CATEGORY_TONES[index % CATEGORY_TONES.length];
                return (
                  <motion.button
                    key={category}
                    type="button"
                    className={`cyber-category-card tone-${tone}`}
                    onClick={() => goCatalogue(category)}
                    variants={fadeUp}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  >
                    <span className="cyber-category-label">
                      <small>{String(index + 1).padStart(2, "0")}</small>
                      <strong>{titleCase(category)}</strong>
                      <em>
                        {items.length}{" "}
                        <EditableText
                          as="span"
                          value={texts.categories.productCountSuffix || INITIAL_TEXT.categories.productCountSuffix || "produk"}
                          editable={canEditText}
                          onChange={(value) => onUpdateText("categories", "productCountSuffix", value)}
                        />
                      </em>
                    </span>
                    <ArrowRight size={18} />
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.section>
        </CyberSection>
      ) : null}

      {!hidden.catalogue ? (
        <CyberSection
          id="catalogue"
          selected={selectedSection === "catalogue"}
          editable={editable}
          hidden={hidden.catalogue}
          textEditMode={isTextEditMode}
          onSelect={onSelectSection}
          onToggleHidden={onToggleHidden}
        >
          <motion.section
            className="cyber-featured"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div className="cyber-section-head" variants={fadeUp}>
              <GlitchText
                as="h2"
                className="cyber-h2"
                value={texts.catalogue.title}
                editable={canEditText}
                onChange={(value) => onUpdateText("catalogue", "title", value)}
              />
              <EditableText
                as="p"
                value={texts.catalogue.body}
                editable={canEditText}
                onChange={(value) => onUpdateText("catalogue", "body", value)}
                multiline
              />
            </motion.div>
            <motion.div className="cyber-product-grid" variants={stagger}>
              {featured.map((product, index) => {
                const copy = productText(product);
                const summary = copy.subtitle || copy.description || texts.catalogue.productFallback || INITIAL_TEXT.catalogue.productFallback || "Produk eTalase.";
                const tone = CATEGORY_TONES[index % CATEGORY_TONES.length];
                return (
                  <motion.article
                    key={product.id}
                    className={`cyber-product-card tone-${tone}`}
                    onClick={() => goProduct(product.id)}
                    role="button"
                    tabIndex={0}
                    variants={fadeUp}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  >
                    <div className="cyber-product-image">
                      {productGallery(product)[0] ? (
                        <img src={productGallery(product)[0]} alt={copy.name} />
                      ) : (
                        <span className="cyber-product-placeholder">{copy.name.charAt(0)}</span>
                      )}
                      <span className="cyber-product-meta">
                        <em>#{String(index + 1).padStart(3, "0")}</em>
                        {(product.tags ?? []).slice(0, 1).map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </span>
                      <span className="cyber-scanline" aria-hidden="true" />
                    </div>
                    <div className="cyber-product-body">
                      <EditableText
                        as="h3"
                        value={copy.name}
                        editable={canEditText}
                        onChange={(value) => onUpdateProductText(product.id, "name", value)}
                      />
                      <EditableText
                        as="p"
                        value={summary}
                        editable={canEditText}
                        onChange={(value) => onUpdateProductText(product.id, copy.subtitle ? "subtitle" : "description", value)}
                        multiline
                      />
                      <div className="cyber-product-foot">
                        <strong>{formatPrice(effectivePrice(product), currency)}</strong>
                        <button
                          type="button"
                          className="cyber-card-add"
                          disabled={(() => { const left = stockLimit(product) - (cartItems[product.id] ?? 0); return stockLimit(product) === 0 || left <= 0; })()}
                          onClick={(event) => {
                            event.stopPropagation();
                            const left = stockLimit(product) - (cartItems[product.id] ?? 0);
                            if (stockLimit(product) === 0 || left <= 0) return;
                            addToCart(product, 1);
                          }}
                          aria-label="Tambah ke keranjang"
                        >
                          <ShoppingBag size={14} />
                          <span>Tambah</span>
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
            <div className="cyber-center">
              <motion.button type="button" className="cyber-button outline" onClick={() => goCatalogue(null)} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <EditableText
                  as="span"
                  value={texts.catalogue.viewAllLabel || INITIAL_TEXT.catalogue.viewAllLabel || "Lihat semua katalog"}
                  editable={canEditText}
                  onChange={(value) => onUpdateText("catalogue", "viewAllLabel", value)}
                />
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </motion.section>
        </CyberSection>
      ) : null}

      {footer}
      {cartDrawer}
    </div>
  );
}
