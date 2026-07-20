import { Module } from '@nestjs/common';
import { EmploymentVerificationService } from './employment-verification.service';
import { EmploymentVerificationController, AdminEmploymentVerificationController } from './employment-verification.controller';
import { PublicVerificationController } from './public-verification.controller';

@Module({
  controllers: [
    EmploymentVerificationController,
    AdminEmploymentVerificationController,
    PublicVerificationController,
  ],
  providers: [EmploymentVerificationService],
  exports: [EmploymentVerificationService],
})
export class EmploymentVerificationModule {}
