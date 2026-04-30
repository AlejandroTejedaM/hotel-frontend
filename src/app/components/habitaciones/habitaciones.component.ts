import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HabitacionRequest, HabitacionResponse } from '../../models/habitacion.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HabitacionService } from '../../services/habitacion.service';
import Swal from 'sweetalert2';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Roles } from '../../constants/Roles';

declare var bootstrap: any;

@Component({
  selector: 'app-habitaciones',
  standalone: false,
  templateUrl: './habitaciones.component.html',
  styleUrl: './habitaciones.component.css',
})
export class HabitacionesComponent implements OnInit, AfterViewInit {
  protected habitaciones$!: Observable<HabitacionResponse[]>;
  protected textoModal: string = 'Registrar Habitación';
  protected habitacionForm: FormGroup;
  protected esEditMode: boolean = false;
  private selectedHabitacion: HabitacionResponse | null = null;
  private selectedHabitacionId: number | null = null;
  private refresh$ = new BehaviorSubject<void>(undefined);

  @ViewChild('habitacionModalRef')
  habitacionModalEl!: ElementRef;
  private modalInstance!: any;

  constructor(
    private fb: FormBuilder,
    private habitacionService: HabitacionService,
    private authService: AuthService,
  ) {
    this.habitacionForm = this.fb.group({
      numero: [null, [Validators.required, Validators.min(1)]],
      tipo: ['', [Validators.required]],
      precio: [null, [Validators.required, Validators.min(0.01)]],
      capacidad: [null, [Validators.required, Validators.min(1)]],
    });
  }

  private refrescarHabitaciones(): void {
    this.refresh$.next();
  }

  ngAfterViewInit(): void {
    this.modalInstance = new bootstrap.Modal(this.habitacionModalEl.nativeElement, {
      keyboard: false,
    });
    this.habitacionModalEl.nativeElement.addEventListener('hidden.bs.modal', () => {
      this.habitacionForm.reset();
      this.esEditMode = false;
      this.selectedHabitacion = null;
      this.selectedHabitacionId = null;
    });
  }

  toggleForm(): void {
    this.textoModal = 'Registrar habitación';
    this.modalInstance.show();
  }

  public ngOnInit(): void {
    this.habitaciones$ = this.refresh$.pipe(
      switchMap(() => this.habitacionService.getHabitaciones()),
    );
  }

  protected onSubmit() {
    if (this.habitacionForm.invalid) {
      return;
    }
    const habitacionData: HabitacionRequest = this.habitacionForm.getRawValue();

    if (this.esEditMode && this.selectedHabitacion && this.selectedHabitacionId) {
      this.habitacionService.putHabitacion(habitacionData, this.selectedHabitacionId).subscribe({
        next: (): void => {
          this.refrescarHabitaciones();
          Swal.fire('Actualizada', 'Habitación actualizada correctamente', 'success');
          this.modalInstance.hide();
        },
        error: (err) => {
          console.log('Error al actualizar habitación: ', err);
          Swal.fire(
            'Error',
            `<div>No se pudo actualizar la habitación<br><small>${err.error?.message ?? ''}</small></div>`,
            'error',
          );
        },
      });
      return;
    }

    this.habitacionService.postHabitacion(habitacionData).subscribe({
      next: (): void => {
        this.refrescarHabitaciones();
        Swal.fire('Registrada', 'Habitación registrada correctamente', 'success');
        this.modalInstance.hide();
      },
      error: (err) => {
        console.log('Error al registrar habitación: ', err);
        Swal.fire(
          'Error',
          `<div>No se pudo registrar la habitación<br><small>${err.error?.message ?? ''}</small></div>`,
          'error',
        );
      },
    });
  }

  protected editarHabitacion(habitacion: HabitacionResponse): void {
    this.esEditMode = true;
    this.selectedHabitacion = habitacion;
    this.selectedHabitacionId = habitacion.id;
    this.textoModal = 'Editando Habitación: ' + habitacion.numero;

    this.habitacionForm.patchValue({ ...habitacion });

    if (this.authService.hasRole(Roles.USER)) {
      this.habitacionForm.get('precio')?.disable();
    }

    this.modalInstance.show();
  }

  protected isAdmin(): boolean {
    return this.authService.hasRole(Roles.ADMIN);
  }

  protected deleteHabitacion(habitacionResponse: HabitacionResponse): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `La habitación: ${habitacionResponse.numero} será eliminada permanentemente`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.habitacionService.deleteHabitacion(habitacionResponse.id).subscribe({
          next: () => {
            this.refrescarHabitaciones();
            Swal.fire('Eliminada', 'Habitación eliminada correctamente', 'success');
          },
          error: (err) => {
            console.error('Error al eliminar habitación: ', err);
            Swal.fire(
              'Error',
              `<div>No se pudo eliminar la habitación<br><small>${err.error?.message ?? ''}</small></div>`,
              'error',
            );
          },
        });
      }
    });
  }
}
