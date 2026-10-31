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

export interface MedicoClinica {
  id: number;
  medicoId: number;
  medico: string;
  clinicaId: number;
  clinica: string;
  consultorio?: string;
  fechaIngreso?: string;
  activo: boolean;
}

export interface MedicoClinicaRequest {
  medicoId?: number;
  clinicaId: number;
  consultorio?: string;
  fechaIngreso?: string;
}
