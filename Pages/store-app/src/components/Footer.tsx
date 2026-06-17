import { Instagram, MessageCircle, Globe } from 'lucide-react'
import type { PublicSettings } from 'etalase-module'

interface FooterProps {
  storeName: string
  storeSettings: PublicSettings | null
}

const PLATFORM_ICONS: Record<string, typeof Instagram> = {
  instagram: Instagram,
  whatsapp: MessageCircle,
  website: Globe,
}

export default function Footer({ storeName, storeSettings }: FooterProps) {
  const year = new Date().getFullYear()
  const socialLinks = storeSettings?.socialLinks ?? []

  return (
    <footer className="bg-store-primary text-store-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl font-semibold mb-3">{storeName}</h3>
            {storeSettings?.storeDescription && (
              <p className="font-sans text-sm text-store-bg/60 leading-relaxed max-w-xs">
                {storeSettings.storeDescription}
              </p>
            )}
            {socialLinks.length > 0 && (
              <div className="flex gap-3 mt-5">
                {socialLinks.map((link) => {
                  const platform = link.platform.toLowerCase()
                  const Icon = PLATFORM_ICONS[platform] ?? Globe
                  return (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.platform}
                      className="w-9 h-9 rounded-full border border-store-bg/20 flex items-center justify-center hover:bg-store-bg/10 transition-colors cursor-pointer"
                    >
                      <Icon size={16} className="text-store-bg/70" />
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div>
            <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-store-bg/50 mb-4">Explore</p>
            <nav className="flex flex-col gap-3">
              {['Collection', 'About Us', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '')}`}
                  className="font-sans text-sm text-store-bg/70 hover:text-store-bg transition-colors cursor-pointer"
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>

          {/* Info */}
          <div>
            <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-store-bg/50 mb-4">Information</p>
            <div className="flex flex-col gap-2">
              {storeSettings?.bankTransferEnabled && (
                <p className="font-sans text-sm text-store-bg/70">Bank Transfer accepted</p>
              )}
              {storeSettings?.midtransEnabled && (
                <p className="font-sans text-sm text-store-bg/70">Online payment via Midtrans</p>
              )}
              {storeSettings?.flatRateDeliveryEnabled && (
                <p className="font-sans text-sm text-store-bg/70">
                  Flat rate shipping: {storeSettings.flatRateDeliveryName}
                </p>
              )}
              {!storeSettings && (
                <p className="font-sans text-sm text-store-bg/50">Loading store info...</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-store-bg/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-xs text-store-bg/40">
            © {year} {storeName}. All rights reserved.
          </p>
          <p className="font-sans text-xs text-store-bg/40">
            Powered by{' '}
            <span className="text-store-bg/60 font-medium">eTalase</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
