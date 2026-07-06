import { Controller, Get, Param, Res, UseGuards, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { DashboardResponseDto } from './dto/dashboard-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @Roles('BROKER', 'ADMIN')
  async getDashboard(): Promise<DashboardResponseDto> {
    return this.reportsService.getBrokerDashboard();
  }

  @Get('data/:type')
  @Roles('BROKER', 'ADMIN')
  async getReportData(@Param('type') type: string) {
    const validTypes = ['investors', 'bonds', 'orders', 'aum'];
    if (!validTypes.includes(type)) {
      throw new BadRequestException('Invalid report type');
    }
    return this.reportsService.getReportData(type);
  }

  @Get('export/:type')
  @Roles('BROKER', 'ADMIN')
  async exportReportCSV(@Param('type') type: string, @Res() res: Response) {
    const validTypes = ['investors', 'bonds', 'orders', 'aum'];
    if (!validTypes.includes(type)) {
      throw new BadRequestException('Invalid report type');
    }
    
    const data = await this.reportsService.getReportData(type);
    const csv = this.reportsService.generateCSV(data);
    
    res.header('Content-Type', 'text/csv');
    res.attachment(`afin_${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csv);
  }
}
