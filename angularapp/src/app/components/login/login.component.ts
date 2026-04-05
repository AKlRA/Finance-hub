import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.redirectUser(this.authService.getUserRole());
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.authService.login(this.loginForm.value).subscribe(
        (res) => {
          this.isLoading = false;
          this.redirectUser(res.userRole);
        },
        (error) => {
          this.isLoading = false;
          this.errorMessage = 'Invalid credentials. Please try again.';
        }
      );
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  private redirectUser(role: string): void {
    if (role === 'CUSTOMER') {
      this.router.navigate(['/user/dashboard']);
  }
    else if (role === 'REGIONALMANAGER') {
        this.router.navigate(['/manager/dashboard']); // changed
    } else {
        this.router.navigate(['/home']);
    }
}
}
