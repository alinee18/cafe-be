import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  // CREATE
  async create(name: string) {
    const category = await this.prisma.category.create({
      data: { name },
    });

    return {
      success: true,
      message: 'Category berhasil dibuat',
      data: category,
    };
  }

  // GET ALL
  async findAll() {
    const data = await this.prisma.category.findMany({
      include: { menus: true },
    });

    return {
      success: true,
      message: 'Data category berhasil diambil',
      data,
    };
  }

  // GET BY ID
  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { menus: true },
    });

    if (!category) {
      throw new NotFoundException({
        success: false,
        message: 'Category tidak ditemukan',
      });
    }

    return {
      success: true,
      message: 'Category ditemukan',
      data: category,
    };
  }

  // UPDATE
  async update(id: number, name: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException({
        success: false,
        message: 'Category tidak ditemukan',
      });
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: { name },
    });

    return {
      success: true,
      message: 'Category berhasil diupdate',
      data: updated,
    };
  }

  // DELETE
  async remove(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException({
        success: false,
        message: 'Category tidak ditemukan',
      });
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Category berhasil dihapus',
    };
  }
}