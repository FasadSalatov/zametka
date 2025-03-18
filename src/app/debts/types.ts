export type DebtType = 'lent' | 'borrowed';
export type DebtStatus = 'active' | 'partially_paid' | 'paid';

export interface Debt {
  id: string;
  amount: number;
  type: DebtType;
  personName: string;
  description?: string;
  status: DebtStatus;
  dueDate?: string; // ISO дата
  createdAt: string; // ISO дата
  updatedAt: string; // ISO дата
  paidAmount: number;
} 