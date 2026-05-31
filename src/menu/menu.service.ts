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

          // 🔥 RELASI CATEGORY
          categoryId: dto.categoryId,
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
        message: 'Terjadi kesalahan saat menambahkan menu',
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
      orderBy: {
        id: 'desc',
      },
    });

    return {
      success: true,
      message: 'Data menu berhasil diambil',
      data: menus,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

  // =========================
  // GET MENU BY ID
  // =========================
  async findOne(id: number) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!menu) {
      throw new NotFoundException({
        success: false,
        message: 'Menu tidak ditemukan',
      });
    }

    return {
      success: true,
      data: menu,
    };
  }

  // =========================
  // UPDATE MENU
  // =========================
  async update(id: number, dto: UpdateMenuDto) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
    });

    if (!menu) {
      throw new NotFoundException({
        success: false,
        message: 'Menu tidak ditemukan',
      });
    }

    const updated = await this.prisma.menu.update({
      where: { id },
      data: {
        name: dto.name,
        price: dto.price,
        description: dto.description,
        image: dto.image,

        // 🔥 RELASI CATEGORY
        categoryId: dto.categoryId,
      },
    });

    return {
      success: true,
      message: 'Menu berhasil diperbarui',
      data: updated,
    };
  }

  // =========================
  // DELETE MENU
  // =========================
  async remove(id: number) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
    });

    if (!menu) {
      throw new NotFoundException({
        success: false,
        message: 'Menu tidak ditemukan',
      });
    }

    await this.prisma.menu.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Menu berhasil dihapus',
    };
  }
}