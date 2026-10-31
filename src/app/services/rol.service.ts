import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Rol } from '../models/rol/rol.model';

export interface RolRequest {
  nombre: string;
  descripcion?: string;
  idSistema?: number;
  activo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class RolService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.securityApiUrl}/api/security/roles`;

  listar(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.baseUrl);
  }

  obtener(id: number): Observable<Rol> {
    return this.http.get<Rol>(`${this.baseUrl}/${id}`);
  }

  crear(request: RolRequest): Observable<Rol> {
    return this.http.post<Rol>(this.baseUrl, request);
  }

  actualizar(id: number, request: RolRequest): Observable<Rol> {
    return this.http.put<Rol>(`${this.baseUrl}/${id}`, request);
  }

  cambiarEstado(id: number, activo: boolean): Observable<Rol> {
    return this.http.patch<Rol>(`${this.baseUrl}/${id}/estado`, { activo });
  }

  // Métodos de asignación granular RBAC: Rol -> Módulo -> Permisos
  obtenerModulosDeRol(idRol: number): Observable<RolModuloResponse[]> {
    return this.http.get<RolModuloResponse[]>(`${this.baseUrl}/${idRol}/modulos`);
  }

  listarModulos(): Observable<ModuloItem[]> {
    return this.http.get<ModuloItem[]>(`${environment.securityApiUrl}/api/security/modulos`);
  }

  listarPermisos(): Observable<PermisoItem[]> {
    return this.http.get<PermisoItem[]>(`${environment.securityApiUrl}/api/security/permisos`);
  }

  asignarModulo(idRol: number, idModulo: number): Observable<RolModuloResponse> {
    return this.http.post<RolModuloResponse>(`${this.baseUrl}/${idRol}/modulos`, { moduloId: idModulo });
  }

  revocarModulo(idRol: number, idModulo: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${idRol}/modulos/${idModulo}`);
  }

  asignarPermiso(idRolModulo: number, idPermiso: number): Observable<RolModuloResponse> {
    return this.http.post<RolModuloResponse>(`${environment.securityApiUrl}/api/security/rol-modulo/${idRolModulo}/permisos`, { permisoId: idPermiso });
  }

  revocarPermiso(idRolModulo: number, idPermiso: number): Observable<void> {
    return this.http.delete<void>(`${environment.securityApiUrl}/api/security/rol-modulo/${idRolModulo}/permisos/${idPermiso}`);
  }
}

export interface RolModuloResponse {
  id: number; // idRolModulo
  idRol: number;
  nombreRol: string;
  idModulo: number;
  nombreModulo: string;
  rutaModulo: string;
  activo: boolean;
  permisos: string[];
}

export interface PermisoItem {
  idPermiso: number;
  codigo: string;
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

export interface ModuloItem {
  id: number;
  nombre: string;
  ruta: string;
  icono?: string;
  orden?: number;
  activo?: boolean;
}

