import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FeedbackService } from '../../services/feedback.service';
import { AuthService } from '../../services/auth.service';
import { SavingsplanService } from '../../services/savingsplan.service';

@Component({
  selector: 'app-useraddfeedback',
  templateUrl: './useraddfeedback.component.html',
  styleUrls: ['./useraddfeedback.component.css']
})
export class UseraddfeedbackComponent implements OnInit {

  feedbackForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  userId: number = 0;

  // ✅ Savings plans for dropdown
  savingsPlans: any[] = [];
  isLoadingPlans: boolean = false;

  constructor(
    private fb: FormBuilder,
    private feedbackService: FeedbackService,
    private authService: AuthService,
    private savingsplanService: SavingsplanService,
    private router: Router
  ) {
    this.feedbackForm = this.fb.group({
      savingsPlanId: ['', Validators.required],
      rating:        ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      message:       ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.loadSavingsPlans();
  }

  // ✅ Load all active plans for dropdown
  loadSavingsPlans(): void {
    this.isLoadingPlans = true;
    this.savingsplanService.getAllSavingsPlans().subscribe({
      next: (data) => {
        this.savingsPlans = data.filter((p: any) => p.status === 'Active');
        this.isLoadingPlans = false;
      },
      error: () => {
        this.isLoadingPlans = false;
      }
    });
  }

  onSubmit(): void {
    if (this.feedbackForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const feedbackData = {
        rating:       this.feedbackForm.value.rating,
        feedbackText: this.feedbackForm.value.message,
        date:         new Date().toISOString().split('T')[0],
        user:         { userId: this.userId },
        // ✅ Link selected savings plan
        savingsPlan:  { savingsPlanId: this.feedbackForm.value.savingsPlanId }
      };

      this.feedbackService.addFeedback(feedbackData).subscribe(
        () => {
          this.isLoading = false;
          this.successMessage = 'Feedback submitted successfully. Thank you!';
          this.feedbackForm.reset();
          setTimeout(() => this.router.navigate(['/user/view-feedback']), 2000);
        },
        () => {
          this.isLoading = false;
          this.errorMessage = 'Failed to submit feedback. Please try again.';
        }
      );
    } else {
      this.feedbackForm.markAllAsTouched();
    }
  }

  goBack(): void {
    this.router.navigate(['/user/view-feedback']);
  }
}
