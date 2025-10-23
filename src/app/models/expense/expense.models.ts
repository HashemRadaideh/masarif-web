export interface Expense {
  id: number;
  title: string;
  category: string;
  amount: number;
  expenseDate: string;
  notes?: string | null;
}

export interface CreateExpense {
  title: string;
  category: string;
  amount: number;
  expenseDate: string;
  notes?: string | null;
}

export type UpdateExpense = CreateExpense;
