import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OtpService {

  private apiUrl = 'https://8080-abbdedbacdfcecebfffcbfefde.premiumproject.examly.io/api';

  constructor(private http: HttpClient) { }

  sendOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/sendotp`, { email }, { responseType: 'text' });
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verifyotp`, { email, otp }, { responseType: 'text' });
  }
}