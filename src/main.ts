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
  // PORT
  // =========================
  const PORT =
    process.env.PORT || 3000;

  await app.listen(PORT, '0.0.0.0');

  console.log(
    `Application running on port ${PORT}`,
  );

  // =========================
  // CREATE DEFAULT ADMINS
  // JALANKAN SETELAH LISTEN AGAR TIDAK BLOCKING STARTUP
  // =========================
  const authService = app.get(AuthService);
  authService.createAdmin()
    .then(() => console.log('Proses pengecekan default admin selesai'))
    .catch((error) => console.log('Gagal menjalankan createAdmin startup:', error));
}

bootstrap();