import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto, UpdateGroupDto, AddGroupMemberDto } from './dto/group.dto';

@Injectable()
export class GroupService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateGroupDto) {
    const group = await this.prisma.debtGroup.create({
      data: {
        name: dto.name,
        description: dto.description,
        groupImage: dto.groupImage,
        creatorId: userId,
        members: {
          create: {
            userId,
          },
        },
      },
      include: {
        creator: {
          select: { id: true, name: true, username: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, username: true },
            },
          },
        },
        _count: {
          select: { members: true, transactions: true },
        },
      },
    });

    return group;
  }

  async findAll(userId: string) {
    return this.prisma.debtGroup.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        creator: {
          select: { id: true, name: true, username: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, username: true },
            },
          },
        },
        _count: {
          select: { members: true, transactions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const group = await this.prisma.debtGroup.findFirst({
      where: {
        id,
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        creator: {
          select: { id: true, name: true, username: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, username: true, email: true },
            },
          },
        },
        transactions: {
          include: {
            fromUser: {
              select: { id: true, name: true, username: true },
            },
            toUser: {
              select: { id: true, name: true, username: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        settlements: {
          include: {
            fromUser: {
              select: { id: true, name: true, username: true },
            },
            toUser: {
              select: { id: true, name: true, username: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { members: true, transactions: true, settlements: true },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found or you are not a member');
    }

    return group;
  }

  async update(id: string, userId: string, dto: UpdateGroupDto) {
    const group = await this.prisma.debtGroup.findUnique({
      where: { id },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.creatorId !== userId) {
      throw new ForbiddenException('Only group creator can update the group');
    }

    return this.prisma.debtGroup.update({
      where: { id },
      data: dto,
      include: {
        creator: {
          select: { id: true, name: true, username: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, username: true },
            },
          },
        },
        _count: {
          select: { members: true, transactions: true },
        },
      },
    });
  }

  async delete(id: string, userId: string) {
    const group = await this.prisma.debtGroup.findUnique({
      where: { id },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.creatorId !== userId) {
      throw new ForbiddenException('Only group creator can delete the group');
    }

    return this.prisma.debtGroup.delete({
      where: { id },
    });
  }

  async addMember(groupId: string, userId: string, dto: AddGroupMemberDto) {
    // Verify user is a member or creator
    await this.findOne(groupId, userId);

    // Check if user is already a member
    const existing = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: dto.userId,
        },
      },
    });

    if (existing) {
      throw new ForbiddenException('User is already a member');
    }

    return this.prisma.groupMember.create({
      data: {
        groupId,
        userId: dto.userId,
      },
      include: {
        user: {
          select: { id: true, name: true, username: true },
        },
      },
    });
  }

  async removeMember(groupId: string, userId: string, memberUserId: string) {
    const group = await this.prisma.debtGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Only creator can remove members, or user can remove themselves
    if (group.creatorId !== userId && userId !== memberUserId) {
      throw new ForbiddenException('Only group creator can remove members');
    }

    // Cannot remove creator
    if (memberUserId === group.creatorId) {
      throw new ForbiddenException('Cannot remove group creator');
    }

    return this.prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId: memberUserId,
        },
      },
    });
  }

  async getMembers(groupId: string, userId: string) {
    // Verify user is a member
    await this.findOne(groupId, userId);

    return this.prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: { id: true, name: true, username: true, email: true },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }
}
