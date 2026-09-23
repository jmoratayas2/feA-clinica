export interface Rol {
  idRol: number;
  idSistema?: number | null;
  nombreSistema?: string | null;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
  fechaCreacion?: string;
}
