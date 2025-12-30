import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PaymentMethodService } from './payment-method.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PaymentMethodService', () => {
  let service: PaymentMethodService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    paymentMethod: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentMethodService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PaymentMethodService>(PaymentMethodService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a payment method', async () => {
      const userId = 'user-1';
      const createDto = {
        type: 'bank_transfer',
        provider: 'BCA',
        accountNumber: '1234567890',
        accountHolder: 'John Doe',
      };

      const createdPaymentMethod = {
        id: 'pm-1',
        userId,
        ...createDto,
        isPrimary: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.paymentMethod.create.mockResolvedValue(createdPaymentMethod);

      const result = await service.create(userId, createDto);

      expect(mockPrismaService.paymentMethod.create).toHaveBeenCalledWith({
        data: {
          userId,
          ...createDto,
        },
      });
      expect(result).toEqual(createdPaymentMethod);
    });

    it('should unset other primary methods when creating with isPrimary true', async () => {
      const userId = 'user-1';
      const createDto = {
        type: 'e_wallet',
        provider: 'OVO',
        accountNumber: '081234567890',
        accountHolder: 'John Doe',
        isPrimary: true,
      };

      const createdPaymentMethod = {
        id: 'pm-1',
        userId,
        ...createDto,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.paymentMethod.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.paymentMethod.create.mockResolvedValue(createdPaymentMethod);

      await service.create(userId, createDto);

      expect(mockPrismaService.paymentMethod.updateMany).toHaveBeenCalledWith({
        where: { userId },
        data: { isPrimary: false },
      });
    });
  });

  describe('findAll', () => {
    it('should return all payment methods for a user', async () => {
      const userId = 'user-1';
      const paymentMethods = [
        {
          id: 'pm-1',
          userId,
          type: 'bank_transfer',
          isPrimary: true,
        },
        {
          id: 'pm-2',
          userId,
          type: 'e_wallet',
          isPrimary: false,
        },
      ];

      mockPrismaService.paymentMethod.findMany.mockResolvedValue(paymentMethods);

      const result = await service.findAll(userId);

      expect(mockPrismaService.paymentMethod.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
      });
      expect(result).toEqual(paymentMethods);
    });
  });

  describe('getPrimary', () => {
    it('should return primary payment method', async () => {
      const userId = 'user-1';
      const primaryMethod = {
        id: 'pm-1',
        userId,
        isPrimary: true,
        isActive: true,
      };

      mockPrismaService.paymentMethod.findFirst.mockResolvedValue(primaryMethod);

      const result = await service.getPrimary(userId);

      expect(mockPrismaService.paymentMethod.findFirst).toHaveBeenCalledWith({
        where: { userId, isPrimary: true, isActive: true },
      });
      expect(result).toEqual(primaryMethod);
    });

    it('should return null if no primary method', async () => {
      mockPrismaService.paymentMethod.findFirst.mockResolvedValue(null);

      const result = await service.getPrimary('user-1');

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return a payment method by id', async () => {
      const userId = 'user-1';
      const pmId = 'pm-1';
      const paymentMethod = {
        id: pmId,
        userId,
        type: 'bank_transfer',
      };

      mockPrismaService.paymentMethod.findFirst.mockResolvedValue(paymentMethod);

      const result = await service.findOne(pmId, userId);

      expect(mockPrismaService.paymentMethod.findFirst).toHaveBeenCalledWith({
        where: { id: pmId, userId },
      });
      expect(result).toEqual(paymentMethod);
    });

    it('should throw NotFoundException when payment method not found', async () => {
      mockPrismaService.paymentMethod.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
  describe('update', () => {
    it('should update a payment method', async () => {
      const userId = 'user-1';
      const pmId = 'pm-1';
      const updateDto = {
        accountHolder: 'Jane Doe',
        accountNumber: '9876543210',
      };

      const existingPaymentMethod = {
        id: pmId,
        userId,
        type: 'bank_transfer',
      };

      const updatedPaymentMethod = {
        ...existingPaymentMethod,
        ...updateDto,
      };

      mockPrismaService.paymentMethod.findFirst.mockResolvedValue(existingPaymentMethod);
      mockPrismaService.paymentMethod.update.mockResolvedValue(updatedPaymentMethod);

      const result = await service.update(pmId, userId, updateDto);

      expect(mockPrismaService.paymentMethod.update).toHaveBeenCalledWith({
        where: { id: pmId },
        data: updateDto,
      });
      expect(result).toEqual(updatedPaymentMethod);
    });

    it('should unset other primary methods when updating with isPrimary true', async () => {
      const userId = 'user-1';
      const pmId = 'pm-1';
      const updateDto = {
        isPrimary: true,
      };

      const existingPaymentMethod = {
        id: pmId,
        userId,
        isPrimary: false,
      };

      mockPrismaService.paymentMethod.findFirst.mockResolvedValue(existingPaymentMethod);
      mockPrismaService.paymentMethod.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.paymentMethod.update.mockResolvedValue({ ...existingPaymentMethod, isPrimary: true });

      await service.update(pmId, userId, updateDto);

      expect(mockPrismaService.paymentMethod.updateMany).toHaveBeenCalledWith({
        where: { userId, id: { not: pmId } },
        data: { isPrimary: false },
      });
    });

    it('should throw NotFoundException when payment method not found', async () => {
      mockPrismaService.paymentMethod.findFirst.mockResolvedValue(null);

      await expect(
        service.update('non-existent', 'user-1', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a payment method', async () => {
      const userId = 'user-1';
      const pmId = 'pm-1';
      const paymentMethod = {
        id: pmId,
        userId,
      };

      mockPrismaService.paymentMethod.findFirst.mockResolvedValue(paymentMethod);
      mockPrismaService.paymentMethod.delete.mockResolvedValue(paymentMethod);

      const result = await service.delete(pmId, userId);

      expect(mockPrismaService.paymentMethod.delete).toHaveBeenCalledWith({
        where: { id: pmId },
      });
      expect(result).toEqual(paymentMethod);
    });

    it('should throw NotFoundException when payment method not found', async () => {
      mockPrismaService.paymentMethod.findFirst.mockResolvedValue(null);

      await expect(service.delete('non-existent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('setPrimary', () => {
    it('should set payment method as primary', async () => {
      const userId = 'user-1';
      const pmId = 'pm-1';
      const paymentMethod = {
        id: pmId,
        userId,
        isPrimary: false,
      };

      const updatedPaymentMethod = {
        ...paymentMethod,
        isPrimary: true,
      };

      mockPrismaService.paymentMethod.findFirst.mockResolvedValue(paymentMethod);
      mockPrismaService.paymentMethod.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.paymentMethod.update.mockResolvedValue(updatedPaymentMethod);

      const result = await service.setPrimary(pmId, userId);

      // Should unset other primaries (excluding current one)
      expect(mockPrismaService.paymentMethod.updateMany).toHaveBeenCalledWith({
        where: { userId, id: { not: pmId } },
        data: { isPrimary: false },
      });

      // Then set this one as primary
      expect(mockPrismaService.paymentMethod.update).toHaveBeenCalledWith({
        where: { id: pmId },
        data: { isPrimary: true },
      });

      expect(result.isPrimary).toBe(true);
    });

    it('should throw NotFoundException when payment method not found', async () => {
      mockPrismaService.paymentMethod.findFirst.mockResolvedValue(null);

      await expect(service.setPrimary('non-existent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
