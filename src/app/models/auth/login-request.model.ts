/** Petición de login al Security Service.
 *  POST /api/auth/login
 */
export interface LoginRequest {
  username: string;
  password: string;
}
