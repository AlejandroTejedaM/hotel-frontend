export interface HuespedResponse {
  idHuesped: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  telefono: string;
  documento: string;
  nacionalidad: string;
  estadoRegistro: string;
}

export interface HuespedRequest {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  telefono: string;
  documento: string;
  nacionalidad: string;
}