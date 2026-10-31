export interface TipoExamen {
  id?: number;
  nombre: string;
  categoria: string;
  descripcion?: string;
  activo?: boolean;
}

export interface TipoExamenRequest {
  nombre: string;
  categoria: string;
  descripcion?: string;
}

export type PrioridadExamen = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
export type EstadoExamen = 'SOLICITADO' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';

export interface Examen {
  id?: number;
  consultaId: number;
  tipoExamenId: number;
  tipoExamen: string;
  fechaSolicitud: string;
  prioridad: PrioridadExamen;
  estado: EstadoExamen;
  indicaciones?: string;
}

export interface ExamenRequest {
  tipoExamenId: number;
  prioridad: PrioridadExamen;
  indicaciones?: string;
}

export interface ResultadoExamen {
  id?: number;
  examenId: number;
  fechaResultado: string;
  resultado: string;
  conclusion: string;
  archivoUrl?: string;
  observaciones?: string;
}

export interface ResultadoExamenRequest {
  fechaResultado: string;
  resultado: string;
  conclusion: string;
  archivoUrl?: string;
  observaciones?: string;
}
