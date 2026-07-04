import { Controller, Post, Param, UseGuards, Request, Get } from '@nestjs/common';
import { AllocationsService } from './allocations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('allocations')
export class AllocationsController {
  constructor(private readonly allocationsService: AllocationsService) {}

  @Roles('BROKER', 'ADMIN')
  @Get('bond/:bondId')
  async previewAllocation(@Param('bondId') bondId: string) {
    return this.allocationsService.previewAllocationForBond(bondId);
  }

  @Roles('BROKER', 'ADMIN')
  @Post('run/:bondId')
  async runAllocation(@Param('bondId') bondId: string, @Request() req) {
    return this.allocationsService.runAllocationForBond(bondId, req.user.id);
  }
}
