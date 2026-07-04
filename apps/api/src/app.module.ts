import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { InvestorsModule } from './investors/investors.module';
import { BondsModule } from './bonds/bonds.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { AllocationsModule } from './allocations/allocations.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [DatabaseModule, AuthModule, InvestorsModule, BondsModule, OrdersModule, PaymentsModule, AllocationsModule, NotificationsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
