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

@Controller('menu')
export class MenuController {
  constructor(
    private readonly menuService: MenuService,
  ) {}

  // =========================
  // CREATE MENU
  // ADMIN ONLY
  // =========================
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
  @Get()
  findAll() {
    return this.menuService.findAll();
  }

  // =========================
  // GET MENU BY ID
  // PUBLIC
  // =========================
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