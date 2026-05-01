export enum EstadoHabitacion {
  DISPONIBLE = 'Lista para asignarse',
  OCUPADA = 'Asignada a una reserva',
  LIMPIEZA = 'En limpieza',
  MANTENIMIENTO = 'En reparación',
}

export const IdEstadoHabitacion: Record<EstadoHabitacion, number> = {
  [EstadoHabitacion.DISPONIBLE]: 1,
  [EstadoHabitacion.OCUPADA]: 2,
  [EstadoHabitacion.LIMPIEZA]: 3,
  [EstadoHabitacion.MANTENIMIENTO]: 4,
};

export const DescripcionEstadoHabitacion: Record<EstadoHabitacion, string> = {
  [EstadoHabitacion.DISPONIBLE]: 'Lista para asignarse',
  [EstadoHabitacion.OCUPADA]: 'Asignada a una reserva',
  [EstadoHabitacion.LIMPIEZA]: 'En limpieza',
  [EstadoHabitacion.MANTENIMIENTO]: 'En reparación',
};
