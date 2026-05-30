import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Req,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { ReservationService } from './reservation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('reservation')
export class ReservationController {
  constructor(private service: ReservationService) {}

  // =========================
  // CUSTOMER: CREATE RESERVATION
  // =========================
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() body: any) {
    return this.service.createReservation(
      req.user.id,
      body.tableId,
      new Date(body.date),
    );
  }

  // =========================
  // CUSTOMER: MY RESERVATION
  // =========================
  @UseGuards(JwtAuthGuard)
  @Get('my')
  my(@Req() req: any) {
    return this.service.myReservations(req.user.id);
  }

  // =========================
  // ADMIN: GET ALL
  // =========================
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // =========================
  // CUSTOMER: CANCEL
  // =========================
  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancel(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.service.cancel(req.user.id, id);
  }
}