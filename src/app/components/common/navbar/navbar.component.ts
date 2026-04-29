import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Roles } from '../../../constants/Roles';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  username: string | null = null;
  showMenuAdmin: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    if (this.authService.hasRole(Roles.ADMIN)) {
      this.showMenuAdmin = true;
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
