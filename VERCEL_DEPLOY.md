# Deploying the eTalase Builder to Vercel

Step-by-step guide to deploy the builder to Vercel and serve both `builder.e-talase.com` and `store.e-talase.com` from a single deployment.

See `DEPLOYMENT.md` for the broader architecture (host-based middleware, auth model, storefront data path).

---

## What gets deployed

Only the **builder** repo. The `etalase-module` SDK is installed as a dependency at build time from GitHub (tag `v1.0.0` in `frontend/package.json`). The local NestJS `backend/` folder is dev-only and is not deployed.

```
GitHub: reshadirgabiz-del/eTalase_Store_Builder   ← Vercel deploys this
GitHub: reshadirgabiz-del/eTalase_SDK             ← Installed via npm at build time
```

---

## 1. Create the Vercel project

1. Go to https://vercel.com/new.
2. **Import Git Repository** → `reshadirgabiz-del/eTalase_Store_Builder`.
3. On the configuration page:
   - **Framework Preset:** Next.js (auto-detected).
   - **Root Directory:** click **Edit** and set to `frontend`. *(critical — the Next.js app is not at repo root)*
   - **Build Command / Install Command / Output Directory:** leave defaults.

## 2. Set environment variables

Still on the import page, expand **Environment Variables** and add each row below. Apply to **Production**; also add to **Preview** and **Development** if you want preview deploys to work.

| Name | Value |
|---|---|
| `SUPABASE_URL` | `https://<builder-project>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | rotated `sb_secret_...` for the builder project |
| `ETALASE_SOURCE_SUPABASE_URL` | `https://<platform-project>.supabase.co` |
| `ETALASE_SOURCE_SUPABASE_SERVICE_ROLE_KEY` | rotated `sb_secret_...` for the platform project |
| `BUILDER_SESSION_SECRET` | fresh 64-hex string (see below) |
| `NEXT_PUBLIC_ETALASE_API_URL` | `https://api.e-talase.com` |
| `NEXT_PUBLIC_BUILDER_HOST` | `builder.e-talase.com` |
| `NEXT_PUBLIC_STORE_HOST` | `store.e-talase.com` |
| `NEXT_PUBLIC_STOREFRONT_BASE_URL` | `https://store.e-talase.com` |

Generate `BUILDER_SESSION_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Notes:
- Service role keys must be server-only — Vercel masks them and never exposes them to the browser. Only variables prefixed `NEXT_PUBLIC_` are sent to client bundles.
- Do **not** reuse the dev `BUILDER_SESSION_SECRET` value.

Click **Deploy**. First build typically takes 2–4 minutes (longer than subsequent builds because npm has to clone the SDK and run its `prepare` script).

## 3. Add both custom domains

New Vercel project → **Settings → Domains**:

1. Add `builder.e-talase.com`. Vercel shows a CNAME target like `cname.vercel-dns.com`.
2. Add `store.e-talase.com` (same project, same deployment).
3. In your DNS provider (Cloudflare/Namecheap/etc.):
   ```
   builder   CNAME   cname.vercel-dns.com.
   store     CNAME   cname.vercel-dns.com.
   ```
4. Wait for DNS to propagate (usually < 5 min). Vercel auto-issues TLS certs.

## 4. Register both domains in the eTalase platform dashboard

For every merchant store, add both `builder.e-talase.com` and `store.e-talase.com` to the verified-domains list — otherwise the SDK throws "domain not authorized" the moment a real user visits.

## 5. Smoke-test

Hit each URL and confirm the expected response:

| URL | Expected |
|---|---|
| `https://builder.e-talase.com/` | builder UI + login modal |
| `https://store.e-talase.com/` | 404 |
| `https://store.e-talase.com/<published-alias>` | storefront renders |
| `https://store.e-talase.com/docs` | redirects to builder host |
| `https://builder.e-talase.com/<alias>` | redirects to store host |
| `https://builder.e-talase.com/random-path` | 404 |

If `store.e-talase.com/` shows the builder UI instead of 404, middleware didn't deploy. Check Vercel's build logs for a "Middleware compiled" line and confirm `frontend/middleware.ts` exists with a `middleware` export.

---

## Workflows after deploy

### Updating the SDK

1. In the SDK repo, make changes on `main` (or merge a branch into `main`).
2. Tag a new version:
   ```bash
   cd "<path-to>/eTalase Module"
   git tag v1.0.1
   git push origin v1.0.1
   ```
3. In the builder repo, bump the version in `frontend/package.json`:
   ```json
   "etalase-module": "github:reshadirgabiz-del/eTalase_SDK#v1.0.1"
   ```
4. Refresh the lockfile:
   ```bash
   cd frontend
   npm install
   ```
5. Commit `package.json` + `package-lock.json` and push. Vercel auto-deploys.

### Local SDK development

The GitHub install pins to a tag, which is slow for tight iteration. Use `npm link` to symlink the local SDK into the builder while developing:

```bash
# in the SDK repo
cd "<path-to>/eTalase Module"
npm link

# in the builder repo
cd "<path-to>/eTalase Builder/frontend"
npm link etalase-module
```

Builder now uses your local SDK — changes are picked up without commits/tags/installs. When done:

```bash
cd "<path-to>/eTalase Builder/frontend"
npm unlink etalase-module
npm install   # re-installs the pinned GitHub tag
```

### If the SDK repo becomes private

`github:` URLs work for public repos out of the box. For private:

1. Create a fine-grained GitHub personal access token with read-only **Contents** access scoped to `eTalase_SDK`.
2. In Vercel: **Project Settings → Environment Variables** → add `GITHUB_TOKEN` with the token value.
3. Add `frontend/.npmrc`:
   ```
   //github.com/:_authToken=${GITHUB_TOKEN}
   ```
4. Change the dep URL in `frontend/package.json`:
   ```json
   "etalase-module": "git+https://github.com/reshadirgabiz-del/eTalase_SDK.git#v1.0.0"
   ```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Vercel build fails with `Could not resolve "./http"` or similar from the SDK | The tag in `package.json` points at a commit that doesn't build | Tag a fresh, working SDK commit and bump the ref |
| `npm install` keeps installing stale SDK contents after you moved a tag | Local npm cache | `npm cache clean --force` then `rm -rf node_modules package-lock.json && npm install` |
| `store.e-talase.com/` shows builder UI instead of 404 | Middleware not detected | Confirm `frontend/middleware.ts` exists with `export function middleware(...)` and `export const config = { matcher: ... }` |
| "Domain not authorized" error on visit | Domain not registered against the merchant's store in the eTalase platform dashboard | Add both `builder.e-talase.com` and `store.e-talase.com` to the merchant's verified-domains list |
| First request to `/api/auth/session` returns 500 | Missing `BUILDER_SESSION_SECRET` or one of the Supabase env vars | Verify env vars in Vercel project settings; redeploy after any env change |
