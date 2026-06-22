# Preferred Next.js Storefront Template Architecture

Use this architecture when building a standalone Next.js storefront app that may later be converted into an approved eTalase Builder template.

## Core Principle

Build the storefront as one prop-driven UI renderer, not as a route-dependent app.

The app can still have normal Next.js routes for standalone development, but the core storefront experience should live in reusable components that can be copied into the builder and rendered from props.

## Recommended Structure

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

## Main Renderer

Create one top-level storefront component with a shape close to this:

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

This component should decide which page view to show:

```tsx
export function StorefrontTemplate(props: StorefrontTemplateProps) {
  if (props.page === "catalogue") {
    return <CataloguePage {...props} />;
  }

  if (props.page === "product") {
    return <ProductPage {...props} />;
  }

  return <HomePage {...props} />;
}
```

## Data Rules

The template should receive data through props:

- Store name
- Logo URL
- Store settings
- Products
- Currency
- Editable text config
- Hidden section config
- Current page state
- Navigation callback

Avoid fetching backend data inside visual components. Backend/API calls can exist in the standalone app shell for local development, but the template renderer itself should stay data-driven.

## Page Model

Support these core views:

- `home`
- `catalogue`
- `product`

Do not make the core UI depend on standalone Next.js route files like:

```txt
app/products/[id]/page.tsx
app/catalogue/page.tsx
```

Those routes are fine for standalone development, but they should only wrap or call reusable components.

## Styling Rules

Scope all template styles under a wrapper class:

```tsx
<div className="storefront-modern">
  ...
</div>
```

Then write CSS like:

```css
.storefront-modern {
  background: var(--background);
  color: var(--foreground);
}

.storefront-modern .product-card {
  background: var(--card);
  border-color: var(--border);
}
```

Avoid broad global selectors such as:

```css
button { ... }
section { ... }
h1 { ... }
.card { ... }
```

## Theme Variables

Prefer the existing builder theme variables:

```txt
--font-body
--font-heading
--background
--foreground
--card
--card-foreground
--primary
--primary-strong
--primary-foreground
--secondary
--secondary-foreground
--muted
--muted-foreground
--accent
--accent-foreground
--border
--ring
```

Use these instead of hardcoding colors throughout the app.

## Cart And Checkout

Keep cart state local to the storefront renderer or a child component.

Checkout should stay compatible with the existing eTalase flow:

- Cart items should contain product IDs and quantities.
- Checkout should use the store ID/public key available through props.
- Do not introduce a separate checkout backend unless explicitly required.

## Demo Data

Demo data is useful for standalone development, but keep it separate from the renderer:

```txt
src/lib/demo-storefront-data.ts
```

Do not hardcode demo products directly inside visual components.

## Avoid

- Hardcoded products, prices, store names, or categories inside template components.
- Backend calls inside presentational components.
- Required dependence on standalone Next.js route files.
- Unscoped global CSS.
- Checkout behavior that bypasses the eTalase checkout pattern.
- Layout code that assumes only one fixed screen size.

## Prefer

- One exported storefront renderer.
- Small presentational child components.
- Data passed through props.
- CSS scoped under one wrapper class.
- Theme values from CSS variables.
- Responsive layouts with explicit constraints.
- Demo fixtures separated from production rendering.

