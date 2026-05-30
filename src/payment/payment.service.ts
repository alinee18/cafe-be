import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  // =========================
  // CREATE PAYMENT
  // =========================
  async createPayment(orderId: number, method: 'QRIS' | 'CASH') {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundException('Order tidak ditemukan');
    }

    if (order.payment) {
      throw new NotFoundException('Payment sudah ada');
    }

    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        method,
        amount: order.totalPrice,
        status: 'PENDING',
      },
    });

    return {
      success: true,
      message: 'Payment dibuat',
      data: payment,
    };
  }

  // =========================
  // BAYAR PAYMENT
  // =========================
  async pay(orderId: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
    });

    if (!payment) {
      throw new NotFoundException('Payment tidak ditemukan');
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { orderId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    // auto update order
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PAID,
      },
    });

    return {
      success: true,
      message: 'Pembayaran berhasil',
      data: updatedPayment,
    };
  }
}