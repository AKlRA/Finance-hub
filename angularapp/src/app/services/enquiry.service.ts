import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Enquiry } from '../models/enquiry.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EnquiryService {
  private apiUrl = 'https://8080-abbdedbacdfcecebfffcbfefde.premiumproject.examly.io/api/enquiry';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  addEnquiry(enquiry: Enquiry): Observable<Enquiry> {
    return this.http.post<Enquiry>(this.apiUrl, enquiry, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getAllEnquiries(): Observable<Enquiry[]> {
    return this.http.get<Enquiry[]>(this.apiUrl, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getEnquiryById(id: number): Observable<Enquiry> {
    return this.http.get<Enquiry>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // updateEnquiry(id: number, enquiry: Enquiry): Observable<Enquiry> {
  //   return this.http.put<Enquiry>(`${this.apiUrl}/${id}`, enquiry, { headers: this.getAuthHeaders() })
  //     .pipe(catchError(this.handleError));
  // }
updateEnquiry(id: number, enquiry: Enquiry): Observable<Enquiry> {
  // Log the object to see if 'status' is actually changed before sending
  console.log('Sending update:', enquiry); 
  return this.http.put<Enquiry>(`${this.apiUrl}/${id}`, enquiry, { headers: this.getAuthHeaders() })
  .pipe(catchError(this.handleError));
}

  deleteEnquiry(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() })
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
}
