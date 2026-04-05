

import { Component, OnInit } from '@angular/core';
import { FeedbackService } from '../../services/feedback.service';

@Component({
  selector: 'app-adminviewfeedback',
  templateUrl: './adminviewfeedback.component.html',
  styleUrls: ['./adminviewfeedback.component.css']
})
export class AdminviewfeedbackComponent implements OnInit {
  feedbacks: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = true;

  constructor(private feedbackService: FeedbackService) { }

  ngOnInit(): void {
    this.fetchAllFeedback();
  }

  fetchAllFeedback(): void {
    this.feedbackService.getAllFeedback().subscribe(
      (data) => {
        this.feedbacks = data;
        this.isLoading = false;
      },
      (error) => {
        this.errorMessage = 'Failed to load feedback. Please try again later.';
        this.isLoading = false;
      }
    );
  }

  // Helper method for star ratings
  getStars(rating: number): number[] {
    const stars = [];
    for (let i = 0; i < rating; i++) {
      stars.push(0);
    }
    return stars;
  }
}

