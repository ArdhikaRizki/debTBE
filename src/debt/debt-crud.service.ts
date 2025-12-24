import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDebtDto, UpdateDebtDto } from './dto/debt-crud.dto';

@Injectable()
export class DebtCrudService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateDebtDto) {
    return this.prisma.debt.create({
      data: {
        userId,
        type: dto.type,
        name: dto.name,
        otherUserId: dto.otherUserId,
        amount: dto.amount,
        description: dto.description,
        date: new Date(dto.date),
        groupId: dto.groupId,
        status: dto.status || 'confirmed',
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
  }

  async findAll(userId: string, filters?: { type?: string; isPaid?: boolean; status?: string }) {
    return this.prisma.debt.findMany({
      where: {
        userId,
        ...(filters?.type && { type: filters.type }),
        ...(filters?.isPaid !== undefined && { isPaid: filters.isPaid }),
        ...(filters?.status && { status: filters.status }),
      },
      include: {
        user: {
          select: { id: true, name: true, username: true },
        },
        otherUser: {
          select: { id: true, name: true, username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const debt = await this.prisma.debt.findFirst({
      where: { id, userId },
      include: {
        user: {
          select: { id: true, name: true, username: true },
        },
        otherUser: {
          select: { id: true, name: true, username: true },
        },
      },
    });

    if (!debt) {
      throw new NotFoundException('Debt not found');
    }

    return debt;
  }

  async update(id: string, userId: string, dto: UpdateDebtDto) {
    // Verify ownership
    await this.findOne(id, userId);

    return this.prisma.debt.update({
      where: { id },
      data: {
        ...(dto.type && { type: dto.type }),
        ...(dto.name && { name: dto.name }),
        ...(dto.otherUserId !== undefined && { otherUserId: dto.otherUserId }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.isPaid !== undefined && { isPaid: dto.isPaid }),
        ...(dto.status && { status: dto.status }),
        ...(dto.rejectionReason !== undefined && { rejectionReason: dto.rejectionReason }),
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
  }

  async delete(id: string, userId: string) {
    // Verify ownership
    await this.findOne(id, userId);

    return this.prisma.debt.delete({
      where: { id },
    });
  }

  async markPaid(id: string, userId: string) {
    return this.update(id, userId, { isPaid: true });
  }

  async markUnpaid(id: string, userId: string) {
    return this.update(id, userId, { isPaid: false });
  }

  async getSummary(userId: string) {
    const debts = await this.prisma.debt.findMany({
      where: { userId },
    });

    const totalHutang = debts
      .filter(d => d.type === 'hutang' && !d.isPaid)
      .reduce((sum, d) => sum + Number(d.amount), 0);

    const totalPiutang = debts
      .filter(d => d.type === 'piutang' && !d.isPaid)
      .reduce((sum, d) => sum + Number(d.amount), 0);

    const totalPaidHutang = debts
      .filter(d => d.type === 'hutang' && d.isPaid)
      .reduce((sum, d) => sum + Number(d.amount), 0);

    const totalPaidPiutang = debts
      .filter(d => d.type === 'piutang' && d.isPaid)
      .reduce((sum, d) => sum + Number(d.amount), 0);

    return {
      totalHutang,
      totalPiutang,
      totalPaidHutang,
      totalPaidPiutang,
      netBalance: totalPiutang - totalHutang,
      totalDebts: debts.length,
      unpaidDebts: debts.filter(d => !d.isPaid).length,
      paidDebts: debts.filter(d => d.isPaid).length,
    };
  }
}
