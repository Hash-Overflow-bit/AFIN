import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioService } from './portfolio.service';
import { PrismaService } from '../database/prisma.service';
import { QueueService } from '../queue/queue.service';

describe('PortfolioService (Task 6.2 Mock Engine)', () => {
  let service: PortfolioService;
  let prismaService: PrismaService;
  let queueService: QueueService;

  // Mock Data
  const mockCoupons = [
    {
      id: 'coupon-1',
      holdingId: 'holding-1',
      investorId: 'user-1',
      bondId: 'bond-1',
      paymentDate: new Date('2023-01-01'),
      amount: 50.00,
      status: 'SCHEDULED',
      bond: { id: 'bond-1', name: 'OT 10.5% 2031' }
    },
    {
      id: 'coupon-2',
      holdingId: 'holding-2',
      investorId: 'user-2',
      bondId: 'bond-2',
      paymentDate: new Date('2023-01-01'),
      amount: 100.00,
      status: 'SCHEDULED',
      bond: { id: 'bond-2', name: 'OT 8.5% 2029' }
    }
  ];

  beforeEach(async () => {
    // 1. Create mocks for Prisma
    const prismaMock = {
      couponPayment: {
        findMany: jest.fn(),
        update: jest.fn(),
      },
      notification: {
        create: jest.fn(),
      },
      activityLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn(async (cb) => {
        // Execute the callback with the mocked Prisma client
        return cb(prismaMock);
      }),
    };

    // 2. Create mocks for QueueService
    const queueMock = {
      work: jest.fn(),
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: QueueService, useValue: queueMock },
      ],
    }).compile();

    service = module.get<PortfolioService>(PortfolioService);
    prismaService = module.get<PrismaService>(PrismaService);
    queueService = module.get<QueueService>(QueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should register the process-coupons worker', async () => {
      await service.onModuleInit();
      expect(queueService.work).toHaveBeenCalledWith('process-coupons', expect.any(Function));
    });
  });

  describe('triggerMockCouponEngine', () => {
    it('should push a job to the process-coupons queue', async () => {
      (queueService.send as jest.Mock).mockResolvedValue('test-job-id-123');
      
      const result = await service.triggerMockCouponEngine();
      
      expect(queueService.send).toHaveBeenCalledWith('process-coupons', {});
      expect(result).toEqual({ message: 'Mock coupon engine triggered', jobId: 'test-job-id-123' });
    });
  });

  describe('processMockCoupons', () => {
    it('should process scheduled coupons, update status to PAID, create notifications and activity logs', async () => {
      // 1. Setup mock to return scheduled coupons
      (prismaService.couponPayment.findMany as jest.Mock).mockResolvedValue(mockCoupons);
      
      // We need to access the private method to test the logic isolated from the queue event
      // Using bracket notation to bypass TypeScript private modifier
      await service['processMockCoupons']();

      // 2. Verify findMany was called to fetch SCHEDULED coupons
      expect(prismaService.couponPayment.findMany).toHaveBeenCalledWith({
        where: { status: 'SCHEDULED' },
        take: 50,
        orderBy: { paymentDate: 'asc' },
        include: { bond: true }
      });

      // 3. Verify that a transaction was created for each coupon
      expect(prismaService.$transaction).toHaveBeenCalledTimes(mockCoupons.length);

      // 4. Verify the operations executed inside the transaction for the first coupon
      expect(prismaService.couponPayment.update).toHaveBeenCalledWith({
        where: { id: mockCoupons[0].id },
        data: expect.objectContaining({
          status: 'PAID',
          paidAt: expect.any(Date)
        })
      });

      expect(prismaService.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: mockCoupons[0].investorId,
          type: 'PAYMENT',
          title: 'Coupon Payment Received'
        })
      });

      expect(prismaService.activityLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: mockCoupons[0].investorId,
          action: 'COUPON_PAYMENT_RECEIVED',
          resourceType: 'CouponPayment',
          resourceId: mockCoupons[0].id
        })
      });
    });

    it('should exit gracefully if there are no scheduled coupons', async () => {
      (prismaService.couponPayment.findMany as jest.Mock).mockResolvedValue([]);
      
      await service['processMockCoupons']();

      expect(prismaService.$transaction).not.toHaveBeenCalled();
    });
  });
});
