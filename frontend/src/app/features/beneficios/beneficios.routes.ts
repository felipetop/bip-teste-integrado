import { Routes } from '@angular/router';

export const beneficiosRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/beneficios-list.component').then((m) => m.BeneficiosListComponent),
  },
  {
    path: 'novo',
    loadComponent: () =>
      import('./form/beneficio-form.component').then((m) => m.BeneficioFormComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./form/beneficio-form.component').then((m) => m.BeneficioFormComponent),
  },
];
