import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/api/api.service';
import { ErrorHandlingService } from 'src/app/shared/services/error-handling.service';
import { catchError, map, Observable } from 'rxjs';
import { SystemResponse } from 'src/app/core/models/system-response';
import { SystemErrorResponse } from 'src/app/core/models/system-error-response';
import { HttpParams } from '@angular/common/http';
import { Book } from '../models/book';

@Injectable({
  providedIn: 'root'
})
export class GoogleService {

  private googleServicesEndPoint: string = 'v1/google';

  constructor(private apiService: ApiService,
    private errorHandlingService: ErrorHandlingService
  ) { }

  getBookByISBN(isbn: string): Observable<Book | SystemResponse<SystemErrorResponse>> {
    const params = new HttpParams().set('isbn', isbn);
    return this.apiService.get<SystemResponse<Book>>(`${this.googleServicesEndPoint}/isbn`, params).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

}
