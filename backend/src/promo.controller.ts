import { Controller, Post, Body } from '@nestjs/common';

@Controller('promo-codes')
export class PromoController {
  @Post('validate')
  validate(@Body() body: { code?: string; subtotal?: number }) {
    const code = (body.code ?? '').toUpperCase();

    if (code === 'DEMO10') {
      return {
        valid: true,
        code,
        discountType: 'percentage',
        discountValue: 10,
        discountAmount: Math.round((body.subtotal ?? 0) * 0.1),
        message: 'Promo DEMO10 berhasil digunakan!',
      };
    }

    return {
      valid: false,
      code,
      message: 'Kode promo tidak valid atau sudah kedaluwarsa.',
    };
  }
}
