import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ApiService } from 'src/app/core/api/api.service';
import { SystemErrorResponse } from 'src/app/core/models/system-error-response';
import { SystemResponse } from 'src/app/core/models/system-response';
import { ErrorHandlingService } from 'src/app/shared/services/error-handling.service';
import { Book } from '../models/book';
import { HttpEvent, HttpEventType } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private booksEndPoint: string = 'v1/books';

  constructor(private apiService: ApiService,
    private errorHandlingService: ErrorHandlingService
  ) { }

  getBooks(): Observable<Book[] | SystemResponse<SystemErrorResponse>> {
    return this.apiService.get<SystemResponse<Book[]>>(`${this.booksEndPoint}/`).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

  getBooksCount(): Observable<number | SystemResponse<SystemErrorResponse>> {
    return this.apiService.get<SystemResponse<number>>(`${this.booksEndPoint}/count`).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

  createBook(book: Book, epubFile: File): Observable<Book | SystemResponse<SystemErrorResponse>> {
    const formData = new FormData();
    formData.append('epubFile', epubFile, epubFile.name);
    formData.append('dtoBookJSON', JSON.stringify(book));

    return this.apiService.postFormData<SystemResponse<Book>>(`${this.booksEndPoint}/`, formData).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

  createBookSecond(book: Book, epubFile: File): Observable<HttpEvent<SystemResponse<Book>>> {
    const formData = new FormData();
    formData.append('epubFile', epubFile, epubFile.name);
    formData.append('dtoBookJSON', JSON.stringify(book));

    return this.apiService.postFormData<HttpEvent<SystemResponse<Book>>>(`${this.booksEndPoint}/`, formData).pipe(
      catchError(error => {
        const errorEvent: HttpEvent<SystemResponse<SystemErrorResponse>> = {
          type: HttpEventType.Response,
          body: error,
        } as HttpEvent<SystemResponse<SystemErrorResponse>>;
        return throwError(() => errorEvent);
      })
    );
  }

  updateBook(editedBook: Book): Observable<Book | SystemResponse<SystemErrorResponse>> {
    return this.apiService.put<SystemResponse<Book>>(`${this.booksEndPoint}/`, editedBook).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

  deleteBook(book: Book): Observable<Boolean | SystemResponse<SystemErrorResponse>> {
    return this.apiService.delete<SystemResponse<Boolean>>(`${this.booksEndPoint}/${book.gDriveID}`).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }
}
