import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SavingsplanService } from '../../services/savingsplan.service';
import { SavingsPlan } from '../../models/savingsplan.model';

@Component({
  selector: 'app-managereditsavingsplan',
  templateUrl: './managereditsavingsplan.component.html',
  styleUrls: ['./managereditsavingsplan.component.css']
})
export class ManagereditsavingsplanComponent implements OnInit {
  planForm: FormGroup;
  planId: number = 0;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = true;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private savingsplanService: SavingsplanService
  ) {
    this.planForm = this.fb.group({
      name: ['', Validators.required],
      goalAmount: ['', [Validators.required, Validators.min(1)]],
      timeFrame: ['', [Validators.required, Validators.min(1)]],
      riskLevel: ['Medium', Validators.required],
      description: ['', Validators.required],
      status: ['Active', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.planId = +params['id'];
      if (this.planId) {
        this.fetchPlanDetails(this.planId);
      }
    });
  }

  fetchPlanDetails(id: number): void {
    this.savingsplanService.getSavingsPlanById(id).subscribe(
      (data: any) => {
        // Handle potential array response based on backend behavior
        const planToEdit: SavingsPlan = Array.isArray(data) ? data[0] : data;

        if (planToEdit) {
          this.planForm.patchValue({
            name: planToEdit.name,
            goalAmount: planToEdit.goalAmount,
            timeFrame: planToEdit.timeFrame,
            riskLevel: planToEdit.riskLevel,
            description: planToEdit.description,
            status: planToEdit.status
          });
        }
        this.isLoading = false;
      },
      (error) => {
        this.errorMessage = 'Failed to fetch plan details.';
        this.isLoading = false;
      }
    );
  }

  onSubmit(): void {
    if (this.planForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      const updatedPlanData: SavingsPlan = {
        savingsPlanId: this.planId,
        ...this.planForm.value
      };

      this.savingsplanService.updateSavingsPlan(this.planId, updatedPlanData).subscribe(
        (res) => {
          this.isSubmitting = false;
          this.successMessage = 'Savings plan updated successfully!';
          setTimeout(() => this.router.navigate(['/manager/view-savings-plan']), 2000);
        },
        (error) => {
          this.isSubmitting = false;
          this.errorMessage = 'Failed to update savings plan. Please try again.';
        }
      );
    } else {
      this.planForm.markAllAsTouched();
    }
  }

  goBack(): void {
    this.router.navigate(['/manager/view-savings-plan']);
  }
}
