import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';

import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import type { ChartData, ChartOptions, ChartDataset } from 'chart.js';
import { ExpensesService } from './expense.service';
import { Expense, CreateExpense } from './expense.models';

type TxType = 'Expense' | 'Income';
interface Row {
  id: number;
  date: Date;
  type: TxType;
  category: string;
  title?: string;
  note?: string;
  amount: number;
}

@Component({
  selector: 'app-expenses',
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    SelectModule,
    TextareaModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  template: `
    <div class="mx-auto max-w-7xl p-4 md:p-6">
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12 md:col-span-4">
          <p-card class="bg-accent! text-accent-foreground!">
            <ng-template pTemplate="title">Balance</ng-template>
            <div class="text-3xl font-bold">
              {{ format(balance()) }}
            </div>
          </p-card>
        </div>
        <div class="col-span-12 md:col-span-4">
          <p-card class="bg-accent! text-accent-foreground!">
            <ng-template pTemplate="title">Total Income</ng-template>
            <div class="text-3xl font-bold text-emerald-600">
              {{ format(totalIncome()) }}
            </div>
          </p-card>
        </div>
        <div class="col-span-12 md:col-span-4">
          <p-card class="bg-accent! text-accent-foreground!">
            <ng-template pTemplate="title">Total Expense</ng-template>
            <div class="text-3xl font-bold text-rose-600">
              {{ format(totalExpense()) }}
            </div>
          </p-card>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-4 mt-4">
        <div class="col-span-12 md:col-span-7">
          <p-card class="bg-accent! text-accent-foreground!">
            <ng-template pTemplate="title"
              >Income vs Expense (Monthly)</ng-template
            >
            <p-chart
              type="line"
              [data]="lineData()"
              [options]="lineOptions"
              class="h-[280px]"
            ></p-chart>
          </p-card>
        </div>
        <div class="col-span-12 md:col-span-5">
          <p-card class="bg-accent! text-accent-foreground!">
            <ng-template pTemplate="title">Expenses by Category</ng-template>
            <p-chart
              type="doughnut"
              [data]="doughnutData()"
              [options]="doughnutOptions"
              class="h-[280px]"
            ></p-chart>
          </p-card>
        </div>
      </div>

      <p-card class="bg-accent! text-accent-foreground! mt-4">
        <ng-template pTemplate="title">
          <div class="flex justify-between">
            <span> Recent Transactions </span>
            <button
              pButton
              type="button"
              icon="pi pi-plus"
              label="Add"
              (click)="onAdd()"
            ></button>
          </div>
        </ng-template>

        <p-table [value]="rows()">
          <ng-template pTemplate="header">
            <tr>
              <th class="bg-muted! text-muted-foreground!">Date</th>
              <th class="bg-muted! text-muted-foreground!">Type</th>
              <th class="bg-muted! text-muted-foreground!">Title</th>
              <th class="bg-muted! text-muted-foreground!">Category</th>
              <th class="bg-muted! text-muted-foreground!">Note</th>
              <th class="bg-muted! text-muted-foreground! text-right">
                Amount
              </th>
              <th class="bg-muted! text-muted-foreground! text-right w-28">
                Actions
              </th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-r>
            <tr>
              <td class="bg-accent/90! text-accent-foreground!">
                {{ r.date | date: 'mediumDate' }}
              </td>
              <td class="bg-accent/90! text-accent-foreground!">
                <p-tag
                  [value]="r.type"
                  [severity]="r.amount >= 0 ? 'success' : 'danger'"
                ></p-tag>
              </td>
              <td class="bg-accent/90! text-accent-foreground!">
                {{ r.title || '—' }}
                <!-- NEW -->
              </td>
              <td class="bg-accent/90! text-accent-foreground! capitalize">
                {{ r.category }}
              </td>
              <td class="bg-accent/90! text-accent-foreground!">
                {{ r.note }}
              </td>
              <td
                class="bg-accent/90! text-right font-semibold"
                [ngClass]="r.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'"
              >
                {{ format(r.amount) }}
              </td>
              <td class="bg-accent/90! text-right space-x-1">
                <button
                  pButton
                  type="button"
                  icon="pi pi-pencil"
                  class="p-button-text p-button-sm"
                  (click)="onEdit(r)"
                ></button>

                <button
                  pButton
                  type="button"
                  icon="pi pi-trash"
                  severity="danger"
                  class="p-button-text p-button-sm"
                  (click)="confirmDelete(r)"
                ></button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>

    <p-confirmDialog
      [style]="{ width: '480px', maxWidth: '95vw' }"
    ></p-confirmDialog>

    <p-dialog
      [(visible)]="showAddDialog"
      [modal]="true"
      [style]="{ width: '560px', maxWidth: '95vw' }"
      [header]="editId() ? 'Edit Expense' : 'Add Expense'"
      (onHide)="onDialogHide()"
    >
      <form [formGroup]="addForm" class="grid gap-3">
        <div class="grid gap-2">
          <label class="text-sm">Title</label>
          <input
            pInputText
            formControlName="title"
            placeholder="e.g. Groceries"
          />
        </div>

        <div class="grid gap-2">
          <label class="text-sm">Type</label>
          <p-select
            formControlName="type"
            [options]="typeOptions"
            optionLabel="label"
            optionValue="value"
            [style]="{ width: '100%' }"
          >
          </p-select>
        </div>

        <div class="grid gap-2">
          <label class="text-sm">Category</label>
          <p-select
            formControlName="category"
            [options]="categoryOptions"
            [editable]="true"
            placeholder="Select or type…"
            [style]="{ width: '100%' }"
            [appendTo]="'body'"
          >
          </p-select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="grid gap-2">
            <label class="text-sm">Amount</label>
            <p-inputNumber
              formControlName="amount"
              [mode]="'currency'"
              currency="USD"
              [minFractionDigits]="0"
              [maxFractionDigits]="2"
            ></p-inputNumber>
          </div>

          <div class="grid gap-2">
            <label class="text-sm">Date</label>
            <p-datepicker
              formControlName="expenseDate"
              [showIcon]="true"
              [iconDisplay]="'input'"
              [appendTo]="'body'"
              [inputStyleClass]="'w-full'"
            ></p-datepicker>
          </div>
        </div>

        <div class="grid gap-2">
          <label class="text-sm">Notes</label>
          <textarea
            pTextarea
            rows="3"
            formControlName="notes"
            placeholder="Optional"
          ></textarea>
        </div>

        <div class="mt-2 flex justify-end gap-2">
          <button
            pButton
            type="button"
            label="Cancel"
            class="p-button-text"
            (click)="closeDialog()"
          ></button>

          <button
            pButton
            type="button"
            label="Save"
            [disabled]="addForm.invalid || saving()"
            (click)="save()"
          ></button>
        </div>
      </form>
    </p-dialog>
  `,
})
export class ExpensesComponent implements OnInit {
  private api = inject(ExpensesService);
  private fb = inject(FormBuilder);
  private toast = inject(MessageService);

