import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  profileForm: FormGroup;
  passwordForm: FormGroup;
  isEditing: boolean = false;
  isChangingPassword: boolean = false;
  isLoading: boolean = false;
  isPasswordLoading: boolean = false;
  isFetching: boolean = true;
  successMessage: string = '';
  errorMessage: string = '';
  passwordSuccess: string = '';
  authError: string = '';
  currentUser: any = null;
  userRole: string = '';
  isManager: boolean = false;

  private apiUrl = 'https://finance-hub-7c5c.onrender.com/api';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: true }],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      userRole: [{ value: '', disabled: true }],
      region: [{ value: '', disabled: true }]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup) {
    const newPass = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return newPass === confirm ? null : { mismatch: true };
  }

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.isManager = this.userRole === 'REGIONALMANAGER';
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUser = stored;
    this.patchForm(stored);
    this.loadProfile();
  }

  loadProfile(): void {
    this.isFetching = true;
    const userId = this.authService.getUserId();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
    this.http.get<any>(`${this.apiUrl}/user/${userId}`, { headers }).subscribe({
      next: (user) => {
        this.currentUser = user;
        this.patchForm(user);
        this.isFetching = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isFetching = false;
        this.cdr.detectChanges();
      }
    });
  }

  private patchForm(user: any): void {
    this.profileForm.patchValue({
      username: user.username || '',
      email: user.email || '',
      mobileNumber: user.mobileNumber || '',
      userRole: user.userRole || '',
      region: user.region || ''
    });
  }

  enableEdit(): void {
    this.isEditing = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.patchForm(this.currentUser);
    this.errorMessage = '';
  }

  togglePasswordForm(): void {
    this.isChangingPassword = !this.isChangingPassword;
    this.passwordForm.reset();
    this.passwordSuccess = '';
    this.authError = '';
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const userId = this.authService.getUserId();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
    const updatePayload = {
      username: this.profileForm.get('username')?.value,
      mobileNumber: this.profileForm.get('mobileNumber')?.value
    };

    this.http.put<any>(`${this.apiUrl}/user/${userId}`, updatePayload, { headers }).subscribe({
      next: () => {
        this.isLoading = false;
        this.isEditing = false;
        this.successMessage = 'Profile updated successfully!';
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        stored.username = updatePayload.username;
        stored.mobileNumber = updatePayload.mobileNumber;
        localStorage.setItem('user', JSON.stringify(stored));
        this.currentUser = { ...this.currentUser, ...updatePayload };
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'The information you entered is incorrect. Please try again.';
      }
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
  
    this.isPasswordLoading = true;
    this.authError = '';
    this.passwordSuccess = '';

    const userId = this.authService.getUserId();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });
  
    const payload = { 
      currentPassword: this.passwordForm.get('currentPassword')?.value, 
      newPassword: this.passwordForm.get('newPassword')?.value 
    };
  
    // Using the reset-password endpoint to handle potential hash issues
    this.http.put(`${this.apiUrl}/user/${userId}/reset-password`, payload, { 
      headers, 
      responseType: 'text' // Backend returns a plain string
    }).subscribe({
      next: (msg) => {
        this.isPasswordLoading = false;
        this.passwordSuccess = msg || 'Password updated! Logging out for security...';
        this.passwordForm.reset();
        this.isChangingPassword = false;
        
        // Auto-logout after 2 seconds to ensure session is refreshed with new hash
        setTimeout(() => this.authService.logout(), 2000);
      },
      error: (err) => {
        this.isPasswordLoading = false;
        // Specifically handle 401 Bad Credentials from Spring Security
        if (err.status === 401) {
          this.authError = 'The information you entered is incorrect. Please try again.';
        } else {
          this.authError = err.error || 'Server error. Please try again later.';
        }
      }
    });
  }

  getInitials(): string {
    const name: string = this.currentUser?.username || '?';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getRoleLabel(): string {
    return this.isManager ? 'Regional Manager' : 'Customer';
  }
}
