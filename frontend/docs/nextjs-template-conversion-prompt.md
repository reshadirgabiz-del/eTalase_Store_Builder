# Next.js Storefront Template Conversion Prompt

Use this prompt when asking Codex to convert a standalone Next.js storefront app into an approved eTalase Builder template.

## Prompt

I have a standalone Next.js storefront app that I want converted into an eTalase Builder approved template.

Please inspect the app at:

```txt
PASTE_SOURCE_APP_PATH_HERE
```

Then convert it into this builder repo as a new selectable template.

Follow the existing builder architecture:

- Register the template in `lib/templates.ts` with a new `TemplateId`.
- Create a dedicated template renderer component inside `app/components/`.
- Keep the renderer data-driven. It must receive store info, settings, products, text config, hidden section config, currency, page state, and navigation callbacks through props.
- Do not make the template depend on its own standalone Next.js routes at runtime.
- Reuse the current eTalase data shape from `app/components/storefront-preview.tsx` where possible.
- Support the same core published pages: home, catalogue, and product detail.
- Preserve cart and checkout behavior compatible with the existing storefront flow.
- Make theme colors and fonts work through the existing `buildThemeStyle` CSS variables unless there is a clear reason to extend them.
- Scope CSS so the new template does not break the existing `storefront-classic` template.
- Update the builder editor, preview modal, and published storefront route so they render the correct template based on `templateId`.
- Ensure publish still stores `templateId`, `theme`, `texts`, and `hidden`.
- Run the appropriate build/type/lint checks available in this repo and report any remaining issues.

If the source app uses incompatible assumptions, explain the required changes and make the closest practical conversion.

## Recommended Source App Architecture

For easiest conversion, build the standalone Next.js app with this structure:

```txt
src/
  components/
    storefront/
      StorefrontTemplate.tsx
      StoreHeader.tsx
      HomePage.tsx
      CataloguePage.tsx
      ProductPage.tsx
      CartDrawer.tsx
      ProductCard.tsx
  lib/
    storefront-data.ts
    storefront-format.ts
  styles/
    storefront-template.css
```

The most important rule: keep the UI as a prop-driven storefront component, not as logic scattered across routes.

Good top-level component shape:

```tsx
type StorefrontTemplateProps = {
  storeName: string;
  logoUrl: string;
  storeId?: string;
  settings: Settings | null;
  products: Product[];
  texts: TextConfig;
  hidden: HiddenConfig;
  currency: string;
  page: "home" | "catalogue" | "product";
  onNavigate: (page: "home" | "catalogue" | "product") => void;
};
```

Avoid these in the source app:

- Hardcoded products, store names, prices, or category data outside demo fixtures.
- Direct dependency on route files such as `app/products/[id]/page.tsx` for the core UI.
- Backend calls inside visual components.
- Template-specific global CSS selectors like `button`, `section`, `h1`, or `.card` without a wrapper namespace.
- Checkout flows that bypass the existing eTalase checkout URL pattern.

Prefer these:

- One exported storefront renderer.
- Small presentational components.
- Product/store data passed through props.
- CSS scoped under a wrapper class, for example `.storefront-modern`.
- Theme usage through CSS variables such as `--primary`, `--background`, `--foreground`, `--card`, `--accent`, and `--border`.
- Demo data kept separate from the renderer.

## Conversion Checklist

1. Inspect the standalone app structure and identify reusable UI components.
2. Extract the storefront renderer into this builder repo.
3. Map source app data requirements to the existing eTalase product/settings types.
4. Add the new template id and metadata.
5. Add a template renderer switch used by builder preview and published storefront pages.
6. Wire home, catalogue, and product page states.
7. Wire cart and checkout.
8. Scope or migrate CSS.
9. Verify responsive layout.
10. Run available checks.

