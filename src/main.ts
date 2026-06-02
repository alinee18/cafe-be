import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // =========================
  // GLOBAL PREFIX
  // =========================
  app.setGlobalPrefix('api');

  // =========================
  // STATIC FILES (UPLOAD GAMBAR)
  // =========================
  // 👉 INI YANG KAMU BUTUH
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // =========================
  // SWAGGER CONFIGURATION
  // =========================
  const config = new DocumentBuilder()
    .setTitle('Cafe Backend API')
    .setDescription('The Cafe Management System API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: false,
  });

  // =========================
  // CORS
  // =========================
  app.enableCors({
    origin: '*',
    credentials: true,
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
  // PORT (Railway safe)
  // =========================
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  await app.listen(PORT, '0.0.0.0');

  console.log(
    `🚀 Application is successfully listening on host 0.0.0.0 and port ${PORT}`,
  );

  // =========================
  // CREATE DEFAULT ADMINS
  // =========================
  const authService = app.get(AuthService);
  authService
    .createAdmin()
    .then(() => console.log('✅ Proses pengecekan default admin selesai'))
    .catch((error) =>
      console.log('❌ Gagal menjalankan createAdmin startup:', error),
    );
}

bootstrap();