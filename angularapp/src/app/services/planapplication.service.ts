
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { PlanApplication } from '../models/planapplication.model';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class PlanapplicationService {
  private apiUrl = 'https://finance-hub-7c5c.onrender.com/api/planapplications';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  // At the top of the class:
private appliedPlansCache = new Map<number, PlanApplication[]>();
private allPlansCache: PlanApplication[] | null = null;

// The method:
clearCache(): void {
  this.appliedPlansCache.clear();
  this.allPlansCache = null;
}

  addPlanApplication(data: PlanApplication): Observable<PlanApplication> {
    return this.http.post<PlanApplication>(this.apiUrl, data, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  deletePlanApplication(planId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${planId}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getAppliedPlans(userId: number): Observable<PlanApplication[]> {
    return this.http.get<PlanApplication[]>(`${this.apiUrl}/user/${userId}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getAllPlanApplications(): Observable<PlanApplication[]> {
    return this.http.get<PlanApplication[]>(this.apiUrl, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  updatePlanApplication(planId: number, updatedData: PlanApplication): Observable<PlanApplication> {
    return this.http.put<PlanApplication>(`${this.apiUrl}/${planId}`, updatedData, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }

  requestWithdrawal(appId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${appId}/withdraw`, {}, { headers: this.getAuthHeaders() })
        .pipe(tap(() => this.clearCache()), catchError(this.handleError));
}

updateWithdrawalStatus(appId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${appId}/withdrawal-status?status=${status}`, {}, { headers: this.getAuthHeaders() })
        .pipe(tap(() => this.clearCache()), catchError(this.handleError));
}

}


