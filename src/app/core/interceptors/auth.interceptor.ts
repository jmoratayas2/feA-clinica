import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { environment }           from '../../../environments/environment';
import { TokenService }          from '../services/token.service';
import { NotificationService }   from '../services/notification.service';

/**
 * Interceptor funcional de Angular 22.
 *
 * 1. Agrega "Authorization: Bearer <JWT>" solo a peticiones dirigidas
 *    al backend clínicas (clinicApiUrl). NO lo agrega al security-service.
 * 2. Maneja 401 → sesión expirada → limpia token → /login.
 * 3. Maneja 403 → notificación de acceso denegado (no elimina token).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService  = inject(TokenService);
  const notification  = inject(NotificationService);
  const router        = inject(Router);

  const isClinicaApi = req.url.startsWith(environment.clinicApiUrl);
  const token        = tokenService.getToken();

  // Clonar la petición añadiendo el header solo para clinicaBK
  const authReq = (isClinicaApi && token)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && isClinicaApi) {
        // Solo tratar como "sesión expirada" si NO es el login
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
