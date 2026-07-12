import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { DashboardResponseDto } from './dto/dashboard-response.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getBrokerDashboard(): Promise<DashboardResponseDto> {
    // 1. Calculate KPIs
    const [totalInvestors, activeBonds, totalOrders, totalAUMResult] = await Promise.all([
      this.prisma.user.count({ where: { role: 'INVESTOR' } }),
      this.prisma.bond.count({ where: { status: 'OPEN' } }),
      this.prisma.order.count(), // all orders
      this.prisma.portfolioHolding.aggregate({
        _sum: { faceValueHeld: true },
        where: { status: 'ACTIVE' },
      }),
    ]);

    const totalAUM = totalAUMResult._sum.faceValueHeld ? Number(totalAUMResult._sum.faceValueHeld) : 0;

    // 2. Order Status Breakdown
    const orderGroups = await this.prisma.order.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });
    
    const orderStatusBreakdown = orderGroups.map(group => ({
      name: group.status,
      value: group._count.id,
    }));

    // 3. Volume Over Time (Last 30 days)
    // Fetch orders from last 30 days and group by date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
        requestedAmount: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const volumeMap = new Map<string, number>();
    recentOrders.forEach(order => {
      const dateKey = order.createdAt?.toISOString().split('T')[0]; // YYYY-MM-DD
      if (dateKey) {
        const currentAmount = volumeMap.get(dateKey) || 0;
        volumeMap.set(dateKey, currentAmount + Number(order.requestedAmount));
      }
    });

    const volumeChart = Array.from(volumeMap.entries()).map(([date, volume]) => ({
      date,
      volume,
    }));

    // 4. Activity Feed (Financial Transactions Only)
    const financialActions = [
      'ORDER_CREATED',
      'ORDER_APPROVED',
      'PAYMENT_UPLOADED',
      'PAYMENT_VERIFIED',
      'BOND_PUBLISHED',
      'BOND_ALLOCATED',
      'COUPON_PAID'
    ];

    const rawActivityFeed = await this.prisma.activityLog.findMany({
      where: {
        action: {
          in: financialActions,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    const activityFeed = rawActivityFeed.map(log => ({
      id: log.id,
      action: log.action,
      details: log.details,
      createdAt: log.createdAt || new Date(),
      user: log.user ? {
        firstName: log.user.firstName,
        lastName: log.user.lastName,
        email: log.user.email,
      } : null,
    }));

    return {
      kpis: {
        totalInvestors,
        activeBonds,
        totalOrders,
        totalAUM,
      },
      orderStatusBreakdown,
      volumeChart,
      activityFeed,
    };
  }

  async getReportData(type: string): Promise<any[]> {
    switch (type) {
      case 'investors':
        const users = await this.prisma.user.findMany({
          where: { role: 'INVESTOR' },
          include: { investorProfile: true },
          orderBy: { createdAt: 'desc' },
        });
        return users.map(u => ({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          status: u.status,
          kycStatus: u.kycStatus || 'INCOMPLETE',
          joinedDate: u.createdAt.toISOString(),
        }));

      case 'bonds':
        const bonds = await this.prisma.bond.findMany({
          orderBy: { createdAt: 'desc' },
        });
        return bonds.map(b => ({
          id: b.id,
          name: b.name,
          isin: b.isin,
          faceValue: Number(b.faceValue),
          couponRate: Number(b.couponRate),
          status: b.status,
          issuedDate: b.issueDate ? b.issueDate.toISOString() : '',
          maturityDate: b.maturityDate ? b.maturityDate.toISOString() : '',
        }));

      case 'orders':
        const orders = await this.prisma.order.findMany({
          include: { investor: true, bond: true },
          orderBy: { createdAt: 'desc' },
        });
        return orders.map(o => ({
          id: o.id,
          bondName: o.bond.name,
          investorName: `${o.investor.firstName} ${o.investor.lastName}`,
          requestedAmount: Number(o.requestedAmount),
          allocatedAmount: o.allocatedAmount ? Number(o.allocatedAmount) : 0,
          status: o.status,
          createdAt: o.createdAt?.toISOString() || new Date().toISOString(),
        }));

      case 'aum':
        const holdings = await this.prisma.portfolioHolding.findMany({
          include: { investor: true, bond: true },
          orderBy: { acquiredAt: 'desc' },
        });
        return holdings.map(h => ({
          id: h.id,
          investorName: `${h.investor.firstName} ${h.investor.lastName}`,
          bondName: h.bond.name,
          faceValueHeld: Number(h.faceValueHeld),
          status: h.status,
          lastUpdated: h.acquiredAt?.toISOString() || new Date().toISOString(),
        }));

      default:
        throw new Error(`Invalid report type: ${type}`);
    }
  }

  generateCSV(data: any[]): string {
    if (!data || data.length === 0) return '';
    
    // Extract headers from first object
    const headers = Object.keys(data[0]);
    
    // Convert headers to CSV string
    const csvRows = [headers.join(',')];
    
    // Convert each row object to CSV string
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header];
        // Escape quotes and wrap in quotes if there's a comma or newline
        if (typeof val === 'string') {
          const escaped = val.replace(/"/g, '""');
          return `"${escaped}"`;
        }
        return val !== null && val !== undefined ? String(val) : '';
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }
}
