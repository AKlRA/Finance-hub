import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { PlanapplicationService } from '../../services/planapplication.service';
import { AuthService } from '../../services/auth.service';
import { PaymentService } from '../../services/payment.service';
import { environment } from '../../../environments/environment';

declare var Razorpay: any;

@Component({
  selector: 'app-userappliedplans',
  templateUrl: './userappliedplans.component.html',
  styleUrls: ['./userappliedplans.component.css']
})
export class UserappliedplansComponent implements OnInit {
  applications: any[] = [];
  errorMessage = '';
  isLoading = true;
  currentPage = 1;
  pageSize = 4;
  protected Math = Math;

  // ── Payment state ───────────────────────────────────────────
  paymentLoading: number | null = null;
  showHistoryModal = false;
  selectedApp: any = null;
  paymentHistory: any[] = [];

  // ── History cache: appId → InstallmentPayment[] ─────────────
  private historyCache = new Map<number, any[]>();

  // ── Custom popup (replaces alert / confirm) ──────────────────
  popup: {
    visible: boolean;
    type: 'success' | 'error' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
  } = { visible: false, type: 'success', title: '', message: '' };

  showPopup(type: 'success' | 'error', title: string, message: string): void {
    this.popup = { visible: true, type, title, message };
  }

  showConfirm(title: string, message: string, onConfirm: () => void): void {
    this.popup = { visible: true, type: 'confirm', title, message, onConfirm };
  }

  closePopup(): void {
    this.popup = { ...this.popup, visible: false };
  }

  confirmPopup(): void {
    this.popup.visible = false;
    if (this.popup.onConfirm) this.popup.onConfirm();
  }

  constructor(
    private planService: PlanapplicationService,
    private auth: AuthService,
    private paymentService: PaymentService,
    private ngZone: NgZone,
    private router: Router
  ) {}

  ngOnInit() { this.fetchApplications(); }

