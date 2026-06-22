import { Controller, Get, Query, Headers, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly supabase: SupabaseService) {}

  @Get('public')
  async getPublic(
    @Query('storeId') storeId?: string,
    @Headers('x-etalase-store-key') headerKey?: string,
  ) {
    const key = storeId || headerKey;
    if (!key) throw new BadRequestException('storeId query param or x-etalase-store-key header required');

    const resolvedId = await this.supabase.resolveStoreId(key);
    if (!resolvedId) throw new NotFoundException('Store not found');

    const { data } = await this.supabase.client
      .from('settings')
      .select('*')
      .eq('store_id', resolvedId)
      .maybeSingle();

    if (!data) throw new NotFoundException('Settings not found');

    return {
      storeName: data.store_name ?? '',
      storeDescription: data.store_description ?? '',
      logoUrl: data.logo_url ?? data.store_logo ?? '',
      originAddress: data.origin_address ?? '',
      hideLocation: data.hide_location ?? false,
      midtransEnabled: !!(data.midtrans_server_key && data.midtrans_client_key),
      bankTransferEnabled: data.bank_transfer_enabled ?? false,
      bankTransferText: data.bank_transfer_text ?? '',
      bankAccountNumber: data.bank_account_number ?? '',
      bankRecipientName: data.bank_recipient_name ?? '',
      bankName: data.bank_name ?? '',
      currency: data.currency ?? 'IDR',
      flatRateDeliveryEnabled: data.flat_rate_delivery_enabled ?? false,
      flatRateDeliveryPrice: data.flat_rate_delivery_price ?? 0,
      flatRateDeliveryName: data.flat_rate_delivery_name ?? '',
      socialLinks: (data.social_links ?? []) as { platform: string; url: string }[],
    };
  }
}
