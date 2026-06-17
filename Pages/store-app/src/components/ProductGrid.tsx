import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import type { Product } from 'etalase-module'
import ProductCard from './ProductCard'
import ProductDetailModal from './ProductDetailModal'

interface ProductGridProps {
  products: Product[]
  loading: boolean
  currency: string
  onAddToCart: (product: Product) => void
}

function SkeletonCard() {
  return (
    <div className="bg-store-card rounded-2xl overflow-hidden border border-store-border animate-pulse">
      <div className="aspect-square bg-store-border" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-store-border rounded w-3/4" />
        <div className="h-3 bg-store-border rounded w-1/2" />
        <div className="h-5 bg-store-border rounded w-1/3 mt-2" />
      </div>
    </div>
  )
}

export default function ProductGrid({ products, loading, currency, onAddToCart }: ProductGridProps) {
  const [query, setQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const filtered = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
          p.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase())),
      )
    : products

  return (
    <section id="collection" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-store-accent mb-3">
          Our Collection
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-store-text">
          Explore All Products
        </h2>
        <div className="mt-4 mx-auto w-16 h-px bg-store-accent" />
      </motion.div>

      {/* Search */}
      {!loading && products.length > 6 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 max-w-md mx-auto relative"
        >
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-store-muted" />
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-store-card border border-store-border rounded-full font-sans text-sm text-store-text placeholder:text-store-muted focus:outline-none focus:ring-2 focus:ring-store-accent/30 focus:border-store-accent transition-all duration-200"
          />
        </motion.div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-serif text-2xl text-store-muted mb-3">
            {query ? 'No results found' : 'No products yet'}
          </p>
          <p className="font-sans text-sm text-store-muted">
            {query ? `Try a different search term` : 'Check back soon for new arrivals'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              currency={currency}
              onAddToCart={onAddToCart}
              onViewDetail={setSelectedProduct}
            />
          ))}
        </div>
      )}

      {/* Product detail modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          currency={currency}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(p) => {
            onAddToCart(p)
            setSelectedProduct(null)
          }}
        />
      )}
    </section>
  )
}
