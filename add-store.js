#!/usr/bin/env node
import { EtalaseClient } from '../eTalase Module/dist/index.mjs'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createHmac } from 'crypto'

const storeId   = process.argv[2]
const publicKey = process.argv[3] || null   // optional: etalase_pk_live_…
if (!storeId) {
  console.error('Usage: node add-store.js <storeId> [publicKey]')
  process.exit(1)
}
if (publicKey && !/^etalase_pk_/.test(publicKey)) {
  console.error('publicKey must start with etalase_pk_ (e.g. etalase_pk_live_…)')
  process.exit(1)
}

const __dir = dirname(fileURLToPath(import.meta.url))

// Load KEY_SECRET from root .env (never committed)
function loadKeySecret() {
  const envPath = resolve(__dir, '.env')
  if (!existsSync(envPath)) {
    console.error('Missing .env with KEY_SECRET. Run: npm run setup-keys')
    process.exit(1)
  }
  const env = readFileSync(envPath, 'utf8')
  const match = env.match(/^KEY_SECRET=([0-9a-f]+)$/m)
  if (!match) {
    console.error('.env is missing KEY_SECRET=<hex64>. Run: npm run setup-keys')
    process.exit(1)
  }
  return match[1]
}

// HMAC-SHA256 of storeId with secret → 24 hex chars (96 bits, not guessable)
function makeToken(id, keyHex) {
  return createHmac('sha256', Buffer.from(keyHex, 'hex')).update(id).digest('hex').slice(0, 24)
}

// XOR-encrypt a UTF-8 string with a hex key → hex ciphertext
function xorEncrypt(str, keyHex) {
  const key = Buffer.from(keyHex, 'hex')
  const buf = Buffer.from(str, 'utf8')
  return Buffer.from(buf.map((b, i) => b ^ key[i % key.length])).toString('hex')
}

// Generate URL-safe slug from store name (kept in stores.json for admin reference only)
function slugify(str) {
  return str.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-')
}

const KEY_SECRET = loadKeySecret()

// Fetch store name from eTalase API (Node.js — no CORS)
let name = storeId
try {
  const client = new EtalaseClient({ apiUrl: 'https://api.e-talase.com', storeKey: storeId })
  const [infoResult, settingsResult] = await Promise.allSettled([
    client.store.getInfo(),
    client.store.getSettings(),
  ])
  name =
    settingsResult.value?.storeName ||
    infoResult.value?.storeName ||
    storeId
  console.log(`Fetched store name: "${name}"`)
} catch (err) {
  console.warn(`Could not fetch store name: ${err.message}`)
  console.warn(`Using store ID as name. You can edit stores.json manually.`)
}

const key   = slugify(name)
const token = makeToken(storeId, KEY_SECRET)
const encryptedId = xorEncrypt(storeId, KEY_SECRET)

// Read + update stores.json
const storesPath = resolve(__dir, 'stores.json')
let stores = []
try { stores = JSON.parse(readFileSync(storesPath, 'utf8')) } catch {}

if (stores.find(s => s.storeId === storeId)) {
  console.log(`Store "${storeId}" already exists in stores.json — nothing changed.`)
  process.exit(0)
}

stores.push({ storeId, name, key, token, publicKey, date: new Date().toISOString().slice(0, 10) })
writeFileSync(storesPath, JSON.stringify(stores, null, 2) + '\n')
console.log(`✓ Added "${name}" (token: ${token}) to stores.json`)
if (publicKey) console.log(`  Public key: ${publicKey}`)
else console.log(`  ⚠  No public key provided. Get it from eTalase dashboard → Settings → API Keys and add it to stores.json manually.`)

// Inject updated keys map and secret into both index.html files
injectIntoHtml(stores, KEY_SECRET)

console.log(`\n✓ Store URL: ?store=${token}`)
console.log(`\nNext: commit and push`)
console.log(`  git add stores.json Pages/store-app/index.html Pages/store-app/dist/index.html`)
console.log(`  git commit -m "store: add ${name}"`)
console.log(`  git push`)

function injectIntoHtml(allStores, keyHex) {
  // Build map of { token -> encryptedUuid }
  const keysMap = Object.fromEntries(
    allStores.filter(s => s.token).map(s => [s.token, xorEncrypt(s.storeId, keyHex)])
  )
  const keysJson = JSON.stringify(keysMap)

  const htmlFiles = [
    resolve(__dir, 'Pages/store-app/index.html'),
    resolve(__dir, 'Pages/store-app/dist/index.html'),
  ]

  for (const htmlPath of htmlFiles) {
    if (!existsSync(htmlPath)) continue
    let html = readFileSync(htmlPath, 'utf8')
    let changed = false

    if (/\/\* __STORE_KEYS_START__ \*\//.test(html)) {
      html = html.replace(
        /\/\* __STORE_KEYS_START__ \*\/.*?\/\* __STORE_KEYS_END__ \*\//,
        `/* __STORE_KEYS_START__ */window.__STORE_KEYS__=${keysJson}/* __STORE_KEYS_END__ */`
      )
      changed = true
    }
    if (/\/\* __STORE_SECRET_START__ \*\//.test(html)) {
      html = html.replace(
        /\/\* __STORE_SECRET_START__ \*\/.*?\/\* __STORE_SECRET_END__ \*\//,
        `/* __STORE_SECRET_START__ */var __SK='${keyHex}'/* __STORE_SECRET_END__ */`
      )
      changed = true
    }

    if (changed) {
      writeFileSync(htmlPath, html)
      console.log(`✓ Injected into ${htmlPath.replace(__dir + '/', '')}`)
    } else {
      console.warn(`  ⚠ No markers found in ${htmlPath.replace(__dir + '/', '')} — skipping`)
    }
  }
}
