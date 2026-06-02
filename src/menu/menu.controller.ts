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

  // =========================
  // CREATE MENU (UPLOAD IMAGE)
  // =========================
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tambah menu (Admin Only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @UseInterceptors(FileInterceptor('image')) // Simpan di memori RAM sementara
  create(
    @Body() dto: CreateMenuDto,
    @UploadedFile() file: any, // <--- Diubah jadi 'any' agar bebas error Namespace Multer
  ) {
    const payload: any = {
      ...dto,
      price: dto.price ? Number(dto.price) : 0,
      image: file ? file.originalname : undefined,
    };

    if (dto.categoryId) {
      payload.categoryId = Number(dto.categoryId);
    }

    return this.menuService.create(payload as CreateMenuDto);
  }

  // =========================
  // GET ALL MENU
  // =========================
  @Get()
  findAll() {
    return this.menuService.findAll();
  }

  // =========================
  // GET BY ID
  // =========================
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findOne(id);
  }

  // =========================
  // UPDATE MENU
  // =========================
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuDto,
  ) {
    const payload: any = {
      ...dto,
    };

    if (dto.price) {
      payload.price = Number(dto.price);
    }

    if (dto.categoryId) {
      payload.categoryId = Number(dto.categoryId);
    }

    return this.menuService.update(id, payload as UpdateMenuDto);
  }

  // =========================
  // DELETE MENU
  // =========================
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.remove(id);
  }
}