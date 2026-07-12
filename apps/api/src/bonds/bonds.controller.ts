import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BondsService } from './bonds.service';
import { CreateBondDto } from './dto/create-bond.dto';
import { UpdateBondDto } from './dto/update-bond.dto';
import { BondQueryDto } from './dto/bond-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Public bonds controller — no authentication required.
 * Returns limited bond data for the landing page "Featured Offerings" section.
 */
@Controller('bonds')
export class BondsPublicController {
  constructor(private readonly bondsService: BondsService) {}

  @Get('public')
  findPublic() {
    return this.bondsService.findPublic();
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bonds')
export class BondsController {
  constructor(private readonly bondsService: BondsService) {}

  @Roles('BROKER', 'ADMIN', 'BROKER_MANAGER', 'SUPER_ADMIN')
  @Post()
  create(@Body() createBondDto: CreateBondDto, @Request() req: any) {
    return this.bondsService.create(createBondDto, req.user.id);
  }

  @Roles('INVESTOR', 'BROKER', 'ADMIN', 'BROKER_MANAGER', 'SUPER_ADMIN', 'BROKER_ANALYST')
  @Get()
  findAll(@Query() query: BondQueryDto, @Request() req: any) {
    return this.bondsService.findAll(query, req.user.role);
  }

  @Roles('INVESTOR', 'BROKER', 'ADMIN', 'BROKER_MANAGER', 'SUPER_ADMIN', 'BROKER_ANALYST')
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.bondsService.findOne(id, req.user.role);
  }

  @Roles('BROKER', 'ADMIN', 'BROKER_MANAGER', 'SUPER_ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBondDto: UpdateBondDto) {
    return this.bondsService.update(id, updateBondDto);
  }

  @Roles('BROKER', 'ADMIN', 'BROKER_MANAGER', 'SUPER_ADMIN')
  @Patch(':id/publish')
  publish(@Param('id') id: string) {
    return this.bondsService.publish(id);
  }

  @Roles('BROKER', 'ADMIN', 'BROKER_MANAGER', 'SUPER_ADMIN')
  @Patch(':id/close')
  close(@Param('id') id: string) {
    return this.bondsService.close(id);
  }
}
