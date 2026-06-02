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
    } catch (error) {
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
        include: { category: true },
      });

      return {
        success: true,
        message: 'Daftar menu berhasil diambil',
        data: menus,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Gagal mengambil data menu',
      });
    }
  }

  // =========================
  // GET BY ID
  // =========================
  async findOne(id: number) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!menu) {
      throw new NotFoundException({
        success: false,
        message: 'Menu tidak ditemukan',
      });
    }

    return {
      success: true,
      message: 'Detail menu berhasil diambil',
      data: menu,
    };
  }

  // =========================
  // UPDATE MENU
  // =========================
  async update(id: number, dto: UpdateMenuDto) {
  try {
    const updated = await this.prisma.menu.update({
      where: { id },
      data: {
        name: dto.name,
        price: dto.price,
        description: dto.description,
        image: dto.image ?? undefined,
        categoryId: dto.categoryId,
      },
    });

    return {
      success: true,
      message: 'Menu berhasil diupdate',
      data: updated,
    };
  } catch {
    throw new NotFoundException({
      success: false,
      message: 'Menu tidak ditemukan',
    });
  }
}

  // =========================
  // DELETE MENU
  // =========================
  async remove(id: number) {
    try {
      await this.prisma.menu.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Menu berhasil dihapus',
      };
    } catch (error) {
      throw new NotFoundException({
        success: false,
        message: 'Menu tidak ditemukan',
      });
    }
  }
}