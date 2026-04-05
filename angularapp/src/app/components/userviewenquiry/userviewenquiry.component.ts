import { Component, OnInit } from '@angular/core';
import { EnquiryService } from '../../services/enquiry.service';
import { AuthService } from '../../services/auth.service';
import { Enquiry } from '../../models/enquiry.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-userviewenquiry',
  templateUrl: './userviewenquiry.component.html',
  styleUrls: ['./userviewenquiry.component.css']
})
export class UserviewenquiryComponent implements OnInit {
  enquiries: Enquiry[] = [];
  allEnquiries: Enquiry[] = [];
  searchId: string = '';
  errorMessage: string = '';
  isLoading: boolean = true;
  userId: number = 0;

  // ✅ Modal state
  selectedEnquiry: Enquiry | null = null;
  showModal: boolean = false;

  constructor(
    private enquiryService: EnquiryService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.fetchEnquiries();
  }

  fetchEnquiries(): void {
    this.isLoading = true;
    this.enquiryService.getAllEnquiries().subscribe({
      next: (data) => {
        this.allEnquiries = data.filter(e => {
          const idFromEnquiry = e.user?.userId || (e as any).userId;
          return Number(idFromEnquiry) === Number(this.userId);
        });
        this.enquiries = [...this.allEnquiries];
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load enquiries.';
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    const term = this.searchId.trim();
    if (!term) {
      this.enquiries = [...this.allEnquiries];
    } else {
      this.enquiries = this.allEnquiries.filter(e =>
        e.enquiryId?.toString().includes(term)
      );
    }
  }

  deleteEnquiry(id: number | undefined): void {
    if (!id || !confirm('Are you sure you want to delete this enquiry?')) return;

    this.enquiryService.deleteEnquiry(id).subscribe({
      next: () => {
        this.allEnquiries = this.allEnquiries.filter(e => e.enquiryId !== id);
        this.onSearch();
        // close modal if the deleted enquiry was open
        if (this.selectedEnquiry?.enquiryId === id) {
          this.closeModal();
        }
      },
      error: () => this.errorMessage = 'Failed to delete enquiry.'
    });
  }

  // ✅ Open modal with clicked enquiry
  openModal(enquiry: Enquiry): void {
    this.selectedEnquiry = enquiry;
    this.showModal = true;
  }

  // ✅ Close modal
  closeModal(): void {
    this.showModal = false;
    this.selectedEnquiry = null;
  }
}










