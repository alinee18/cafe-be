import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  // =========================================================
  // 1. CREATE ORDER (Logika Kondisional Reservasi vs Di Tempat)
  // =========================================================
  async createOrder(
    userId: number,
    items: { menuId: number; qty: number }[],
    reservationId?: number, // Bersifat opsional (Hanya dikirim jika memesan lewat web)
  ) {
    try {
      // Validasi awal: Pastikan ada makanan/minuman yang dipilih
      if (!items || items.length === 0) {
        throw new BadRequestException({
          success: false,
          message: 'Kamu belum memilih menu makanan atau minuman sama sekali.',
        });
      }

      let totalPrice = 0;
      const orderItemsData: { menuId: number; qty: number; subtotal: number }[] = [];

      // Loop untuk menghitung total harga berdasarkan data asli di database
      for (const item of items) {
        const menu = await this.prisma.menu.findUnique({
          where: { id: item.menuId },
        });

        if (!menu) {
          throw new NotFoundException({
            success: false,
            message: `Menu pilihanmu dengan ID ${item.menuId} tidak ditemukan di sistem kami.`,
          });
        }

        const subtotal = menu.price * item.qty;
        totalPrice += subtotal;

        orderItemsData.push({
          menuId: item.menuId,
          qty: item.qty,
          subtotal,
        });
      }

      // 🧠 KONDISI UTAMA: Cek jika transaksi ini berasal dari RESERVASI WEB
      if (reservationId) {
        // Pastikan ID Reservasi mejanya memang valid dan ada di database
        const checkReservation = await this.prisma.reservation.findUnique({
          where: { id: reservationId },
        });

        if (!checkReservation) {
          throw new NotFoundException({
            success: false,
            message: 'Data reservasi meja Anda tidak ditemukan atau sudah tidak aktif.',
          });
        }

        // Terapkan aturan minimal Rp50.000 khusus untuk Reservasi Web
        if (totalPrice < 50000) {
          throw new BadRequestException({
            success: false,
            message: `Total pesananmu baru Rp${totalPrice.toLocaleString('id-ID')}. Khusus pemesanan melalui reservasi meja web, minimal pemesanan menu adalah Rp50.000.`,
          });
        }
      }

      // Jika lolos pengecekan (atau jika pesan langsung di tempat tanpa reservationId)
      const order = await this.prisma.order.create({
        data: {
          userId,
          totalPrice,
          status: OrderStatus.PENDING,
          reservationId: reservationId || null, // Pasang ID reservasi jika ada, jika tidak set NULL (Dine-In)
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
        message: 'Pesanan kafe berhasil dibuat! Silakan lanjutkan ke pembayaran.',
        data: order,
      };
    } catch (error) {
      // Teruskan error bawaan jika itu adalah error validasi yang kita buat di atas
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException({
        success: false,
        message: 'Terjadi gangguan pada sistem saat mencoba memproses pesanan Anda.',
      });
    }
  }

  // =========================================================
  // 2. GET MY ORDERS (Daftar Riwayat Order Milik Customer)
  // =========================================================
  async myOrders(userId: number) {
    try {
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
        message: 'Data riwayat pesanan berhasil diambil.',
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Gagal mengambil data riwayat pesanan Anda.',
      });
    }
  }

  // =========================================================
  // 3. GET ALL ORDERS (Khusus Dashboard Admin/Kasir)
  // =========================================================
  async findAll() {
    try {
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
        message: 'Seluruh data pesanan berhasil diambil.',
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Gagal memuat seluruh data pesanan untuk admin.',
      });
    }
  }

  // =========================================================
  // 4. UPDATE STATUS ORDER (Khusus Admin: PROCESS / DONE / CANCEL)
  // =========================================================
  async updateStatus(orderId: number, status: OrderStatus) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new NotFoundException({
          success: false,
          message: 'Data pesanan yang ingin diubah statusnya tidak ditemukan.',
        });
      }

      const updated = await this.prisma.order.update({
        where: { id: orderId },
        data: { status },
      });

      return {
        success: true,
        message: `Status pesanan berhasil diperbarui menjadi ${status}.`,
        data: updated,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException({
        success: false,
        message: 'Gagal memperbarui status pesanan.',
      });
    }
  }

  // =========================================================
// 5. PILIH METODE PEMBAYARAN
// Customer hanya memilih metode pembayaran
// Konfirmasi pembayaran dilakukan Admin/Kasir
// =========================================================
async payOrder(orderId: number, method: 'QRIS' | 'CASH') {
  try {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException({
        success: false,
        message:
          'Pesanan yang ingin dibayar tidak ditemukan.',
      });
    }

    const existingPayment = await this.prisma.payment.findUnique({
      where: { orderId },
    });

    if (existingPayment) {
      throw new BadRequestException({
        success: false,
        message:
          'Metode pembayaran untuk pesanan ini sudah dipilih sebelumnya.',
      });
    }

    await this.prisma.payment.create({
      data: {
        orderId,
        method,
        amount: order.totalPrice,
        status: 'PENDING',
      },
    });

    return {
      success: true,
      message: `Metode pembayaran ${method} berhasil dipilih. Silakan lakukan pembayaran ke kasir dan tunggu konfirmasi.`,
      data: {
        orderId,
        totalPrice: order.totalPrice,
        method,
        paymentStatus: 'PENDING',
      },
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException
    ) {
      throw error;
    }

    throw new InternalServerErrorException({
      success: false,
      message:
        'Terjadi kesalahan pada sistem saat memproses pembayaran.',
    });
  }
}
}