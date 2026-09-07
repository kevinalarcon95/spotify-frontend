import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SKIP_AUTH_REDIRECT } from './auth.context';
import { AuthService } from '../services/auth.service';
import { AuthStore } from '../services/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(AuthStore);
  const authService = inject(AuthService);
  const router = inject(Router);
  const authorization = store.header();

  const authReq = authorization
    ? req.clone({ setHeaders: { Authorization: authorization } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.context.get(SKIP_AUTH_REDIRECT)) {
        authService.logout();
        void router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
