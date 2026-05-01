import { HabitacionResponse } from '../models/habitacion.model';

export abstract class NameFormatterHelper {
  public static formatHabitacion(habitacion: Partial<HabitacionResponse>): string {
    const emptyString: string = '';
    const tipo: string = habitacion.tipo ?? emptyString;
    const numero: string = String(habitacion.numero) ?? emptyString;
    const capacidad: string = String(habitacion.capacidad) ?? emptyString;

    return `Hab. ${numero} | ${tipo} | Cap. ${capacidad}`;
  }

  public static formatHuesped(huesped: any): string {
    const emptyString: string = '';
    const nombre: string = huesped.nombre ?? emptyString;
    const apePat: string = huesped.apellidoPaterno ?? emptyString;
    const apeMat: string = huesped.apellidoMaterno ?? emptyString;
    const correo: string = huesped.correo ?? emptyString;
    const telefono: string = huesped.telefono ?? emptyString;

    return `${nombre} ${apePat} ${apeMat} | ${telefono}`;
  }
}
