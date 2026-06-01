import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // =========================
  // CREATE ORDER
  // =========================
  // =========================
  // CREATE ORDER (FIXED)
  // =========================
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Req() req: any, 
    @Body() dto: { items: { menuId: number; qty: number }[]; reservationId?: number } // 🔥 Tambahkan reservationId? di sini
  ) {
    return this.orderService.createOrder(req.user.id, dto.items, dto.reservationId);
  }

  // =========================
  // PAYMENT (QRIS / CASH)
  // =========================
  @UseGuards(JwtAuthGuard)
  @Patch(':id/pay')
  pay(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { method: 'QRIS' | 'CASH' },
  ) {
    return this.orderService.payOrder(id, dto.method);
  }

  // =========================
  // GET ALL ORDERS (ADMIN)
  // =========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  // =========================
  // MY ORDERS (CUSTOMER)
  // =========================
  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  myOrders(@Req() req: any) {
    return this.orderService.myOrders(req.user.id);
  }

  // =========================
  // UPDATE STATUS (ADMIN)
  // =========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { status: any },
  ) {
    return this.orderService.updateStatus(id, dto.status);
  }
}