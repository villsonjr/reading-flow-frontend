import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/api/api.service';
import { Observable, catchError, map, throwError } from 'rxjs';
import { SystemErrorResponse } from 'src/app/core/models/system-error-response';
import { SystemResponse } from 'src/app/core/models/system-response';
import { ErrorHandlingService } from 'src/app/shared/services/error-handling.service';
import { Reading } from '../models/reading';
import { HttpEvent } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReadingBooksService {

  private readingBooksEndPoint: string = 'v1/readings';

  constructor(private apiService: ApiService,
    private errorHandlingService: ErrorHandlingService
  ) { }

  getReport(): Observable<HttpEvent<Blob>> {
    const endpoint = `${this.readingBooksEndPoint}/readings-report`;
    return this.apiService.getPdf(endpoint).pipe(
      catchError(error => {
        this.errorHandlingService.handleError(error);
        throw error;
      })
    );
  }

  getReadings(): Observable<Reading[] | SystemResponse<SystemErrorResponse>> {
    return this.apiService.get<SystemResponse<Reading[]>>(`${this.readingBooksEndPoint}/`).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

  getPagesCount(): Observable<number | SystemResponse<SystemErrorResponse>> {
    return this.apiService.get<SystemResponse<number>>(`${this.readingBooksEndPoint}/countPages`).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

  getReadingsCount(): Observable<number | SystemResponse<SystemErrorResponse>> {
    return this.apiService.get<SystemResponse<number>>(`${this.readingBooksEndPoint}/count`).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

  saveReading(reading: Reading): Observable<Reading | SystemResponse<SystemErrorResponse>> {
    return this.apiService.post<SystemResponse<Reading>>(`${this.readingBooksEndPoint}/`, reading).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

  updateReading(reading: Reading): Observable<Reading | SystemResponse<SystemErrorResponse>> {
    return this.apiService.put<SystemResponse<Reading>>(`${this.readingBooksEndPoint}/`, reading).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

  deleteReading(reading: Reading): Observable<Boolean | SystemResponse<SystemErrorResponse>> {
    return this.apiService.delete<SystemResponse<Boolean>>(`${this.readingBooksEndPoint}/${reading.key}`).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }
}