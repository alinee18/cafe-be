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
          categoryId: dto.categoryId ?? null, // Mengizinkan kosong jika tidak diisi
        },
      });

      return {
        success: true,
        message: 'Menu berhasil ditambahkan',
        data: menu,
      };
    } catch (error: any) {
      // Menampilkan detail error asli dari Prisma agar mudah dibaca di Postman
      throw new InternalServerErrorException({
        success: false,
        message: 'Gagal menambahkan menu ke database',
        errorAsli: error.message || error,
      });
    }
  }

  // ==========================================
  // 2. AMBIL SEMUA MENU (GET ALL)
  // ==========================================
  async findAll() {
    try {
      const menus = await this.prisma.menu.findMany({
        include: { category: true }, // Menampilkan info detail kategori pendukungnya
      });

      return {
        success: true,
        message: 'Daftar menu berhasil diambil',
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

      // Jika menu dengan ID tersebut tidak ada di database
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
      // Jika errornya bersumber dari NotFoundException di atas, teruskan saja ke user
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
      // Langkah 1: Pastikan dulu menunya beneran ada sebelum di-update
      const cekMenu = await this.prisma.menu.findUnique({ where: { id } });
      if (!cekMenu) {
        throw new NotFoundException({
          success: false,
          message: `Gagal update, menu dengan ID ${id} tidak ditemukan`,
        });
      }

      // Langkah 2: Lakukan eksekusi update data
      const updated = await this.prisma.menu.update({
        where: { id },
        data: {
          name: dto.name,
          price: dto.price ? Number(dto.price) : undefined, // Dipastikan aman menjadi angka
          description: dto.description,
          image: dto.image ?? undefined,
          categoryId: dto.categoryId ? Number(dto.categoryId) : undefined, // Dipastikan aman menjadi angka
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
      // Langkah 1: Pastikan menunya beneran ada sebelum di-delete
      const cekMenu = await this.prisma.menu.findUnique({ where: { id } });
      if (!cekMenu) {
        throw new NotFoundException({
          success: false,
          message: `Gagal hapus, menu dengan ID ${id} tidak ditemukan`,
        });
      }

      // Langkah 2: Lakukan eksekusi delete data
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