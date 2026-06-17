import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Truck, CreditCard, CheckCircle, Tag, Loader2, ExternalLink, Copy } from 'lucide-react'
import { EtalaseApiError } from 'etalase-module'
import type {
  CartItem,
  Address,
  DeliveryOption,
  Order,
  PublicSettings,
  DeliveryEstimatePayload,
  PromoValidatePayload,
  PromoValidationResult,
  CheckoutPayload,
} from 'etalase-module'
import { formatPrice, getProductKey } from '@/lib/utils'

type Step = 'address' | 'delivery' | 'payment' | 'confirmation'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  total: number
  totalWeightGrams: number
  storeSettings: PublicSettings | null
  onOrderComplete: () => void
  onEstimateDelivery: (payload: DeliveryEstimatePayload) => Promise<DeliveryOption[]>
  onValidatePromo: (payload: PromoValidatePayload) => Promise<PromoValidationResult>
  onPlaceOrder: (payload: Omit<CheckoutPayload, 'storeId'>) => Promise<Order>
}

const STEPS: Step[] = ['address', 'delivery', 'payment', 'confirmation']
const STEP_LABELS: Record<Step, string> = {
  address: 'Shipping',
  delivery: 'Delivery',
  payment: 'Payment',
  confirmation: 'Confirmed',
}
const STEP_ICONS: Record<Step, typeof MapPin> = {
  address: MapPin,
  delivery: Truck,
  payment: CreditCard,
  confirmation: CheckCircle,
}

const emptyAddress: Address = {
  recipientName: '',
  phone: '',
  street: '',
  city: '',
  province: '',
  postalCode: '',
  notes: '',
}

