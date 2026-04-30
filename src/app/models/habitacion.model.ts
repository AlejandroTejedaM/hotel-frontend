export interface HabitacionResponse {
  id: number;
  numero: number;
  tipo: string;
  precio: number;
  capacidad: number;
  estado: string;
}

export interface HabitacionRequest {
  numero: number;
  tipo: string;
  precio: number;
  capacidad: number;
}
