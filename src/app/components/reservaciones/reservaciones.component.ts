import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, switchMap, take } from 'rxjs';
import { ReservacionRequest, ReservacionResponse } from '../../models/reservacion.model';
import { ReservacionService } from '../../services/reservacion.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HabitacionResponse } from '../../models/habitacion.model';
import { HabitacionService } from '../../services/habitacion.service';
import Swal from 'sweetalert2';
import { HuespedService } from '../../services/huesped.service';
import { DescripcionEstadoReserva, EstadoReserva } from '../../constants/EstadoReserva';
import { DateFormatterHelper } from '../../shared/date-formatter.helper';
import { NameFormatterHelper } from '../../shared/name-formatter.helper';
import { HuespedResponse } from '../../models/huesped.model';

declare var bootstrap: any;

@Component({
  selector: 'app-reservaciones',
  standalone: false,
  templateUrl: './reservaciones.component.html',
  styleUrl: './reservaciones.component.css',
})
export class ReservacionesComponent implements OnInit, AfterViewInit {
  protected reservaciones$!: Observable<ReservacionResponse[]>;
  protected habitaciones$!: Observable<HabitacionResponse[]>;
  @ViewChild('reservacionModalRef')
  reservacionModalEl!: ElementRef;
  protected reservacionForm: FormGroup;

  @ViewChild('reservacionChangeStatusModalRef')
  reservacionChangeStatusModalEl!: ElementRef;
  protected reservacionChangeStatusForm: FormGroup;
  private refresh$: BehaviorSubject<void> = new BehaviorSubject<void>(undefined);
  private selectedReservacion: ReservacionResponse | null = null;
  private selectedReservacionId: number | null = null;
  private ALLOWED_TO_CHANGE: boolean = true;
  private NOT_ALLOWED_TO_CHANGE: boolean = false;

  private modalInstance!: any;
  private modalChangeStatusInstance!: any;
  private esEditMode: boolean = false;
  protected textoModal: string = 'Registrar Habitación';
  protected huespedes$!: Observable<HuespedResponse[]>;
  protected estadosReservacion: EstadoReserva[] = Object.values(EstadoReserva);

  constructor(
    private fb: FormBuilder,
    private reservacionService: ReservacionService,
    private habitacionService: HabitacionService,
    private huespedService: HuespedService,
  ) {
    this.reservacionForm = this.fb.group({
      habitacion: [null, [Validators.required]],
      huesped: [null, [Validators.required]],
      fechaEntrada: [null, [Validators.required]],
      fechaSalida: [null, [Validators.required]],
    });

    this.reservacionChangeStatusForm = this.fb.group({
      estado: [null, [Validators.required]],
    });
  }

  private triggerRefresh(): void {
    this.refresh$.next();
  }

  ngOnInit(): void {
    this.habitaciones$ = this.refresh$.pipe(
      switchMap(() => this.habitacionService.getHabitaciones()),
    );
    this.reservaciones$ = this.refresh$.pipe(
      switchMap(() => this.reservacionService.getReservaciones()),
    );
    this.huespedes$ = this.refresh$.pipe(switchMap(() => this.huespedService.getHuespedes()));
  }

  protected compareById(a: { id: number }, b: { id: number }): boolean {
    return a && b && a.id === b.id;
  }

  ngAfterViewInit(): void {
    this.modalInstance = new bootstrap.Modal(this.reservacionModalEl.nativeElement, {
      keyboard: false,
    });

    this.modalChangeStatusInstance = new bootstrap.Modal(
      this.reservacionChangeStatusModalEl.nativeElement,
      {
        keyboard: false,
      },
    );

    this.reservacionModalEl.nativeElement.addEventListener('hidden.bs.modal', () => {
      this.reservacionForm.reset();
      this.esEditMode = false;
      this.selectedReservacion = null;
      this.selectedReservacionId = null;
    });

    this.reservacionChangeStatusModalEl.nativeElement.addEventListener('hidden.bs.modal', () => {
      this.reservacionChangeStatusForm.reset();
      this.selectedReservacionId = null;
    });
  }

  protected formatHabitacion(habitacion: Partial<HabitacionResponse>): string {
    return NameFormatterHelper.formatHabitacion(habitacion);
  }

  protected formatHuesped(huesped: any): string {
    return NameFormatterHelper.formatHuesped(huesped);
  }

  protected toggleForm() {
    this.textoModal = 'Registrar reservación';
    this.huespedes$.pipe(take(1)).subscribe((huespedes) => {
      if (huespedes?.length > 0) {
        setTimeout(() => this.reservacionForm.patchValue({ huesped: huespedes[0] }));
      }
    });
    this.habitaciones$.pipe(take(1)).subscribe((habitaciones) => {
      if (habitaciones?.length > 0) {
        setTimeout(() => this.reservacionForm.patchValue({ habitacion: habitaciones[0] }));
      }
    });
    this.modalInstance.show();
  }

