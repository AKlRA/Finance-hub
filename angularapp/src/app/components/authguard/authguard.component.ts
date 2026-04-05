import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthguardComponent implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.authService.isAuthenticated()) {
      const userRole = this.authService.getUserRole();
      const expectedRole = route.url[0].path;

      if (expectedRole === 'user' && userRole === 'CUSTOMER') {
        return true;
      }

      if (expectedRole === 'manager' && (userRole === 'REGIONAL_MANAGER' || userRole === 'REGIONALMANAGER')) {
        return true;
      }

      if (expectedRole !== 'user' && expectedRole !== 'manager') {
        return true;
      }

      // role mismatch redirect
      if (userRole === 'CUSTOMER') {
        this.router.navigate(['/user/view-savings-plan']);
      } else if (userRole === 'REGIONAL_MANAGER' || userRole === 'REGIONALMANAGER') {
        this.router.navigate(['/manager/view-savings-plan']);
      } else {
        this.router.navigate(['/login']);
      }
      return false;
    }

    this.router.navigate(['/login']);
    return false;
  }
}