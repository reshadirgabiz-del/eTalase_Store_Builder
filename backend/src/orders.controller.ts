import { Controller, Post, Body } from '@nestjs/common';

@Controller('orders')
export class OrdersController {
  @Post()
  create(@Body() body: any) {
    const orderId = `ORD-DEMO-${Date.now()}`;
    return {
      id: orderId,
      status: 'pending',
      items: body.items ?? [],
      subtotal: body.subtotal ?? 0,
      deliveryCost: body.deliveryCost ?? 0,
      discount: body.discount ?? 0,
      total: (body.subtotal ?? 0) + (body.deliveryCost ?? 0) - (body.discount ?? 0),
      customer: body.customer ?? null,
      shippingAddress: body.shippingAddress ?? null,
      paymentMethod: body.paymentMethod ?? null,
      createdAt: new Date().toISOString(),
      note: '[DEMO] This is a local stub order — not persisted to the database.',
    };
  }
}
