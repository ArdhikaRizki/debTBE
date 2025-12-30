import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DebtCrudService } from './debt-crud.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DebtCrudService', () => {
  let service: DebtCrudService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    debt: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DebtCrudService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DebtCrudService>(DebtCrudService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new debt', async () => {
      const userId = 'user-1';
      const createDto = {
        type: 'hutang' as const,
        name: 'John Doe',
        amount: 100000,
        description: 'Dinner payment',
        date: '2025-12-25',
      };

      const createdDebt = {
        id: 'debt-1',
        userId,
        ...createDto,
        date: new Date(createDto.date),
        isPaid: false,
        status: 'confirmed',
        initiatedBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: userId, name: 'Test', username: 'test' },
        otherUser: null,
      };

      mockPrismaService.debt.create.mockResolvedValue(createdDebt);

      const result = await service.create(userId, createDto);

      expect(mockPrismaService.debt.create).toHaveBeenCalledWith({
        data: {
          userId,
          type: createDto.type,
          name: createDto.name,
          otherUserId: undefined,
          amount: createDto.amount,
          description: createDto.description,
          date: new Date(createDto.date),
          groupId: undefined,
          status: 'confirmed',
          initiatedBy: userId,
        },
        include: {
          user: {
            select: { id: true, name: true, username: true },
          },
          otherUser: {
            select: { id: true, name: true, username: true },
          },
        },
      });
      expect(result).toEqual(createdDebt);
    });
  });

  describe('findAll', () => {
    it('should return all debts for a user', async () => {
      const userId = 'user-1';
      const debts = [
        { id: 'debt-1', userId, type: 'hutang', amount: 100000 },
        { id: 'debt-2', userId, type: 'piutang', amount: 50000 },
      ];

      mockPrismaService.debt.findMany.mockResolvedValue(debts);

      const result = await service.findAll(userId);

      expect(mockPrismaService.debt.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          user: { select: { id: true, name: true, username: true } },
          otherUser: { select: { id: true, name: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(debts);
    });

    it('should filter debts by type', async () => {
      const userId = 'user-1';
      const filters = { type: 'hutang' };

      mockPrismaService.debt.findMany.mockResolvedValue([]);

      await service.findAll(userId, filters);

      expect(mockPrismaService.debt.findMany).toHaveBeenCalledWith({
        where: { userId, type: 'hutang' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter debts by isPaid status', async () => {
      const userId = 'user-1';
      const filters = { isPaid: true };

      mockPrismaService.debt.findMany.mockResolvedValue([]);

      await service.findAll(userId, filters);

      expect(mockPrismaService.debt.findMany).toHaveBeenCalledWith({
        where: { userId, isPaid: true },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a debt by id', async () => {
      const userId = 'user-1';
      const debtId = 'debt-1';
      const debt = {
        id: debtId,
        userId,
        type: 'hutang',
        amount: 100000,
      };

      mockPrismaService.debt.findFirst.mockResolvedValue(debt);

      const result = await service.findOne(debtId, userId);

      expect(mockPrismaService.debt.findFirst).toHaveBeenCalledWith({
        where: { id: debtId, userId },
        include: expect.any(Object),
      });
      expect(result).toEqual(debt);
    });

    it('should throw NotFoundException when debt not found', async () => {
      const userId = 'user-1';
      const debtId = 'non-existent';

      mockPrismaService.debt.findFirst.mockResolvedValue(null);

      await expect(service.findOne(debtId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a debt', async () => {
      const userId = 'user-1';
      const debtId = 'debt-1';
      const updateDto = {
        amount: 150000,
        description: 'Updated description',
      };

      const existingDebt = { id: debtId, userId };
      const updatedDebt = { ...existingDebt, ...updateDto };

      mockPrismaService.debt.findFirst.mockResolvedValue(existingDebt);
      mockPrismaService.debt.update.mockResolvedValue(updatedDebt);

      const result = await service.update(debtId, userId, updateDto);

      expect(mockPrismaService.debt.update).toHaveBeenCalledWith({
        where: { id: debtId },
        data: {
          amount: 150000,
          description: 'Updated description',
        },
        include: expect.any(Object),
      });
      expect(result).toEqual(updatedDebt);
    });

    it('should throw NotFoundException when debt not found', async () => {
      mockPrismaService.debt.findFirst.mockResolvedValue(null);

      await expect(
        service.update('non-existent', 'user-1', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a debt', async () => {
      const userId = 'user-1';
      const debtId = 'debt-1';
      const debt = { id: debtId, userId };

      mockPrismaService.debt.findFirst.mockResolvedValue(debt);
      mockPrismaService.debt.delete.mockResolvedValue(debt);

      const result = await service.delete(debtId, userId);

      expect(mockPrismaService.debt.delete).toHaveBeenCalledWith({
        where: { id: debtId },
      });
      expect(result).toEqual(debt);
    });
  });

  describe('markPaid', () => {
    it('should mark debt as paid', async () => {
      const userId = 'user-1';
      const debtId = 'debt-1';
      const debt = { id: debtId, userId, isPaid: false };
      const updatedDebt = { ...debt, isPaid: true };

      mockPrismaService.debt.findFirst.mockResolvedValue(debt);
      mockPrismaService.debt.update.mockResolvedValue(updatedDebt);

      const result = await service.markPaid(debtId, userId);

      expect(mockPrismaService.debt.update).toHaveBeenCalledWith({
        where: { id: debtId },
        data: { isPaid: true },
        include: expect.any(Object),
      });
      expect(result.isPaid).toBe(true);
    });
  });

  describe('getSummary', () => {
    it('should calculate debt summary correctly', async () => {
      const userId = 'user-1';
      const debts = [
        { type: 'hutang', amount: 100000, isPaid: false },
        { type: 'hutang', amount: 50000, isPaid: true },
        { type: 'piutang', amount: 75000, isPaid: false },
        { type: 'piutang', amount: 25000, isPaid: true },
      ];

      mockPrismaService.debt.findMany.mockResolvedValue(debts);

      const result = await service.getSummary(userId);

      expect(result).toEqual({
        totalHutang: 100000,
        totalPiutang: 75000,
        totalPaidHutang: 50000,
        totalPaidPiutang: 25000,
        netBalance: -25000, // piutang - hutang = 75000 - 100000
        totalDebts: 4,
        unpaidDebts: 2,
        paidDebts: 2,
      });
    });

    it('should return zero values when no debts exist', async () => {
      mockPrismaService.debt.findMany.mockResolvedValue([]);

      const result = await service.getSummary('user-1');

      expect(result).toEqual({
        totalHutang: 0,
        totalPiutang: 0,
        totalPaidHutang: 0,
        totalPaidPiutang: 0,
        netBalance: 0,
        totalDebts: 0,
        unpaidDebts: 0,
        paidDebts: 0,
      });
    });
  });
});
