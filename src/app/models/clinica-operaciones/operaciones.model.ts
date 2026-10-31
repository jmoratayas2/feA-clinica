export type EstadoCita = 'PROGRAMADA' | 'CONFIRMADA' | 'EN_CURSO' | 'ATENDIDA' | 'CANCELADA' | 'NO_ASISTIO';

export interface Cita {
  id?: number;
  pacienteId: number;
  paciente: string;
  medicoId: number;
  medico: string;
  clinicaId: number;
  clinica: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  motivo: string;
  estado: EstadoCita;
  observaciones?: string;
}

export interface CitaRequest {
  pacienteId: number;
  medicoId: number;
  clinicaId: number;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  motivo: string;
  observaciones?: string;
}

export type TipoDiagnostico = 'PRESUNTIVO' | 'DEFINITIVO';
export type EstadoTratamiento = 'ACTIVO' | 'SUSPENDIDO' | 'FINALIZADO';
export type EstadoReceta = 'EMITIDA' | 'DISPENSADA' | 'ANULADA';

export interface Consulta {
  id?: number;
  citaId?: number;
  fechaHora: string;
  motivoConsulta: string;
  sintomas?: string;
  examenFisico?: string;
  observaciones?: string;
  planGeneral?: string;
}

export interface ConsultaRequest {
  citaId?: number;
  fechaHora: string;
  motivoConsulta: string;
  sintomas?: string;
  examenFisico?: string;
  observaciones?: string;
  planGeneral?: string;
}

export interface Diagnostico {
  id?: number;
  consultaId: number;
  codigoCie10?: string;
  descripcion: string;
  tipo: TipoDiagnostico;
  principal?: boolean;
  observaciones?: string;
}

export interface DiagnosticoRequest {
  descripcion: string;
  codigoCie10?: string;
  tipo: TipoDiagnostico;
  principal?: boolean;
  observaciones?: string;
}

export interface Tratamiento {
  id?: number;
  consultaId: number;
  diagnosticoId?: number;
  descripcion: string;
  indicaciones: string;
  fechaInicio: string;
  fechaFin?: string;
  estado: EstadoTratamiento;
  observaciones?: string;
}

export interface TratamientoRequest {
  diagnosticoId?: number;
  descripcion: string;
  indicaciones: string;
  fechaInicio: string;
  fechaFin?: string;
  estado: EstadoTratamiento;
  observaciones?: string;
}

export interface DetalleReceta {
  id?: number;
  medicamentoId: number;
  medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  viaAdministracion: string;
  cantidad?: string;
  indicaciones?: string;
}

export interface DetalleRecetaRequest {
  medicamentoId: number;
  dosis: string;
  frecuencia: string;
  duracion: string;
  viaAdministracion: string;
  cantidad?: string;
  indicaciones?: string;
}

export interface Receta {
  id?: number;
  consultaId: number;
  fechaEmision: string;
  indicacionesGenerales?: string;
  estado: EstadoReceta;
  observaciones?: string;
  detalles: DetalleReceta[];
}

export interface RecetaRequest {
  indicacionesGenerales?: string;
  observaciones?: string;
  detalles: DetalleRecetaRequest[];
}
