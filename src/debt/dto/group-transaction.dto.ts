export class CreateGroupTransactionDto {
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  description: string;
  date: string; // ISO date string
}

export class UpdateGroupTransactionDto {
  fromUserId?: string;
  toUserId?: string;
  amount?: number;
  description?: string;
  date?: string;
  isPaid?: boolean;
}

export class GroupTransactionResponseDto {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  description: string;
  date: Date;
  isPaid: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  fromUser?: any;
  toUser?: any;
  creator?: any;
}
