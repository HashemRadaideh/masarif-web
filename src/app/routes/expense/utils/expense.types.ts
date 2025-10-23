export type TxType = 'Expense' | 'Income';

export interface Row {
  id: number;
  date: Date;
  type: TxType;
  category: string;
  title?: string;
  note?: string;
  amount: number;
}
