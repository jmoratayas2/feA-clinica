import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cita, CitaRequest, EstadoCita, Consulta, ConsultaRequest } from '../models/clinica-operaciones/operaciones.model';

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.clinicApiUrl}/api/v1/citas`;

  listar(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.baseUrl);
  }

  obtener(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.baseUrl}/${id}`);
  }

  crear(request: CitaRequest): Observable<Cita> {
    return this.http.post<Cita>(this.baseUrl, request);
  }

  actualizar(id: number, request: CitaRequest): Observable<Cita> {
    return this.http.put<Cita>(`${this.baseUrl}/${id}`, request);
  }

  cambiarEstado(id: number, estado: EstadoCita): Observable<Cita> {
    return this.http.put<Cita>(`${this.baseUrl}/${id}/estado`, { estado });
  }

  cancelar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  crearConsulta(citaId: number, request: ConsultaRequest): Observable<Consulta> {
    return this.http.post<Consulta>(`${this.baseUrl}/${citaId}/consulta`, request);
  }
}
