import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // CREATE PAYMENT
  @Post(':orderId')
  create(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() dto: { method: 'QRIS' | 'CASH' },
  ) {
    return this.paymentService.createPayment(orderId, dto.method);
  }

  // PAY PAYMENT
  @Patch(':orderId/pay')
  pay(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.paymentService.pay(orderId);
  }
}