import {
  ValidationPipe,
} from '@nestjs/common';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import { AuthService } from './auth/auth.service';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  console.log('Aplikasi mulai bootstrap...');
  
  const app = await NestFactory.create(AppModule);
  console.log('NestFactory berhasil dibuat');

  // =========================
  // GLOBAL PREFIX
  // =========================
  app.setGlobalPrefix('api');
  console.log('Global prefix set to /api');

  // =========================
  // SWAGGER CONFIGURATION
  // =========================
  try {
    const config = new DocumentBuilder()
      .setTitle('Cafe Backend API')
      .setDescription('The Cafe Management System API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    console.log('Swagger berhasil dikonfigurasi di /docs');
  } catch (e) {
    console.log('Error saat setup Swagger:', e.message);
  }

  // =========================
  // CORS
  // =========================
  app.enableCors({
    origin: '*',
  });
  console.log('CORS diaktifkan');

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
  console.log('Validation Pipe diaktifkan');

  // =========================
  // PORT
  // =========================
  const PORT = process.env.PORT || 3000;
  console.log(`Mencoba listen di port: ${PORT}`);

  try {
    await app.listen(PORT, '0.0.0.0');
    console.log(`🚀 Application running on port ${PORT}`);
  } catch (e) {
    console.log('FATAL ERROR saat app.listen:', e.message);
  }

  // =========================
  // CREATE DEFAULT ADMINS
  // =========================
  console.log('Menjalankan pengecekan admin di background...');
  const authService = app.get(AuthService);
  authService.createAdmin()
    .then(() => console.log('✅ Proses default admin selesai'))
    .catch((error) => console.log('❌ Gagal createAdmin:', error.message));
}

bootstrap().catch(err => console.log('BOOTSTRAP ERROR:', err.message));