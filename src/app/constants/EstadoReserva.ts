export enum EstadoReserva {
  CONFIRMADA = 'Reserva creada',
  EN_CURSO = 'Check-in realizado',
  FINALIZADA = 'Check-out realizado',
  CANCELADA = 'Reserva cancelada',
}

export const DescripcionEstadoReserva = {
  [EstadoReserva.CONFIRMADA]: 'Reserva creada',
  [EstadoReserva.EN_CURSO]: 'Check-in realizado',
  [EstadoReserva.FINALIZADA]: 'Check-out realizado',
  [EstadoReserva.CANCELADA]: 'Reserva cancelada',
};

export const IdEstadoReserva: Record<EstadoReserva, number> = {
  [EstadoReserva.CONFIRMADA]: 1,
  [EstadoReserva.EN_CURSO]: 2,
  [EstadoReserva.FINALIZADA]: 3,
  [EstadoReserva.CANCELADA]: 4,
};
