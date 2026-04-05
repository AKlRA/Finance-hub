import { Component, OnInit } from '@angular/core';
import { SavingsplanService } from '../../services/savingsplan.service';
import { Router } from '@angular/router';
import { SavingsPlan } from 'src/app/models/savingsplan.model';
 
@Component({
  selector: 'app-userviewsavingsplan',
  templateUrl: './userviewsavingsplan.component.html',
  styleUrls: ['./userviewsavingsplan.component.css']
})
export class UserviewsavingsplanComponent implements OnInit {
  savingsPlans: any[] = [];
  allSavingsPlans: any[] = [];
  searchTerm: string = '';
  errorMessage: string = '';
  planDetails?: SavingsPlan;
  successMessage: string = '';
  isLoading = true; // kept from your version
 
  // compare state — from teammate
  selectedForCompare: any[] = [];
  showCompareModal: boolean = false;
 
  constructor(private savingsPlanService: SavingsplanService, private router: Router) {}
 
  ngOnInit(): void {
    this.loadSavingsPlans();
  }
 
  loadSavingsPlans(): void {
    this.savingsPlanService.getAllSavingsPlans().subscribe(
      (data) => {
        this.allSavingsPlans = data;
        this.savingsPlans = [...data];
        this.isLoading = false; // kept from your version
      },
      (error) => {
        this.errorMessage = 'Failed to load savings plans.';
        this.isLoading = false; // kept from your version
      }
    );
  }
 
  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.savingsPlans = [...this.allSavingsPlans];
      return;
    }
    this.savingsPlans = this.allSavingsPlans.filter(plan =>
      plan.name.toLowerCase().includes(term)
    );
  }
 

  applyForPlan(planId: number): void {
    this.router.navigate(['/user/apply-plan', planId]);
  }
 
  goBack(): void {
    this.router.navigate(['/user/view-savings-plan']);
  }
 
  // ─── COMPARE FUNCTIONS — from teammate ───
 
  isSelectedForCompare(plan: any): boolean {
    return this.selectedForCompare.some(p => p.savingsPlanId === plan.savingsPlanId);
  }
 
  toggleCompare(plan: any): void {
    if (this.isSelectedForCompare(plan)) {
      this.selectedForCompare = this.selectedForCompare.filter(
        p => p.savingsPlanId !== plan.savingsPlanId
      );
    } else {
      if (this.selectedForCompare.length >= 2) {
        this.selectedForCompare[0] = this.selectedForCompare[1];
        this.selectedForCompare[1] = plan;
      } else {
        this.selectedForCompare.push(plan);
      }
    }
  }
 
  openCompareModal(): void {
    if (this.selectedForCompare.length === 2) {
      this.showCompareModal = true;
    }
  }
 
  closeCompareModal(): void {
    this.showCompareModal = false;
  }
 
  clearCompare(): void {
    this.selectedForCompare = [];
    this.showCompareModal = false;
  }
 
  betterGoal(): number {
    const a = this.selectedForCompare[0]?.goalAmount ?? 0;
    const b = this.selectedForCompare[1]?.goalAmount ?? 0;
    if (a > b) return 0;
    if (b > a) return 1;
    return -1;
  }
 
  riskScore(level: string): number {
    switch ((level ?? '').toLowerCase()) {
      case 'low':    return 1;
      case 'medium': return 2;
      case 'high':   return 3;
      default:       return 0;
    }
  }
 
  lowerRisk(): number {
    const a = this.riskScore(this.selectedForCompare[0]?.riskLevel);
    const b = this.riskScore(this.selectedForCompare[1]?.riskLevel);
    if (a < b) return 0;
    if (b < a) return 1;
    return -1;
  }
}
