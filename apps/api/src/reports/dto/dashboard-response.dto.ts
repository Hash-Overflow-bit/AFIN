export class DashboardKpiDto {
  totalInvestors: number;
  activeBonds: number;
  totalOrders: number;
  totalAUM: number;
}

export class OrderStatusBreakdownDto {
  name: string;
  value: number;
}

export class VolumeDataPointDto {
  date: string;
  volume: number;
}

export class ActivityFeedItemDto {
  id: string;
  action: string;
  details: any;
  createdAt: Date;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export class DashboardResponseDto {
  kpis: DashboardKpiDto;
  orderStatusBreakdown: OrderStatusBreakdownDto[];
  volumeChart: VolumeDataPointDto[];
  activityFeed: ActivityFeedItemDto[];
}
