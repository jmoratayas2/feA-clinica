/** Respuesta del Security Service tras login exitoso.
 *  Basado en LoginResponse.java: record LoginResponse(String accessToken, String tokenType, long expiresIn)
 */
export interface LoginResponse {
  accessToken: string;
  tokenType:   string;   // "Bearer"
  expiresIn:   number;   // segundos (3600 por defecto)
}
