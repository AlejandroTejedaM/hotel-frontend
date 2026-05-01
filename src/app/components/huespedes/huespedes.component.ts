import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HuespedRequest, HuespedResponse } from '../../models/huesped.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HuespedService } from '../../services/huesped.service';
import Swal from 'sweetalert2';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Roles } from '../../constants/Roles';

declare var bootstrap: any;

@Component({
  selector: 'app-huespedes',
  standalone: false,
  templateUrl: './huespedes.component.html',
  styleUrl: './huespedes.component.css',
})
export class HuespedesComponent implements OnInit, AfterViewInit {
  protected huespedes$!: Observable<HuespedResponse[]>;
  protected textoModal: string = 'Registrar Huésped';
  protected huespedForm: FormGroup;
  protected esEditMode: boolean = false;
  private selectedHuesped: HuespedResponse | null = null;
  private selectedHuespedId: number | null = null;
  private refresh$ = new BehaviorSubject<void>(undefined);

  @ViewChild('huespedModalRef')
  huespedModalEl!: ElementRef;
  private modalInstance!: any;

  constructor(
    private fb: FormBuilder,
    private huespedService: HuespedService,
    private authService: AuthService,
  ) {
    this.huespedForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellidoPaterno: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellidoMaterno: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      documento: ['', [Validators.required]],
      nacionalidad: ['', [Validators.required]],
    });
  }

  private refrescarHuespedes(): void {
    this.refresh$.next();
  }

  ngAfterViewInit(): void {
    this.modalInstance = new bootstrap.Modal(this.huespedModalEl.nativeElement, {
      keyboard: false,
    });
    this.huespedModalEl.nativeElement.addEventListener('hidden.bs.modal', () => {
      this.huespedForm.reset();
      this.esEditMode = false;
      this.selectedHuesped = null;
      this.selectedHuespedId = null;
    });
  }

  toggleForm(): void {
    this.textoModal = 'Registrar Huésped';
    this.modalInstance.show();
  }

  public ngOnInit(): void {
    this.huespedes$ = this.refresh$.pipe(
      switchMap(() => this.huespedService.getHuespedes()),
    );
  }

  protected onSubmit(): void {
    if (this.huespedForm.invalid) return;

    const huespedData: HuespedRequest = this.huespedForm.getRawValue();

    if (this.esEditMode && this.selectedHuesped && this.selectedHuespedId) {
      this.huespedService.putHuesped(huespedData, this.selectedHuespedId).subscribe({
        next: (): void => {
          this.refrescarHuespedes();
          Swal.fire('Actualizado', 'Huésped actualizado correctamente', 'success');
          this.modalInstance.hide();
        },
        error: (err) => {
          console.log('Error al actualizar huésped: ', err);
          Swal.fire(
            'Error',
            `<div>No se pudo actualizar el huésped<br><small>${err.error?.message ?? ''}</small></div>`,
            'error',
          );
        },
      });
      return;
    }

    this.huespedService.postHuesped(huespedData).subscribe({
      next: (): void => {
        this.refrescarHuespedes();
        Swal.fire('Registrado', 'Huésped registrado correctamente', 'success');
        this.modalInstance.hide();
      },
      error: (err) => {
        console.log('Error al registrar huésped: ', err);
        Swal.fire(
          'Error',
          `<div>No se pudo registrar el huésped<br><small>${err.error?.message ?? ''}</small></div>`,
          'error',
        );
      },
    });
  }

  protected editarHuesped(huesped: HuespedResponse): void {
    this.esEditMode = true;
    this.selectedHuesped = huesped;
    this.selectedHuespedId = huesped.idHuesped;
    this.textoModal = 'Editando Huésped: ' + huesped.nombre + ' ' + huesped.apellidoPaterno;
    this.huespedForm.patchValue({ ...huesped });
    this.modalInstance.show();
  }

  protected isAdmin(): boolean {
    return this.authService.hasRole(Roles.ADMIN);
  }

  protected deleteHuesped(huesped: HuespedResponse): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `El huésped: ${huesped.nombre} ${huesped.apellidoPaterno} será eliminado`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.huespedService.deleteHuesped(huesped.idHuesped).subscribe({
          next: () => {
            this.refrescarHuespedes();
            Swal.fire('Eliminado', 'Huésped eliminado correctamente', 'success');
          },
          error: (err) => {
            console.error('Error al eliminar huésped: ', err);
            Swal.fire(
              'Error',
              `<div>No se pudo eliminar el huésped<br><small>${err.error?.message ?? ''}</small></div>`,
              'error',
            );
          },
        });
      }
    });
  }
}