import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideNgxSkeletonLoader } from 'ngx-skeleton-loader';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideNgxSkeletonLoader({
      animation: 'pulse',
      theme: {
        extendsFromRoot: true,
        height: '20px',
        'background-color': '#e0e0e0',
        'border-radius': '8px',
      },
    }),
  ],
};
