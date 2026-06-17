#!/usr/bin/env node
/**
 * Prepare a production build for a single store to deploy to eTalase hosting.
 * Usage: node deploy-prepare.js <storeId>
 *
 * What it does:
 *  1. Updates Pages/store-app/.env with the given store ID
 *  2. Runs the production build
 *  3. The output at Pages/store-app/dist/ is the upload artifact
 */
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const storeId = process.argv[2]
if (!storeId) {
  console.error('Usage: node deploy-prepare.js <storeId>')
  process.exit(1)
}

const __dir = dirname(fileURLToPath(import.meta.url))

// Update VITE_STORE_ID in Pages/store-app/.env
const envPath = resolve(__dir, 'Pages/store-app/.env')
let env = readFileSync(envPath, 'utf8')
if (/^VITE_STORE_ID=/m.test(env)) {
  env = env.replace(/^VITE_STORE_ID=.*/m, `VITE_STORE_ID=${storeId}`)
} else {
  env += `\nVITE_STORE_ID=${storeId}\n`
}
writeFileSync(envPath, env)
console.log(`✓ Set VITE_STORE_ID=${storeId}`)

// Build
console.log('Building store app...\n')
execSync('npm run build --prefix Pages/store-app', { stdio: 'inherit' })

console.log('\n✓ Artifact ready at: Pages/store-app/dist/')
console.log('  Upload the contents of that folder to eTalase hosting.')
console.log(`  The page will work at your subdomain without ?store= in the URL.`)
