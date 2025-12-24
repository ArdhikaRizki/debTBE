import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupTransactionDto, UpdateGroupTransactionDto } from './dto/group-transaction.dto';

@Injectable()
export class GroupTransactionService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateGroupTransactionDto) {
    // Verify user is member of the group
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: dto.groupId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return this.prisma.groupTransaction.create({
      data: {
        groupId: dto.groupId,
        fromUserId: dto.fromUserId,
        toUserId: dto.toUserId,
        amount: dto.amount,
        description: dto.description,
        date: new Date(dto.date),
        createdBy: userId,
      },
      include: {
        fromUser: {
          select: { id: true, name: true, username: true },
        },
        toUser: {
          select: { id: true, name: true, username: true },
        },
        creator: {
          select: { id: true, name: true, username: true },
        },
      },
    });
  }

  async findAll(userId: string, groupId?: string) {
    const where: any = {};

    if (groupId) {
      // Verify user is member of the group
      const membership = await this.prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId,
          },
        },
      });

      if (!membership) {
        throw new ForbiddenException('You are not a member of this group');
      }

      where.groupId = groupId;
    } else {
      // Get all transactions from groups user is a member of
      const userGroups = await this.prisma.groupMember.findMany({
        where: { userId },
        select: { groupId: true },
      });

      where.groupId = {
        in: userGroups.map(g => g.groupId),
      };
    }

    return this.prisma.groupTransaction.findMany({
      where,
      include: {
        fromUser: {
          select: { id: true, name: true, username: true },
        },
        toUser: {
          select: { id: true, name: true, username: true },
        },
        creator: {
          select: { id: true, name: true, username: true },
        },
        group: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.prisma.groupTransaction.findUnique({
      where: { id },
      include: {
        fromUser: {
          select: { id: true, name: true, username: true },
        },
        toUser: {
          select: { id: true, name: true, username: true },
        },
        creator: {
          select: { id: true, name: true, username: true },
        },
        group: {
          select: { id: true, name: true },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Verify user is member of the group
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: transaction.groupId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return transaction;
  }

  async update(id: string, userId: string, dto: UpdateGroupTransactionDto) {
    const transaction = await this.findOne(id, userId);

    // Only creator can update
    if (transaction.createdBy !== userId) {
      throw new ForbiddenException('Only transaction creator can update it');
    }

    return this.prisma.groupTransaction.update({
      where: { id },
      data: {
        ...(dto.fromUserId && { fromUserId: dto.fromUserId }),
        ...(dto.toUserId && { toUserId: dto.toUserId }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.isPaid !== undefined && { isPaid: dto.isPaid }),
      },
      include: {
        fromUser: {
          select: { id: true, name: true, username: true },
        },
        toUser: {
          select: { id: true, name: true, username: true },
        },
        creator: {
          select: { id: true, name: true, username: true },
        },
      },
    });
  }

  async delete(id: string, userId: string) {
    const transaction = await this.findOne(id, userId);

    // Only creator can delete
    if (transaction.createdBy !== userId) {
      throw new ForbiddenException('Only transaction creator can delete it');
    }

    return this.prisma.groupTransaction.delete({
      where: { id },
    });
  }

  async markPaid(id: string, userId: string) {
    return this.update(id, userId, { isPaid: true });
  }

  async markUnpaid(id: string, userId: string) {
    return this.update(id, userId, { isPaid: false });
  }
}
