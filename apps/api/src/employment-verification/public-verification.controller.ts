import { Controller, Get, Post, Param, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmploymentVerificationService } from './employment-verification.service';

@Controller('public/verify-employment')
export class PublicVerificationController {
  constructor(private readonly service: EmploymentVerificationService) {}

  @Get(':token')
  getByToken(@Param('token') token: string) {
    return this.service.getByToken(token);
  }

  @Post(':token/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadDocuments(
    @Param('token') token: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Proof of income or verification letter file is required.');
    }
    return this.service.submitEmployerDocuments(token, file);
  }
}
