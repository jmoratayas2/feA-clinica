/** Payload decodificado del JWT generado por security-service.
 *
 *  Claims verificados en JwtService.java:
 *  - sub      : username
 *  - userId   : Long  (ID del usuario en la BD del security-service)
 *  - medicoId : Long | null  (opcional, solo para usuarios tipo médico)
 *  - authorities: string[]   (permisos directos, p.ej. "PACIENTE_READ")
 *  - iss      : "clinicas-security"
 *  - aud      : ["clinicas-backend"]
 *  - iat / exp: timestamps Unix
 */
export interface JwtPayload {
  sub:         string;
  userId:      number;
  medicoId?:   number | null;
  authorities: string[];
  iss:         string;
  aud:         string | string[];
  iat:         number;
  exp:         number;
}
