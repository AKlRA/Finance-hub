

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SavingsplanService {
  private apiUrl = 'https://finance-hub-7c5c.onrender.com/api/savingsplans';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  getAllSavingsPlans(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getSavingsPlanById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  addSavingsPlan(plan: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, plan, { headers: this.getAuthHeaders() });
  }

  updateSavingsPlan(id: number, plan: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, plan, { headers: this.getAuthHeaders() });
  }

  deleteSavingsPlan(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { 
        headers: this.getAuthHeaders(),
        responseType: 'text' as 'json'  
    });
}
}
