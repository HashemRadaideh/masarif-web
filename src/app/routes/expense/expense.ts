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
import { ConfirmationService, MessageService } from 'primeng/api';

import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import type { ChartData, ChartDataset } from 'chart.js';
import { ExpensesService } from '../../services/expense/expense';
import { CreateExpense, Expense } from '../../models/expense/expense.models';

import { Row, TxType } from './utils/expense.types';
import {
  CURRENCY,
  TYPE_OPTIONS,
  CATEGORY_OPTIONS,
  LINE_OPTIONS,
  DOUGHNUT_OPTIONS,
} from './utils/expense.constants';
import {
  aggregateExpenseByCategory,
  aggregateMonthly,
  currency,
  escapeHtml,
  getId,
  sumBy,
  toRow,
} from './utils/expense.helpers';

@Component({
  selector: 'app-expense',
  standalone: true,
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
  providers: [ConfirmationService, MessageService],
  templateUrl: './expense.html',
})
export class ExpenseComponent implements OnInit {
  private api = inject(ExpensesService);
  private fb = inject(FormBuilder);
  private confirmation = inject(ConfirmationService);
  private toast = inject(MessageService);

  private expenses = signal<Expense[]>([]);
  private loading = signal(false);
  private error = signal<string | null>(null);

  showAddDialog = signal(false);
  saving = signal(false);
  editId = signal<number | null>(null);

  readonly typeOptions = TYPE_OPTIONS;
  readonly categoryOptions = CATEGORY_OPTIONS;
  readonly currency = CURRENCY;

  addForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    type: ['Expense' as TxType, Validators.required],
    category: ['', [Validators.required, Validators.maxLength(100)]],
    amount: [null as number | null, [Validators.required]],
    expenseDate: [new Date(), Validators.required],
    notes: ['' as string | null],
  });

  rows = computed<Row[]>(() => this.expenses().map(toRow));
  totalIncome = computed(() =>
    sumBy(this.rows(), (r) => (r.amount > 0 ? r.amount : 0)),
  );
  totalExpense = computed(() =>
    sumBy(this.rows(), (r) => (r.amount < 0 ? Math.abs(r.amount) : 0)),
  );
  balance = computed(() => sumBy(this.rows(), (r) => r.amount));

  lineOptions = LINE_OPTIONS;
  doughnutOptions = DOUGHNUT_OPTIONS;

  lineData = computed<ChartData<'line', number[], string>>(() => {
    const { labels, income, expense } = aggregateMonthly(this.rows());
    const datasets: ChartDataset<'line', number[]>[] = [
      { label: 'Income', data: income, borderWidth: 3, tension: 0.35 },
      { label: 'Expense', data: expense, borderWidth: 3, tension: 0.35 },
    ];
    return { labels, datasets };
  });

  doughnutData = computed<ChartData<'doughnut', number[], string>>(() => {
    const byCat = aggregateExpenseByCategory(this.rows());
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
        console.error(err);
        this.error.set('Failed to load expenses');
        this.notify('error', 'Failed to load expenses');
        this.loading.set(false);
      },
    });
  }

  format(n: number) {
    return currency(n, this.currency);
  }

  private notify(
    severity: 'success' | 'error',
    summary: string,
    detail?: string,
  ) {
    this.toast.add({
      severity,
      summary,
      detail,
      life: severity === 'success' ? 2500 : 4000,
    });
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

  confirmDelete(r: Row) {
    const lines = [
      r.title ? `<div><b>Title:</b> ${escapeHtml(r.title)}</div>` : '',
      `<div><b>Type:</b> ${r.type}</div>`,
      `<div><b>Category:</b> ${escapeHtml(r.category)}</div>`,
      r.note ? `<div><b>Notes:</b> ${escapeHtml(r.note)}</div>` : '',
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
    this.expenses.set(prev.filter((e) => getId(e) !== id));

    this.api.delete(id).subscribe({
      next: () => this.notify('success', 'Expense deleted'),
      error: (err) => {
        console.error(err);
        this.expenses.set(prev);
        this.notify('error', 'Failed to delete expense');
      },
    });
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
        prev.map((e) => (getId(e) === id ? { ...e, ...payload } : e)),
      );

      this.api.update(id, payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeDialog();
          this.notify('success', 'Expense updated', v.title);
        },
        error: (err) => {
          console.error(err);
          this.expenses.set(prev);
          this.saving.set(false);
          this.notify('error', 'Failed to update expense');
        },
      });
    } else {
      this.api.create(payload).subscribe({
        next: (created) => {
          this.expenses.update((list) => [created, ...list]);
          this.saving.set(false);
          this.closeDialog();
          this.notify('success', 'Expense added', created?.title ?? undefined);
        },
        error: (err) => {
          console.error(err);
          this.saving.set(false);
          this.notify('error', 'Failed to add expense');
        },
      });
    }
  }
}
