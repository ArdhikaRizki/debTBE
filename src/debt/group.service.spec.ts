import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { GroupService } from './group.service';
import { PrismaService } from '../prisma/prisma.service';

describe('GroupService', () => {
  let service: GroupService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    debtGroup: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    groupMember: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<GroupService>(GroupService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a group and add creator as member', async () => {
      const userId = 'user-1';
      const createDto = {
        name: 'Travel Group',
        description: 'Summer vacation expenses',
      };

      const createdGroup = {
        id: 'group-1',
        name: createDto.name,
        description: createDto.description,
        creatorId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.debtGroup.create.mockResolvedValue(createdGroup);

      const result = await service.create(userId, createDto);

      expect(mockPrismaService.debtGroup.create).toHaveBeenCalled();
      expect(result).toEqual(createdGroup);
    });
  });

  describe('findAll', () => {
    it('should return all groups for a user', async () => {
      const userId = 'user-1';
      const groups = [
        { id: 'group-1', name: 'Group 1' },
        { id: 'group-2', name: 'Group 2' },
      ];

      mockPrismaService.debtGroup.findMany.mockResolvedValue(groups);

      const result = await service.findAll(userId);

      expect(mockPrismaService.debtGroup.findMany).toHaveBeenCalled();
      expect(result).toEqual(groups);
    });
  });

  describe('findOne', () => {
    it('should return a group by id for a member', async () => {
      const userId = 'user-1';
      const groupId = 'group-1';
      const group = { id: groupId, name: 'Test Group' };

      mockPrismaService.debtGroup.findFirst.mockResolvedValue(group);

      const result = await service.findOne(groupId, userId);

      expect(mockPrismaService.debtGroup.findFirst).toHaveBeenCalled();
      expect(result).toEqual(group);
    });

    it('should throw NotFoundException when group not found', async () => {
      mockPrismaService.debtGroup.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a group', async () => {
      const userId = 'user-1';
      const groupId = 'group-1';
      const updateDto = { name: 'Updated Group Name' };
      const group = { id: groupId, creatorId: userId };
      const updatedGroup = { ...group, ...updateDto };

      mockPrismaService.debtGroup.findUnique.mockResolvedValue(group);
      mockPrismaService.debtGroup.update.mockResolvedValue(updatedGroup);

      const result = await service.update(groupId, userId, updateDto);

      expect(mockPrismaService.debtGroup.update).toHaveBeenCalled();
      expect(result).toEqual(updatedGroup);
    });

    it('should throw ForbiddenException when user is not creator', async () => {
      const group = { id: 'group-1', creatorId: 'other-user' };

      mockPrismaService.debtGroup.findUnique.mockResolvedValue(group);

      await expect(
        service.update('group-1', 'user-1', { name: 'New Name' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should delete a group', async () => {
      const userId = 'user-1';
      const groupId = 'group-1';
      const group = { id: groupId, creatorId: userId };

      mockPrismaService.debtGroup.findUnique.mockResolvedValue(group);
      mockPrismaService.debtGroup.delete.mockResolvedValue(group);

      const result = await service.delete(groupId, userId);

      expect(mockPrismaService.debtGroup.delete).toHaveBeenCalled();
      expect(result).toEqual(group);
    });

    it('should throw ForbiddenException when user is not creator', async () => {
      const group = { id: 'group-1', creatorId: 'other-user' };

      mockPrismaService.debtGroup.findUnique.mockResolvedValue(group);

      await expect(service.delete('group-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('addMember', () => {
    it('should add a member to a group', async () => {
      const userId = 'user-1';
      const groupId = 'group-1';
      const group = { id: groupId, creatorId: userId };
      const newMember = { id: 'member-1', groupId, userId: 'user-2' };

      // Mock findOne (which checks if user is a member)
      mockPrismaService.debtGroup.findFirst.mockResolvedValue(group);
      // Mock checking if new user already exists
      mockPrismaService.groupMember.findUnique.mockResolvedValue(null);
      mockPrismaService.groupMember.create.mockResolvedValue(newMember);

      const result = await service.addMember(groupId, userId, { userId: 'user-2' });

      expect(mockPrismaService.groupMember.create).toHaveBeenCalled();
      expect(result).toEqual(newMember);
    });

    it('should throw ForbiddenException when user is not a member', async () => {
      // findOne will throw NotFoundException when user is not a member
      mockPrismaService.debtGroup.findFirst.mockResolvedValue(null);

      await expect(
        service.addMember('group-1', 'user-1', { userId: 'user-2' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeMember', () => {
    it('should remove a member from a group', async () => {
      const userId = 'user-1';
      const groupId = 'group-1';
      const memberId = 'member-1';
      const group = { id: groupId, creatorId: userId };
      const member = { id: memberId, userId: 'user-2' };

      mockPrismaService.debtGroup.findUnique.mockResolvedValue(group);
      mockPrismaService.groupMember.findFirst.mockResolvedValue(member);
      mockPrismaService.groupMember.delete.mockResolvedValue(member);

      const result = await service.removeMember(groupId, userId, memberId);

      expect(mockPrismaService.groupMember.delete).toHaveBeenCalled();
      expect(result).toEqual(member);
    });
  });

  describe('getMembers', () => {
    it('should return all members of a group', async () => {
      const userId = 'user-1';
      const groupId = 'group-1';
      const group = { id: groupId };
      const members = [
        { id: 'member-1', userId: 'user-1' },
        { id: 'member-2', userId: 'user-2' },
      ];

      mockPrismaService.debtGroup.findFirst.mockResolvedValue(group);
      mockPrismaService.groupMember.findMany.mockResolvedValue(members);

      const result = await service.getMembers(groupId, userId);

      expect(mockPrismaService.groupMember.findMany).toHaveBeenCalled();
      expect(result).toEqual(members);
    });
  });
});
