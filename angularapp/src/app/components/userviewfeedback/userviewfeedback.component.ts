import { Component, OnInit } from '@angular/core';
import { FeedbackService } from '../../services/feedback.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-userviewfeedback',
  templateUrl: './userviewfeedback.component.html',
  styleUrls: ['./userviewfeedback.component.css']
})
export class UserviewfeedbackComponent implements OnInit {
  feedbacks: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = true;
  userId: number = 0;

  constructor(
    private feedbackService: FeedbackService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.fetchUserFeedback();
  }

  fetchUserFeedback(): void {
    this.feedbackService.getFeedbackByUserId(this.userId).subscribe(
      (data) => {
        this.feedbacks = data;
        this.isLoading = false;
      },
      (error) => {
        this.errorMessage = 'Failed to load your feedback. Please try again later.';
        this.isLoading = false;
      }
    );
  }

  deleteFeedback(id: number): void {
    if (confirm('Are you sure you want to delete this feedback?')) {
      this.feedbackService.deleteFeedback(id).subscribe(
        () => {
          this.feedbacks = this.feedbacks.filter(f => f.feedbackId !== id);
        },
        (error) => {
          this.errorMessage = 'Failed to delete feedback.';
        }
      );
    }
  }

  // Helper method to generate an array for star ratings in the template
  getStars(rating: number): number[] {
    const stars = [];
    for (let i = 0; i < rating; i++) {
      stars.push(0);
    }
    return stars;
  }
}
