/**
 * Metadatos de paginación devueltos por el backend en cada respuesta paginada.
 * Coincide exactamente con el record PaginationMetadata.java del backend.
 */
export interface PaginationMetadata {
  totalRecords: number;     // page.getTotalElements()
  page: number;             // page.getNumber()  — zero-based
  pageSize: number;         // page.getSize()
  totalPages: number;       // page.getTotalPages()
  hasPreviousPage: boolean; // page.hasPrevious()
  hasNextPage: boolean;     // page.hasNext()
}
