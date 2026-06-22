import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { StoresController } from './stores.controller';
import { SettingsController } from './settings.controller';
import { ProductsController } from './products.controller';
import { DeliveryController } from './delivery.controller';
import { PromoController } from './promo.controller';
import { OrdersController } from './orders.controller';

@Module({
  controllers: [
    StoresController,
    SettingsController,
    ProductsController,
    DeliveryController,
    PromoController,
    OrdersController,
  ],
  providers: [SupabaseService],
})
export class AppModule {}
