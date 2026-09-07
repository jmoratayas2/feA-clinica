/**
 * Filtro de búsqueda de pacientes.
 * Los nombres de campos coinciden exactamente con los query-params
 * que acepta el backend: @ModelAttribute PacienteFilter
 *
 * Criterios opcionales: nombres, apellidos, numeroIdentificacion, activo.
 * Si son undefined/vacíos NO se incluyen en los HttpParams.
 *
 * page y size son siempre requeridos (con valores por defecto 0 y 50).
 */
export interface PacienteFilter {
  nombres?: string;               // LOWER(nombres) LIKE '%valor%'
  apellidos?: string;             // LOWER(apellidos) LIKE '%valor%'
  numeroIdentificacion?: string;  // Cubre DPI, pasaporte, etc.
  activo?: boolean;               // true=activos / false=inactivos / omitir=todos
  page: number;                   // Zero-based, default 0
  size: number;                   // Valores permitidos: 50 | 100 | 200
}
