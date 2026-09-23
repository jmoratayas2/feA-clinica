export interface Usuario {
  idUsuario: number;
  username: string;
  nombres?: string | null;
  apellidos?: string | null;
  email?: string | null;
  activo: boolean;
  medicoId?: number | null;
  creadoEn: string;
  actualizadoEn?: string | null;
  roles: string[];
}

export interface UsuarioRequest {
  username: string;
  password?: string;
  email?: string | null;
  nombres?: string | null;
  apellidos?: string | null;
  medicoId?: number | null;
}

export interface EstadoRequest {
  activo: boolean;
}

export interface AsignarRolRequest {
  rolId: number;
}
