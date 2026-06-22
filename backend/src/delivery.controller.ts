import { Controller, Post, Body, Headers } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

interface DeliveryOption {
  courierId: string;
  courierName: string;
  courierCode: string;
  serviceName: string;
  serviceType: string;
  price: number;
  estimatedDays: string;
}

const COURIER_OPTIONS: DeliveryOption[] = [
  {
    courierId: 'jne-reg',
    courierName: 'JNE',
    courierCode: 'jne',
    serviceName: 'Reguler (2-3 hari)',
    serviceType: 'REG',
    price: 15000,
    estimatedDays: '2-3',
  },
  {
    courierId: 'jne-yes',
    courierName: 'JNE',
    courierCode: 'jne',
    serviceName: 'Yakin Esok Sampai',
    serviceType: 'YES',
    price: 35000,
    estimatedDays: '1',
  },
  {
    courierId: 'sicepat-best',
    courierName: 'SiCepat',
    courierCode: 'sicepat',
    serviceName: 'SiCepat BEST (2-3 hari)',
    serviceType: 'BEST',
    price: 13000,
    estimatedDays: '2-3',
  },
];

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly supabase: SupabaseService) {}

  @Post('estimate')
  async estimate(
    @Body() body: { storeId?: string },
    @Headers('x-etalase-store-key') headerKey?: string,
  ): Promise<DeliveryOption[]> {
    const options: DeliveryOption[] = [];

    const key = body?.storeId || headerKey;
    if (key) {
      const resolvedId = await this.supabase.resolveStoreId(key);
      if (resolvedId) {
        const { data } = await this.supabase.client
          .from('settings')
          .select('flat_rate_delivery_enabled, flat_rate_delivery_price, flat_rate_delivery_name')
          .eq('store_id', resolvedId)
          .maybeSingle();

        if (data?.flat_rate_delivery_enabled) {
          const name = data.flat_rate_delivery_name || 'Flat rate delivery';
          options.push({
            courierId: 'flat-rate',
            courierName: name,
            courierCode: 'flat_rate',
            serviceName: name,
            serviceType: 'flat-rate',
            price: data.flat_rate_delivery_price ?? 0,
            estimatedDays: '-',
          });
        }
      }
    }

    options.push(...COURIER_OPTIONS);
    return options;
  }
}
