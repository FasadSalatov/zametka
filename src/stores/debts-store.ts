import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Debt } from '@/app/debts/types';

interface DebtsState {
  debts: Debt[];
  setDebts: (debts: Debt[]) => void;
  addDebt: (debt: Debt) => void;
  updateDebt: (id: string, updatedDebt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  updateDebtStatus: (id: string, status: Debt['status'], paidAmount?: number) => void;
}

export const useDebtsStore = create<DebtsState>()(
  persist(
    (set) => ({
      debts: [],
      setDebts: (debts) => set({ debts }),
      addDebt: (debt) => set((state) => ({ 
        debts: [...state.debts, debt] 
      })),
      updateDebt: (id, updatedDebt) => set((state) => ({ 
        debts: state.debts.map((debt) => 
          debt.id === id ? { ...debt, ...updatedDebt, updatedAt: new Date().toISOString() } : debt
        ) 
      })),
      deleteDebt: (id) => set((state) => ({ 
        debts: state.debts.filter((debt) => debt.id !== id) 
      })),
      updateDebtStatus: (id, status, paidAmount) => set((state) => ({
        debts: state.debts.map((debt) => 
          debt.id === id ? { 
            ...debt, 
            status, 
            paidAmount: paidAmount !== undefined ? paidAmount : debt.paidAmount,
            updatedAt: new Date().toISOString() 
          } : debt
        )
      })),
    }),
    { name: 'debts' }
  )
); 