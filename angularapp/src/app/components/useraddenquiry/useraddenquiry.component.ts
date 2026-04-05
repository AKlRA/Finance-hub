import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EnquiryService } from '../../services/enquiry.service';
import { AuthService } from '../../services/auth.service';
import { Enquiry } from '../../models/enquiry.model';
 
@Component({
  selector: 'app-useraddenquiry',
  templateUrl: './useraddenquiry.component.html',
  styleUrls: ['./useraddenquiry.component.css']
})
export class UseraddenquiryComponent implements OnInit {
  enquiryForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  userId: number = 0;
 
  constructor(
    
    private fb: FormBuilder,
    private enquiryService: EnquiryService,
    private authService: AuthService,
    private router: Router
  ) {
    this.enquiryForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }
 
  ngOnInit(): void {
    this.userId = this.authService.getUserId();
  }
 
  onSubmit(): void {
    if (this.enquiryForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
 
const enquiryData: Enquiry = {
  message: this.enquiryForm.value.message,
  user: { userId: this.userId } as any,  
      status: 'Pending'                
};
 
      this.enquiryService.addEnquiry(enquiryData).subscribe(
        (res) => {
          this.isLoading = false;
          this.successMessage = 'Enquiry submitted successfully!';
          this.enquiryForm.reset();
          setTimeout(() => this.router.navigate(['/user/view-enquiry']), 2000);
        },
        (error) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to submit enquiry. Please try again.';
        }
      );
    } else {
      this.enquiryForm.markAllAsTouched();
    }
  }
 
  goBack(): void {
    this.router.navigate(['/user/view-enquiry']);
  }
}
 