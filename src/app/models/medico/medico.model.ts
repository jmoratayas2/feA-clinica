export interface Medico {
  id?: number;
  nombres: string;
  apellidos: string;
  numeroColegiado: string;
  telefono?: string;
  correo?: string;
  activo?: boolean;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface MedicoRequest {
  nombres: string;
  apellidos: string;
  numeroColegiado: string;
  telefono?: string;
  correo?: string;
}
