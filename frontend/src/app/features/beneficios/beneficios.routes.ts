import { Routes } from '@angular/router';

export const beneficiosRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/beneficios-list.component').then((m) => m.BeneficiosListComponent),
  },
];
