import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const hasValidSession = await authService.checkSession();

  if (hasValidSession) {
    return true;
  }

  sessionStorage.setItem('returnUrl', state.url);
  router.navigate(['/login']);

  return false;
};

export const publicGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const hasValidSession = await authService.checkSession();

  if (hasValidSession) {
    router.navigate(['/admin']);
    return false;
  }

  return true;
};

export const adminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const hasValidSession = await authService.checkSession();

  if (!hasValidSession) {
    sessionStorage.setItem('returnUrl', state.url);
    router.navigate(['/login']);
    return false;
  }

  const userRole = authService.userRole();
  if (userRole === 'ROLE_ADMIN') {
    return true;
  }

  router.navigate(['/admin/calendar']);
  return false;
};
