import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SavingsplanService } from '../../services/savingsplan.service';
import { PlanapplicationService } from '../../services/planapplication.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-userplanapplicationform',
  templateUrl: './userplanapplicationform.component.html',
  styleUrls: ['./userplanapplicationform.component.css']
})
export class UserplanapplicationformComponent implements OnInit {

  applicationForm: FormGroup;
  planId: number = 0;
  planDetails: any;
  userId: number = 0;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  today: Date = new Date();

  selectedFile: File | null = null;
  fileName: string = '';
  proofDocumentBase64: string = '';

  // ── Installment computed values ─────────────────────────────
  installmentAmount: number = 0;
  totalInstallments: number = 0;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private savingsplanService: SavingsplanService,
    private planapplicationService: PlanapplicationService,
    private authService: AuthService
  ) {
    this.applicationForm = this.fb.group({
      remarks: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.route.params.subscribe(params => {
      this.planId = +params['id'];
      if (this.planId) {
        this.fetchPlanDetails(this.planId);
      }
    });
  }

  fetchPlanDetails(id: number): void {
    this.savingsplanService.getSavingsPlanById(id).subscribe(
      (data) => {
        this.planDetails = Array.isArray(data) ? data[0] : data;
        this.calculateInstallments();
      },
      () => {
        this.errorMessage = 'Failed to fetch plan details.';
      }
    );
  }

  // ── Calculate installment amount from plan data ──────────────
  calculateInstallments(): void {
    if (this.planDetails) {
      this.totalInstallments = this.planDetails.timeFrame;
      // Use admin-set installmentAmount if available, fallback to simple division
      this.installmentAmount = this.planDetails.installmentAmount
        ? this.planDetails.installmentAmount
        : Math.ceil(this.planDetails.goalAmount / this.planDetails.timeFrame);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.fileName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        this.proofDocumentBase64 = result.split(',')[1];
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.applicationForm.valid && this.planDetails && this.selectedFile) {
      this.isLoading = true;
      this.errorMessage = '';

      const applicationData: any = {
        
        amountRequired: this.planDetails.goalAmount,
        appliedAmount: this.planDetails.goalAmount,
        status: 'PENDING',
        remarks: this.applicationForm.value.remarks,
        proofDocument: this.proofDocumentBase64,
        applicationDate: new Date().toISOString().substring(0, 10),
        user: { userId: this.userId },
        savingsPlan: { savingsPlanId: this.planId }
        
      };

      this.planapplicationService.addPlanApplication(applicationData).subscribe({
        next: () => {
          this.successMessage = 'Application submitted successfully!';
          setTimeout(() => this.router.navigate(['/user/applied-plans']), 2000);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Server error: Cannot upload';
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/user/view-savings-plan']);
  }
}


