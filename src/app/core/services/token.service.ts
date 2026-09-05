import { Injectable } from '@angular/core';
import { JwtPayload } from '../../models/auth/jwt-payload.model';

const TOKEN_KEY = 'clinicas_token';

/**
 * Servicio responsable de toda la interacción con sessionStorage
 * relacionada con el JWT.
 *
 * NO usar sessionStorage.getItem('clinicas_token') directamente
 * fuera de este servicio.
 */
@Injectable({ providedIn: 'root' })
export class TokenService {

  /** Guarda el JWT en sessionStorage. */
  saveToken(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  /** Devuelve el JWT o null si no existe. */
  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  /** Elimina el JWT de sessionStorage. */
  removeToken(): void {
    sessionStorage.removeItem(TOKEN_KEY);
  }

  /**
   * Decodifica el payload del JWT sin validación criptográfica.
   * La validación RSA la realiza el backend (clinicaBK).
   */
  decodeToken(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      // Añade padding Base64 si es necesario
      const payload = parts[1];
      const padded  = payload + '='.repeat((4 - payload.length % 4) % 4);
      const decoded = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded) as JwtPayload;
    } catch {
      return null;
    }
  }

  /** Nombre de usuario (claim sub). */
  getUsername(): string | null {
    return this.decodeToken()?.sub ?? null;
  }

  /** ID del usuario (claim userId). */
  getUserId(): number | null {
    return this.decodeToken()?.userId ?? null;
  }

  /** Lista de permisos (claim authorities). */
  getAuthorities(): string[] {
    return this.decodeToken()?.authorities ?? [];
  }

  /** Timestamp de expiración en milisegundos. */
  getExpiration(): number | null {
    const exp = this.decodeToken()?.exp;
    return exp != null ? exp * 1000 : null;
  }

  /** Devuelve true si el token ha expirado o no existe. */
  isExpired(): boolean {
    const exp = this.getExpiration();
    if (exp == null) return true;
    return Date.now() >= exp;
  }
}
