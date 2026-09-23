import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario, UsuarioRequest, EstadoRequest, AsignarRolRequest } from '../models/usuario/usuario.model';
import { Rol } from '../models/rol/rol.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.securityApiUrl}/api/security/usuarios`;
  private readonly rolesUrl = `${environment.securityApiUrl}/api/security/roles`;

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.baseUrl);
  }

  obtener(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/${id}`);
  }

  crear(request: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, request);
  }

  actualizar(id: number, request: UsuarioRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/${id}`, request);
  }

  cambiarEstado(id: number, activo: boolean): Observable<Usuario> {
    const body: EstadoRequest = { activo };
    return this.http.patch<Usuario>(`${this.baseUrl}/${id}/estado`, body);
  }

  asignarRol(idUsuario: number, rolId: number): Observable<Usuario> {
    const body: AsignarRolRequest = { rolId };
    return this.http.post<Usuario>(`${this.baseUrl}/${idUsuario}/roles`, body);
  }

  revocarRol(idUsuario: number, rolId: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseUrl}/${idUsuario}/roles/${rolId}/revocar`, {});
  }

  listarRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.rolesUrl);
  }
}
