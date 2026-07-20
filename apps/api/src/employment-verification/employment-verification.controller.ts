import { Controller, Get, Post, Body, Request, UseGuards, Patch, Param } from '@nestjs/common';
import { EmploymentVerificationService } from './employment-verification.service';
import { CreateEmploymentVerificationDto } from './dto/create-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('investors/employment-verification')
export class EmploymentVerificationController {
  constructor(private readonly service: EmploymentVerificationService) {}

  @Roles('INVESTOR')
  @Post('request')
  createRequest(@Request() req, @Body() dto: CreateEmploymentVerificationDto) {
    return this.service.createRequest(req.user.id, dto);
  }

  @Roles('INVESTOR')
  @Get()
  getInvestorVerification(@Request() req) {
    return this.service.getInvestorVerification(req.user.id);
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/employment-verification')
export class AdminEmploymentVerificationController {
  constructor(private readonly service: EmploymentVerificationService) {}

  @Roles('BROKER', 'ADMIN')
  @Patch(':id')
  reviewVerification(@Param('id') id: string, @Request() req, @Body() dto: import('./dto/review-request.dto').ReviewEmploymentVerificationDto) {
    return this.service.reviewVerification(id, req.user.id, dto);
  }

  @Roles('BROKER', 'ADMIN')
  @Get()
  getAll() {
    return this.service.getAdminAll();
  }
}
