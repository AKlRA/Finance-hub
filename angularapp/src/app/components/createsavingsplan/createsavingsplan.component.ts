import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SavingsplanService } from '../../services/savingsplan.service';
import { SavingsPlan } from '../../models/savingsplan.model';

@Component({
  selector: 'app-createsavingsplan',
  templateUrl: './createsavingsplan.component.html',
  styleUrls: ['./createsavingsplan.component.css']
})
export class CreatesavingsplanComponent implements OnInit {
  planForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  calculatedInstallment: number | null = null;

  constructor(
    private fb: FormBuilder,
    private savingsplanService: SavingsplanService,
    private router: Router
  ) {
    this.planForm = this.fb.group({
      name: ['', Validators.required],
      goalAmount: ['', [Validators.required, Validators.min(1)]],
      timeFrame: ['', [Validators.required, Validators.min(1)]],
      interestRate: ['', [Validators.required, Validators.min(0), Validators.max(50)]],
      riskLevel: ['Medium', Validators.required],
      description: ['', Validators.required],
      status: ['Active', Validators.required]
    });
  }

  ngOnInit(): void {
    // Recalculate whenever goalAmount, timeFrame, or interestRate changes
    this.planForm.valueChanges.subscribe(() => this.calculateInstallment());
  }

  // RD Simple Interest formula:
  // M = R*n + R * [n*(n+1)/2] * (rate/100/12)
  // Solve for R: R = M / [n + n*(n+1)/2 * (rate/1200)]
  calculateInstallment(): void {
    const goal = +this.planForm.get('goalAmount')?.value;
    const months = +this.planForm.get('timeFrame')?.value;
    const rate = +this.planForm.get('interestRate')?.value;

    if (goal > 0 && months > 0 && rate >= 0) {
      const factor = months + (months * (months + 1) / 2) * (rate / 1200);
      this.calculatedInstallment = Math.ceil(goal / factor);
    } else {
      this.calculatedInstallment = null;
    }
  }

  onSubmit(): void {
    if (this.planForm.valid && this.calculatedInstallment) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const planData: SavingsPlan = {
        ...this.planForm.value,
        installmentAmount: this.calculatedInstallment
      };

      this.savingsplanService.addSavingsPlan(planData).subscribe(
        () => {
          this.isLoading = false;
          this.successMessage = 'Savings plan created successfully!';
          this.planForm.reset({ riskLevel: 'Medium', status: 'Active' });
          this.calculatedInstallment = null;
          setTimeout(() => this.router.navigate(['/manager/view-savings-plan']), 2000);
        },
        () => {
          this.isLoading = false;
          this.errorMessage = 'Failed to create savings plan. Please try again.';
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