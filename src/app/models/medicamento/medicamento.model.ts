export interface Medicamento {
  id?: number;
  nombreGenerico: string;
  nombreComercial?: string;
  presentacion: string;
  concentracion: string;
  activo?: boolean;
}

export interface MedicamentoRequest {
  nombreGenerico: string;
  nombreComercial?: string;
  presentacion: string;
  concentracion: string;
}
