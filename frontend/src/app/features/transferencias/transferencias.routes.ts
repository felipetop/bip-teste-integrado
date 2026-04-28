import { Routes } from '@angular/router';

export const transferenciasRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./transferir/transferir.component').then((m) => m.TransferirComponent),
  },
];
