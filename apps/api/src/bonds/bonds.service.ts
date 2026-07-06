import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateBondDto } from './dto/create-bond.dto';
import { UpdateBondDto } from './dto/update-bond.dto';
import { BondQueryDto } from './dto/bond-query.dto';

@Injectable()
export class BondsService {
  constructor(private prisma: PrismaService) {}

  async create(createBondDto: CreateBondDto, brokerId: string) {
    return this.prisma.bond.create({
      data: {
        ...createBondDto,
        status: 'DRAFT',
        createdBy: brokerId,
      },
    });
  }

  async findAll(query: BondQueryDto, userRole: string) {
    const { status, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    // Investor can see all bonds except DRAFT
    if (userRole === 'INVESTOR') {
      where.status = { not: 'DRAFT' };
    } else if (status) {
      where.status = status;
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.bond.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.bond.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userRole: string) {
    const bond = await this.prisma.bond.findUnique({ where: { id } });

    if (!bond) {
      throw new NotFoundException(`Bond with ID ${id} not found`);
    }

    if (userRole === 'INVESTOR' && bond.status === 'DRAFT') {
      throw new NotFoundException(`Bond with ID ${id} not found`);
    }

    return bond;
  }

  async update(id: string, updateBondDto: UpdateBondDto) {
    const bond = await this.prisma.bond.findUnique({ where: { id } });
    if (!bond) {
      throw new NotFoundException(`Bond with ID ${id} not found`);
    }

    if (bond.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT bonds can be updated');
    }

    return this.prisma.bond.update({
      where: { id },
      data: updateBondDto,
    });
  }

  async publish(id: string) {
    const bond = await this.prisma.bond.findUnique({ where: { id } });
    if (!bond) {
      throw new NotFoundException(`Bond with ID ${id} not found`);
    }

    if (bond.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT bonds can be published');
    }

    const updatedBond = await this.prisma.bond.update({
      where: { id },
      data: { status: 'OPEN' },
    });

    console.log(`[Notification Engine Mock] Bond ${updatedBond.name} published. Notifying all APPROVED investors.`);

    return updatedBond;
  }

  async close(id: string) {
    const bond = await this.prisma.bond.findUnique({ where: { id } });
    if (!bond) {
      throw new NotFoundException(`Bond with ID ${id} not found`);
    }

    if (bond.status !== 'OPEN') {
      throw new BadRequestException('Only OPEN bonds can be closed');
    }

    return this.prisma.bond.update({
      where: { id },
      data: { status: 'CLOSED' },
    });
  }
}
