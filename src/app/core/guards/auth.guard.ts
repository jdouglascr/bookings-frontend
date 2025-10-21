import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  sessionStorage.setItem('returnUrl', state.url);
  router.navigate(['/login']);

  return false;
};

export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    router.navigate(['/admin']);
    return false;
  }

  return true;
};

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      sessionStorage.setItem('returnUrl', state.url);
      router.navigate(['/login']);
      return false;
    }

    const userRole = authService.userRole();
    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }

    router.navigate(['/']);
    return false;
  };
};
