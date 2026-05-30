import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  // =========================
  // CREATE ORDER
  // =========================
  async createOrder(
    userId: number,
    items: { menuId: number; qty: number }[],
  ) {
    if (!items || items.length === 0) {
      throw new BadRequestException('Items tidak boleh kosong');
    }

    let totalPrice = 0;

    const orderItemsData: {
      menuId: number;
      qty: number;
      subtotal: number;
    }[] = [];

    for (const item of items) {
      const menu = await this.prisma.menu.findUnique({
        where: { id: item.menuId },
      });

      if (!menu) {
        throw new NotFoundException(`Menu id ${item.menuId} tidak ditemukan`);
      }

      const subtotal = menu.price * item.qty;
      totalPrice += subtotal;

      orderItemsData.push({
        menuId: item.menuId,
        qty: item.qty,
        subtotal,
      });
    }

    // MINIMUM ORDER
    if (totalPrice < 50000) {
      throw new BadRequestException('Minimum order Rp50.000');
    }

    const order = await this.prisma.order.create({
      data: {
        userId,
        totalPrice,
        status: OrderStatus.PENDING,

        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: {
          include: { menu: true },
        },
      },
    });

    return {
      success: true,
      message: 'Order berhasil dibuat',
      data: order,
    };
  }

  // =========================
  // GET MY ORDERS
  // =========================
  async myOrders(userId: number) {
    const data = await this.prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: { menu: true },
        },
      },
      orderBy: { id: 'desc' },
    });

    return {
      success: true,
      message: 'Data order berhasil diambil',
      data,
    };
  }

  // =========================
  // GET ALL (ADMIN)
  // =========================
  async findAll() {
    const data = await this.prisma.order.findMany({
      include: {
        user: true,
        orderItems: {
          include: { menu: true },
        },
      },
      orderBy: { id: 'desc' },
    });

    return {
      success: true,
      message: 'Semua order berhasil diambil',
      data,
    };
  }

  // =========================
  // UPDATE STATUS (ADMIN)
  // =========================
  async updateStatus(orderId: number, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order tidak ditemukan');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return {
      success: true,
      message: 'Status order berhasil diupdate',
      data: updated,
    };
  }

  // =========================
  // PAYMENT
  // =========================
  async payOrder(orderId: number, method: 'QRIS' | 'CASH') {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order tidak ditemukan');
    }

    // 1. cek payment dulu
    const existingPayment = await this.prisma.payment.findUnique({
      where: { orderId },
    });

    if (!existingPayment) {
      // CREATE PAYMENT
      await this.prisma.payment.create({
        data: {
          orderId,
          method,
          amount: order.totalPrice,
          status: 'PAID',
          paidAt: new Date(),
        },
      });
    } else {
      // UPDATE PAYMENT
      await this.prisma.payment.update({
        where: { orderId },
        data: {
          method,
          status: 'PAID',
          paidAt: new Date(),
        },
      });
    }

    // 2. UPDATE ORDER STATUS
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PAID,
      },
    });

    return {
      success: true,
      message: 'Pembayaran berhasil',
      data: updatedOrder,
    };
  }
}