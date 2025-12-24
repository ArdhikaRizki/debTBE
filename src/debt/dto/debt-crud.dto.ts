export class CreateDebtDto {
  type: 'hutang' | 'piutang';
  name: string;
  otherUserId?: string;
  amount: number;
  description: string;
  date: string; // ISO date string
  groupId?: string;
  status?: 'pending' | 'confirmed' | 'rejected' | 'settlement_requested';
}

export class UpdateDebtDto {
  type?: 'hutang' | 'piutang';
  name?: string;
  otherUserId?: string;
  amount?: number;
  description?: string;
  date?: string;
  isPaid?: boolean;
  status?: 'pending' | 'confirmed' | 'rejected' | 'settlement_requested';
  rejectionReason?: string;
}

export class DebtResponseDto {
  id: string;
  userId: string;
  type: string;
  name: string;
  otherUserId?: string;
  amount: number;
  description: string;
  date: Date;
  isPaid: boolean;
  groupId?: string;
  status: string;
  initiatedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
