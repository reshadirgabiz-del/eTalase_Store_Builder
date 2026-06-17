import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Menu, X } from 'lucide-react'

interface NavbarProps {
  storeName: string
  logoUrl?: string
  cartCount: number
  onCartClick: () => void
}

export default function Navbar({ storeName, logoUrl, cartCount, onCartClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-store-bg/95 backdrop-blur-md shadow-sm border-b border-store-border'
          : 'bg-transparent'
      }`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 cursor-pointer">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="h-8 w-auto object-contain" />
            ) : (
              <span className="font-serif text-xl sm:text-2xl font-semibold text-store-text tracking-wide">
                {storeName || 'Store'}
              </span>
            )}
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {['Collection', 'About', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="font-sans text-sm font-medium text-store-muted hover:text-store-text tracking-wider uppercase transition-colors duration-200 cursor-pointer"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Cart + Mobile toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={onCartClick}
              aria-label={`Cart (${cartCount} items)`}
              className="relative p-2.5 rounded-full hover:bg-store-border transition-colors duration-200 cursor-pointer"
            >
              <ShoppingBag size={20} className="text-store-text" />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-store-accent text-white text-xs font-sans font-bold w-5 h-5 flex items-center justify-center rounded-full"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </motion.span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              className="md:hidden p-2.5 rounded-full hover:bg-store-border transition-colors duration-200 cursor-pointer"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-store-bg border-t border-store-border"
        >
          <nav className="flex flex-col px-6 py-4 gap-4">
            {['Collection', 'About', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMobileOpen(false)}
                className="font-sans text-sm font-medium text-store-muted hover:text-store-text tracking-wider uppercase transition-colors duration-200 cursor-pointer py-2"
              >
                {item}
              </a>
            ))}
          </nav>
        </motion.div>
      )}
    </motion.header>
  )
}
