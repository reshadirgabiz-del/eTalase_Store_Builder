const DEFAULT_PRODUCT_IMAGE_BASE_URL =
  "https://pub-1bc67b98c9144ef4940ff6e4c0f94cee.r2.dev/uploads";

function productImageBaseUrl() {
  return (process.env.PRODUCT_IMAGE_BASE_URL ?? DEFAULT_PRODUCT_IMAGE_BASE_URL).replace(/\/+$/, "");
}

function buildImageUrl(img: Record<string, unknown>) {
  const existingUrl = img.image_url ?? img.imageUrl ?? img.url ?? img.src;
  if (typeof existingUrl === "string" && existingUrl) return existingUrl;

  const storagePath = img.storage_path ?? img.path ?? img.key;
  if (typeof storagePath === "string" && storagePath) {
    if (/^https?:\/\//i.test(storagePath)) return storagePath;
    return `${productImageBaseUrl()}/${storagePath.replace(/^\/+/, "")}`;
  }

  return typeof img.id === "string" ? `${productImageBaseUrl()}/${img.id}.webp` : null;
}

type ProductImageRow = Record<string, unknown> & {
  id?: string;
  image_url?: string | null;
  sort_order?: number | null;
  position?: number | null;
  is_thumbnail?: boolean | null;
  alt?: string | null;
};

type ProductVariantRow = Record<string, unknown> & {
  id?: string;
  name?: string;
  options?: unknown[];
  price?: number | null;
  stock?: number | null;
  sku?: string | null;
};

type ProductRow = Record<string, unknown> & {
  product_images?: ProductImageRow[] | null;
  product_variants?: ProductVariantRow[] | null;
};

export function serializeProduct(row: ProductRow) {
  const images = (row.product_images ?? [])
    .slice()
    .sort((a, b) => (a.sort_order ?? a.position ?? 0) - (b.sort_order ?? b.position ?? 0))
    .map((img) => {
      const url = buildImageUrl(img);

      return {
        id: img.id,
        url,
        imageUrl: url,
        image_url: url,
        alt: img.alt ?? null,
        position: img.position ?? img.sort_order ?? 0,
        sortOrder: img.sort_order ?? img.position ?? 0,
        isThumbnail: img.is_thumbnail ?? false,
      };
    });
  const thumbnail = images.find((img) => img.isThumbnail) ?? images[0];

  return {
    id: row.id,
    storeId: row.store_id,
    name: row.name,
    description: row.description ?? null,
    price: row.price ?? 0,
    compareAtPrice: row.compare_at_price ?? null,
    discountedPrice: row.discounted_price ?? null,
    sku: row.sku ?? null,
    stock: row.stock ?? 0,
    weight: row.weight ?? null,
    weightGrams: row.weight_grams ?? row.weight ?? null,
    category: row.category ?? null,
    tags: row.tags ?? [],
    isActive: row.is_active ?? true,
    imageUrl: thumbnail?.url ?? row.image_url ?? null,
    image_url: thumbnail?.url ?? row.image_url ?? null,
    images,
    variants: (row.product_variants ?? []).map((variant) => ({
      id: variant.id,
      name: variant.name,
      options: variant.options ?? [],
      price: variant.price ?? null,
      stock: variant.stock ?? null,
      sku: variant.sku ?? null,
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
