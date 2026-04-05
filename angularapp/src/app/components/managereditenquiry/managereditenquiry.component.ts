import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EnquiryService } from 'src/app/services/enquiry.service';
 
@Component({
  selector: 'app-managereditenquiry',
  templateUrl: './managereditenquiry.component.html',
  styleUrls: ['./managereditenquiry.component.css']
})
export class ManagereditenquiryComponent implements OnInit {
  editForm: FormGroup;
  enquiryId: number;
  enquiryData: any = {};
  isLoading = true;
  errorMessage = '';
 
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private enquiryService: EnquiryService
  ) {
    this.editForm = this.fb.group({
      status: ['', Validators.required]
    });
  }
 
  ngOnInit(): void {
    this.enquiryId = this.route.snapshot.params['id'];
    this.loadEnquiry();
  }
 
  loadEnquiry() {
    this.enquiryService.getEnquiryById(this.enquiryId).subscribe({
      next: (data:any) => {
        this.enquiryData = data;
        this.editForm.patchValue({ status: data.status });
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Could not fetch enquiry details.';
        this.isLoading = false;
      }
    });
  }
 
  onSubmit() {
    if (this.editForm.valid) {
      const updatedData = { ...this.enquiryData, status: this.editForm.value.status };
      this.enquiryService.updateEnquiry(this.enquiryId, updatedData).subscribe({
        next: () => {
          // Redirect back to the list view
          this.router.navigate(['/manager/view-enquiries']);
        },
        error: () => {
          this.errorMessage = 'Failed to update enquiry status.';
        }
      });
    }
  }
 
}
 
 
 