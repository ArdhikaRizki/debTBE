export class CreateGroupDto {
  name: string;
  description: string;
  groupImage?: string;
}

export class UpdateGroupDto {
  name?: string;
  description?: string;
  groupImage?: string;
  isActive?: boolean;
}

export class AddGroupMemberDto {
  userId: string;
}

export class GroupResponseDto {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  isActive: boolean;
  groupImage?: string;
  createdAt: Date;
  updatedAt: Date;
  creator?: any;
  members?: any[];
  _count?: {
    members: number;
    transactions: number;
  };
}
