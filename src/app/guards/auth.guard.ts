import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../../../../Desktop/Semana 4/citasApp/src/app/services/auth.service';
import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { Roles } from '../constants/Roles';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isLoggedIn()) {
      this.authService.logout();
      return false;
    }
    const expectRoles: Roles[] = route.data['roles'];
    console.log('Roles esperados: ', expectRoles);
    if (expectRoles && !this.authService.hasAnyRole(expectRoles)) {
      Swal.fire(
        'Acceso denegado',
        `Hola ${this.authService.getUsername()} no tienes acceso a este recurso!`,
        'warning',
      ).then(() => {
        this.router.navigate(['/dashboard']);
      });
      return false;
    }
    return true;
  }
}
