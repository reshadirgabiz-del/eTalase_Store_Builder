# eTalase Builder Frontend

Next.js master builder for creating storefront pages from approved templates.

## Local development

1. Copy `.env.example` to `.env` and set `SUPABASE_URL` plus `SUPABASE_SERVICE_ROLE_KEY`.
2. Run `npm install`.
3. Run `npm run dev`.

## Pages

- `/` opens the template selection page and requires a public store key before the page can be used.
- `/docs` embeds the SDK documentation from `../eTalase Module/docs/index.html`.
- Selecting the Storefront Classic template opens a full-screen editable preview based on `../Storepage test/my-app`.

The editor preview supports section selection, text editing, section hiding, color scheme changes, draft save, publish action capture, and preview mode through the bottom-right floating action menu.

The API routes are server-only and mirror the local NestJS backend endpoints:

- `GET /api/stores/:storeId/public`
- `GET /api/settings/public?storeId=`
- `GET /api/products?storeId=&limit=10`

The approved template source is `../Storepage test/my-app`; generated storefronts should keep using `etalase-module` from `../eTalase Module`.
