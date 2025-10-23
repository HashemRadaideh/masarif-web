import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    data: { label: 'Dashboard' },
    async loadComponent() {
      const m = await import('./routes/expenses/expense');
      return m.ExpensesComponent;
    },
  },
  {
    path: 'about',
    pathMatch: 'full',
    data: { label: 'About' },
    async loadComponent() {
      const m = await import('./routes/about/about');
      return m.AboutComponent;
    },
  },
  {
    path: 'account',
    pathMatch: 'full',
    data: { label: 'Account' },
    async loadComponent() {
      const m = await import('./routes/account/account');
      return m.AccountComponent;
    },
  },
  { path: '**', redirectTo: '' },
];
