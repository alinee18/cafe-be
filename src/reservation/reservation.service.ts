import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReservationService {
  constructor(private prisma: PrismaService) {}

  // =========================
  // CREATE RESERVATION
  // =========================
  async createReservation(userId: number, tableId: number, date: Date) {
    // 🔥 AUTO CREATE TABLE kalau belum ada
    let table = await this.prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!table) {
      table = await this.prisma.table.create({
data: {
  id: tableId,
  number: tableId, // <- TAMBAH INI
  isBooked: false,
}
      });
    }

    // CEK DOUBLE BOOKING TABLE (waktu yang sama)
    const existingTable = await this.prisma.reservation.findFirst({
      where: {
        tableId,
        date,
        status: 'ACTIVE',
      },
    });

    if (existingTable) {
      throw new BadRequestException({
        success: false,
        message: 'Meja sudah dipesan pada waktu ini',
        data: null,
      });
    }

    // CEK USER MASIH PUNYA RESERVASI AKTIF
    const existingUser = await this.prisma.reservation.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
    });

    if (existingUser) {
      throw new BadRequestException({
        success: false,
        message: 'Kamu masih punya reservasi aktif',
        data: null,
      });
    }

    // CREATE RESERVATION
    const reservation = await this.prisma.reservation.create({
      data: {
        userId,
        tableId,
        date,
      },
    });

    // UPDATE STATUS TABLE
    await this.prisma.table.update({
      where: { id: tableId },
      data: { isBooked: true },
    });

    // AMBIL DATA TERBARU (biar isBooked selalu benar)
    const finalData = await this.prisma.reservation.findUnique({
      where: { id: reservation.id },
      include: {
        table: true,
      },
    });

    return {
      success: true,
      message: 'Reservasi berhasil dibuat',
      data: finalData,
    };
  }

  // =========================
  // GET MY RESERVATIONS
  // =========================
  async myReservations(userId: number) {
    const data = await this.prisma.reservation.findMany({
      where: { userId },
      include: { table: true },
      orderBy: { id: 'desc' },
    });

    return {
      success: true,
      message: 'Data reservasi berhasil diambil',
      data,
    };
  }

  // =========================
  // GET ALL (ADMIN)
  // =========================
  async findAll() {
    const data = await this.prisma.reservation.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        table: true,
      },
      orderBy: { id: 'desc' },
    });

    return {
      success: true,
      message: 'Semua data reservasi berhasil diambil',
      data,
    };
  }

  // =========================
  // CANCEL RESERVATION
  // =========================
  async cancel(userId: number, id: number) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException({
        success: false,
        message: 'Reservasi tidak ditemukan',
        data: null,
      });
    }

    if (reservation.userId !== userId) {
      throw new ForbiddenException({
        success: false,
        message: 'Kamu tidak punya akses ke reservasi ini',
        data: null,
      });
    }

    const updated = await this.prisma.reservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await this.prisma.table.update({
      where: { id: reservation.tableId },
      data: { isBooked: false },
    });

    return {
      success: true,
      message: 'Reservasi berhasil dibatalkan',
      data: updated,
    };
  }
}