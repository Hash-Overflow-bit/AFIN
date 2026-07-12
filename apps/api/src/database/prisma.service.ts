import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    const maxRetries = 5;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.$connect();
        this.logger.log('Database connection established successfully');
        return;
      } catch (error) {
        this.logger.warn(
          `Database connection attempt ${attempt}/${maxRetries} failed: ${error.message}`,
        );
        if (attempt === maxRetries) {
          this.logger.error('All database connection attempts failed');
          throw error;
        }
        // Exponential backoff: 3s, 6s, 9s, 12s
        const delay = 3000 * attempt;
        this.logger.log(`Retrying in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
