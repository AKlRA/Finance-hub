import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'financehub';

  isMobileMenuOpen = false;

  constructor(public authService: AuthService) { }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  isCustomer(): boolean {
    return this.authService.getUserRole() === 'CUSTOMER';
  }

  isManager(): boolean {
    return this.authService.getUserRole() === 'REGIONALMANAGER'; // fixed
  }
}
