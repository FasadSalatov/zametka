import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction } from '@/app/finances/types';

interface FinancesState {
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updatedTransaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
}

export const useFinancesStore = create<FinancesState>()(
  persist(
    (set) => ({
      transactions: [],
      setTransactions: (transactions) => set({ transactions }),
      addTransaction: (transaction) => set((state) => ({ 
        transactions: [...state.transactions, transaction] 
      })),
      updateTransaction: (id, updatedTransaction) => set((state) => ({ 
        transactions: state.transactions.map((transaction) => 
          transaction.id === id ? { ...transaction, ...updatedTransaction, updatedAt: new Date().toISOString() } : transaction
        ) 
      })),
      deleteTransaction: (id) => set((state) => ({ 
        transactions: state.transactions.filter((transaction) => transaction.id !== id) 
      })),
    }),
    { name: 'finances' }
  )
); 