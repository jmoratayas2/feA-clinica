import { PaginationMetadata } from './pagination-metadata.model';

/**
 * Respuesta genérica paginada del backend.
 * Coincide con el record PagedResponse<T>.java del backend.
 *
 * Ejemplo JSON:
 * {
 *   "data": [ { "id": 1, "nombres": "Maria", ... } ],
 *   "metadata": { "totalRecords": 750, "page": 0, "pageSize": 50, ... }
 * }
 */
export interface PagedResponse<T> {
  data: T[];
  metadata: PaginationMetadata;
}
