# Deployment Guide

This guide deploys the **eTalase Builder** as a single Next.js app served on two subdomains:

| Subdomain | Role |
|---|---|
| `builder.e-talase.com` | Merchant-facing builder UI: pick template, edit theme/texts, publish |
| `store.e-talase.com/<alias>` | Public storefront rendered from a published config |

The same Next.js bundle handles both — host-based middleware (`frontend/middleware.ts`, exporting `middleware`) routes requests so the builder UI is unreachable on `store.e-talase.com`.

Store info, settings, and products are fetched at runtime from the production eTalase API via the `etalase-module` SDK (default `https://api.e-talase.com`). The builder DB only holds two tables: `builder_owners` (auth) and `storefront_publications` (alias → publication config).

---

## 1. Prerequisites

- A Supabase project for the builder DB (separate from the eTalase platform DB).
- A platform-owned eTalase store. The platform admin must issue both a `etalase_pk_live_...` public key and a `etalase_sk_live_...` secret key per merchant.
- DNS control over `e-talase.com`.
- A hosting target that runs Next.js with middleware (Vercel, Cloudflare Pages with Next runtime, Fly, or a Node host).

---

## 2. Database

Run `database/schema.sql` against the builder Supabase project. It creates:

- `storefront_publications` — alias → `(store_id, public_store_key, theme, texts, hidden, ...)`
- `builder_owners` — `(store_id, public_store_key, secret_key_hash)` for write auth

### Seed an owner row

When onboarding a merchant, hash their secret key with scrypt and insert:

```js
// scripts/hash-secret.mjs — run with: node scripts/hash-secret.mjs etalase_sk_live_xxx
import { scrypt, randomBytes } from "node:crypto";
import { promisify } from "node:util";
const scryptAsync = promisify(scrypt);

const secret = process.argv[2];
const salt = randomBytes(16);
const derived = await scryptAsync(secret, salt, 32);
console.log(`scrypt$${salt.toString("hex")}$${derived.toString("hex")}`);
```

```sql
insert into public.builder_owners (store_id, public_store_key, secret_key_hash)
values (
  '<merchant-uuid>',
  'etalase_pk_live_...',
  'scrypt$<saltHex>$<derivedHex>'
);
```

The builder app never writes this table — the platform onboarding flow does.

---

## 3. Environment variables

Create `frontend/.env.production` (or set in your host's env panel):

```bash
# Builder DB (Supabase) — service role, server-only
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# eTalase platform/source DB (Supabase) — service role, server-only.
# This is the separate Supabase project that owns public.stores.
ETALASE_SOURCE_SUPABASE_URL=https://<platform-project>.supabase.co
ETALASE_SOURCE_SUPABASE_SERVICE_ROLE_KEY=<platform-service-role-key>

# Session signing — generate once and never rotate without invalidating sessions
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
BUILDER_SESSION_SECRET=<64-hex-chars>

# Public storefront URL base (used to build full custom_store_uri values)
NEXT_PUBLIC_STOREFRONT_BASE_URL=https://store.e-talase.com

# Host routing for middleware
NEXT_PUBLIC_BUILDER_HOST=builder.e-talase.com
NEXT_PUBLIC_STORE_HOST=store.e-talase.com

# eTalase production API for the SDK (omit to use the SDK default)
NEXT_PUBLIC_ETALASE_API_URL=https://api.e-talase.com
```

**Never commit `.env.production`.** Supabase service role keys and `BUILDER_SESSION_SECRET` must stay server-side.

---

## 4. Build and deploy

```bash
cd frontend
npm ci
npm run build
npm run start   # or hand off to your host's start command
```

### DNS

Point both subdomains at the same deployment:

```
builder.e-talase.com.   CNAME   <your-app-host>
store.e-talase.com.     CNAME   <your-app-host>
```

Both subdomains need TLS certs (Let's Encrypt via your host).

### Verify

- `https://builder.e-talase.com/` → builder UI, login modal opens.
- `https://store.e-talase.com/` → 404 (builder UI is blocked).
- `https://store.e-talase.com/<published-alias>` → storefront renders.
- `https://store.e-talase.com/docs` → redirects to `https://builder.e-talase.com/docs`.
- `https://builder.e-talase.com/<published-alias>` → redirects to `https://store.e-talase.com/<alias>` (builder host serves only builder UI).
- `https://builder.e-talase.com/anything-else` → 404.

---

## 5. Operational notes

### Auth model

- Login: merchant enters public key + secret key in the bootstrap modal. The server validates the secret against `builder_owners.secret_key_hash` (scrypt + timing-safe compare) and sets `etalase_builder_session`, an httpOnly, `SameSite=Lax`, signed cookie scoped to the builder host.
- Publish: `POST /api/stores/custom-uri` requires the session cookie and rejects unless `session.storeId === resolveOwnerStoreId(body.storeId)`. Public keys alone cannot write.
- Logout: `DELETE /api/auth/session` clears the cookie. The cookie also auto-expires after 8 hours.

### Storefront data path

- The storefront page at `store.e-talase.com/<alias>` calls `GET /api/stores/custom-uri?alias=<alias>` (the only API route allowed on the store host) to resolve `<alias>` → `public_store_key`, then uses `etalase-module` directly from the browser to fetch store info, settings, and products from `api.e-talase.com`. The browser never holds the service role key or secret key.

### Domain registration with eTalase platform

Per `CLAUDE.md`, custom domains must be verified in the eTalase dashboard before SDK calls succeed. Register both `builder.e-talase.com` and `store.e-talase.com` against every merchant's store, otherwise `EtalaseClient` requests will fail with `UNAUTHORIZED_DOMAIN_MESSAGE`.

### Rotating `BUILDER_SESSION_SECRET`

Rotating the secret invalidates all active sessions — merchants will be redirected to the login modal on their next action. Plan rotations during low-traffic windows.

### Backups

Back up the builder Supabase project on the same schedule as the eTalase platform DB. Losing `storefront_publications` means every published alias goes 404 until merchants re-publish.
