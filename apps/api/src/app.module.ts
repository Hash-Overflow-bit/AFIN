import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { InvestorsModule } from './investors/investors.module';

@Module({
  imports: [DatabaseModule, AuthModule, InvestorsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
