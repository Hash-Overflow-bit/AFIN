import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { Request } from 'express';

describe('PortfolioController', () => {
  let controller: PortfolioController;
  let service: PortfolioService;

  const mockUser = { id: 'investor-123', role: 'INVESTOR' };
  const mockRequest = { user: mockUser } as unknown as Request;

  beforeEach(async () => {
    const mockService = {
      getSummary: jest.fn().mockResolvedValue({ totalInvested: 5000 }),
      getHoldings: jest.fn().mockResolvedValue([{ id: 'h1', bondId: 'b1' }]),
      getCoupons: jest.fn().mockResolvedValue([{ id: 'c1', amount: 50 }]),
      getHistory: jest.fn().mockResolvedValue([{ id: 'a1', action: 'BOND_PURCHASED' }]),
      triggerMockCouponEngine: jest.fn().mockResolvedValue({ message: 'Triggered' })
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioController],
      providers: [
        { provide: PortfolioService, useValue: mockService }
      ],
    }).compile();

    controller = module.get<PortfolioController>(PortfolioController);
    service = module.get<PortfolioService>(PortfolioService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get portfolio summary', async () => {
    const res = await controller.getSummary(mockRequest);
    expect(res).toEqual({ totalInvested: 5000 });
    expect(service.getSummary).toHaveBeenCalledWith('investor-123');
  });

  it('should get holdings', async () => {
    const res = await controller.getHoldings(mockRequest);
    expect(res).toEqual([{ id: 'h1', bondId: 'b1' }]);
    expect(service.getHoldings).toHaveBeenCalledWith('investor-123');
  });

  it('should get coupons', async () => {
    const res = await controller.getCoupons(mockRequest);
    expect(res).toEqual([{ id: 'c1', amount: 50 }]);
    expect(service.getCoupons).toHaveBeenCalledWith('investor-123');
  });

  it('should get history', async () => {
    const res = await controller.getHistory(mockRequest);
    expect(res).toEqual([{ id: 'a1', action: 'BOND_PURCHASED' }]);
    expect(service.getHistory).toHaveBeenCalledWith('investor-123');
  });

  it('should trigger mock coupon engine', async () => {
    const res = await controller.triggerMockCoupons();
    expect(res).toEqual({ message: 'Triggered' });
    expect(service.triggerMockCouponEngine).toHaveBeenCalled();
  });
});
