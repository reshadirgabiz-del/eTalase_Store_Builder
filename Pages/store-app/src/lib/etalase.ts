import { EtalaseClient } from 'etalase-module'

const apiUrl = import.meta.env.VITE_API_URL as string | undefined
if (!apiUrl) throw new Error('VITE_API_URL is not set. Add it to your .env file.')

// Prefer the resolved public store key (etalase_pk_*); fall back to legacy UUID path
const params = new URLSearchParams(window.location.search)
const storeKey =
  (window as any).__RESOLVED_STORE_KEY__ ||
  (window as any).__RESOLVED_STORE_ID__ ||
  params.get('store') ||
  (import.meta.env.VITE_STORE_KEY as string) ||
  ''
if (!storeKey) throw new Error('No store key. Add ?store=<publicKey> to the URL.')

export const STORE_KEY = storeKey

export const client = new EtalaseClient({
  apiUrl,
  storeKey,
  persist: true,
})
