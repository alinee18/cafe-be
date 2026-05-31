import {
  ValidationPipe,
} from '@nestjs/common';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app =
    await NestFactory.create(AppModule);

  // =========================
  // GLOBAL PREFIX
  // =========================
  app.setGlobalPrefix('api');

  // =========================
  // CORS
  // =========================
  app.enableCors({
    origin: '*',
  });

  // =========================
  // VALIDATION
  // =========================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,

      forbidNonWhitelisted: true,

      transform: true,
    }),
  );

  // =========================
  // CREATE DEFAULT ADMINS
  // =========================
  try {
    const authService =
      app.get(AuthService);

    await authService.createAdmin();

    console.log(
      'Default admin berhasil dibuat',
    );
  } catch (error) {
    console.log(
      'Admin sudah ada atau gagal dibuat',
    );
  }

  // =========================
  // PORT
  // =========================
  const PORT =
    process.env.PORT || 3000;

  await app.listen(PORT, '0.0.0.0');

  console.log(
    `Application running on port ${PORT}`,
  );
}

bootstrap();