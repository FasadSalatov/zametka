export type TransactionType = 'income' | 'expense';
export type TransactionCategory = string;

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  description?: string;
  date: string; // ISO дата
  createdAt: string; // ISO дата
  updatedAt: string; // ISO дата
} 