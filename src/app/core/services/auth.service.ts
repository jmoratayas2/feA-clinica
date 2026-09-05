import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginRequest }  from '../../models/auth/login-request.model';
import { LoginResponse } from '../../models/auth/login-response.model';
import { TokenService }  from './token.service';

/**
 * AuthService gestiona el flujo de autenticación:
 *  login → guardar JWT → leer claims → logout.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly loginUrl = `${environment.securityApiUrl}/api/auth/login`;

  /** Signal reactivo: username del usuario autenticado o null. */
  readonly currentUser = signal<string | null>(null);

  constructor(
    private http:   HttpClient,
    private token:  TokenService,
    private router: Router
  ) {
    // Restaurar sesión si hay token válido en sessionStorage al recargar
    if (!this.token.isExpired()) {
      this.currentUser.set(this.token.getUsername());
    }
  }

  /**
   * Realiza el POST /api/auth/login y guarda el JWT.
   * El llamador se encarga de redirigir y mostrar notificaciones.
   */
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginUrl, request).pipe(
      tap(response => {
        this.token.saveToken(response.accessToken);
        this.currentUser.set(this.token.getUsername());
      })
    );
  }

  /** Elimina el token y limpia el estado. */
  logout(): void {
    this.token.removeToken();
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  /** True si hay un token no expirado. */
  isAuthenticated(): boolean {
    return !!this.token.getToken() && !this.token.isExpired();
  }

  /** Username del usuario autenticado. */
  getUsername(): string | null {
    return this.token.getUsername();
  }

  /** Lista de permisos del JWT. */
  getAuthorities(): string[] {
    return this.token.getAuthorities();
  }

  /**
   * Comprueba si el usuario posee exactamente el permiso indicado.
   * @example authService.hasPermission('PACIENTE_READ')
   */
  hasPermission(permission: string): boolean {
    return this.getAuthorities().includes(permission);
  }
}
