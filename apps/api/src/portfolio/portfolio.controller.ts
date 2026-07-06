import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Roles('INVESTOR')
  @Get('summary')
  async getSummary(@Request() req) {
    return this.portfolioService.getSummary(req.user.id);
  }

  @Roles('INVESTOR')
  @Get('holdings')
  async getHoldings(@Request() req) {
    return this.portfolioService.getHoldings(req.user.id);
  }

  @Roles('INVESTOR')
  @Get('coupons')
  async getCoupons(@Request() req) {
    return this.portfolioService.getCoupons(req.user.id);
  }

  @Roles('INVESTOR')
  @Get('history')
  async getHistory(@Request() req) {
    return this.portfolioService.getHistory(req.user.id);
  }

  @Roles('BROKER', 'ADMIN')
  @Post('trigger-mock-coupons')
  async triggerMockCoupons() {
    return this.portfolioService.triggerMockCouponEngine();
  }
}
