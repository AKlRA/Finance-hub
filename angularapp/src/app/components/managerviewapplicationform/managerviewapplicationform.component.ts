import { Component, OnInit } from '@angular/core';
import { PlanapplicationService } from '../../services/planapplication.service';
import { PlanApplication } from '../../models/planapplication.model';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-managerviewapplicationform',
  templateUrl: './managerviewapplicationform.component.html',
  styleUrls: ['./managerviewapplicationform.component.css']
})
export class ManagerviewapplicationformComponent implements OnInit {
  applications: PlanApplication[] = [];
  errorMessage: string = '';
  isLoading: boolean = true;
  sortDirection: 'asc' | 'desc' = 'asc';

  currentPage: number = 1;
  pageSize: number = 4;
  protected Math = Math;

  isDownloadingPDF: boolean = false;

  // ── Installment history modal ───────────────────────────────
  showHistoryModal = false;
  selectedApp: any = null;
  paymentHistory: any[] = [];
  historyLoading = false;

  constructor(
    private planapplicationService: PlanapplicationService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.fetchApplications();
  }

  fetchApplications(): void {
    this.isLoading = true;
    this.planapplicationService.getAllPlanApplications().subscribe(
      (data) => {
        this.applications = (data || []).reverse();
        this.errorMessage = '';
        this.isLoading = false;
      },
      (error) => {
        this.errorMessage = 'Failed to load applications. Please try again later.';
        this.isLoading = false;
      }
    );
  }

  // ── View installment history ────────────────────────────────
  viewInstallmentHistory(app: any): void {
    this.selectedApp = app;
    this.showHistoryModal = true;
    this.historyLoading = true;
    this.paymentHistory = [];

    this.paymentService.getPaymentHistory(app.planApplicationId).subscribe({
      next: (data: any[]) => {
        this.paymentHistory = data.filter(p => p.status === 'PAID');
        this.historyLoading = false;
      },
      error: () => {
        this.paymentHistory = [];
        this.historyLoading = false;
      }
    });
  }

  closeHistoryModal(): void {
    this.showHistoryModal = false;
    this.selectedApp = null;
    this.paymentHistory = [];
  }

  get totalPaidAmount(): number {
    return this.paymentHistory.reduce((sum, p) => sum + (p.amount || 0), 0);
  }

  get paginatedApplications() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.applications.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.applications.length / this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  updateApplicationStatus(id: number | undefined, newStatus: string): void {
    if (!id) return;
    const appToUpdate = this.applications.find(a => a.planApplicationId === id);
    if (appToUpdate) {
      const previousStatus = appToUpdate.status;
      appToUpdate.status = newStatus;
      const updatedApp = { ...appToUpdate, status: newStatus };
      this.planapplicationService.updatePlanApplication(id, updatedApp).subscribe({
        next: () => {},
        error: () => {
          appToUpdate.status = previousStatus;
          this.errorMessage = `Failed to update status to ${newStatus}.`;
          setTimeout(() => this.errorMessage = '', 2000);
        }
      });
    }
  }

  sortByAmount(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.applications.sort((a, b) => {
      const valA = a.savingsPlan?.goalAmount || 0;
      const valB = b.savingsPlan?.goalAmount || 0;
      return this.sortDirection === 'asc' ? valA - valB : valB - valA;
    });
    this.currentPage = 1;
  }

  getStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'APPROVED': return 'badge bg-success';
      case 'REJECTED': return 'badge bg-danger';
      case 'PENDING': return 'badge bg-warning text-dark';
      default: return 'badge bg-secondary';
    }
  }

  viewProof(base64: string | undefined): void {
    if (!base64) return;
    const img = base64.startsWith('data:image') ? base64 : 'data:image/png;base64,' + base64;
    const styles = `body { margin:0; background:#000; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; color:white; } .back-btn { margin-bottom:20px; padding:10px 20px; background:#ef4444; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold; } .back-btn:hover { background:#dc2626; } .img-container { background:#111; padding:15px; border-radius:12px; border:1px solid #333; } img { max-width:85vw; max-height:75vh; display:block; border-radius:4px; }`;
    const win = window.open("", "_blank");
    win?.document.write(`<html><head><style>${styles}</style></head><body><button class="back-btn" onclick="window.close()">&larr; Back to Manager Dashboard</button><div class="img-container"><img src="${img}" /></div></body></html>`);
  }

  downloadAllPDF(): void {
    this.isDownloadingPDF = true;
    try {
      const now = new Date().toLocaleString('en-IN');
      const approved = this.applications.filter(a => a.status?.toUpperCase() === 'APPROVED').length;
      const rejected = this.applications.filter(a => a.status?.toUpperCase() === 'REJECTED').length;
      const pending  = this.applications.filter(a => a.status?.toUpperCase() === 'PENDING').length;

      const tableRows = this.applications.map((app, i) => `
        <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
          <td>#${app.planApplicationId ?? '-'}</td>
          <td><div class="name">${app.user?.username ?? '-'}</div><div class="sub">${app.user?.email ?? ''}</div></td>
          <td><div class="name">${app.savingsPlan?.name ?? '-'}</div><div class="sub">ID: ${app.savingsPlan?.savingsPlanId ?? '-'}</div></td>
          <td>₹${(app.savingsPlan?.goalAmount ?? 0).toLocaleString('en-IN')}</td>
          <td><span class="badge badge-${(app.status ?? '').toLowerCase()}">${app.status ?? '-'}</span></td>
        </tr>`).join('');

      const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Plan Applications Report</title>
        <style>* { box-sizing:border-box; margin:0; padding:0; } body { font-family:'Segoe UI',Arial,sans-serif; font-size:11px; color:#222; padding:32px; } .header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:14px; margin-bottom:20px; border-bottom:3px solid #1a56db; } .brand { font-size:20px; font-weight:700; color:#1a56db; } .brand-sub { font-size:11px; color:#666; margin-top:3px; } .meta { text-align:right; font-size:10px; color:#666; } .summary { display:flex; gap:10px; margin-bottom:22px; } .card { flex:1; padding:10px 14px; border-radius:8px; border-left:4px solid; } .c-total { background:#eff6ff; border-color:#1a56db; } .c-approved { background:#f0fdf4; border-color:#16a34a; } .c-pending { background:#fffbeb; border-color:#d97706; } .c-rejected { background:#fef2f2; border-color:#dc2626; } .card-lbl { font-size:9px; color:#888; text-transform:uppercase; letter-spacing:.5px; margin-bottom:4px; } .card-val { font-size:20px; font-weight:700; } .c-total .card-val { color:#1a56db; } .c-approved .card-val { color:#16a34a; } .c-pending .card-val { color:#d97706; } .c-rejected .card-val { color:#dc2626; } table { width:100%; border-collapse:collapse; } thead tr { background:#1a56db; color:#fff; } thead th { padding:9px 10px; text-align:left; font-size:10px; font-weight:600; text-transform:uppercase; } tbody td { padding:8px 10px; border-bottom:1px solid #e5e7eb; } tr.even { background:#fff; } tr.odd { background:#f8fafc; } .name { font-weight:600; } .sub { font-size:9px; color:#888; } .badge { display:inline-block; padding:3px 10px; border-radius:12px; font-size:9px; font-weight:700; text-transform:uppercase; } .badge-approved { background:#dcfce7; color:#16a34a; } .badge-rejected { background:#fee2e2; color:#dc2626; } .badge-pending { background:#fef9c3; color:#ca8a04; } .footer { margin-top:20px; padding-top:10px; border-top:1px solid #e5e7eb; display:flex; justify-content:space-between; font-size:9px; color:#aaa; } @media print { body { padding:15px; } @page { margin:15mm; } }</style>
        </head><body>
        <div class="header"><div><div class="brand">💰 FinanceHub</div><div class="brand-sub">Plan Applications — Manager Report</div></div><div class="meta"><div><strong>Generated:</strong> ${now}</div><div><strong>Total Records:</strong> ${this.applications.length}</div></div></div>
        <div class="summary"><div class="card c-total"><div class="card-lbl">Total</div><div class="card-val">${this.applications.length}</div></div><div class="card c-approved"><div class="card-lbl">Approved</div><div class="card-val">${approved}</div></div><div class="card c-pending"><div class="card-lbl">Pending</div><div class="card-val">${pending}</div></div><div class="card c-rejected"><div class="card-lbl">Rejected</div><div class="card-val">${rejected}</div></div></div>
        <table><thead><tr><th>App ID</th><th>Customer</th><th>Plan Details</th><th>Amount</th><th>Status</th></tr></thead><tbody>${tableRows}</tbody></table>
        <div class="footer"><span>FinanceHub — Confidential Manager Report</span><span>Generated on ${now}</span></div>
        <script>window.onload = () => { window.print(); }</script></body></html>`;

      const win = window.open('', '_blank', 'width=1000,height=700');
      if (win) { win.document.write(html); win.document.close(); }
    } catch (e) {
      this.errorMessage = 'Failed to generate PDF.';
      setTimeout(() => this.errorMessage = '', 3000);
    } finally {
      this.isDownloadingPDF = false;
    }
  }

  downloadSinglePDF(app: PlanApplication): void {
    const now = new Date().toLocaleString('en-IN');
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Application #${app.planApplicationId}</title>
      <style>* { box-sizing:border-box; margin:0; padding:0; } body { font-family:'Segoe UI',Arial,sans-serif; font-size:13px; color:#222; padding:40px; } .header { text-align:center; padding-bottom:20px; margin-bottom:28px; border-bottom:3px solid #1a56db; } .brand { font-size:22px; font-weight:700; color:#1a56db; } .subtitle { font-size:12px; color:#666; margin-top:5px; } .app-id { display:inline-block; background:#1a56db; color:#fff; padding:4px 16px; border-radius:20px; font-size:12px; font-weight:600; margin-top:10px; } .section { margin-bottom:24px; } .section-title { font-size:11px; font-weight:700; color:#1a56db; text-transform:uppercase; letter-spacing:1px; padding-bottom:6px; margin-bottom:12px; border-bottom:1px solid #e5e7eb; } .grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; } .field { background:#f8fafc; padding:12px 14px; border-radius:8px; border-left:3px solid #1a56db; } .lbl { font-size:9px; color:#888; text-transform:uppercase; letter-spacing:.5px; margin-bottom:4px; } .val { font-size:14px; font-weight:600; color:#333; } .status-wrap { display:inline-block; padding:5px 18px; border-radius:20px; font-size:13px; font-weight:700; text-transform:uppercase; } .status-approved { background:#dcfce7; color:#16a34a; } .status-rejected { background:#fee2e2; color:#dc2626; } .status-pending { background:#fef9c3; color:#ca8a04; } .footer { margin-top:32px; padding-top:12px; border-top:1px solid #e5e7eb; font-size:9px; color:#aaa; text-align:center; line-height:1.8; } @media print { body { padding:20px; } @page { margin:15mm; } }</style>
      </head><body>
      <div class="header"><div class="brand">💰 FinanceHub</div><div class="subtitle">Plan Application Receipt</div><div class="app-id">Application #${app.planApplicationId}</div></div>
      <div class="section"><div class="section-title">👤 Customer Information</div><div class="grid"><div class="field"><div class="lbl">Username</div><div class="val">${app.user?.username ?? '-'}</div></div><div class="field"><div class="lbl">Email</div><div class="val">${app.user?.email ?? '-'}</div></div></div></div>
      <div class="section"><div class="section-title">💼 Plan Details</div><div class="grid"><div class="field"><div class="lbl">Plan Name</div><div class="val">${app.savingsPlan?.name ?? '-'}</div></div><div class="field"><div class="lbl">Plan ID</div><div class="val">#${app.savingsPlan?.savingsPlanId ?? '-'}</div></div><div class="field"><div class="lbl">Goal Amount</div><div class="val">₹${(app.savingsPlan?.goalAmount ?? 0).toLocaleString('en-IN')}</div></div><div class="field"><div class="lbl">Risk Level</div><div class="val">${app.savingsPlan?.riskLevel ?? '-'}</div></div></div></div>
      <div class="section"><div class="section-title">📋 Decision</div><div class="grid"><div class="field"><div class="lbl">Current Status</div><div class="val"><span class="status-wrap status-${(app.status ?? '').toLowerCase()}">${app.status ?? '-'}</span></div></div></div></div>
<div class="section"><div class="section-title">💳 Installments</div><div class="grid"><div class="field"><div class="lbl">Monthly Amount</div><div class="val">₹${(app as any).installmentAmount?.toLocaleString('en-IN') ?? '-'}</div></div><div class="field"><div class="lbl">Progress</div><div class="val">${(app as any).installmentsPaid ?? 0} / ${(app as any).totalInstallments ?? 0} paid</div></div><div class="field"><div class="lbl">Payment Status</div><div class="val">${(app as any).paymentStatus ?? '-'}</div></div><div class="field"><div class="lbl">Remaining</div><div class="val">${((app as any).totalInstallments ?? 0) - ((app as any).installmentsPaid ?? 0)} left</div></div></div></div>
<div class="section"><div class="section-title">🏦 Withdrawal</div><div class="grid"><div class="field"><div class="lbl">Withdrawal Status</div><div class="val">${(app as any).withdrawalStatus ?? 'Not Requested'}</div></div></div></div>
<div class="grid"><span class="status-wrap status-${(app.status ?? '').toLowerCase()}"></span></div></div>
      <div class="footer">Generated by FinanceHub Manager Portal • ${now}<br/>This is a system-generated document — no signature required.</div>
      <script>window.onload = () => { window.print(); }</script></body></html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (win) { win.document.write(html); win.document.close(); }
  }

  updateWithdrawal(appId: number, status: string): void {
    this.planapplicationService.updateWithdrawalStatus(appId, status).subscribe({
      next: () => {
        const app = this.applications.find((a: any) => a.planApplicationId === appId);
        if (app) (app as any).withdrawalStatus = status;
      },
      error: () => {
        this.errorMessage = 'Failed to update withdrawal status.';
        setTimeout(() => this.errorMessage = '', 2000);
      }
    });
  }
}