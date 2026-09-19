export interface MenuModulo {
  idModulo: number;
  nombre: string;
  descripcion?: string;
  ruta: string;
  icono: string;
  orden: number;
  idModuloPadre?: number | null;
  permisos: string[];
  submodulos: MenuModulo[];
}
