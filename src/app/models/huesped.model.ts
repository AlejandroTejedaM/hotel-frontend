export interface DatosHuesped {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  documento: string;
  nacionalidad: string;
}

export interface HuespedResponse {
  id: number;
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
