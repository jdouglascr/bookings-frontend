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
    path: 'booking/confirm/:token',
    loadComponent: () =>
      import('./website/components/booking-confirm/booking-confirm').then((m) => m.BookingConfirm),
    title: 'Rulos Style | Confirmar Reserva',
  },
  {
    path: 'booking/cancel/:token',
    loadComponent: () =>
      import('./website/components/booking-cancel/booking-cancel').then((m) => m.BookingCancel),
    title: 'Rulos Style | Cancelar Reserva',
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
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'services',
        pathMatch: 'full',
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./management/pages/service-page/service-page').then((m) => m.ServicePage),
        title: 'Rulos Style | Servicios',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
