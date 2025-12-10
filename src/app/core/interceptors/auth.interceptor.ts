import { HttpInterceptorFn, HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, filter, take, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/api/public/')) {
    return next(req);
  }

  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/api/public/auth/refresh')) {
        const authService = inject(AuthService);
        return handleUnauthorizedError(authService, req, next);
      }

      return throwError(() => error);
    }),
  );
};

function handleUnauthorizedError(authService: AuthService, req: HttpRequest<unknown>, next: HttpHandlerFn) {
  if (authService.isRefreshingToken) {
    return authService.refreshTokenSubject$.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => {
        const newReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
        return next(newReq);
      }),
    );
  }

  authService.setRefreshingToken(true);

  return authService.refreshToken().pipe(
    switchMap((response) => {
      authService.setRefreshingToken(false);

      const newReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${response.accessToken}`,
        },
      });

      return next(newReq);
    }),
    catchError((error) => {
      authService.setRefreshingToken(false);

      authService.logout();

      return throwError(() => error);
    }),
  );
}
