import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Consulta,
  ConsultaRequest,
  Diagnostico,
  DiagnosticoRequest,
  Tratamiento,
  TratamientoRequest,
  Receta,
  RecetaRequest
} from '../models/clinica-operaciones/operaciones.model';
import { Examen, ExamenRequest } from '../models/examen/examen.model';

@Injectable({ providedIn: 'root' })
export class ConsultaService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.clinicApiUrl}/api/v1`;

  // ── Consultas ─────────────────────────────────────────────────────────────
  listar(): Observable<Consulta[]> {
    return this.http.get<Consulta[]>(`${this.baseUrl}/consultas`);
  }

  obtener(id: number): Observable<Consulta> {
    return this.http.get<Consulta>(`${this.baseUrl}/consultas/${id}`);
  }

  actualizar(id: number, request: ConsultaRequest): Observable<Consulta> {
    return this.http.put<Consulta>(`${this.baseUrl}/consultas/${id}`, request);
  }

  // ── Diagnósticos ──────────────────────────────────────────────────────────
  listarDiagnosticos(consultaId: number): Observable<Diagnostico[]> {
    return this.http.get<Diagnostico[]>(`${this.baseUrl}/consultas/${consultaId}/diagnosticos`);
  }

  crearDiagnostico(consultaId: number, request: DiagnosticoRequest): Observable<Diagnostico> {
    return this.http.post<Diagnostico>(`${this.baseUrl}/consultas/${consultaId}/diagnosticos`, request);
  }

  // ── Tratamientos ──────────────────────────────────────────────────────────
  listarTratamientos(consultaId: number): Observable<Tratamiento[]> {
    return this.http.get<Tratamiento[]>(`${this.baseUrl}/consultas/${consultaId}/tratamientos`);
  }

  crearTratamiento(consultaId: number, request: TratamientoRequest): Observable<Tratamiento> {
    return this.http.post<Tratamiento>(`${this.baseUrl}/consultas/${consultaId}/tratamientos`, request);
  }

  // ── Recetas ───────────────────────────────────────────────────────────────
  listarRecetas(consultaId: number): Observable<Receta[]> {
    return this.http.get<Receta[]>(`${this.baseUrl}/consultas/${consultaId}/recetas`);
  }

  crearReceta(consultaId: number, request: RecetaRequest): Observable<Receta> {
    return this.http.post<Receta>(`${this.baseUrl}/consultas/${consultaId}/recetas`, request);
  }

  anularReceta(recetaId: number): Observable<Receta> {
    return this.http.put<Receta>(`${this.baseUrl}/recetas/${recetaId}/anular`, {});
  }

  // ── Exámenes ──────────────────────────────────────────────────────────────
  listarExamenes(consultaId: number): Observable<Examen[]> {
    return this.http.get<Examen[]>(`${this.baseUrl}/consultas/${consultaId}/examenes`);
  }

  solicitarExamen(consultaId: number, request: ExamenRequest): Observable<Examen> {
    return this.http.post<Examen>(`${this.baseUrl}/consultas/${consultaId}/examenes`, request);
  }
}
