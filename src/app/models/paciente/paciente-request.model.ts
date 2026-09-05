import { SexoBiologico, TipoIdentificacion } from './paciente.model';

/** Cuerpo de petición para crear/actualizar un paciente.
 *  Basado en PacienteRequestDto.java
 *  Campos obligatorios: nombres, apellidos, fechaNacimiento
 */
export interface PacienteRequest {
  nombres:              string;
  apellidos:            string;
  tipoIdentificacion:   TipoIdentificacion | null;
  numeroIdentificacion: string | null;
  sexoBiologico:        SexoBiologico | null;
  telefono:             string | null;
  correo:               string | null;
  direccion:            string | null;
  contactoEmergencia:   string | null;
  telefonoEmergencia:   string | null;
  fechaNacimiento:      string;  // ISO date "YYYY-MM-DD"
}
