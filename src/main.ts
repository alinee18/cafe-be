import {
  ValidationPipe,
} from '@nestjs/common';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import { AuthService } from './auth/auth.service';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app =
    await NestFactory.create(AppModule);

  // =========================
  // GLOBAL PREFIX
  // =========================
  app.setGlobalPrefix('api');

  // =========================
  // SWAGGER CONFIGURATION
  // =========================
  const config = new DocumentBuilder()
    .setTitle('Cafe Backend API')
    .setDescription('The Cafe Management System API description')
    .setVersion('1.0')
    .addBearerAuth() // Memungkinkan testing endpoint yang diproteksi JWT
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

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