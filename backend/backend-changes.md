# Backend changes the SDK still needs

The SDK now normalizes both snake_case and camelCase, and maps the backend's
current product fields (`compareAtPrice`, `weight`, root-level `category`) into
the canonical `Product` shape. One thing it **cannot** work around in the
client: missing image URLs.

## Required: product image URLs

### Current response

`GET /products?storeId=…` returns image entries with only an ID:

```json
"images": [
  { "id": "10837688-afb6-47db-8cdd-a476648b36f5", "alt": null, "position": 0 }
]
```

There is no resolvable URL on the entry, no top-level `image_url` on the
product, and no public image-serving endpoint (we probed
`/images/:id`, `/uploads/:id`, `/products/:id/images/:id`, `/files/:id`,
`/media/:id`, `/v1/images/:id`, `/product-images/:id`, etc. — all 404).

The R2 bucket `pub-1bc67b98c9144ef4940ff6e4c0f94cee.r2.dev` returned by
`storePhotoUrl` doesn't accept the raw image UUID with `.webp`/`.jpg`/`.png`
extensions either, so the client can't build the URL itself.

### Needed

Add a resolvable URL to every image entry returned by the public product
endpoints. Either of these two shapes works with the SDK as-is:

**Option A (preferred — matches `storePhotoUrl`):**

```json
"images": [
  {
    "id": "10837688-afb6-47db-8cdd-a476648b36f5",
    "url": "https://pub-1bc67b98c9144ef4940ff6e4c0f94cee.r2.dev/uploads/10837688-afb6-47db-8cdd-a476648b36f5.webp",
    "alt": null,
    "position": 0
  }
]
```

The SDK accepts `url`, `imageUrl`, `image_url`, or `src` on each image entry.

**Option B (also fine):**

Add a top-level field on the product itself:

```json
{
  "id": "…",
  "name": "…",
  "imageUrl": "https://…/uploads/….webp",
  "images": [ … ]
}
```

The SDK accepts `imageUrl`, `image_url`, `thumbnailUrl`, or `thumbnail_url` at
the product root.

### Affected endpoints

- `GET /products?storeId=…`
- `GET /products/:id`

## Nice to have (not required)

These are non-blocking — the SDK fills sensible defaults for now:

| Field returned                    | SDK expects                       | Current SDK fallback              |
| --------------------------------- | --------------------------------- | --------------------------------- |
| `compareAtPrice`                  | `discountedPrice`                 | Mapped automatically              |
| `weight` (null on most products)  | `weightGrams`                     | Defaults to 500g                  |
| `category` (string, separate from `tags`) | included in `tags[]`      | Promoted into `tags` automatically |
| `subtitle` missing                | `subtitle`                        | Falls back to `description`       |
| Settings: `storeLogo`             | `logoUrl`                         | Aliased in SDK                    |
| Settings: no `originAddress`, no `flatRateDelivery*`, no `bankTransfer*` | required for shipping & checkout flows | Empty strings / `false` — checkout will not work until added |

The checkout/delivery flows (`/delivery/estimate`, `/orders`, `/promo-codes/validate`)
need real values for the delivery/payment settings before the cart sidebar and
checkout page can be wired up.
