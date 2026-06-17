## About this project
Master builder at `index.html`. All generated store pages share a single React/Vite app at `Pages/store-app/`. The store ID is passed via `?store=<id>` at runtime — no new build is needed when adding a new store.

## Architecture
- `index.html` — master builder (pure HTML/JS). Fetches store list from `stores.json` at runtime.
- `stores.json` — store registry. Add entries here to register new stores.
- `add-store.js` — CLI to add a store without Claude: `node add-store.js <storeId>`
- `Pages/store-app/` — shared React/Vite app. One build serves any store via `?store=<storeId>`.
- `./../eTalase Module/` — merchant backend SDK (aliased in vite.config.ts).

## Adding a new store (Claude's task when user provides a Store ID)
1. Use the eTalase Module to fetch the store name for the given store ID.
2. Add ONE entry to `stores.json`:
   `{ "storeId": "<id>", "name": "<fetched name>", "publicKey": "<etalase_pk_live_…>", "date": "YYYY-MM-DD" }`
   - `publicKey` is the merchant's public store key (`etalase_pk_live_…` format) — safe to store here, it's public.
   - If the user did not supply a public key, set `"publicKey": null` and note it needs to be filled in from the eTalase dashboard → Settings → API Keys.
3. Done — no new folder, no build, no change to index.html.

## Public store key rules
- The `publicKey` (`etalase_pk_live_…`) is safe in frontend/client code.
- Never store service-role keys, admin tokens, or payment secret keys in this repo.
- The store-app uses `publicKey` as the `storeKey` for ETalaseProvider.
- Custom domains must be verified in the eTalase dashboard before production API calls from that domain work.
- `example.com` and `www.example.com` are separate origins — register both if needed.

## Tech stack
- Module: Reference to './../eTalase Module/', this is to connect the webpage to the merchant backend
- Skills: Use UI/UX Pro Max skill, Framer skill for animation if necessary

## User inputs
- Hero page (optional): User may add prompt from 21st Dev for the hero section
- Reference page (optional): User may provide reference website
- Store page: User must provide store id from eTalase platform

## Flow
- When starting, collect necessary information from user including store ID
- Fetch store info from eTalase Module using the store ID
- Add entry to stores.json