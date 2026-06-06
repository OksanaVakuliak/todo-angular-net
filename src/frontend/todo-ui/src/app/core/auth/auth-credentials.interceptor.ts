import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authCredentialsInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const isApiRequest = request.url.startsWith('/api/');
  const isAuthEndpoint = request.url.startsWith('/api/auth/');
  const credentialsRequest = isApiRequest ? request.clone({ withCredentials: true }) : request;

  return next(credentialsRequest).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && isApiRequest && !isAuthEndpoint) {
        authService.clearSession();
        void router.navigate(['/login'], {
          queryParams: {
            returnUrl: router.url,
            reason: 'session-expired'
          }
        });
      }

      return throwError(() => error);
    })
  );
};
