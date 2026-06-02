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

  // =========================
  // CREATE MENU
  // =========================
  async create(dto: CreateMenuDto) {
    try {
      const menu = await this.prisma.menu.create({
        data: {
          name: dto.name,
          price: dto.price,
          description: dto.description,
          image: dto.image,
          categoryId: dto.categoryId,
        },
      });

      return {
        success: true,
        message: 'Menu berhasil ditambahkan',
        data: menu,
      };
    } catch (error: any) {
      console.error('CREATE MENU ERROR:', error);

      throw new InternalServerErrorException({
        success: false,
        message: 'Gagal menambahkan menu',
      });
    }
  }

  // =========================
  // GET ALL MENU
  // =========================
  async findAll() {
    try {
      const menus = await this.prisma.menu.findMany({
        include: {
          category: true,
        },
      });

      return {
        success: true,
        message: 'Daftar menu berhasil diambil',
        data: menus,
      };
    } catch (error: any) {
      console.error('GET ALL MENU ERROR:', error);

      throw new InternalServerErrorException({
        success: false,
        message: 'Gagal mengambil daftar menu',
      });
    }
  }

  // =========================
  // GET MENU BY ID
  // =========================
  async findOne(id: number) {
    try {
      const menu = await this.prisma.menu.findUnique({
        where: { id },
        include: {
          category: true,
        },
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
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('GET MENU DETAIL ERROR:', error);

      throw new InternalServerErrorException({
        success: false,
        message: 'Gagal mengambil detail menu',
      });
    }
  }

  // =========================
  // UPDATE MENU
  // =========================
  async update(id: number, dto: UpdateMenuDto) {
    try {
      const menu = await this.prisma.menu.findUnique({
        where: { id },
      });

      if (!menu) {
        throw new NotFoundException({
          success: false,
          message: `Menu dengan ID ${id} tidak ditemukan`,
        });
      }

      const updated = await this.prisma.menu.update({
        where: { id },
        data: {
          name: dto.name,
          price: dto.price,
          description: dto.description,
          image: dto.image,
          categoryId: dto.categoryId,
        },
      });

      return {
        success: true,
        message: 'Menu berhasil diperbarui',
        data: updated,
      };
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('UPDATE MENU ERROR:', error);

      throw new InternalServerErrorException({
        success: false,
        message: 'Gagal memperbarui menu',
      });
    }
  }

  // =========================
  // DELETE MENU
  // =========================
  async remove(id: number) {
    try {
      const menu = await this.prisma.menu.findUnique({
        where: { id },
      });

      if (!menu) {
        throw new NotFoundException({
          success: false,
          message: `Menu dengan ID ${id} tidak ditemukan`,
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
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('DELETE MENU ERROR:', error);

      throw new InternalServerErrorException({
        success: false,
        message: 'Gagal menghapus menu',
      });
    }
  }
}