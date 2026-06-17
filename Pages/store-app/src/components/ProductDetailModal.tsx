import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Product, ProductVariant } from 'etalase-module'
import { formatPrice } from '@/lib/utils'

interface ProductDetailModalProps {
  product: Product
  currency: string
  onClose: () => void
  onAddToCart: (product: Product, variant?: ProductVariant) => void
}

export default function ProductDetailModal({ product, currency, onClose, onAddToCart }: ProductDetailModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.length ? product.variants[0] : null
  )
  const [imgIdx, setImgIdx] = useState(0)

  const images = product.images?.length
    ? product.images.map((img) => img.imageUrl)
    : [product.imageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop']

  const activeVariant = selectedVariant
  const price = activeVariant
    ? (activeVariant.discountedPrice ?? activeVariant.price)
    : (product.discountedPrice ?? product.price)
  const originalPrice = activeVariant ? activeVariant.price : product.price
  const hasDiscount = price < originalPrice
  const isOutOfStock = activeVariant ? activeVariant.stock === 0 : product.stock === 0

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-store-primary/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-store-card rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-store-bg hover:bg-store-border transition-colors duration-150 cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="grid md:grid-cols-2">
            {/* Image carousel */}
            <div className="relative aspect-square bg-store-bg rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none overflow-hidden">
              <img
                src={images[imgIdx]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop'
                }}
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-store-bg/80 rounded-full cursor-pointer hover:bg-store-bg transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-store-bg/80 rounded-full cursor-pointer hover:bg-store-bg transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIdx(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${i === imgIdx ? 'bg-store-text w-4' : 'bg-store-muted'}`}
                        aria-label={`Image ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Details */}
            <div className="p-6 flex flex-col gap-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-store-text leading-tight">{product.name}</h2>
                {product.subtitle && (
                  <p className="mt-1 font-sans text-sm text-store-muted">{product.subtitle}</p>
                )}
              </div>

              <div className="flex items-baseline gap-3">
                <span className="font-serif text-2xl font-semibold text-store-text">
                  {formatPrice(price, currency)}
                </span>
                {hasDiscount && (
                  <span className="font-sans text-sm text-store-muted line-through">
                    {formatPrice(originalPrice, currency)}
                  </span>
                )}
              </div>

              {product.description && (
                <p className="font-sans text-sm text-store-muted leading-relaxed line-clamp-4">
                  {product.description}
                </p>
              )}

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div>
                  <p className="font-sans text-xs font-semibold tracking-widest uppercase text-store-muted mb-2">
                    Variant
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-sans font-medium transition-all duration-150 cursor-pointer ${
                          selectedVariant?.id === v.id
                            ? 'border-store-primary bg-store-primary text-store-bg'
                            : 'border-store-border text-store-text hover:border-store-muted'
                        } ${v.stock === 0 ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
                        disabled={v.stock === 0}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock info */}
              {!isOutOfStock && (product.variants?.length ? selectedVariant!.stock : product.stock) <= 5 && (
                <p className="font-sans text-xs text-store-accent font-medium">
                  Only {product.variants?.length ? selectedVariant!.stock : product.stock} left in stock
                </p>
              )}

              <button
                onClick={() => {
                  if (!isOutOfStock) {
                    onAddToCart(product, selectedVariant ?? undefined)
                  }
                }}
                disabled={isOutOfStock}
                className="mt-auto flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-full bg-store-primary text-store-bg font-sans font-medium text-sm tracking-widest uppercase hover:bg-store-secondary transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={16} />
                {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
