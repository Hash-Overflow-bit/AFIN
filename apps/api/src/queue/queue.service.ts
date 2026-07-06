import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import type PgBossType from 'pg-boss';
import type { SendOptions, Job } from 'pg-boss';
const PgBoss = require('pg-boss');

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private boss: PgBossType;
  private readonly logger = new Logger(QueueService.name);

  constructor() {
    // pg-boss requires session-level features (advisory locks, LISTEN/NOTIFY) 
    // which are not supported by Supabase's transaction pooler (DATABASE_URL/6543)
    const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DIRECT_URL or DATABASE_URL is required to initialize pg-boss');
    }

    this.boss = new PgBoss(connectionString);

    this.boss.on('error', (error) => {
      this.logger.error('pg-boss error:', error);
    });
  }

  async onModuleInit() {
    try {
      await this.boss.start();
      this.logger.log('pg-boss started successfully');
    } catch (error) {
      this.logger.error('Failed to start pg-boss', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.boss.stop();
    this.logger.log('pg-boss stopped');
  }

  /**
   * Send a job to a specific queue
   */
  async send(queue: string, data: object, options?: SendOptions) {
    return this.boss.send(queue, data, options);
  }

  /**
   * Register a worker for a specific queue
   */
  async work(queue: string, handler: (job: Job) => Promise<void>) {
    return this.boss.work(queue, handler);
  }
}
