import { Expense } from '../../../models/expense/expense.models';
import type { Row } from './expense.types';

export function getId(e: Expense): number {
  return ((e as any).id ?? (e as any)._id) as number;
}

export function toRow(e: Expense): Row {
  const amount = Number(e.amount);
  return {
    id: getId(e),
    date: new Date(e.expenseDate),
    type: amount >= 0 ? 'Income' : 'Expense',
    category: e.category,
    title: (e as any).title ?? undefined,
    note: e.notes ?? undefined,
    amount,
  };
}

export function sumBy<T>(arr: T[], sel: (x: T) => number): number {
  let s = 0;
  for (const i of arr) s += sel(i);
  return s;
}

export function currency(n: number, curr: string) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: curr,
    maximumFractionDigits: 0,
  }).format(n);
}

export function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );
}

export function aggregateMonthly(rows: Row[]) {
  const now = new Date();
  const months: string[] = [];
  const keyFor = (d: Date) =>
    `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  const keys: string[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(keyFor(d));
    months.push(d.toLocaleString(undefined, { month: 'short' }));
  }

  const income = new Map<string, number>(keys.map((k) => [k, 0]));
  const expense = new Map<string, number>(keys.map((k) => [k, 0]));

  for (const r of rows) {
    const k = keyFor(new Date(r.date.getFullYear(), r.date.getMonth(), 1));
    if (!income.has(k)) continue;
    if (r.amount >= 0) income.set(k, (income.get(k) ?? 0) + r.amount);
    else expense.set(k, (expense.get(k) ?? 0) + Math.abs(r.amount));
  }

  return {
    labels: months,
    income: keys.map((k) => income.get(k) ?? 0),
    expense: keys.map((k) => expense.get(k) ?? 0),
  };
}

export function aggregateExpenseByCategory(rows: Row[]) {
  const map: Record<string, number> = {};
  for (const r of rows)
    if (r.amount < 0)
      map[r.category] = (map[r.category] ?? 0) + Math.abs(r.amount);
  return map;
}
