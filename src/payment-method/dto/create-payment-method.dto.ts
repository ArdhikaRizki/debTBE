export class CreatePaymentMethodDto {
  type: string; // 'bank_transfer' | 'credit_card' | 'e_wallet' | 'cash'
  provider: string; // 'BCA' | 'Mandiri' | 'OVO' | 'DANA' etc
  accountNumber: string;
  accountHolder: string;
  isPrimary?: boolean;
}

export class UpdatePaymentMethodDto {
  type?: string;
  provider?: string;
  accountNumber?: string;
  accountHolder?: string;
  isPrimary?: boolean;
  isActive?: boolean;
}

export class PaymentMethodResponseDto {
  id: string;
  userId: string;
  type: string;
  provider: string;
  accountNumber: string;
  accountHolder: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
