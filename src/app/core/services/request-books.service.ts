import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ApiService } from 'src/app/core/api/api.service';
import { ErrorHandlingService } from 'src/app/shared/services/error-handling.service';
import { SystemErrorResponse } from 'src/app/core/models/system-error-response';
import { SystemResponse } from 'src/app/core/models/system-response';
import { RequestedBook } from '../models/requestedBook';
import { RequestBook } from '../models/requestBook';
import { HttpEvent, HttpEventType } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RequestBooksService {

  private requestBooksEndPoint: string = 'v1/book-requests';

  constructor(private apiService: ApiService,
    private errorHandlingService: ErrorHandlingService
  ) { }

  getRequestedBooks(): Observable<RequestedBook[] | SystemResponse<SystemErrorResponse>> {
    return this.apiService.get<SystemResponse<RequestedBook[]>>(`${this.requestBooksEndPoint}/`).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

  getLast3RequestedBooks(): Observable<RequestedBook[] | SystemResponse<SystemErrorResponse>> {
    return this.apiService.get<SystemResponse<RequestedBook[]>>(`${this.requestBooksEndPoint}/lastRequests`).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

  saveRequest(requestBook: RequestBook): Observable<RequestedBook | SystemResponse<SystemErrorResponse>> {
    return this.apiService.post<SystemResponse<RequestedBook>>(`${this.requestBooksEndPoint}/`, requestBook).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

  updateRequest(requestBook: RequestBook): Observable<RequestedBook | SystemResponse<SystemErrorResponse>> {
    return this.apiService.put<SystemResponse<RequestedBook>>(`${this.requestBooksEndPoint}/`, requestBook).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

  getBookByISBN(requestBook: RequestedBook): Observable<RequestedBook | SystemResponse<SystemErrorResponse>> {
    return this.apiService.post<SystemResponse<RequestedBook>>(`${this.requestBooksEndPoint}/book`, requestBook).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

  uploadBook(epubFile: File, bookDTO: RequestedBook, sendMail: boolean): Observable<RequestedBook | SystemResponse<SystemErrorResponse>> {
    const formData = new FormData();
    formData.append('epubFile', epubFile, epubFile.name);
    formData.append('requestedBookDTO', JSON.stringify(bookDTO));
    formData.append('sendMail', sendMail.toString());

    return this.apiService.postFormData<SystemResponse<RequestedBook>>(`${this.requestBooksEndPoint}/upload`, formData).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

  assignRequest(requestBook: RequestBook): Observable<RequestedBook | SystemResponse<SystemErrorResponse>> {
    return this.apiService.put<SystemResponse<RequestedBook>>(`${this.requestBooksEndPoint}/assign`, requestBook).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

  cancelRequest(requestBook: RequestBook): Observable<RequestedBook | SystemResponse<SystemErrorResponse>> {
    return this.apiService.put<SystemResponse<RequestedBook>>(`${this.requestBooksEndPoint}/cancel`, requestBook).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

  deleteRequest(requestedBook: RequestedBook): Observable<Boolean | SystemResponse<SystemErrorResponse>> {
    return this.apiService.delete<SystemResponse<Boolean>>(`${this.requestBooksEndPoint}/${requestedBook.key}`).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }
}
