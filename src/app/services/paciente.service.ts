import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment }      from '../../environments/environment';
import { Paciente }         from '../models/paciente/paciente.model';
import { PacienteRequest }  from '../models/paciente/paciente-request.model';

/**
 * PacienteService — consume los endpoints REALES de clinicaBK.
 *
 * Base URL : http://localhost:8080/api/v1/pacientes
 * El header Authorization lo agrega automáticamente authInterceptor.
 *
 * Endpoints implementados (verificados en PacienteController.java):
 *   GET    /api/v1/pacientes            → PACIENTE_READ
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

  /** Obtiene todos los pacientes activos (o todos si incluirInactivos=true). */
  getAll(incluirInactivos = false): Observable<Paciente[]> {
    const params = new HttpParams().set('incluirInactivos', String(incluirInactivos));
    return this.http.get<Paciente[]>(this.base, { params });
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
