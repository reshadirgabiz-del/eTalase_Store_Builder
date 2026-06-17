import { useState, useEffect, useCallback } from 'react'
import type { Product, ProductVariant } from 'etalase-module'
import { client } from '@/lib/etalase'

export function useCart() {
  const [items, setItems] = useState(() => client.cart.getItems())

  useEffect(() => {
    const sync = () => setItems(client.cart.getItems())
    client.cart.subscribe(sync)
    return () => client.cart.unsubscribe(sync)
  }, [])

  const addItem = useCallback((product: Product, variant?: ProductVariant) => {
    client.cart.addItem(product, 1, variant)
  }, [])

  const updateQty = useCallback((key: string, qty: number) => {
    client.cart.updateQuantity(key, qty)
  }, [])

  const remove = useCallback((key: string) => {
    client.cart.removeItem(key)
  }, [])

  const clear = useCallback(() => {
    client.cart.clear()
  }, [])

  const toCheckout = useCallback(() => {
    return client.cart.toCheckoutItems()
  }, [])

  return {
    items,
    count: items.reduce((s, i) => s + i.quantity, 0),
    total: client.cart.getTotal(),
    weightGrams: client.cart.getTotalWeightGrams(),
    addItem,
    updateQty,
    remove,
    clear,
    toCheckout,
  }
}
