import { useEffect, useState, useCallback } from 'react'
import type {
  Product,
  PublicSettings,
  PublicStoreInfo,
  DeliveryEstimatePayload,
  PromoValidatePayload,
  CheckoutPayload,
} from 'etalase-module'
import { EtalaseApiError } from 'etalase-module'
import { client, STORE_KEY } from '@/lib/etalase'
import { useCart } from '@/lib/useCart'
import { ArcGalleryHero } from '@/components/ui/arc-gallery-hero-component'
import Navbar from '@/components/Navbar'
import ProductGrid from '@/components/ProductGrid'
import CartDrawer from '@/components/CartDrawer'
import CheckoutModal from '@/components/CheckoutModal'
import Footer from '@/components/Footer'

// Fallback Unsplash images when no store products are loaded yet
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1549989476-69a92fa57c36?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512201078372-9c52b0a9b8e4?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=400&auto=format&fit=crop',
]

export default function App() {
  const [storeInfo, setStoreInfo] = useState<PublicStoreInfo | null>(null)
  const [storeSettings, setStoreSettings] = useState<PublicSettings | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loadingStore, setLoadingStore] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [storeError, setStoreError] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const { items: cartItems, count: cartCount, total: cartTotal, weightGrams: cartWeightGrams, addItem, updateQty, remove, clear } = useCart()

  // Fetch store info + settings + products
  useEffect(() => {
    let cancelled = false

    const fetchStore = async () => {
      try {
        const [info, settings] = await Promise.all([
          client.store.getInfo(),
          client.store.getSettings(),
        ])
        if (cancelled) return
        setStoreInfo(info)
        setStoreSettings(settings)
        if (settings?.storeName) document.title = settings.storeName
      } catch (err) {
        if (!cancelled) {
          if (err instanceof EtalaseApiError && err.status === 503) {
            // backend offline — fall through to storeError banner
          }
          setStoreError(true)
        }
      } finally {
        if (!cancelled) setLoadingStore(false)
      }
    }

    const fetchProducts = async () => {
      try {
        const result = await client.products.list({ limit: 100 })
        if (!cancelled) setProducts(result.data)
      } catch {
        if (!cancelled) setProducts([])
      } finally {
        if (!cancelled) setLoadingProducts(false)
      }
    }

    fetchStore()
    fetchProducts()

    return () => { cancelled = true }
  }, [])

  const handleCheckout = useCallback(() => {
    setCartOpen(false)
    setCheckoutOpen(true)
  }, [])

  const handleOrderComplete = useCallback(() => {
    clear()
    setCheckoutOpen(false)
  }, [clear])

  const onEstimateDelivery = useCallback(
    (payload: DeliveryEstimatePayload) => client.delivery.estimate(payload),
    []
  )

  const onValidatePromo = useCallback(
    (payload: PromoValidatePayload) => client.promo.validate(payload),
    []
  )

  const onPlaceOrder = useCallback(
    (payload: Omit<CheckoutPayload, 'storeId'>) =>
      client.orders.create({ ...payload, storeId: STORE_KEY }),
    []
  )

  // Hero images: use product images (up to 12), fallback to Unsplash
  const heroImages =
    products.length >= 3
      ? products
          .filter((p) => p.imageUrl)
          .slice(0, 12)
          .map((p) => p.imageUrl)
      : FALLBACK_IMAGES

  const storeName = storeSettings?.storeName ?? storeInfo?.storeName ?? 'Our Store'
  const storeDescription = storeSettings?.storeDescription ?? 'Curated pieces crafted for the modern lifestyle.'
  const currency = storeSettings?.currency ?? 'IDR'

  const scrollToCollection = () => {
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-store-bg">
      <Navbar
        storeName={storeName}
        logoUrl={storeInfo?.storePhotoUrl ?? storeSettings?.logoUrl}
        cartCount={cartCount}
        onCartClick={() => setCartOpen(true)}
      />

      {/* Store offline notice */}
      {storeError && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-amber-50 border border-amber-200 text-amber-800 font-sans text-xs px-4 py-2 rounded-full shadow-md">
          Store is temporarily unavailable. Showing preview mode.
        </div>
      )}

      {/* Hero Section */}
      <ArcGalleryHero
        images={heroImages}
        title={loadingStore ? 'Welcome' : storeName}
        subtitle={loadingStore ? 'Loading store...' : storeDescription}
        primaryCtaText="Shop Now"
        secondaryCtaText="Our Story"
        onPrimaryCtaClick={scrollToCollection}
        onSecondaryCtaClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
      />

      {/* Products Section */}
      <ProductGrid
        products={products}
        loading={loadingProducts}
        currency={currency}
        onAddToCart={addItem}
      />

      {/* About section (uses store description) */}
      {storeSettings?.storeDescription && (
        <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-store-primary">
          <div className="max-w-2xl mx-auto text-center">
            <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-store-bg/50 mb-4">
              About Us
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-store-bg mb-6">
              {storeName}
            </h2>
            <p className="font-sans text-base text-store-bg/70 leading-relaxed">
              {storeSettings.storeDescription}
            </p>
          </div>
        </section>
      )}

      <Footer storeName={storeName} storeSettings={storeSettings} />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        total={cartTotal}
        currency={currency}
        onUpdateQuantity={updateQty}
        onRemove={remove}
        onCheckout={handleCheckout}
      />

      {/* Checkout Modal */}
      {checkoutOpen && (
        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          items={cartItems}
          total={cartTotal}
          totalWeightGrams={cartWeightGrams}
          storeSettings={storeSettings}
          onOrderComplete={handleOrderComplete}
          onEstimateDelivery={onEstimateDelivery}
          onValidatePromo={onValidatePromo}
          onPlaceOrder={onPlaceOrder}
        />
      )}
    </div>
  )
}
