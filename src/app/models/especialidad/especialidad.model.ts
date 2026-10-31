export interface Especialidad {
  id?: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface EspecialidadRequest {
  nombre: string;
  descripcion?: string;
}
