import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { UsuariosService } from '../../services/usuarios.service';
import { AuthService } from '../../services/auth.service';
import { UsuarioRequest, UsuarioResponse } from '../../models/usuario.model';
import { DescripcionRoles, Roles } from '../../constants/Roles';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';

declare var bootstrap: any;

@Component({
  selector: 'app-usuarios',
  standalone: false,
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosComponent implements OnInit, AfterViewInit {
  protected usuarios$!: Observable<UsuarioResponse[]>;
  protected usuarioForm: FormGroup;
  protected textoModal: string = 'Registrar';
  protected roles: Roles[] = Object.values(Roles);
  protected esEditMode: boolean = false;
  protected selectedUsuario: UsuarioResponse | null = null;
  private refresh$ = new BehaviorSubject<void>(undefined);

  @ViewChild('usuarioModalRef')
  usuarioModalEl!: ElementRef;
  private modalInstance!: any;

  constructor(
    private fb: FormBuilder,
    private userService: UsuariosService
  ) {
    this.usuarioForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
      password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(20),
      Validators.pattern('^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$')
    ]],
      roles: [[], [Validators.required]],
    });
  }

  ngAfterViewInit(): void {
    this.modalInstance = new bootstrap.Modal(this.usuarioModalEl.nativeElement, {
      keyboard: false,
    });
    this.usuarioModalEl.nativeElement.addEventListener('hidden.bs.modal', () => {
      this.resetForm();
    });
  }

  toggleForm(): void {
    this.resetForm();
    this.textoModal = 'Registrar Usuario';
    this.modalInstance.show();
  }

  public ngOnInit(): void {
    this.usuarios$ = this.refresh$.pipe(
      switchMap(() => this.userService.getUsuarios())
    );
  }

  protected listarUsuarios(): void {
    this.refresh$.next();
  }

  protected deleteUsuario(username: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `El usuario ${username} será eliminado permanentemente`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUsuario(username).subscribe({
          next: () => {
            this.listarUsuarios();
            Swal.fire('Eliminado', 'Usuario eliminado correctamente', 'success');
          },
          error: (err) => {
            console.error('Error al listar usuarios: ', err);
            Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
          },
        });
      }
    });
  }

  protected onSubmit() {
    if (this.usuarioForm.invalid) {
      return;
    }
    const usuarioData: UsuarioRequest = this.usuarioForm.value;

    if (this.esEditMode && this.selectedUsuario) {
      this.userService.putUsuario(usuarioData, usuarioData.username).subscribe({
        next: (newUser) => {
          this.listarUsuarios();
          this.modalInstance.hide();
          Swal.fire('Actualizado', 'Usuario actualizado correctamente', 'success');
        },
        error: (err) => {
          console.log('Error al registrar usuario: ', err);
          Swal.fire(
            'Error',
            `<div> No se pudo registrar el usuario <ol>${err.error?.mensaje}</ol> </div>`,
            'error',
          );
        },
      });
      return;
    }

    this.userService.postUsuario(usuarioData).subscribe({
      next: (newUser) => {
        this.listarUsuarios();
        Swal.fire('Registrado', 'Usuario registrado correctamente', 'success');
        this.modalInstance.hide();
      },
      error: (err) => {
        console.log('Error al registrar usuario: ', err);
        Swal.fire(
          'Error',
          `<div> No se pudo registrar el usuario <ol>${err.error?.mensaje}</ol> </div>`,
          'error',
        );
      },
    });
  }

  protected transformarRol(rol: Roles): string {
    return DescripcionRoles[rol] || 'Desconocido';
  }

  resetForm(): void {
    this.esEditMode = false;
    this.selectedUsuario = null;
    this.textoModal = 'Registrar Usuario';
    this.usuarioForm.get('password')?.setValidators([
      // ← NUEVO
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(20),
      Validators.pattern('^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$'),
    ]);
    this.usuarioForm.get('password')?.updateValueAndValidity();
    this.usuarioForm.reset({
      username: '',
      password: '',
      roles: [],
    });
    this.usuarioForm.markAsPristine();
    this.usuarioForm.markAsUntouched();
  }

  protected editarUsuario(usuario: UsuarioResponse): void {
    this.esEditMode = true;
    this.selectedUsuario = { ...usuario };
    this.textoModal = 'Editando Usuario: ' + usuario.username;
    this.usuarioForm.reset({ username: '', password: '', roles: [] }); // ← NUEVO
    const rolesSeleccionados = usuario.roles.map((rol) => rol as string);
    this.usuarioForm.patchValue({
      username: usuario.username,
      password: '',
      roles: rolesSeleccionados
    });

    this.usuarioForm.get('password')?.setValidators([
      Validators.minLength(8),
      Validators.maxLength(20),
      Validators.pattern('^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$')
    ]);
    this.usuarioForm.get('password')?.updateValueAndValidity();
    this.modalInstance.show();
    }



   // this.usuarioForm.patchValue({ ...usuario });
    //this.modalInstance.show();

}
