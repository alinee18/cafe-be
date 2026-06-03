import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // 1. TAMBAH MENU (CREATE)
  // ==========================================
  async create(dto: CreateMenuDto) {
    try {
      const menu = await this.prisma.menu.create({
        data: {
          name: dto.name,
          price: dto.price,
          description: dto.description ?? null,
          image: dto.image ?? null,
          categoryId: dto.categoryId ?? null,
        },
      });

      return {
        success: true,
        message: 'Menu berhasil ditambahkan',
        data: menu,
      };
    } catch (error: any) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Gagal menambahkan menu ke database',
        errorAsli: error.message || error,
      });
    }
  }

  // ==========================================
  // 2. AMBIL SEMUA MENU (GET ALL) + SINKRONISASI DATA KOTOR
  // ==========================================
  async findAll() {
    try {
      // 🟢 TRICK SEMENTARA: Paksa semua data image yang masih string kotor menjadi null
      // Ini akan langsung membersihkan row di database Railway kamu saat API GET dipanggil
      await this.prisma.menu.updateMany({
        where: {
          image: { not: null },
        },
        data: {
          image: null,
        },
      });

      const menus = await this.prisma.menu.findMany({
        include: { category: true },
      });

      return {
        success: true,
        message: 'Daftar menu berhasil diambil (Database telah dibersihkan)',
        data: menus,
      };
    } catch (error: any) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Gagal mengambil data menu',
        errorAsli: error.message || error,
      });
    }
  }

  // ==========================================
  // 3. AMBIL MENU BERDASARKAN ID (GET BY ID)
  // ==========================================
  async findOne(id: number) {
    try {
      const menu = await this.prisma.menu.findUnique({
        where: { id },
        include: { category: true },
      });

      if (!menu) {
        throw new NotFoundException({
          success: false,
          message: `Menu dengan ID ${id} tidak ditemukan`,
        });
      }

      return {
        success: true,
        message: 'Detail menu berhasil diambil',
        data: menu,
      };
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException({
        success: false,
        message: 'Gagal mencari detail menu',
        errorAsli: error.message || error,
      });
    }
  }

  // ==========================================
  // 4. UBAH DATA MENU (UPDATE)
  // ==========================================
  async update(id: number, dto: UpdateMenuDto) {
    try {
      const cekMenu = await this.prisma.menu.findUnique({ where: { id } });
      if (!cekMenu) {
        throw new NotFoundException({
          success: false,
          message: `Gagal update, menu dengan ID ${id} tidak ditemukan`,
        });
      }

      const updated = await this.prisma.menu.update({
        where: { id },
        data: {
          name: dto.name,
          price: dto.price ? Number(dto.price) : undefined,
          description: dto.description,
          image: dto.image ?? undefined,
          categoryId: dto.categoryId ? Number(dto.categoryId) : undefined,
        },
      });

      return {
        success: true,
        message: 'Menu berhasil diupdate',
        data: updated,
      };
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException({
        success: false,
        message: 'Gagal memperbarui data menu',
        errorAsli: error.message || error,
      });
    }
  }

  // ==========================================
  // 5. HAPUS MENU (DELETE)
  // ==========================================
  async remove(id: number) {
    try {
      const cekMenu = await this.prisma.menu.findUnique({ where: { id } });
      if (!cekMenu) {
        throw new NotFoundException({
          success: false,
          message: `Gagal hapus, menu dengan ID ${id} tidak ditemukan`,
        });
      }

      await this.prisma.menu.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Menu berhasil dihapus',
      };
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException({
        success: false,
        message: 'Gagal menghapus menu dari database',
        errorAsli: error.message || error,
      });
    }
  }
}