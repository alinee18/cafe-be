import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { MenuService } from './menu.service';

import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Menu')
@Controller('menu')
export class MenuController {
  constructor(
    private readonly menuService: MenuService,
  ) {}

  // =========================
  // CREATE MENU
  // ADMIN ONLY
  // =========================
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tambah menu baru (Admin Only)' })
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateMenuDto) {
    return this.menuService.create(dto);
  }

  // =========================
  // GET ALL MENU
  // PUBLIC
  // =========================
  @ApiOperation({ summary: 'Ambil semua data menu' })
  @Get()
  findAll() {
    return this.menuService.findAll();
  }

  // =========================
  // GET MENU BY ID
  // PUBLIC
  // =========================
  @ApiOperation({ summary: 'Ambil detail menu berdasarkan ID' })
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.menuService.findOne(id);
  }

  // =========================
  // UPDATE MENU
  // ADMIN ONLY
  // =========================
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update data menu (Admin Only)' })
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuDto,
  ) {
    return this.menuService.update(id, dto);
  }

  // =========================
  // DELETE MENU
  // ADMIN ONLY
  // =========================
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus menu (Admin Only)' })
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('admin')
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.menuService.remove(id);
  }
}