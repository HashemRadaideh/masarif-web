import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Expense, CreateExpense, UpdateExpense } from './expense.models';
import { ExpenseQuery } from './expense.query';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class ExpensesService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/Expenses`;

  getAll(q: ExpenseQuery = {}) {
    let params = new HttpParams();
    if (q.category) params = params.set('category', q.category);
    if (q.from) params = params.set('from', q.from);
    if (q.to) params = params.set('to', q.to);
    return this.http.get<Expense[]>(this.base, { params });
  }

  getById(id: number) {
    return this.http.get<Expense>(`${this.base}/${id}`);
  }

  create(body: CreateExpense) {
    return this.http.post<Expense>(this.base, body);
  }

  update(id: number, body: UpdateExpense) {
    return this.http.put<void>(`${this.base}/${id}`, body);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
