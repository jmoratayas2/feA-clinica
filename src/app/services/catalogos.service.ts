import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Clinica, ClinicaRequest } from '../models/clinica/clinica.model';
import { Especialidad, EspecialidadRequest } from '../models/especialidad/especialidad.model';
import { Medico, MedicoRequest } from '../models/medico/medico.model';
import { Medicamento, MedicamentoRequest } from '../models/medicamento/medicamento.model';
import { TipoExamen, TipoExamenRequest } from '../models/examen/examen.model';

@Injectable({ providedIn: 'root' })
export class CatalogosService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.clinicApiUrl}/api/v1`;

  // ── Clínicas ──────────────────────────────────────────────────────────────
  listarClinicas(incluirInactivos: boolean = true): Observable<Clinica[]> {
    const params = new HttpParams().set('incluirInactivos', incluirInactivos.toString());
    return this.http.get<Clinica[]>(`${this.baseUrl}/clinicas`, { params });
  }

  obtenerClinica(id: number): Observable<Clinica> {
    return this.http.get<Clinica>(`${this.baseUrl}/clinicas/${id}`);
  }

  crearClinica(req: ClinicaRequest): Observable<Clinica> {
    return this.http.post<Clinica>(`${this.baseUrl}/clinicas`, req);
  }

  actualizarClinica(id: number, req: ClinicaRequest): Observable<Clinica> {
    return this.http.put<Clinica>(`${this.baseUrl}/clinicas/${id}`, req);
  }

  desactivarClinica(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/clinicas/${id}`);
  }

  activarClinica(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/clinicas/${id}/activar`, {});
  }

  // ── Especialidades ────────────────────────────────────────────────────────
  listarEspecialidades(incluirInactivos: boolean = true): Observable<Especialidad[]> {
    const params = new HttpParams().set('incluirInactivos', incluirInactivos.toString());
    return this.http.get<Especialidad[]>(`${this.baseUrl}/especialidades`, { params });
  }

  obtenerEspecialidad(id: number): Observable<Especialidad> {
    return this.http.get<Especialidad>(`${this.baseUrl}/especialidades/${id}`);
  }

  crearEspecialidad(req: EspecialidadRequest): Observable<Especialidad> {
    return this.http.post<Especialidad>(`${this.baseUrl}/especialidades`, req);
  }

  actualizarEspecialidad(id: number, req: EspecialidadRequest): Observable<Especialidad> {
    return this.http.put<Especialidad>(`${this.baseUrl}/especialidades/${id}`, req);
  }

  desactivarEspecialidad(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/especialidades/${id}`);
  }

  activarEspecialidad(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/especialidades/${id}/activar`, {});
  }

  // ── Médicos ───────────────────────────────────────────────────────────────
  listarMedicos(incluirInactivos: boolean = true): Observable<Medico[]> {
    const params = new HttpParams().set('incluirInactivos', incluirInactivos.toString());
    return this.http.get<Medico[]>(`${this.baseUrl}/medicos`, { params });
  }

  obtenerMedico(id: number): Observable<Medico> {
    return this.http.get<Medico>(`${this.baseUrl}/medicos/${id}`);
  }

  crearMedico(req: MedicoRequest): Observable<Medico> {
    return this.http.post<Medico>(`${this.baseUrl}/medicos`, req);
  }

  actualizarMedico(id: number, req: MedicoRequest): Observable<Medico> {
    return this.http.put<Medico>(`${this.baseUrl}/medicos/${id}`, req);
  }

  desactivarMedico(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/medicos/${id}`);
  }

  activarMedico(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/medicos/${id}/activar`, {});
  }

  // ── Medicamentos ──────────────────────────────────────────────────────────
  listarMedicamentos(incluirInactivos: boolean = true): Observable<Medicamento[]> {
    const params = new HttpParams().set('incluirInactivos', incluirInactivos.toString());
    return this.http.get<Medicamento[]>(`${this.baseUrl}/medicamentos`, { params });
  }

  obtenerMedicamento(id: number): Observable<Medicamento> {
    return this.http.get<Medicamento>(`${this.baseUrl}/medicamentos/${id}`);
  }

  crearMedicamento(req: MedicamentoRequest): Observable<Medicamento> {
    return this.http.post<Medicamento>(`${this.baseUrl}/medicamentos`, req);
  }

  actualizarMedicamento(id: number, req: MedicamentoRequest): Observable<Medicamento> {
    return this.http.put<Medicamento>(`${this.baseUrl}/medicamentos/${id}`, req);
  }

  desactivarMedicamento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/medicamentos/${id}`);
  }

  activarMedicamento(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/medicamentos/${id}/activar`, {});
  }

  // ── Tipos de Examen ───────────────────────────────────────────────────────
  listarTiposExamen(incluirInactivos: boolean = true): Observable<TipoExamen[]> {
    const params = new HttpParams().set('incluirInactivos', incluirInactivos.toString());
    return this.http.get<TipoExamen[]>(`${this.baseUrl}/tipos-examen`, { params });
  }

  obtenerTipoExamen(id: number): Observable<TipoExamen> {
    return this.http.get<TipoExamen>(`${this.baseUrl}/tipos-examen/${id}`);
  }

  crearTipoExamen(req: TipoExamenRequest): Observable<TipoExamen> {
    return this.http.post<TipoExamen>(`${this.baseUrl}/tipos-examen`, req);
  }

  actualizarTipoExamen(id: number, req: TipoExamenRequest): Observable<TipoExamen> {
    return this.http.put<TipoExamen>(`${this.baseUrl}/tipos-examen/${id}`, req);
  }

  desactivarTipoExamen(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tipos-examen/${id}`);
  }

  activarTipoExamen(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/tipos-examen/${id}/activar`, {});
  }
}
