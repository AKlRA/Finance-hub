import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OtpService } from '../../services/otp.service';
 
@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
 
  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
 
  // OTP fields
  otpSent = false;
  otpVerified = false;
  otpValue = '';
  isSendingOtp = false;
  isVerifyingOtp = false;
  otpMessage = '';
  otpError = '';
 
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private otpService: OtpService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username:     ['', [Validators.required, Validators.minLength(3)]],
      email:        ['', [Validators.required, Validators.email]],
      password:     ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      userRole:     ['CUSTOMER', Validators.required],
      region:       ['']
    },{ validators: this.passwordMatchValidator });
 
    this.registerForm.get('userRole')?.valueChanges.subscribe(role => {
      const regionControl = this.registerForm.get('region');
      if (role === 'REGIONALMANAGER') {
        regionControl?.setValidators([Validators.required]);
      } else {
        regionControl?.clearValidators();
        regionControl?.setValue('');
      }
      regionControl?.updateValueAndValidity();
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }
 
  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }
 
  sendOtp(): void {
    const email = this.registerForm.get('email')?.value;
    if (!email || this.registerForm.get('email')?.invalid) {
      this.otpError = 'Please enter a valid email address first.';
      return;
    }
    this.isSendingOtp = true;
    this.otpError = '';
    this.otpMessage = '';
    this.otpService.sendOtp(email).subscribe({
      next: () => {
        this.otpSent = true;
        this.isSendingOtp = false;
        this.otpMessage = 'OTP sent! Check your inbox.';
      },
      error: () => {
        this.isSendingOtp = false;
        this.otpError = 'Failed to send OTP. Please try again.';
      }
    });
  }
 
  verifyOtp(): void {
    const email = this.registerForm.get('email')?.value;
    if (!this.otpValue || this.otpValue.length !== 6) {
      this.otpError = 'Please enter the 6-digit OTP.';
      return;
    }
    this.isVerifyingOtp = true;
    this.otpError = '';
    this.otpService.verifyOtp(email, this.otpValue).subscribe({
      next: () => {
        this.otpVerified = true;
        this.isVerifyingOtp = false;
        this.otpMessage = 'Email verified! ✓';
      },
      error: () => {
        this.isVerifyingOtp = false;
        this.otpError = 'Invalid or expired OTP.';
      }
    });
  }
 
  resendOtp(): void {
    this.otpSent = false;
    this.otpVerified = false;
    this.otpValue = '';
    this.otpError = '';
    this.otpMessage = '';
    this.sendOtp();
  }
 
  onSubmit(): void {
    if (!this.otpVerified) {
      this.errorMessage = 'Please verify your email with OTP before registering.';
      return;
    }
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
 
      this.authService.register(this.registerForm.value).subscribe(
        (res) => {
          this.isLoading = false;
          this.successMessage = 'Registration successful! You can now login.';
          this.registerForm.reset({ userRole: 'CUSTOMER' });
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        (error) => {
          this.isLoading = false;
          this.errorMessage = 'Registration failed. Email might already be in use.';
        }
      );
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}