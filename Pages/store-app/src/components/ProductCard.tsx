import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Eye } from 'lucide-react'
import type { Product } from 'etalase-module'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  currency: string
  onAddToCart: (product: Product) => void
  onViewDetail: (product: Product) => void
}

export default function ProductCard({ product, currency, onAddToCart, onViewDetail }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [adding, setAdding] = useState(false)

  const price = product.discountedPrice ?? product.price
  const hasDiscount = !!product.discountedPrice && product.discountedPrice < product.price
  const isOutOfStock = product.stock === 0

  const handleAddToCart = async () => {
    if (isOutOfStock || adding) return
    setAdding(true)
    onAddToCart(product)
    setTimeout(() => setAdding(false), 600)
  }

  const thumbnailUrl = !imageError && product.imageUrl
    ? product.imageUrl
    : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop'

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group bg-store-card rounded-2xl overflow-hidden border border-store-border hover:shadow-lg transition-shadow duration-300"
    >
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-store-bg">
        <img
          src={thumbnailUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImageError(true)}
          loading="lazy"
        />

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-store-accent text-white text-xs font-sans font-semibold px-2.5 py-1 rounded-full">
            -{Math.round(((product.price - price) / product.price) * 100)}%
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-store-bg/70 flex items-center justify-center">
            <span className="font-sans text-sm font-semibold text-store-muted tracking-widest uppercase">
              Sold Out
            </span>
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute inset-0 flex items-end justify-center pb-4 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onViewDetail(product)}
            aria-label="View details"
            className="flex items-center gap-2 px-4 py-2 bg-store-bg/95 backdrop-blur-sm text-store-text text-xs font-sans font-semibold tracking-wider uppercase rounded-full hover:bg-store-border transition-colors duration-150 cursor-pointer"
          >
            <Eye size={14} />
            Details
          </button>
          {!isOutOfStock && (
            <button
              onClick={handleAddToCart}
              aria-label="Add to cart"
              disabled={adding}
              className="flex items-center gap-2 px-4 py-2 bg-store-primary text-store-bg text-xs font-sans font-semibold tracking-wider uppercase rounded-full hover:bg-store-secondary transition-colors duration-150 cursor-pointer disabled:opacity-70"
            >
              <ShoppingBag size={14} />
              {adding ? 'Added!' : 'Add'}
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-sans text-sm font-medium text-store-text truncate leading-snug">
          {product.name}
        </h3>
        {product.subtitle && (
          <p className="mt-0.5 font-sans text-xs text-store-muted truncate">{product.subtitle}</p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <span className="font-serif text-base font-semibold text-store-text">
            {formatPrice(price, currency)}
          </span>
          {hasDiscount && (
            <span className="font-sans text-xs text-store-muted line-through">
              {formatPrice(product.price, currency)}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  )
}
