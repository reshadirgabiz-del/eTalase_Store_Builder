## About this project
The repo root has two top-level folders:
- `frontend/` — the Next.js builder UI + examples + API route
- `backend/` — standalone NestJS backend (runs on port 4000 for local SDK development)

Master builder at `frontend/`, is a page that allow user to create a custom webpage for the storefront. There will be several templates (each a next.js application)

## Architecture

### Local backend API routes (read-only, dev only)
These Next.js API routes mirror the Jastip Platform Backend but only expose read-only endpoints.
They use the Supabase service role key from `frontend/.env` — **never exposed to the browser**.

| Endpoint | Returns |
|---|---|
| `GET /api/stores/:storeId/public` | `{ storeName, storePhotoUrl, publicKey }` |
| `GET /api/settings/public?storeId=` | Public store settings (same shape as production) |
| `GET /api/products?storeId=&limit=10` | Up to 10 active products (demo only) |

### Standalone NestJS backend (`backend/`)
A fully independent NestJS server any frontend can point its SDK `apiUrl` at during local development.
Reads Supabase credentials from the root `.env` automatically (`../../.env` relative to `backend/src/main.ts`).


### SDK / eTalase Module
- Located at `./../eTalase Module/` (sibling repo)
- Aliased as `etalase-module` in all vite.config.ts files
- Provides `EtalaseClient`, `ETalaseProvider`, and all API helpers
- Generated pages bundle it at build time — no runtime dependency on the local backend

#### Frontend
The frontend is the interface between user and the builder. There are three main processes it covers, each on one or multiple pages independently: 
1. etalase SDK documentation for developer, exist in './../eTalase\ Module\docs\index.html'; 
2. Template selection / builder. When openned, a modal appears prompting user to input their store public key (pk_live_...); without it, the content of this page is disabled. This page is where user select the template to use (an example is './../Storepage\ test/my-app'). The page contains card with snapshot of the template, and when click, a modal appear to provide user with a preview. In the end, the user will select one template to configure its color scheme and texts (point 3). This page also have an upload input for custom application. Refer to Flow 2a and 2b below for the processing of this step.

Note for 2: I expect the template will be exactly the same as the reference page, as-if we built it here; I will use './../Storepage\ test/my-app' as a reference to evaluate this.

3. Color scheme and text editor. This page essentially a full preview of the template with user data (fetched using store public key on point 2.). The page is a full screen of the page, with hovering control button at bottom right (https://21st.dev/community/components/chetanverma16/floating-action-menu/default), to change color scheme, publish, preview, save, and other actions. User can remove component (make it hidden from the template) and change text by selecting the component in the preview page. Clicking preview from hovering control button will disable all edit capabilities until the user exit the preview mode.


## Public store key rules
- `etalase_pk_live_…` is safe in frontend/client code and in `.env` committed to this repo.
- **Never** put `SUPABASE_SERVICE_ROLE_KEY`, admin tokens, payment secret keys, or `KEY_SECRET` in frontend code or committed env files.
- The local backend `.env` (with service role key) is git-ignored.
- Custom domains must be verified in the eTalase dashboard before production API calls from that domain work.
- `example.com` and `www.example.com` are separate origins — register both if needed.

## Tech stack
- Builder: Next.js (serves `index.html` and API routes); Mantine
- SDK: `etalase-module` (`./../eTalase Module/`)
- Database: Supabase (accessed via service role key in local backend only)
- Skills: Use UI/UX Pro Max skill, Framer skill for animation if necessary

## User inputs
- Public store key and id: User may provide `etalase_pk_live_…` (or it can be auto-fetched) and store-id

## Flow
1. Collect necessary information from user (Store ID, optional public key)
2. User select an existing template, or upload a zip file containing a javascript based application.
2a. In case user uploaded an application, prompt the user that they are uploading a non-standard template that might lead to operational issues. Ask them if they already done some tests of the key features of the template before uploading.
2b. In case user uploaded an application, they will need to wait for admin to deploy the page, typically takes 1 week. Admin will also check for key feature tests before deploying. Once deployed, user will be contacted by the admin.
3. User can select color scheme and change text of the new page.
