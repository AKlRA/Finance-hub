import { Component, OnInit } from '@angular/core';
import { EnquiryService } from '../../services/enquiry.service';
import { Enquiry } from '../../models/enquiry.model';
import { Router } from '@angular/router'; // Import Router for navigation
 
@Component({
  selector: 'app-managerviewenquiries',
  templateUrl: './managerviewenquiries.component.html',
  styleUrls: ['./managerviewenquiries.component.css']
})
export class ManagerviewenquiriesComponent implements OnInit {
  enquiries: Enquiry[] = [];
  allEnquiries: Enquiry[] = []; // Master copy for searching
  searchTerm: string = '';      // Bound to search input
  errorMessage: string = '';
  isLoading: boolean = true;
 
  constructor(
    private enquiryService: EnquiryService,
    private router: Router // Inject Router
  ) { }
 
  ngOnInit(): void {
    this.fetchEnquiries();
  }
 
  fetchEnquiries(): void {
    this.enquiryService.getAllEnquiries().subscribe(
      (data) => {
        this.allEnquiries = data;
        this.enquiries = data;
        this.isLoading = false;
      },
      (error) => {
        this.errorMessage = 'Failed to load enquiries. Please try again later.';
        this.isLoading = false;
      }
    );
  }
 
  // Filter by ID or Username
  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.enquiries = [...this.allEnquiries];
    } else {
      this.enquiries = this.allEnquiries.filter(e =>
        e.enquiryId?.toString().includes(term) ||
        e.user?.username?.toLowerCase().includes(term)
      );
    }
  }
 
  // Navigate to edit page
  editEnquiry(id: number | undefined): void {
    if (!id) return;
    this.router.navigate(['/manager/edit-enquiry', id]);
  }
 
  deleteEnquiry(id: number | undefined): void {
    if (!id) return;
    if (confirm('Are you sure you want to delete this enquiry?')) {
      this.enquiryService.deleteEnquiry(id).subscribe(
        () => {
          this.allEnquiries = this.allEnquiries.filter(e => e.enquiryId !== id);
          this.onSearch(); // Refresh search view
        },
        (error) => { this.errorMessage = 'Failed to delete enquiry.'; }
      );
    }
  }
}
 
 
 
