export interface UserBalance {
  userId: string;
  userName: string;
  balance: number;
}

export interface OptimizedDebt {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

export interface DebtActivity {
  id: string;
  timestamp: string;
  type: 'payment' | 'new_debt' | 'settled';
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
  description: string;
}

export class OptimizeDto {
  allDebts: any[];
  allUsers: any[];
}

export class SimulateDto {
  allDebts: any[];
  allUsers: any[];
  fromUserId: string;
  toUserId: string;
  amount: number;
}

export class PathDto {
  fromUserId: string;
  toUserId: string;
  allDebts?: any[];
  allUsers?: any[];
  optimizedDebts?: OptimizedDebt[];
}

export class ActivityDto {
  type: 'payment' | 'new_debt' | 'settled';
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
  description: string;
}
