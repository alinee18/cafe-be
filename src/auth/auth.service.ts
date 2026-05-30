import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';

import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // =========================
  // CREATE DEFAULT ADMINS
  // =========================
  async createAdmin() {
    try {
      const hashedPassword =
        await bcrypt.hash(
          '123456',
          10,
        );

      // ADMIN 1
      await this.prisma.user.upsert({
        where: {
          email: 'admin1@gmail.com',
        },

        update: {},

        create: {
          username: 'admin1',

          email: 'admin1@gmail.com',

          password: hashedPassword,

          role: UserRole.admin,
        },
      });

      // ADMIN 2
      await this.prisma.user.upsert({
        where: {
          email: 'admin2@gmail.com',
        },

        update: {},

        create: {
          username: 'admin2',

          email: 'admin2@gmail.com',

          password: hashedPassword,

          role: UserRole.admin,
        },
      });

      console.log(
        'Default admin berhasil dibuat',
      );
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,

        message:
          'Gagal membuat default admin',
      });
    }
  }

  // =========================
  // REGISTER
  // =========================
  async register(dto: RegisterDto) {
    try {
      const {
        username,
        email,
        password,
      } = dto;

      // CHECK EMAIL
      const existingEmail =
        await this.prisma.user.findUnique({
          where: {
            email,
          },
        });

      if (existingEmail) {
        throw new BadRequestException({
          success: false,

          message:
            'Email sudah digunakan, silakan gunakan email lain',
        });
      }

      // HASH PASSWORD
      const hashedPassword =
        await bcrypt.hash(
          password,
          10,
        );

      // CREATE USER
      const user =
        await this.prisma.user.create({
          data: {
            username,

            email,

            password:
              hashedPassword,

            // DEFAULT ROLE
            role:
              UserRole.customer,
          },
        });

      return {
        success: true,

        message:
          'Register berhasil',

        data: {
          id: user.id,

          username:
            user.username,

          email: user.email,

          role: user.role,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // =========================
  // LOGIN
  // =========================
  async login(dto: LoginDto) {
    try {
      const { email, password } =
        dto;

      // CHECK USER
      const user =
        await this.prisma.user.findUnique({
          where: {
            email,
          },
        });

      if (!user) {
        throw new UnauthorizedException({
          success: false,

          message:
            'Email tidak ditemukan',
        });
      }

      // CHECK PASSWORD
      const isMatch =
        await bcrypt.compare(
          password,
          user.password,
        );

      if (!isMatch) {
        throw new UnauthorizedException({
          success: false,

          message:
            'Password yang anda masukkan salah',
        });
      }

      // GENERATE TOKEN
      const token = this.jwtService.sign(
  {
    id: user.id,
    email: user.email,
    role: user.role,
  },
  {
    secret: process.env.JWT_SECRET,
  },
);

      return {
        success: true,

        message:
          'Login berhasil',

        token,

        data: {
          id: user.id,

          username:
            user.username,

          email: user.email,

          role: user.role,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}