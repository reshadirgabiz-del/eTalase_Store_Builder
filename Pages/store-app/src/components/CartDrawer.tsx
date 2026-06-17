import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import type { CartItem } from 'etalase-module'
import { formatPrice, getProductKey } from '@/lib/utils'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  total: number
  currency: string
  onUpdateQuantity: (key: string, qty: number) => void
  onRemove: (key: string) => void
  onCheckout: () => void
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  total,
  currency,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}: CartDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-store-primary/30 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-store-bg shadow-2xl flex flex-col"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-store-border">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-store-text" />
                <h2 className="font-serif text-xl font-semibold text-store-text">Your Cart</h2>
                {items.length > 0 && (
                  <span className="font-sans text-xs font-semibold bg-store-accent text-white px-2 py-0.5 rounded-full">
                    {items.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Close cart"
                className="p-2 rounded-full hover:bg-store-border transition-colors duration-150 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
                  <ShoppingBag size={48} className="text-store-border" />
                  <p className="font-serif text-lg text-store-muted">Your cart is empty</p>
                  <p className="font-sans text-sm text-store-muted">Add some products to get started</p>
                  <button
                    onClick={onClose}
                    className="mt-2 px-6 py-2.5 rounded-full border border-store-border text-sm font-sans font-medium tracking-wider uppercase hover:bg-store-border transition-colors duration-150 cursor-pointer"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => {
                    const key = getProductKey(item.product.id, item.variant?.id)
                    const unitPrice = item.variant
                      ? (item.variant.discountedPrice ?? item.variant.price)
                      : (item.product.discountedPrice ?? item.product.price)
                    const imgSrc = item.product.imageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=200&auto=format&fit=crop'

                    return (
                      <motion.li
                        key={key}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex gap-4 py-4 border-b border-store-border last:border-0"
                      >
                        <img
                          src={imgSrc}
                          alt={item.product.name}
                          className="w-20 h-20 rounded-xl object-cover bg-store-border flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=200&auto=format&fit=crop'
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-sm font-medium text-store-text truncate">{item.product.name}</p>
                          {item.variant && (
                            <p className="font-sans text-xs text-store-muted mt-0.5">{item.variant.name}</p>
                          )}
                          <p className="font-serif text-sm font-semibold text-store-text mt-1">
                            {formatPrice(unitPrice * item.quantity, currency)}
                          </p>

                          {/* Quantity controls */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => onUpdateQuantity(key, item.quantity - 1)}
                              aria-label="Decrease quantity"
                              className="w-7 h-7 rounded-full border border-store-border flex items-center justify-center hover:bg-store-border transition-colors cursor-pointer"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="font-sans text-sm font-medium w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(key, item.quantity + 1)}
                              aria-label="Increase quantity"
                              className="w-7 h-7 rounded-full border border-store-border flex items-center justify-center hover:bg-store-border transition-colors cursor-pointer"
                            >
                              <Plus size={12} />
                            </button>
                            <button
                              onClick={() => onRemove(key)}
                              aria-label="Remove item"
                              className="ml-auto p-1.5 rounded-full text-store-muted hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-store-border px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm font-medium text-store-muted">Subtotal</span>
                  <span className="font-serif text-lg font-semibold text-store-text">{formatPrice(total, currency)}</span>
                </div>
                <p className="font-sans text-xs text-store-muted">Shipping calculated at checkout</p>
                <button
                  onClick={onCheckout}
                  className="w-full py-3.5 rounded-full bg-store-primary text-store-bg font-sans font-semibold text-sm tracking-widest uppercase hover:bg-store-secondary transition-colors duration-200 cursor-pointer"
                >
                  Checkout
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
