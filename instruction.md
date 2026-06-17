# eTalase Builder — How to Create a Store Page

## Prerequisites

- Node.js 18+
- Store ID from your [eTalase merchant dashboard](https://e-talase.com) → Settings → Store ID
- This repo cloned and dependencies installed (`npm install` at root, `npm install` inside `Pages/store-app/`)

---

## Step 1 — Run the local server

```bash
npm run dev
```

Opens at `http://localhost:3000`. Keep this running while you work.

---

## Step 2 — Register the store

```bash
npm run add-store <storeId>
# example:
npm run add-store d0909d76-bd7a-4584-853c-aa432788b223
```

This fetches the store name from the eTalase API and registers the store with an encrypted access token. The command:

1. Reads `KEY_SECRET` from the root `.env` file (never committed — see below)
2. Generates a **cryptographic token** from the store ID using HMAC-SHA256 (not guessable)
3. Encrypts the store UUID in the page HTML (the UUID is not visible in plain text)
4. Adds an entry to `stores.json` with the token
5. Injects the token map into both `Pages/store-app/index.html` and `Pages/store-app/dist/index.html`

**The public URL uses the token, not the UUID:**

```
?store=77700b5d13c9badd0025648a
```

- Someone who knows the UUID cannot derive the token
- The token cannot be guessed (96 bits of entropy from HMAC-SHA256)
- The encrypted UUID in the HTML is unreadable without `KEY_SECRET`

### KEY_SECRET — first-time setup

The root `.env` file holds your secret and is **never committed** (it's in `.gitignore`):

```
KEY_SECRET=9f3f0f5139a8fc8ea2432694df7fdae7b766fc2291b11f32a6416d56e59b77d9
```

> If you clone this repo on a new machine, you must copy `.env` to the new machine manually. Without it, `npm run add-store` will fail and existing tokens cannot be regenerated.

Refresh the browser — the store card appears in the gallery immediately.

---

## Step 3 — Preview the store page

On the store card, click **Open Store**. The page loads live data from the eTalase API: store name, description, and product catalogue.

> If the page shows "Store is temporarily unavailable", the store ID may be inactive or the API is unreachable. Check the eTalase dashboard.

---

## Step 4 — Edit text (no rebuild needed)

1. On the store card, click **Edit Texts**.
2. The editor opens with a live preview on the left and a sidebar on the right.
3. Hover over any text in the preview — it highlights blue. Click to select it.
4. Edit the text in the sidebar and click **Apply**.
5. Use **Save Draft** to keep changes in your browser session.

---

## Step 5 — Change the color scheme (no rebuild needed)

1. In the editor, click the **Colors** tab in the sidebar.
2. Pick a preset theme (Rose, Lavender, Ocean, Forest, Amber, Dark), or use the custom color pickers for Background, Text, Accent, and Border.
3. The preview updates instantly.

---

## Step 6 — Publish to the main app

> **Why this step exists:** Save Draft stores changes only in your browser (`localStorage`). Visitors to your deployed site see the unmodified page until you publish. Publish bakes the changes into a file that gets deployed with the site.

1. When your edits are ready, click **Publish** (top-right of the editor).
2. This calls the local dev server and writes your text + color overrides to:
   ```
   Pages/store-app/dist/overrides/<storeId>.json
   ```
3. Commit and push that file:
   ```bash
   git add Pages/store-app/dist/overrides/
   git commit -m "publish: <store name> — text + color updates"
   git push
   ```
4. Netlify / Vercel auto-deploys. All visitors now see the published version.

> **Publish requires `npm run dev` to be running.** The button POSTs to the local Vite server which writes the file. If the server is not running you'll see an error toast.

On the deployed site the store page loads overrides from the published file automatically — no localStorage, no browser dependency.

---

## Step 7 — Deep design changes (Claude Code)

For layout changes, a new hero section, or anything beyond text and color:

1. Fill in the form on the main builder page (`http://localhost:3000`):
   - **Store ID** — the same ID used in Step 2
   - **Hero Section Prompt** — describe the hero design, or paste a prompt from [21st.dev](https://21st.dev)
   - **Reference Website** — a store whose design you want to draw from (optional)
   - **Additional Notes** — anything else (fonts, tone, sections to add)
2. Click **Copy to Claude** and paste it into this Claude Code terminal.
3. Claude modifies the React source in `Pages/store-app/src/` and rebuilds the app.
4. Commit everything and push:
   ```bash
   git add Pages/store-app/dist/ Pages/store-app/src/
   git commit -m "design: update store page"
   git push
   ```

---

## Step 8 — Register and deploy a new store (your own hosting)

```bash
npm run add-store <storeId>      # fetches name, generates encrypted token
git add stores.json Pages/store-app/index.html Pages/store-app/dist/index.html
git commit -m "store: add <store name>"
git push
```

The token is printed at the end of the command output. Share `?store=<token>` with the store owner — only someone who has run `add-store` knows the token.

---

## Step 9 — Deploy to e-talase.com (eTalase subdomain hosting)

eTalase can host the store page at a subdomain (e.g. `yourstore.e-talase.com`). The deployable artifact is only `Pages/store-app/dist/` — not the whole builder project.

### 9a — Finish and publish your edits first

Complete Steps 4–6. Click **Publish** in the editor so text and color overrides are written to `Pages/store-app/dist/overrides/<storeId>.json`. These are included in the upload.

### 9b — Build the production artifact for this store

```bash
npm run deploy:prepare <storeId>
# example:
npm run deploy:prepare d0909d76-bd7a-4584-853c-aa432788b223
```

This sets `VITE_STORE_ID` in the `.env` to the given store ID and runs a clean production build. The output is in:

```
Pages/store-app/dist/
  index.html
  assets/
  overrides/
    <storeId>.json   ← your published text + color overrides
```

The page uses `VITE_STORE_ID` as the default store, so it works at the root URL of the subdomain without needing `?store=` in the address.

### 9c — Upload to eTalase hosting

1. Go to your **eTalase merchant dashboard** → **Storefront** (or Hosting / Custom Page).
2. Upload the **contents** of `Pages/store-app/dist/` — the `index.html`, `assets/` folder, and `overrides/` folder.
3. eTalase publishes the page at your subdomain.

> The exact upload UI depends on what eTalase provides (zip upload, file manager, git integration). Check the eTalase dashboard for the current method.

### 9d — Re-deploying after changes

| Change type | Steps to redo |
|-------------|--------------|
| Text or color edit | Steps 4–6 (Publish) → 9b → 9c |
| New products / store info | No action — page fetches live from eTalase API |
| Layout / component redesign | Steps 6 (Claude) → 9b → 9c |

---

## Summary — which steps need what

| Task                              | Action                            | `npm run dev`? | Rebuild? | Where deployed |
|-----------------------------------|-----------------------------------|----------------|----------|----------------|
| Add a store to the builder        | `npm run add-store <id>`          | No             | No       | Your hosting (`stores.json`) |
| Edit text / colors                | Editor → Text or Colors tab       | Yes            | No       | Draft only (browser) |
| Publish edits to your hosting     | Editor → **Publish** → `git push` | Yes            | No       | Your hosting (`dist/overrides/`) |
| Deploy to eTalase subdomain       | `npm run deploy:prepare <id>` → upload `dist/` | No | Yes | e-talase.com |
| Redesign hero / layout            | Copy to Claude → terminal         | Yes            | Yes      | Both |