  private expenses = signal<Expense[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);
  editId = signal<number | null>(null);

  showAddDialog = signal(false);
  saving = signal(false);

  typeOptions = [
    { label: 'Expense', value: 'Expense' as TxType },
    { label: 'Income', value: 'Income' as TxType },
  ];

  categoryOptions = [
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

  addForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    type: ['Expense' as TxType, Validators.required],
    category: ['', [Validators.required, Validators.maxLength(100)]],
    amount: [null as number | null, [Validators.required]],
    expenseDate: [new Date(), Validators.required],
    notes: ['' as string | null],
  });

  rows = computed<Row[]>(() =>
    this.expenses().map((e) => ({
      id: (e as any).id ?? (e as any)._id,
      date: new Date(e.expenseDate),
      type: Number(e.amount) >= 0 ? 'Income' : 'Expense',
      category: e.category,
      title: (e as any).title ?? undefined,
      note: e.notes ?? undefined,
      amount: Number(e.amount),
    })),
  );

  totalIncome = computed(() =>
    this.rows()
      .filter((r) => r.amount > 0)
      .reduce((s, r) => s + r.amount, 0),
  );
  totalExpense = computed(() =>
    this.rows()
      .filter((r) => r.amount < 0)
      .reduce((s, r) => s + Math.abs(r.amount), 0),
  );
  balance = computed(() => this.rows().reduce((s, r) => s + r.amount, 0));

  lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true }, tooltip: { enabled: true } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(0,0,0,0.06)' } },
    },
  };
  doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  lineData = computed<ChartData<'line', number[], string>>(() => {
    const { labels, income, expense } = this.aggregateMonthly(this.rows());
    const datasets: ChartDataset<'line', number[]>[] = [
      { label: 'Income', data: income, borderWidth: 3, tension: 0.35 },
      { label: 'Expense', data: expense, borderWidth: 3, tension: 0.35 },
    ];
    return { labels, datasets };
  });

  doughnutData = computed<ChartData<'doughnut', number[], string>>(() => {
    const byCat = this.aggregateExpenseByCategory(this.rows());
    const labels = Object.keys(byCat);
    const data = labels.map((k) => byCat[k]);
    const datasets: ChartDataset<'doughnut', number[]>[] = [{ data }];
    return { labels, datasets };
  });

  ngOnInit(): void {
    this.fetch();
  }

  private fetch() {
    this.loading.set(true);
    this.error.set(null);
    this.api.getAll().subscribe({
      next: (res) => {
        this.expenses.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load expenses');
        console.error(err);
        this.err('Failed to load expenses');
        this.loading.set(false);
      },
    });
  }

  private ok(summary: string, detail?: string) {
    this.toast.add({ severity: 'success', summary, detail, life: 2500 });
  }

  private err(summary: string, detail?: string) {
    this.toast.add({ severity: 'error', summary, detail, life: 4000 });
  }

  onAdd() {
    this.showAddDialog.set(true);
  }
  closeDialog() {
    this.showAddDialog.set(false);
  }
  onDialogHide() {
    this.addForm.reset({
      title: '',
      type: 'Expense',
      category: '',
      amount: null,
      expenseDate: new Date(),
      notes: '',
    });
    this.editId.set(null);
  }

  onEdit(r: Row) {
    const type: TxType = r.amount >= 0 ? 'Income' : 'Expense';
    const absAmount = Math.abs(r.amount);

    this.addForm.patchValue({
      title: r.title ?? '',
      type,
      category: r.category,
      amount: absAmount,
      expenseDate: r.date,
      notes: r.note ?? '',
    });

    this.editId.set(r.id);
    this.showAddDialog.set(true);
  }

  private confirmation = inject(ConfirmationService);

  confirmDelete(r: Row) {
    const lines = [
      r.title ? `<div><b>Title:</b> ${this.escape(r.title)}</div>` : '',
      `<div><b>Type:</b> ${r.type}</div>`,
      `<div><b>Category:</b> ${this.escape(r.category)}</div>`,
      r.note ? `<div><b>Notes:</b> ${this.escape(r.note)}</div>` : '',
      `<div><b>Date:</b> ${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(r.date)}</div>`,
      `<div><b>Amount:</b> ${this.format(r.amount)}</div>`,
    ]
      .filter(Boolean)
      .join('');

    this.confirmation.confirm({
      header: 'Delete Expense',
      message: `
      <div>Are you sure you want to delete this expense?</div>
      <div class="mt-2 p-3 rounded bg-background">
        ${lines}
      </div>
    `,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => this.deleteExpense(r.id),
    });
  }

  deleteExpense(id: number) {
    if (!id) return;

    const prev = this.expenses();
    this.expenses.set(
      prev.filter((e) => ((e as any).id ?? (e as any)._id) !== id),
    );

    this.api.delete(id).subscribe({
      next: () => {
        this.ok('Expense deleted');
      },
      error: (err) => {
        console.error(err);
        this.expenses.set(prev);
        this.err('Failed to delete expense');
      },
    });
  }

  private escape(s: string) {
    return s.replace(
      /[&<>"']/g,
      (c) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[c]!,
    );
  }

  save() {
    if (this.addForm.invalid) return;
    this.saving.set(true);

    const v = this.addForm.value as {
      title: string;
      type: TxType;
      category: string;
      amount: number;
      expenseDate: Date;
      notes: string | null;
    };

    const signedAmount =
      v.type === 'Expense' ? -Math.abs(v.amount) : Math.abs(v.amount);

    const payload: CreateExpense = {
      title: v.title.trim(),
      category: v.category.trim(),
      amount: signedAmount,
      expenseDate: new Date(v.expenseDate).toISOString(),
      notes: v.notes && v.notes.trim().length ? v.notes.trim() : null,
    };

    const id = this.editId();

    if (id != null) {
      const prev = this.expenses();

      this.expenses.set(
        prev.map((e) =>
          ((e as any).id ?? (e as any)._id) === id ? { ...e, ...payload } : e,
        ),
      );

      this.api.update(id, payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeDialog();
          this.ok('Expense updated', v.title);
        },
        error: (err) => {
          console.error(err);
          this.expenses.set(prev);
          this.saving.set(false);
          this.err('Failed to update expense');
        },
      });
    } else {
      this.api.create(payload).subscribe({
        next: (created) => {
          this.expenses.update((list) => [created, ...list]);
          this.saving.set(false);
          this.closeDialog();
          this.ok('Expense added', created?.title ?? undefined);
        },
        error: (err) => {
          console.error(err);
          this.saving.set(false);
          this.err('Failed to add expense');
        },
      });
    }
  }

  private aggregateMonthly(rows: Row[]) {
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
    const incomeMap = new Map<string, number>(keys.map((k) => [k, 0]));
    const expenseMap = new Map<string, number>(keys.map((k) => [k, 0]));
    for (const r of rows) {
      const k = keyFor(new Date(r.date.getFullYear(), r.date.getMonth(), 1));
      if (!incomeMap.has(k)) continue;
      if (r.amount >= 0) incomeMap.set(k, (incomeMap.get(k) ?? 0) + r.amount);
      else expenseMap.set(k, (expenseMap.get(k) ?? 0) + Math.abs(r.amount));
    }
    const income = keys.map((k) => incomeMap.get(k) ?? 0);
    const expense = keys.map((k) => expenseMap.get(k) ?? 0);
    return { labels: months, income, expense };
  }

  private aggregateExpenseByCategory(rows: Row[]) {
    const map: Record<string, number> = {};
    for (const r of rows)
      if (r.amount < 0)
        map[r.category] = (map[r.category] ?? 0) + Math.abs(r.amount);
    return map;
  }

  format(n: number) {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n);
  }
}
