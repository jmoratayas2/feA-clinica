/** Respuesta del backend clínicas al consultar un paciente.
 *  Basado en PacienteResponseDto.java
 */
export interface Paciente {
  id:                  number;
  nombres:             string;
  apellidos:           string;
  tipoIdentificacion:  TipoIdentificacion | null;
  numeroIdentificacion: string | null;
  sexoBiologico:       SexoBiologico | null;
  telefono:            string | null;
  correo:              string | null;
  direccion:           string | null;
  contactoEmergencia:  string | null;
  telefonoEmergencia:  string | null;
  fechaNacimiento:     string;   // ISO date "YYYY-MM-DD"
  edad:                number | null;
  activo:              boolean;
  creadoEn:            string;   // ISO datetime
  actualizadoEn:       string;   // ISO datetime
}

/** Enums reales del backend (SexoBiologico.java) */
export type SexoBiologico = 'MASCULINO' | 'FEMENINO' | 'NO_REGISTRADO';

/** Enums reales del backend (TipoIdentificacion.java) */
export type TipoIdentificacion = 'DPI' | 'PASAPORTE' | 'NACIMIENTO' | 'OTRO';
