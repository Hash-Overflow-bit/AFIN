import { Module } from '@nestjs/common';
import { BondsController, BondsPublicController } from './bonds.controller';
import { BondsService } from './bonds.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [BondsPublicController, BondsController],
  providers: [BondsService],
  exports: [BondsService],
})
export class BondsModule {}
