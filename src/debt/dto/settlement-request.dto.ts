export class CreateSettlementRequestDto {
  groupId: string;
  fromUserId: string; // user who pays
  toUserId: string; // user who receives
  amount: number;
  description: string;
}

export class ReviewSettlementDto {
  status: 'approved' | 'rejected';
  rejectionReason?: string;
}

export class SettlementRequestResponseDto {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  description: string;
  status: string;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  fromUser?: any;
  toUser?: any;
  reviewer?: any;
  group?: any;
}
