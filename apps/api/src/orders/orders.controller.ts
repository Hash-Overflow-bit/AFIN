import { Controller, Post, Get, Patch, Body, Param, Request, UseGuards, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles('INVESTOR')
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Request() req: any) {
    return this.ordersService.create(createOrderDto, req.user.id);
  }

  @Roles('INVESTOR')
  @Get('my-orders')
  getMyOrders(@Request() req: any) {
    return this.ordersService.getMyOrders(req.user.id);
  }

  @Roles('INVESTOR')
  @Patch(':id/cancel')
  cancelOrder(@Param('id') id: string, @Request() req: any) {
    return this.ordersService.cancelOrder(id, req.user.id);
  }

  // --- BROKER ROUTES ---

  @Roles('BROKER', 'BROKER_MANAGER', 'ADMIN', 'SUPER_ADMIN')
  @Get()
  getAllOrders(@Query('status') status?: string, @Query('bondId') bondId?: string) {
    return this.ordersService.getAllOrders({ status, bondId });
  }

  @Roles('BROKER', 'BROKER_MANAGER', 'ADMIN', 'SUPER_ADMIN')
  @Patch(':id/approve')
  approveOrder(@Param('id') id: string, @Request() req: any) {
    return this.ordersService.approveOrder(id, req.user.id);
  }

  @Roles('BROKER', 'BROKER_MANAGER', 'ADMIN', 'SUPER_ADMIN')
  @Patch(':id/reject')
  rejectOrder(@Param('id') id: string, @Body('reason') reason: string, @Request() req: any) {
    return this.ordersService.rejectOrder(id, req.user.id, reason);
  }
}