  fetchApplications() {
    this.isLoading = true;
    this.planService.getAppliedPlans(this.auth.getUserId()).subscribe({
      next: (data) => {
        this.applications = data.sort((a: any, b: any) => b.planApplicationId - a.planApplicationId);
        this.isLoading = false;
       
      },
      error: () => {
        this.errorMessage = 'Failed to load applications.';
        this.isLoading = false;
      }
    });
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

  progressPercent(app: any): number {
    if (!app.totalInstallments) return 0;
    return Math.round((app.installmentsPaid / app.totalInstallments) * 100);
  }

  viewProof(base64: string) {
    const img = base64.startsWith('data:image') ? base64 : 'data:image/png;base64,' + base64;
    const win = window.open('', '_blank');
    win?.document.write(`
      <html>
        <body style="margin:0; background:#0f172a; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif;">
          <button onclick="window.close()" style="margin-bottom:20px; padding:10px 20px; background:#3b82f6; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">&larr; Back to Applications</button>
          <div style="background:#1e293b; padding:10px; border-radius:8px; border:1px solid #334155;">
            <img src="${img}" style="max-width:80vw; max-height:75vh; display:block;" />
          </div>
        </body>
      </html>
    `);
  }

  // ── Check if already paid this calendar month ──────────────
  private monthName(date: Date): string {
    return date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
  }

  private isPaidThisMonth(history: any[]): boolean {
    const paid = history.filter(p => p.status === 'PAID');
    if (!paid.length) return false;
    const latest = new Date(paid[paid.length - 1].paymentDate);
    const now    = new Date();
    return latest.getFullYear() === now.getFullYear() &&
           latest.getMonth()    === now.getMonth();
  }

  // ── Load Razorpay script dynamically from environment ───────
  private loadRazorpay(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof Razorpay !== 'undefined') {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = environment.razorpayScriptUrl;
      script.onload = () => resolve();
      script.onerror = () => reject('Razorpay SDK failed to load.');
      document.body.appendChild(script);
    });
  }

  // ── Pay installment via Razorpay ────────────────────────────
  payInstallment(app: any): void {
    const nextInstallmentNum = (app.installmentsPaid || 0) + 1;
    this.paymentLoading = app.planApplicationId;

    const cached = this.historyCache.get(app.planApplicationId);
    if (cached !== undefined) {
      this.checkAndPay(app, nextInstallmentNum, cached);
    } else {
      this.paymentService.getPaymentHistory(app.planApplicationId).subscribe({
        next: (history: any[]) => {
          this.historyCache.set(app.planApplicationId, history);
          this.checkAndPay(app, nextInstallmentNum, history);
        },
        error: () => this.proceedWithPayment(app)
      });
    }
  }

  private checkAndPay(app: any, nextNum: number, history: any[]): void {
    if (this.isPaidThisMonth(history)) {
      this.paymentLoading = null;
      const monthLabel = this.monthName(new Date());
      this.showConfirm(
        '⚠️ Early Payment',
        `You have already made a payment this month (${monthLabel}).\nYou are about to pay Installment #${nextNum} early. Are you sure?`,
        () => {
          this.paymentLoading = app.planApplicationId;
          this.proceedWithPayment(app);
        }
      );
      return;
    }
    this.proceedWithPayment(app);
  }

  private proceedWithPayment(app: any): void {
    this.loadRazorpay().then(() => {
      this.paymentService.createOrder(app.planApplicationId).subscribe({
        next: (order: any) => {
          this.paymentLoading = null;

          const options = {
            key: order.razorpayKeyId,
            amount: order.amount,
            currency: 'INR',
            name: 'Finance Hub',
            description: `${order.planName} — Installment #${order.installmentNumber} of ${order.totalInstallments}`,
            order_id: order.orderId,

            prefill: { name: '', email: '', contact: '' },

            config: {
              display: {
                blocks: {
                  utib: {
                    name: 'Pay via UPI',
                    instruments: [{ method: 'upi' }]
                  },
                  other: {
                    name: 'Other Payment Methods',
                    instruments: [
                      { method: 'card' },
                      { method: 'netbanking' },
                      { method: 'wallet' }
                    ]
                  }
                },
                sequence: ['block.utib', 'block.other'],
                preferences: { show_default_blocks: false }
              }
            },

            handler: (response: any) => {
              this.ngZone.run(() => {
                this.paymentService.verifyPayment({
                  razorpayOrderId:   response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  applicationId:     app.planApplicationId
                }).subscribe({
                  next: (res: any) => {
                    this.historyCache.delete(app.planApplicationId);
                    this.planService.clearCache();
                    this.showConfirm(
                      '✅ Payment Successful',
                      `Installment #${res.installmentNumber} paid!\n${res.installmentsPaid}/${res.totalInstallments} installments done.`,
                      () => {
                        this.fetchApplications();
                      }
                    );
                  },
                  error: () => this.showPopup('error', '⚠️ Verification Failed', 'Payment verification failed. Please contact support.')
                });
              });
            },

            theme: { color: '#e11d48' },
            modal: { ondismiss: () => { this.paymentLoading = null; } }
          };

          const rzp = new Razorpay(options);
          rzp.open();
        },
        error: (err: any) => {
          this.paymentLoading = null;
          this.showPopup('error', '❌ Payment Failed', err.error || 'Could not initiate payment. Please try again.');
        }
      });
    }).catch(() => {
      this.paymentLoading = null;
      this.showPopup('error', '❌ Payment Failed', 'Could not load payment gateway. Please try again.');
    });
  }

  // ── Payment history modal ───────────────────────────────────
  viewHistory(app: any): void {
    this.selectedApp = app;
    this.showHistoryModal = true;

    const cached = this.historyCache.get(app.planApplicationId);
    if (cached !== undefined) {
      this.paymentHistory = cached.filter((p: any) => p.status === 'PAID');
      return;
    }
    this.paymentService.getPaymentHistory(app.planApplicationId).subscribe({
      next: (data) => {
        const paidOnly = data.filter((p: any) => p.status === 'PAID');
        this.historyCache.set(app.planApplicationId, paidOnly);
        this.paymentHistory = paidOnly;
      },
      error: () => this.paymentHistory = []
    });
  }

  closeModal(): void {
    this.showHistoryModal = false;
    this.selectedApp = null;
    this.paymentHistory = [];
  }

  // ── Download PDF ────────────────────────────────────────────
  downloadApplicationPDF(app: any): void {
    const now = new Date().toLocaleString('en-IN');

    const statusColor =
      app.status === 'APPROVED' ? '#16a34a' :
      app.status === 'REJECTED' ? '#dc2626' : '#ca8a04';

    const statusBg =
      app.status === 'APPROVED' ? '#dcfce7' :
      app.status === 'REJECTED' ? '#fee2e2' : '#fef9c3';

    const html = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <title>Application Receipt #${app.planApplicationId}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1e293b; padding: 40px; font-size: 13px; }
          .header { text-align: center; border-bottom: 3px solid #1a56db; padding-bottom: 20px; margin-bottom: 28px; }
          .brand   { font-size: 24px; font-weight: 700; color: #1a56db; }
          .subtitle { color: #64748b; font-size: 12px; margin-top: 4px; }
          .app-id  { display: inline-block; margin-top: 10px; background: #1a56db; color: #fff; padding: 4px 18px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .section { margin-bottom: 24px; }
          .section-title { font-size: 10px; font-weight: 700; color: #1a56db; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .field { background: #f8fafc; border-left: 3px solid #1a56db; border-radius: 6px; padding: 10px 14px; }
          .lbl   { font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
          .val   { font-size: 14px; font-weight: 600; color: #1e293b; }
          .status-pill { display: inline-block; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; background: ${statusBg}; color: ${statusColor}; }
          .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 9px; color: #94a3b8; line-height: 1.8; }
          @media print { body { padding: 20px; } @page { margin: 15mm; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">💰 FinanceHub</div>
          <div class="subtitle">Plan Application Receipt</div>
          <div class="app-id">Application #${app.planApplicationId}</div>
        </div>
        <div class="section">
          <div class="section-title">💼 Plan Details</div>
          <div class="grid">
            <div class="field"><div class="lbl">Plan Name</div><div class="val">${app.savingsPlan?.name ?? '-'}</div></div>
            <div class="field"><div class="lbl">Goal Amount</div><div class="val">₹${(app.savingsPlan?.goalAmount ?? 0).toLocaleString('en-IN')}</div></div>
            <div class="field"><div class="lbl">Risk Level</div><div class="val">${app.savingsPlan?.riskLevel ?? '-'}</div></div>
            <div class="field"><div class="lbl">Time Frame</div><div class="val">${app.savingsPlan?.timeFrame ?? '-'} Months</div></div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">📋 Application Details</div>
          <div class="grid">
            <div class="field"><div class="lbl">Application ID</div><div class="val">#${app.planApplicationId}</div></div>
            <div class="field"><div class="lbl">Application Date</div><div class="val">${app.applicationDate ?? '-'}</div></div>
            <div class="field"><div class="lbl">Monthly Installment</div><div class="val">₹${(app.installmentAmount ?? 0).toLocaleString('en-IN')}</div></div>
            <div class="field"><div class="lbl">Installments Paid</div><div class="val">${app.installmentsPaid ?? 0} / ${app.totalInstallments ?? 0}</div></div>
            <div class="field"><div class="lbl">Remarks</div><div class="val">${app.remarks ?? 'None'}</div></div>
            <div class="field"><div class="lbl">Decision Status</div><div class="val"><span class="status-pill">${app.status ?? '-'}</span></div></div>
          </div>
        </div>
        <div class="footer">
          Generated from FinanceHub Customer Portal • ${now}<br/>
          This is a system-generated document — no signature required.
        </div>
        <script>window.onload = () => { window.print(); }</script>
      </body>
      </html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  }

  requestWithdrawal(app: any): void {
    this.showConfirm(
      '💰 Request Withdrawal',
      `You are about to request withdrawal of ₹${app.savingsPlan?.goalAmount?.toLocaleString('en-IN')}.\nThis will be reviewed by the admin. Proceed?`,
      () => {
        this.planService.requestWithdrawal(app.planApplicationId).subscribe({
          next: () => {
            this.planService.clearCache();
            this.fetchApplications();
            this.showPopup('success', '✅ Withdrawal Requested',
              'Your withdrawal request has been submitted. Admin will review it shortly.');
          },
          error: () => this.showPopup('error', '❌ Failed', 'Could not submit withdrawal request.')
        });
      }
    );
  }
}