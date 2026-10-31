import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Examen,
  EstadoExamen,
  ResultadoExamen,
  ResultadoExamenRequest
} from '../models/examen/examen.model';

@Injectable({ providedIn: 'root' })
export class ExamenService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.clinicApiUrl}/api/v1`;

  listarExamenes(): Observable<Examen[]> {
    return this.http.get<Examen[]>(`${this.baseUrl}/examenes`);
  }

  obtenerExamen(id: number): Observable<Examen> {
    return this.http.get<Examen>(`${this.baseUrl}/examenes/${id}`);
  }

  cambiarEstado(id: number, estado: EstadoExamen): Observable<Examen> {
    return this.http.put<Examen>(`${this.baseUrl}/examenes/${id}/estado`, { estado });
  }

  cancelarExamen(id: number): Observable<Examen> {
    return this.http.put<Examen>(`${this.baseUrl}/examenes/${id}/cancelar`, {});
  }

  registrarResultado(id: number, request: ResultadoExamenRequest): Observable<ResultadoExamen> {
    return this.http.post<ResultadoExamen>(`${this.baseUrl}/examenes/${id}/resultado`, request);
  }

  obtenerResultadoPorExamen(id: number): Observable<ResultadoExamen> {
    return this.http.get<ResultadoExamen>(`${this.baseUrl}/examenes/${id}/resultado`);
  }

  listarResultados(): Observable<ResultadoExamen[]> {
    return this.http.get<ResultadoExamen[]>(`${this.baseUrl}/resultados-examen`);
  }
}
