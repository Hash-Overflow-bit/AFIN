import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { InvestorsController } from './investors.controller';
import { DocumentsController } from './documents.controller';
import { InvestorsService } from './investors.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [DocumentsController, InvestorsController],
  providers: [InvestorsService],
})
export class InvestorsModule {}
