import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./website/components/website-layout/website-layout').then((m) => m.WebsiteLayout),
    title: 'Rulos Style | Reservas',
  },
  {
    path: 'login',
    loadComponent: () => import('./management/pages/login/login').then((m) => m.Login),
    title: 'Rulos Style | Inicio Sesión',
    canActivate: [publicGuard],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./management/pages/management-layout/management-layout').then(
        (m) => m.ManagementLayout,
      ),
    title: 'Rulos Style | Administración',
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
