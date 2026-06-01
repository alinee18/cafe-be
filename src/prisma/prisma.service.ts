import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit
{
  [x: string]: any;

  async onModuleInit() {
    const maxRetries = 10;
    const retryDelay = 2000; // 2 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Prisma] Connection attempt ${attempt}/${maxRetries}...`);
        await this.$connect();
        console.log('[Prisma] Successfully connected to database');
        return;
      } catch (error) {
        console.error(
          `[Prisma] Connection attempt ${attempt} failed:`,
          error.message,
        );

        if (attempt === maxRetries) {
          console.error('[Prisma] Max retries reached. Giving up.');
          throw error;
        }

        console.log(
          `[Prisma] Retrying in ${retryDelay / 1000} seconds...`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay),
        );
      }
    }
  }
}

