import { Controller, Get, Param, Query, Headers, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

const DEFAULT_PRODUCT_IMAGE_BASE_URL = 'https://pub-1bc67b98c9144ef4940ff6e4c0f94cee.r2.dev/uploads';

function getProductImageBaseUrl() {
  return (process.env.PRODUCT_IMAGE_BASE_URL ?? DEFAULT_PRODUCT_IMAGE_BASE_URL).replace(/\/+$/, '');
}

function buildImageUrl(img: any) {
  const existingUrl = img.image_url ?? img.imageUrl ?? img.url ?? img.src ?? null;
  if (existingUrl) return existingUrl;

  const path = img.storage_path ?? img.path ?? img.key ?? null;
  if (path) {
    if (/^https?:\/\//i.test(path)) return path;
    return `${getProductImageBaseUrl()}/${String(path).replace(/^\/+/, '')}`;
  }

  return img.id ? `${getProductImageBaseUrl()}/${img.id}.webp` : null;
}

function serializeProduct(row: any) {
  const images = (row.product_images ?? [])
    .slice()
    .sort((a: any, b: any) => (a.sort_order ?? a.position ?? 0) - (b.sort_order ?? b.position ?? 0))
    .map((img: any) => {
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
  const thumbnail = images.find((img: any) => img.isThumbnail) ?? images[0];

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
    variants: (row.product_variants ?? []).map((v: any) => ({
      id: v.id,
      name: v.name,
      options: v.options ?? [],
      price: v.price ?? null,
      stock: v.stock ?? null,
      sku: v.sku ?? null,
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

@Controller('products')
export class ProductsController {
  constructor(private readonly supabase: SupabaseService) {}

  @Get()
  async list(
    @Query('storeId') storeId?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Headers('x-etalase-store-key') headerKey?: string,
  ) {
    const key = storeId || headerKey;
    if (!key) throw new BadRequestException('storeId query param or x-etalase-store-key header required');

    const resolvedId = await this.supabase.resolveStoreId(key);
    if (!resolvedId) throw new NotFoundException('Store not found');

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 10), 10);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    const { data, count } = await this.supabase.client
      .from('products')
      .select('*, product_images(*), product_variants(*)', { count: 'exact' })
      .eq('store_id', resolvedId)
      .eq('is_active', true)
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .range(from, to);

    const items = (data ?? []).map(serializeProduct);

    return {
      data: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limitNum),
      },
    };
  }

  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @Headers('x-etalase-store-key') headerKey?: string,
  ) {
    const { data } = await this.supabase.client
      .from('products')
      .select('*, product_images(*), product_variants(*)')
      .eq('id', id)
      .eq('is_active', true)
      .eq('is_archived', false)
      .maybeSingle();

    if (!data) throw new NotFoundException('Product not found');
    return serializeProduct(data);
  }
}
