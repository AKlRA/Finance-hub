import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SavingsplanService } from '../../services/savingsplan.service';
import { PlanapplicationService } from '../../services/planapplication.service';
import { EnquiryService } from '../../services/enquiry.service';

@Component({
  selector: 'app-userhome',
  templateUrl: './userhome.component.html',
  styleUrls: ['./userhome.component.css']
})
export class UserhomeComponent implements OnInit {

  isLoading = true;

  // profile
  username = '';
  email = '';
  userId = 0;

  // stats
  totalPlans = 0;
  myEnquiriesCount = 0;
  myApplication: any = null; // single application

  // featured plans
  featuredPlans: any[] = [];

  constructor(
    private authService: AuthService,
    private savingsplanService: SavingsplanService,
    private planAppService: PlanapplicationService,
    private enquiryService: EnquiryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // read profile from localStorage — no API call needed
    const user = this.authService['currentUserSubject'].value;
    this.username = user?.username || 'Customer';
    this.email = user?.email || '';
    this.userId = this.authService.getUserId();

    this.loadData();
  }

  loadData(): void {
    this.savingsplanService.getAllSavingsPlans().subscribe(
      (data: any) => {
        const plans = data.content ? data.content : data;
        this.totalPlans = plans.length;
        // fix 1: filter only Active plans before slicing
        this.featuredPlans = plans.filter((p: any) => p.status === 'Active').slice(0, 3);
        this.checkLoading();
      },
      () => this.checkLoading()
    );


    this.planAppService.getAppliedPlans(this.userId).subscribe(
      (data: any) => {
        const apps = Array.isArray(data) ? data : (data.content ? data.content : []);
        if (apps.length > 0) {
          // get most recent
          this.myApplication = apps.sort((a: any, b: any) =>
            b.planApplicationId - a.planApplicationId)[0];
        }
        this.checkLoading();
      },
      () => this.checkLoading()
    );

    // load enquiries filtered by userId
    this.enquiryService.getAllEnquiries().subscribe(
      (data: any) => {
        const all = Array.isArray(data) ? data : (data.content ? data.content : []);
        this.myEnquiriesCount = all.filter((e: any) => {
          const id = e.user?.userId || (e as any).userId;
          return Number(id) === Number(this.userId);
        }).length;
        this.checkLoading();
      },
      () => this.checkLoading()
    );
  }

  checkLoading(): void {
    this.isLoading = false;
  }

  getStatusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'text-green-400 bg-green-900/40 border-green-800';
      case 'REJECTED': return 'text-red-400 bg-red-900/40 border-red-800';
      default: return 'text-yellow-400 bg-yellow-900/40 border-yellow-800';
    }
  }

  getRiskColor(risk: string): string {
    switch (risk) {
      case 'Low': return 'text-green-400 bg-green-900/30 border-green-800';
      case 'High': return 'text-red-400 bg-red-900/30 border-red-800';
      default: return 'text-yellow-400 bg-yellow-900/30 border-yellow-800';
    }
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }
}