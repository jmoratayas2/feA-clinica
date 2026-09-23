import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { TokenService } from '../services/token.service';
import { NotificationService } from '../services/notification.service';

/**
 * Interceptor funcional de autenticación.
 *
 * 1. Agrega "Authorization: Bearer <JWT>" a todas las peticiones protegidas
 *    tanto para clinicaBK (puerto 8080) como para security-clinic (puerto 8081).
 *    Excluye únicamente el endpoint público de login.
 * 2. Maneja 401 → sesión expirada → limpia token → /login.
 * 3. Maneja 403 → notificación de acceso denegado.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const notification = inject(NotificationService);
  const router = inject(Router);

  const isLoginUrl = req.url.includes('/api/auth/login');
  const token = tokenService.getToken();

  // Adjuntar token de autenticación a cualquier petición protegida
  const authReq = (!isLoginUrl && token)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isLoginUrl) {
        tokenService.removeToken();
        notification.sessionExpired();
        router.navigate(['/login']);
      } else if (error.status === 403) {
        notification.accessDenied();
        router.navigate(['/unauthorized']);
      }
      return throwError(() => error);
    })
  );
};
