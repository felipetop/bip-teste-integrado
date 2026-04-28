import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'beneficios', pathMatch: 'full' },
  {
    path: 'beneficios',
    loadChildren: () =>
      import('./features/beneficios/beneficios.routes').then((m) => m.beneficiosRoutes),
  },
  {
    path: 'transferencias',
    loadChildren: () =>
      import('./features/transferencias/transferencias.routes').then(
        (m) => m.transferenciasRoutes,
      ),
  },
  { path: '**', redirectTo: 'beneficios' },
];