  protected onSubmit() {
    if (this.reservacionForm.invalid) {
      return;
    }
    const raw = this.reservacionForm.getRawValue();
    console.dir(raw);
    const reservacionRequest: ReservacionRequest = {
      idHuesped: raw.huesped.id,
      idHabitacion: raw.habitacion.id,
      fechaEntrada: DateFormatterHelper.formatStringDate(raw.fechaEntrada),
      fechaSalida: DateFormatterHelper.formatStringDate(raw.fechaSalida),
    };
    if (this.esEditMode && this.selectedReservacion && this.selectedReservacionId) {
      this.reservacionService
        .putReservacion(reservacionRequest, this.selectedReservacionId)
        .subscribe({
          next: (): void => {
            this.triggerRefresh();
            Swal.fire('Actualizada', 'Reservación actualizada correctamente', 'success');
            this.modalInstance.hide();
          },
          error: (err) => {
            Swal.fire(
              'Error',
              `<div>No se pudo actualizar la reservación<br><small>${err.error?.message ?? ''}</small></div>`,
              'error',
            );
          },
        });
      return;
    }

    this.reservacionService.postReservacion(reservacionRequest).subscribe({
      next: (): void => {
        this.triggerRefresh();
        Swal.fire('Registrada', 'Reservación registrada correctamente', 'success');
        this.modalInstance.hide();
      },
      error: (err) => {
        Swal.fire(
          'Error',
          `<div>${err.error?.message ?? 'Error al realizar la operación por favor contacte al Equipo de TI'}</div>`,
          'error',
        );
      },
    });
  }

  protected changeEstado(reservacion: ReservacionResponse): void {
    this.reservacionChangeStatusForm.patchValue({
      estado: reservacion.estado,
    });

    this.selectedReservacionId = reservacion.id;

    this.modalChangeStatusInstance.show();
  }

  protected editarReservacion(reservacion: ReservacionResponse): void {
    this.esEditMode = true;
    this.selectedReservacion = reservacion;
    this.selectedReservacionId = reservacion.id;
    this.textoModal = 'Editando reservación: ' + reservacion.id;
    console.log(reservacion);
    this.reservacionForm.patchValue({
      habitacion: reservacion.habitacion,
      huesped: reservacion.huesped,
      fechaEntrada: DateFormatterHelper.formatStringToInputDate(reservacion.fechaInicial),
      fechaSalida: DateFormatterHelper.formatStringToInputDate(reservacion.fechaFinal),
    });

    this.modalInstance.show();
  }

  protected isChangeAllowed(reservacion: ReservacionResponse): boolean {
    if (!reservacion.estado) {
      return this.NOT_ALLOWED_TO_CHANGE;
    }

    switch (reservacion.estado) {
      case EstadoReserva.CONFIRMADA:
      case EstadoReserva.EN_CURSO:
        return this.ALLOWED_TO_CHANGE;
      default:
        return this.NOT_ALLOWED_TO_CHANGE;
    }
  }

  protected deleteReservacion(reservacion: ReservacionResponse): void {
    Swal.fire({
      title: '¿Estás seguro?',
      html: `La reservación a nombre de <strong>${reservacion.huesped.nombre}</strong> para la <strong> ${this.formatHabitacion({ ...reservacion.habitacion })}</strong> será eliminada permanentemente`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.reservacionService.deleteReservacion(reservacion.id).subscribe({
          next: () => {
            this.triggerRefresh();
            Swal.fire('Eliminada', 'Reservación eliminada correctamente', 'success');
          },
          error: (err) => {
            Swal.fire(
              'Error',
              `<div>${err.error?.message ?? 'Error al realizar la operación por favor contacte al Equipo de TI'}</div>`,
              'error',
            );
          },
        });
      }
    });
  }

  protected formatEstadoReserva(estado: EstadoReserva): string {
    return DescripcionEstadoReserva[estado] || 'Desconocido';
  }

  protected onSubmitChangeStatus() {
    if (this.reservacionChangeStatusForm.invalid) {
      return;
    }

    const raw = this.reservacionChangeStatusForm.getRawValue();
    if (raw.estado && this.selectedReservacionId) {
      this.reservacionService.changeStatus(this.selectedReservacionId, raw.estado).subscribe({
        next: (): void => {
          this.triggerRefresh();
          Swal.fire('Actualizado', 'Estado actualizado correctamente', 'success');
          this.modalChangeStatusInstance.hide();
        },
        error: (err) => {
          Swal.fire(
            'Error',
            `<div>${err.error?.message ?? 'Error al realizar la operación por favor contacte al Equipo de TI'}</div>`,
            'error',
          );
        },
      });
      return;
    }
  }
}
