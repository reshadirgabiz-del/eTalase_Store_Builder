import { Controller, Get, Param, Headers, NotFoundException } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Controller('stores')
export class StoresController {
  constructor(private readonly supabase: SupabaseService) {}

  @Get(':storeKey/public')
  async getPublic(
    @Param('storeKey') storeKey: string,
    @Headers('x-etalase-store-key') headerKey?: string,
  ) {
    const key = headerKey || storeKey;
    const storeId = await this.supabase.resolveStoreId(key);
    if (!storeId) throw new NotFoundException('Store not found');

    const { data } = await this.supabase.client
      .from('stores')
      .select('name, logo_url, public_store_key')
      .eq('id', storeId)
      .maybeSingle();

    if (!data) throw new NotFoundException('Store not found');

    return {
      storeName: data.name ?? '',
      storePhotoUrl: data.logo_url ?? null,
      publicKey: data.public_store_key ?? null,
    };
  }
}
