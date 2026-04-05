import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiUrl = 'https://finance-hub-7c5c.onrender.com/api/payments';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  createOrder(applicationId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/create-order/${applicationId}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  verifyPayment(payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    applicationId: number;
  }): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/verify`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  getPaymentHistory(applicationId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/history/${applicationId}`,
      { headers: this.getAuthHeaders() }
    );
  }
}
