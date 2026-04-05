import { Component, OnInit } from '@angular/core';
import { SavingsplanService } from '../../services/savingsplan.service';
import { SavingsPlan } from '../../models/savingsplan.model';

@Component({
  selector: 'app-viewsavingsplan',
  templateUrl: './viewsavingsplan.component.html',
  styleUrls: ['./viewsavingsplan.component.css']
})
export class ViewsavingsplanComponent implements OnInit {
  savingsPlans: SavingsPlan[] = [];
  errorMessage: string = '';
  successMessage = '';
  isLoading: boolean = true;

  constructor(private savingsplanService: SavingsplanService) { }

  ngOnInit(): void {
    this.fetchSavingsPlans();
  }

  fetchSavingsPlans(): void {
    this.savingsplanService.getAllSavingsPlans().subscribe(
      (data) => {
        this.savingsPlans = data;
        this.isLoading = false;
      },
      (error) => {
        this.errorMessage = 'Failed to load savings plans. Please try again later.';
        this.isLoading = false;
      }
    );
  }

  deletePlan(id: number | undefined): void {
    if (!id) return;

    if (confirm('Are you sure you want to delete this savings plan?')) {
        this.savingsplanService.deleteSavingsPlan(id).subscribe(
            () => {
                this.savingsPlans = this.savingsPlans.filter(p => p.savingsPlanId !== id);
                this.successMessage = 'Savings plan deleted successfully!';
                this.errorMessage = '';
            },
            (error) => {
                // check if it's actually a parse error on a successful response
                if (error.status === 200) {
                    this.savingsPlans = this.savingsPlans.filter(p => p.savingsPlanId !== id);
                    this.errorMessage = '';
                } else {
                    this.errorMessage = 'Failed to delete savings plan.';
                }
            }
        );
    }
}
}

