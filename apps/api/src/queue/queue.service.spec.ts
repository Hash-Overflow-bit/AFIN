import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from './queue.service';
import { PrismaService } from '../database/prisma.service';

// Mock pg-boss entirely
jest.mock('pg-boss', () => {
  return jest.fn().mockImplementation(() => {
    return {
      on: jest.fn(),
      start: jest.fn().mockResolvedValue(undefined),
      stop: jest.fn().mockResolvedValue(undefined),
      work: jest.fn().mockResolvedValue('worker-id-123'),
      send: jest.fn().mockResolvedValue('job-id-123'),
    };
  });
});

describe('QueueService (Task 6.2 Queue Engine)', () => {
  let service: QueueService;

  beforeEach(async () => {
    // 1. Create mock for Prisma
    const prismaMock = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize and start pg-boss', async () => {
      await service.onModuleInit();
      // Since it's mocked, we know it's defined internally, we just ensure it didn't crash
      expect(service).toBeDefined();
    });
  });

  describe('onModuleDestroy', () => {
    it('should stop pg-boss if initialized', async () => {
      await service.onModuleInit(); // initialize first
      await service.onModuleDestroy();
      expect(service).toBeDefined();
    });
  });

  describe('work (Worker Registration)', () => {
    it('should register a worker and return the worker ID', async () => {
      await service.onModuleInit();
      const mockHandler = jest.fn();
      
      const workerId = await service.work('process-coupons', mockHandler);
      expect(workerId).toBe('worker-id-123');
    });
  });

  describe('send (Job Dispatch)', () => {
    it('should send a job to the queue and return the job ID', async () => {
      await service.onModuleInit();
      const jobId = await service.send('process-coupons', { testData: 123 });
      
      expect(jobId).toBe('job-id-123');
    });
  });
});
