import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment }      from '../../environments/environment';
import { Paciente }         from '../models/paciente/paciente.model';
import { PacienteRequest }  from '../models/paciente/paciente-request.model';
import { PacienteFilter }   from '../models/paciente-filter.model';
import { PagedResponse }    from '../models/paged-response.model';

/**
 * PacienteService — consume los endpoints REALES de clinicaBK.
 *
 * Base URL : http://localhost:8080/api/v1/pacientes
 * El header Authorization lo agrega automáticamente authInterceptor.
 *
 * Endpoints implementados (verificados en PacienteController.java):
 *   GET    /api/v1/pacientes            → PACIENTE_READ  (paginado con filtros)
 *   GET    /api/v1/pacientes/{id}       → PACIENTE_READ
 *   POST   /api/v1/pacientes            → PACIENTE_CREATE
 *   PUT    /api/v1/pacientes/{id}       → PACIENTE_UPDATE
 *   DELETE /api/v1/pacientes/{id}       → PACIENTE_UPDATE (desactivar)
 *   PUT    /api/v1/pacientes/{id}/activar → PACIENTE_UPDATE (reactivar)
 */
@Injectable({ providedIn: 'root' })
export class PacienteService {

  private readonly base = `${environment.clinicApiUrl}/api/v1/pacientes`;

  constructor(private http: HttpClient) {}

  /**
   * Búsqueda paginada con filtros opcionales.
   * Solo se incluyen en los params los criterios que tienen valor.
   *
   * Cada cambio de página/filtro produce una NUEVA petición HTTP:
   *   GET /api/v1/pacientes?page=0&size=50
   *   GET /api/v1/pacientes?nombres=Maria&page=1&size=50
   */
  search(filter: PacienteFilter): Observable<PagedResponse<Paciente>> {
    let params = new HttpParams()
      .set('page', String(filter.page))
      .set('size', String(filter.size));

    // Agregar criterios opcionales solo si tienen valor
    if (filter.nombres?.trim()) {
      params = params.set('nombres', filter.nombres.trim());
    }
    if (filter.apellidos?.trim()) {
      params = params.set('apellidos', filter.apellidos.trim());
    }
    if (filter.numeroIdentificacion?.trim()) {
      params = params.set('numeroIdentificacion', filter.numeroIdentificacion.trim());
    }
    if (filter.activo !== undefined && filter.activo !== null) {
      params = params.set('activo', String(filter.activo));
    }

    return this.http.get<PagedResponse<Paciente>>(this.base, { params });
  }

  /** Obtiene un paciente por su ID. */
  getById(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.base}/${id}`);
  }

  /** Crea un nuevo paciente. */
  create(request: PacienteRequest): Observable<Paciente> {
    return this.http.post<Paciente>(this.base, request);
  }

  /** Actualiza un paciente existente. */
  update(id: number, request: PacienteRequest): Observable<Paciente> {
    return this.http.put<Paciente>(`${this.base}/${id}`, request);
  }

  /**
   * Desactiva (soft-delete) un paciente.
   * Requiere PACIENTE_UPDATE (el backend no tiene PACIENTE_DELETE).
   */
  deactivate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  /** Reactiva un paciente previamente desactivado. */
  activate(id: number): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/activar`, {});
  }
}
