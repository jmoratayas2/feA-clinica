import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard de permisos.
 * Lee el permiso requerido desde route.data['permission']
 * y verifica que el usuario lo posea en su JWT.
 *
 * Uso en las rutas:
 *   {
 *     path: 'pacientes',
 *     canActivate: [authGuard, permissionGuard],
 *     data: { permission: 'PACIENTE_READ' }
 *   }
 */
export const permissionGuard: CanActivateFn = (route, _state) => {
  const auth       = inject(AuthService);
  const router     = inject(Router);
  const permission = route.data?.['permission'] as string | undefined;

  if (!permission || auth.hasPermission(permission)) {
    return true;
  }

  return router.createUrlTree(['/unauthorized']);
};
