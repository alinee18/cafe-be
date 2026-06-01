import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // =========================
  // GLOBAL PREFIX
  // =========================
  // Pastikan rute utama menggunakan prefix 'api'
  app.setGlobalPrefix('api');

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
  
  // Perbaikan: Tambahkan opsi agar Swagger tidak ikut terkena prefix /api jika diakses di /docs
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
  // PORT (Tahan Banting untuk Railway)
  // =========================
  // Railway mengirimkan PORT berupa string, kita paksa parsing ke integer base 10
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Wajib bind ke '0.0.0.0' agar proxy internal Railway bisa memetakan port kontainer
  await app.listen(PORT, '0.0.0.0');

  console.log(`🚀 Application is successfully listening on host 0.0.0.0 and port ${PORT}`);

  // =========================
  // CREATE DEFAULT ADMINS
  // =========================
  const authService = app.get(AuthService);
  authService.createAdmin()
    .then(() => console.log('✅ Proses pengecekan default admin selesai'))
    .catch((error) => console.log('❌ Gagal menjalankan createAdmin startup:', error));
}

bootstrap();