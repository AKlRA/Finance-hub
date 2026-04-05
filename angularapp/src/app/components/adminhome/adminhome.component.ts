import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlanapplicationService } from '../../services/planapplication.service';
import { FeedbackService } from '../../services/feedback.service';
import { EnquiryService } from '../../services/enquiry.service';
import { SavingsplanService } from '../../services/savingsplan.service';

@Component({
  selector: 'app-adminhome',
  templateUrl: './adminhome.component.html',
  styleUrls: ['./adminhome.component.css']
})
export class AdminhomeComponent implements OnInit {

  isLoading = true;

  totalPlans = 0;
  totalApplications = 0;
  totalFeedbacks = 0;
  totalEnquiries = 0;

  pendingCount = 0;
  approvedCount = 0;
  rejectedCount = 0;

  barData: { label: string; count: number; color: string }[] = [];
  maxBarValue = 1;

  recentEnquiries: any[] = [];

  constructor(
    private planAppService: PlanapplicationService,
    private feedbackService: FeedbackService,
    private enquiryService: EnquiryService,
    private savingsplanService: SavingsplanService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.savingsplanService.getAllSavingsPlans().subscribe(
      (data: any) => {
        const plans = data.content ? data.content : data;
        this.totalPlans = plans.length;
      }
    );

    this.feedbackService.getAllFeedback().subscribe(
      (data: any) => {
        const feedbacks = data.content ? data.content : data;
        this.totalFeedbacks = feedbacks.length;
        this.checkLoading();
      }
    );

    this.enquiryService.getAllEnquiries().subscribe(
      (data: any) => {
        const enquiries = Array.isArray(data) ? data : (data.content ? data.content : []);
        this.totalEnquiries = enquiries.length;
        // grab last 4 as recent
        this.recentEnquiries = enquiries.slice(-4).reverse();
        this.checkLoading();
      }
    );

    this.planAppService.getAllPlanApplications().subscribe(
      (data: any) => {
        const apps = Array.isArray(data) ? data : (data.content ? data.content : []);
        this.totalApplications = apps.length;

        this.pendingCount = apps.filter((a: any) =>
          a.status?.toUpperCase() === 'PENDING').length;
        this.approvedCount = apps.filter((a: any) =>
          a.status?.toUpperCase() === 'APPROVED' || a.status?.toUpperCase() === 'ACCEPTED').length;
        this.rejectedCount = apps.filter((a: any) =>
          a.status?.toUpperCase() === 'REJECTED').length;

        this.barData = [
          { label: 'Pending',  count: this.pendingCount,  color: '#f59e0b' },
          { label: 'Approved', count: this.approvedCount, color: '#10b981' },
          { label: 'Rejected', count: this.rejectedCount, color: '#ef4444' },
        ];

        this.maxBarValue = Math.max(...this.barData.map(b => b.count), 1);
        this.checkLoading();
      },
      () => { this.checkLoading(); }
    );
  }

  checkLoading(): void {
    this.isLoading = false;
  }

  getBarHeight(count: number): string {
    return `${(count / this.maxBarValue) * 180}px`;
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }
}
