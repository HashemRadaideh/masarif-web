import type { ChartOptions } from 'chart.js';
import type { TxType } from './expense.types';

export const CURRENCY = 'USD' as const;

export const TYPE_OPTIONS: { label: string; value: TxType }[] = [
  { label: 'Expense', value: 'Expense' },
  { label: 'Income', value: 'Income' },
];

export const CATEGORY_OPTIONS: { label: string; value: string }[] = [
  'rent',
  'groceries',
  'transport',
  'dining',
  'utilities',
  'health',
  'entertainment',
  'salary',
  'other',
].map((c) => ({ label: c[0].toUpperCase() + c.slice(1), value: c }));

export const LINE_OPTIONS: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: true }, tooltip: { enabled: true } },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: 'rgba(0,0,0,0.06)' } },
  },
};

export const DOUGHNUT_OPTIONS: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' } },
};
