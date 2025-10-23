import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    data: { label: 'Dashboard' },
    async loadComponent() {
      const m = await import('./expense/expense');
      return m.ExpenseComponent;
    },
  },
  {
    path: 'about',
    pathMatch: 'full',
    data: { label: 'About' },
    async loadComponent() {
      const m = await import('./about/about');
      return m.AboutComponent;
    },
  },
  {
    path: 'account',
    pathMatch: 'full',
    data: { label: 'Account' },
    async loadComponent() {
      const m = await import('./account/account');
      return m.AccountComponent;
    },
  },
  { path: '**', redirectTo: '' },
];
