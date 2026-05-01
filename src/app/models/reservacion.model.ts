import { DatosHabitacion } from './habitacion.model';
import { DatosHuesped } from './huesped.model';

export interface ReservacionResponse {
  id: number;
  habitacion: DatosHabitacion;
  huesped: DatosHuesped;
  estado: string;
  fechaInicial: string;
  fechaFinal: string;
}

export interface ReservacionRequest {
  idHuesped: number;
  idHabitacion: number;
  fechaEntrada: string;
  fechaSalida: string;
}