export default function CheckoutModal({
  isOpen,
  onClose,
  items,
  total,
  totalWeightGrams,
  storeSettings,
  onOrderComplete,
  onEstimateDelivery,
  onValidatePromo,
  onPlaceOrder,
}: CheckoutModalProps) {
  const [step, setStep] = useState<Step>('address')
  const [address, setAddress] = useState<Address>(emptyAddress)
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([])
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOption | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'midtrans' | 'bank_transfer'>('bank_transfer')
  const [promoInput, setPromoInput] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoError, setPromoError] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedField, setCopiedField] = useState('')

  const currency = storeSettings?.currency ?? 'IDR'

  const stepIndex = STEPS.indexOf(step)

  const handleAddressNext = async () => {
    const required: (keyof Address)[] = ['recipientName', 'phone', 'street', 'city', 'province', 'postalCode']
    const missing = required.find((k) => !address[k]?.trim())
    if (missing) {
      setError(`Please fill in: ${missing.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
      return
    }
    setError('')
    setLoading(true)
    try {
      const options = await onEstimateDelivery({
        destinationAddress: `${address.city}, ${address.province}`,
        totalWeightGrams: totalWeightGrams || 500,
      })
      setDeliveryOptions(options)
      setSelectedDelivery(options[0] ?? null)
      setStep('delivery')
    } catch (err) {
      // If delivery API fails, allow flat-rate if enabled
      if (storeSettings?.flatRateDeliveryEnabled) {
        setDeliveryOptions([])
        setSelectedDelivery({
          courierId: 'flat',
          courierName: storeSettings.flatRateDeliveryName,
          courierCode: 'flat',
          serviceName: storeSettings.flatRateDeliveryName,
          serviceType: 'flat',
          price: storeSettings.flatRateDeliveryPrice,
          estimatedDays: '2-5',
        })
        setStep('delivery')
      } else {
        if (err instanceof EtalaseApiError && err.status === 503) {
          setError('Delivery service is currently offline. Please try again later.')
        } else {
          setError('Failed to fetch delivery options. Please try again.')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return
    setLoading(true)
    setPromoError('')
    try {
      const result = await onValidatePromo({
        codes: [promoInput.trim()],
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        deliveryPrice: selectedDelivery?.price ?? 0,
      })
      if (result.valid.length > 0) {
        setPromoDiscount(result.totalDiscount)
        setPromoError('')
      } else {
        setPromoError(result.invalid[0]?.reason ?? 'Invalid promo code')
        setPromoDiscount(0)
      }
    } catch (err) {
      if (err instanceof EtalaseApiError) {
        if (err.status === 422) setPromoError('Invalid promo code or conditions not met.')
        else if (err.status === 503) setPromoError('Promo service is temporarily unavailable.')
        else setPromoError('Failed to validate promo code.')
      } else {
        setPromoError('Failed to validate promo code.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedDelivery) return
    setLoading(true)
    setError('')
    try {
      const placed = await onPlaceOrder({
        items: items.map((i) => ({
          productId: i.product.id,
          ...(i.variant ? { variantId: i.variant.id } : {}),
          quantity: i.quantity,
        })),
        address,
        deliveryOption: selectedDelivery,
        promoCodes: promoInput && promoDiscount > 0 ? [promoInput.trim()] : [],
        paymentMethod,
      })
      setOrder(placed)
      setStep('confirmation')
      if (placed.midtransRedirectUrl && paymentMethod === 'midtrans') {
        window.open(placed.midtransRedirectUrl, '_blank', 'noopener')
      }
      onOrderComplete()
    } catch (err) {
      if (err instanceof EtalaseApiError) {
        if (err.status === 422) setError('Order data is invalid. Please review your details.')
        else if (err.status === 503) setError('Our store is temporarily offline. Please try again in a moment.')
        else if (err.status === 429) setError('Too many requests. Please wait a moment and try again.')
        else setError(err.message || 'Failed to place order. Please try again.')
      } else {
        setError('Failed to place order. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field)
      setTimeout(() => setCopiedField(''), 2000)
    })
  }

  const grandTotal = total + (selectedDelivery?.price ?? 0) - promoDiscount

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={step !== 'confirmation' ? onClose : undefined}
          className="absolute inset-0 bg-store-primary/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-store-bg rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-store-bg px-6 pt-6 pb-4 border-b border-store-border z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-semibold text-store-text">Checkout</h2>
              {step !== 'confirmation' && (
                <button
                  onClick={onClose}
                  aria-label="Close checkout"
                  className="p-2 rounded-full hover:bg-store-border transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Step indicators */}
            <div className="flex items-center gap-0">
              {STEPS.slice(0, -1).map((s, i) => {
                const Icon = STEP_ICONS[s]
                const isActive = s === step
                const isDone = stepIndex > i
                return (
                  <div key={s} className="flex items-center flex-1">
                    <div className={`flex flex-col items-center gap-1 flex-shrink-0 ${i < STEPS.length - 2 ? 'flex-1' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDone ? 'bg-store-accent text-white' : isActive ? 'bg-store-primary text-store-bg' : 'bg-store-border text-store-muted'}`}>
                        <Icon size={14} />
                      </div>
                      <span className={`font-sans text-xs font-medium ${isActive ? 'text-store-text' : 'text-store-muted'}`}>
                        {STEP_LABELS[s]}
                      </span>
                    </div>
                    {i < 2 && <div className={`flex-1 h-px mx-1 mb-4 ${isDone ? 'bg-store-accent' : 'bg-store-border'}`} />}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="px-6 py-5">
            {/* Error banner */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-sans text-sm">
                {error}
              </div>
            )}

            {/* STEP: ADDRESS */}
            {step === 'address' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-3"
              >
                {[
                  { key: 'recipientName', label: 'Full Name', placeholder: 'Recipient name' },
                  { key: 'phone', label: 'Phone Number', placeholder: '+62 8xx xxxx xxxx', type: 'tel' },
                  { key: 'street', label: 'Street Address', placeholder: 'Jl. Contoh No. 1' },
                  { key: 'city', label: 'City', placeholder: 'Jakarta' },
                  { key: 'province', label: 'Province', placeholder: 'DKI Jakarta' },
                  { key: 'postalCode', label: 'Postal Code', placeholder: '10110', type: 'text' },
                  { key: 'notes', label: 'Notes (Optional)', placeholder: 'Delivery notes...', optional: true },
                ].map(({ key, label, placeholder, type, optional }) => (
                  <div key={key}>
                    <label className="font-sans text-xs font-semibold tracking-wider uppercase text-store-muted mb-1 block">
                      {label}
                    </label>
                    <input
                      type={type ?? 'text'}
                      value={(address as unknown as Record<string, string>)[key] ?? ''}
                      onChange={(e) => setAddress((prev) => ({ ...prev, [key]: e.target.value }))}
                      placeholder={placeholder}
                      required={!optional}
                      className="w-full px-4 py-2.5 bg-store-card border border-store-border rounded-xl font-sans text-sm text-store-text placeholder:text-store-muted focus:outline-none focus:ring-2 focus:ring-store-accent/30 focus:border-store-accent transition-all"
                    />
                  </div>
                ))}

                <button
                  onClick={handleAddressNext}
                  disabled={loading}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-full bg-store-primary text-store-bg font-sans font-semibold text-sm tracking-widest uppercase hover:bg-store-secondary transition-colors cursor-pointer disabled:opacity-60"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Next: Delivery'}
                </button>
              </motion.div>
            )}

            {/* STEP: DELIVERY */}
            {step === 'delivery' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                <p className="font-sans text-sm text-store-muted mb-4">Select your preferred delivery option</p>

                {deliveryOptions.length === 0 && selectedDelivery ? (
                  <div className="p-4 rounded-xl border-2 border-store-primary bg-store-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-sans text-sm font-semibold text-store-text">{selectedDelivery.serviceName}</p>
                        <p className="font-sans text-xs text-store-muted mt-0.5">{selectedDelivery.estimatedDays} days</p>
                      </div>
                      <span className="font-serif text-base font-semibold text-store-text">
                        {formatPrice(selectedDelivery.price, currency)}
                      </span>
                    </div>
                  </div>
                ) : (
                  deliveryOptions.map((opt) => (
                    <label
                      key={`${opt.courierId}-${opt.serviceType}`}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedDelivery?.courierId === opt.courierId && selectedDelivery?.serviceType === opt.serviceType
                          ? 'border-store-primary bg-store-card'
                          : 'border-store-border hover:border-store-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="delivery"
                          checked={selectedDelivery?.courierId === opt.courierId && selectedDelivery?.serviceType === opt.serviceType}
                          onChange={() => setSelectedDelivery(opt)}
                          className="accent-store-primary"
                        />
                        <div>
                          <p className="font-sans text-sm font-semibold text-store-text">{opt.courierName} — {opt.serviceName}</p>
                          <p className="font-sans text-xs text-store-muted">{opt.estimatedDays} working days</p>
                        </div>
                      </div>
                      <span className="font-serif text-base font-semibold text-store-text">
                        {formatPrice(opt.price, currency)}
                      </span>
                    </label>
                  ))
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setStep('address')}
                    className="flex-1 py-3 rounded-full border border-store-border font-sans font-medium text-sm tracking-wider uppercase hover:bg-store-border transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => { if (selectedDelivery) setStep('payment') }}
                    disabled={!selectedDelivery}
                    className="flex-1 py-3 rounded-full bg-store-primary text-store-bg font-sans font-semibold text-sm tracking-wider uppercase hover:bg-store-secondary transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Next: Payment
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP: PAYMENT */}
            {step === 'payment' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                {/* Order summary */}
                <div className="bg-store-card rounded-2xl p-4 space-y-2 border border-store-border">
                  <p className="font-sans text-xs font-semibold tracking-widest uppercase text-store-muted mb-3">Order Summary</p>
                  {items.slice(0, 3).map((item) => {
                    const key = getProductKey(item.product.id, item.variant?.id)
                    const unitPrice = item.variant
                      ? (item.variant.discountedPrice ?? item.variant.price)
                      : (item.product.discountedPrice ?? item.product.price)
                    return (
                      <div key={key} className="flex justify-between text-sm font-sans">
                        <span className="text-store-muted truncate flex-1 mr-2">
                          {item.product.name} {item.variant ? `(${item.variant.name})` : ''} ×{item.quantity}
                        </span>
                        <span className="text-store-text flex-shrink-0">{formatPrice(unitPrice * item.quantity, currency)}</span>
                      </div>
                    )
                  })}
                  {items.length > 3 && (
                    <p className="text-xs text-store-muted font-sans">+{items.length - 3} more items</p>
                  )}
                  <div className="pt-2 border-t border-store-border space-y-1">
                    <div className="flex justify-between text-sm font-sans">
                      <span className="text-store-muted">Subtotal</span>
                      <span>{formatPrice(total, currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-sans">
                      <span className="text-store-muted">Delivery ({selectedDelivery?.serviceName})</span>
                      <span>{formatPrice(selectedDelivery?.price ?? 0, currency)}</span>
                    </div>
                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-sm font-sans text-store-accent">
                        <span>Promo discount</span>
                        <span>-{formatPrice(promoDiscount, currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-serif text-base font-semibold text-store-text pt-1 border-t border-store-border">
                      <span>Total</span>
                      <span>{formatPrice(grandTotal, currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Promo code */}
                <div>
                  <label className="font-sans text-xs font-semibold tracking-widest uppercase text-store-muted mb-1.5 block">
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-store-muted" />
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); setPromoDiscount(0) }}
                        placeholder="Enter code"
                        className="w-full pl-9 pr-3 py-2.5 bg-store-card border border-store-border rounded-xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-store-accent/30 focus:border-store-accent transition-all"
                      />
                    </div>
                    <button
                      onClick={handleApplyPromo}
                      disabled={loading || !promoInput}
                      className="px-4 py-2.5 rounded-xl border border-store-border font-sans text-sm font-medium hover:bg-store-border transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && <p className="mt-1 font-sans text-xs text-red-500">{promoError}</p>}
                  {promoDiscount > 0 && (
                    <p className="mt-1 font-sans text-xs text-store-accent font-medium">
                      Promo applied! You save {formatPrice(promoDiscount, currency)}
                    </p>
                  )}
                </div>

                {/* Payment method */}
                <div>
                  <p className="font-sans text-xs font-semibold tracking-widest uppercase text-store-muted mb-2">Payment Method</p>
                  <div className="space-y-2">
                    {storeSettings?.bankTransferEnabled !== false && (
                      <label className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'bank_transfer' ? 'border-store-primary bg-store-card' : 'border-store-border'}`}>
                        <input type="radio" name="payment" value="bank_transfer" checked={paymentMethod === 'bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} className="accent-store-primary" />
                        <div>
                          <p className="font-sans text-sm font-semibold text-store-text">Bank Transfer</p>
                          <p className="font-sans text-xs text-store-muted">Manual transfer confirmation</p>
                        </div>
                      </label>
                    )}
                    {storeSettings?.midtransEnabled && (
                      <label className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'midtrans' ? 'border-store-primary bg-store-card' : 'border-store-border'}`}>
                        <input type="radio" name="payment" value="midtrans" checked={paymentMethod === 'midtrans'} onChange={() => setPaymentMethod('midtrans')} className="accent-store-primary" />
                        <div>
                          <p className="font-sans text-sm font-semibold text-store-text">Online Payment</p>
                          <p className="font-sans text-xs text-store-muted">Card, GoPay, OVO, DANA via Midtrans</p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('delivery')}
                    className="flex-1 py-3 rounded-full border border-store-border font-sans font-medium text-sm tracking-wider uppercase hover:bg-store-border transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-store-primary text-store-bg font-sans font-semibold text-sm tracking-wider uppercase hover:bg-store-secondary transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Place Order'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP: CONFIRMATION */}
            {step === 'confirmation' && order && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-semibold text-store-text">Order Placed!</h3>
                  <p className="font-sans text-sm text-store-muted mt-1">
                    Order ID: <span className="font-mono font-semibold text-store-text">{order.id.slice(0, 8).toUpperCase()}</span>
                  </p>
                </div>

                {/* Bank transfer details */}
                {order.paymentMethod === 'bank_transfer' && order.bankDetails && (
                  <div className="bg-store-card rounded-2xl p-4 border border-store-border text-left space-y-3">
                    <p className="font-sans text-xs font-semibold tracking-widest uppercase text-store-muted">Transfer Details</p>
                    {[
                      { label: 'Bank', value: order.bankDetails.bankName },
                      { label: 'Account', value: order.bankDetails.bankAccountNumber },
                      { label: 'Recipient', value: order.bankDetails.bankRecipientName },
                      { label: 'Amount', value: formatPrice(order.total, currency) },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="font-sans text-xs text-store-muted">{label}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-sans text-sm font-semibold text-store-text">{value}</span>
                          <button
                            onClick={() => copyToClipboard(value, label)}
                            aria-label={`Copy ${label}`}
                            className="p-1 rounded hover:bg-store-border transition-colors cursor-pointer"
                          >
                            {copiedField === label ? <CheckCircle size={13} className="text-green-500" /> : <Copy size={13} className="text-store-muted" />}
                          </button>
                        </div>
                      </div>
                    ))}
                    {order.bankDetails.bankTransferText && (
                      <p className="font-sans text-xs text-store-muted pt-2 border-t border-store-border">{order.bankDetails.bankTransferText}</p>
                    )}
                  </div>
                )}

                {/* Midtrans redirect */}
                {order.paymentMethod === 'midtrans' && order.midtransRedirectUrl && (
                  <div className="space-y-3">
                    <p className="font-sans text-sm text-store-muted">Complete your payment on the payment page.</p>
                    <a
                      href={order.midtransRedirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-store-accent text-white font-sans font-semibold text-sm tracking-wider uppercase hover:bg-store-accent-dark transition-colors cursor-pointer"
                    >
                      <ExternalLink size={16} />
                      Pay Now
                    </a>
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-full border border-store-border font-sans font-medium text-sm tracking-widest uppercase hover:bg-store-border transition-colors cursor-pointer"
                >
                  Continue Shopping
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
