import { Controller, Get, Patch, Post, Body, Request, UseGuards, Ip, Param } from '@nestjs/common';
import { InvestorsService } from './investors.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('investors')
export class InvestorsController {
  constructor(private readonly investorsService: InvestorsService) {}

  @Roles('INVESTOR')
  @Get('profile')
  getProfile(@Request() req) {
    // req.user is set by JwtAuthGuard
    return this.investorsService.getProfile(req.user.id);
  }

  @Roles('INVESTOR')
  @Patch('profile')
  updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
    @Ip() ipAddress: string,
  ) {
    return this.investorsService.updateProfile(req.user.id, updateProfileDto, ipAddress);
  }

  @Roles('INVESTOR')
  @Post('submit-kyc')
  submitKyc(@Request() req) {
    return this.investorsService.submitKyc(req.user.id);
  }

  // --- Broker Endpoints ---

  @Roles('BROKER', 'ADMIN')
  @Get('kyc-queue')
  getKycQueue() {
    return this.investorsService.getKycQueue();
  }

  @Roles('BROKER', 'ADMIN')
  @Get()
  getInvestors(@Request() req) {
    const { status } = req.query;
    return this.investorsService.getInvestors(status);
  }

  @Roles('BROKER', 'ADMIN')
  @Get(':id')
  getInvestorDetails(@Param('id') id: string) {
    return this.investorsService.getInvestorDetails(id);
  }

  @Roles('BROKER', 'ADMIN')
  @Patch(':id/kyc')
  updateKyc(
    @Param('id') id: string,
    @Body() updateKycDto: import('./dto/update-kyc.dto').UpdateKycDto,
    @Request() req,
  ) {
    return this.investorsService.updateKycStatus(
      id,
      updateKycDto.status,
      updateKycDto.reason,
      req.user.id,
    );
  }
}
