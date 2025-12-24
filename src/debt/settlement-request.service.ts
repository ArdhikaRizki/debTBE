import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSettlementRequestDto, ReviewSettlementDto } from './dto/settlement-request.dto';

@Injectable()
export class SettlementRequestService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateSettlementRequestDto) {
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

    // Only the payer (fromUser) can create settlement request
    if (dto.fromUserId !== userId) {
      throw new ForbiddenException('You can only create settlement requests for yourself');
    }

    return this.prisma.settlementRequest.create({
      data: {
        groupId: dto.groupId,
        fromUserId: dto.fromUserId,
        toUserId: dto.toUserId,
        amount: dto.amount,
        description: dto.description,
      },
      include: {
        fromUser: {
          select: { id: true, name: true, username: true },
        },
        toUser: {
          select: { id: true, name: true, username: true },
        },
        group: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findAll(userId: string, filters?: { groupId?: string; status?: string }) {
    // Get groups user is a member of
    const userGroups = await this.prisma.groupMember.findMany({
      where: { userId },
      select: { groupId: true },
    });

    const groupIds = userGroups.map(g => g.groupId);

    const where: any = {
      groupId: { in: groupIds },
    };

    if (filters?.groupId) {
      where.groupId = filters.groupId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    return this.prisma.settlementRequest.findMany({
      where,
      include: {
        fromUser: {
          select: { id: true, name: true, username: true },
        },
        toUser: {
          select: { id: true, name: true, username: true },
        },
        reviewer: {
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
    const settlement = await this.prisma.settlementRequest.findUnique({
      where: { id },
      include: {
        fromUser: {
          select: { id: true, name: true, username: true },
        },
        toUser: {
          select: { id: true, name: true, username: true },
        },
        reviewer: {
          select: { id: true, name: true, username: true },
        },
        group: {
          select: { id: true, name: true },
        },
      },
    });

    if (!settlement) {
      throw new NotFoundException('Settlement request not found');
    }

    // Verify user is member of the group
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: settlement.groupId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return settlement;
  }

  async review(id: string, userId: string, dto: ReviewSettlementDto) {
    const settlement = await this.findOne(id, userId);

    if (settlement.status !== 'pending') {
      throw new BadRequestException('Settlement request already reviewed');
    }

    // Only the recipient (toUser) can review
    if (settlement.toUserId !== userId) {
      throw new ForbiddenException('Only the recipient can review this settlement request');
    }

    return this.prisma.settlementRequest.update({
      where: { id },
      data: {
        status: dto.status,
        rejectionReason: dto.rejectionReason,
        reviewedBy: userId,
        reviewedAt: new Date(),
      },
      include: {
        fromUser: {
          select: { id: true, name: true, username: true },
        },
        toUser: {
          select: { id: true, name: true, username: true },
        },
        reviewer: {
          select: { id: true, name: true, username: true },
        },
        group: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async delete(id: string, userId: string) {
    const settlement = await this.findOne(id, userId);

    // Only creator (fromUser) can delete, and only if pending
    if (settlement.fromUserId !== userId) {
      throw new ForbiddenException('Only the creator can delete this settlement request');
    }

    if (settlement.status !== 'pending') {
      throw new BadRequestException('Cannot delete a reviewed settlement request');
    }

    return this.prisma.settlementRequest.delete({
      where: { id },
    });
  }

  async getPendingForUser(userId: string, groupId?: string) {
    const where: any = {
      OR: [
        { fromUserId: userId },
        { toUserId: userId },
      ],
      status: 'pending',
    };

    if (groupId) {
      where.groupId = groupId;
    }

    return this.prisma.settlementRequest.findMany({
      where,
      include: {
        fromUser: {
          select: { id: true, name: true, username: true },
        },
        toUser: {
          select: { id: true, name: true, username: true },
        },
        group: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
