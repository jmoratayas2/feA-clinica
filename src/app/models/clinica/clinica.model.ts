export interface Clinica {
  id?: number;
  nombre: string;
  direccion: string;
  telefono: string;
  correo?: string;
  horarioAtencion?: string;
  activo?: boolean;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface ClinicaRequest {
  nombre: string;
  direccion: string;
  telefono: string;
  correo?: string;
  horarioAtencion?: string;
}
