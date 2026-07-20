import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { InvestorsModule } from './investors/investors.module';
import { BondsModule } from './bonds/bonds.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { AllocationsModule } from './allocations/allocations.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { QueueModule } from './queue/queue.module';
import { ReportsModule } from './reports/reports.module';
import { AdminModule } from './admin/admin.module';
import { EmploymentVerificationModule } from './employment-verification/employment-verification.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // max 100 requests per minute
    }]),
    DatabaseModule,
    QueueModule,
    AuthModule,
    InvestorsModule,
    BondsModule,
    OrdersModule,
    PaymentsModule,
    AllocationsModule,
    NotificationsModule,
    PortfolioModule,
    ReportsModule,
    AdminModule,
    EmploymentVerificationModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
