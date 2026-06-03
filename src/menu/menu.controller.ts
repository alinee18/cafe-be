import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';

import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // ==========================================
  // 1. TAMBAH MENU (CREATE)
  // ==========================================
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tambah menu (Admin Only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() dto: CreateMenuDto,
    @UploadedFile() file: any,
  ) {
    const payload: any = {
      ...dto,
      price: dto.price ? Number(dto.price) : 0,
      image: file ? file.originalname : dto.image || undefined, 
    };

    if (dto.categoryId) {
      payload.categoryId = Number(dto.categoryId);
    }

    return this.menuService.create(payload as CreateMenuDto);
  }

  // ==========================================
  // 2. AMBIL SEMUA MENU (GET ALL)
  // ==========================================
  @Get()
  findAll() {
    return this.menuService.findAll();
  }

  // ==========================================
  // 3. AMBIL MENU BERDASARKAN ID (GET BY ID)
  // ==========================================
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findOne(id);
  }

  // ==========================================
  // 4. UBAH DATA MENU (UPDATE)
  // ==========================================
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image')) // Diaktifkan agar bisa memproses field image di form-data
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuDto,
    @UploadedFile() file: any, // Ditambahkan interceptor file di sini
  ) {
    let imageValue: string | undefined = undefined;

    if (file) {
      imageValue = file.originalname;
    } else if (dto.image) {
      imageValue = dto.image;
    }

    const payload: any = {
      ...dto,
    };

    // Masukkan hasil penentuan gambar tadi ke dalam payload jika ada perubahan
    if (imageValue !== undefined) {
      payload.image = imageValue;
    }

    if (dto.price) {
      payload.price = Number(dto.price);
    }

    if (dto.categoryId) {
      payload.categoryId = Number(dto.categoryId);
    }

    return this.menuService.update(id, payload as UpdateMenuDto);
  }

  // ==========================================
  // 5. HAPUS MENU (DELETE)
  // ==========================================
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.remove(id);
  }
}