import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { ApiService } from 'src/app/core/api/api.service';
import { ErrorHandlingService } from 'src/app/shared/services/error-handling.service';
import { SystemErrorResponse } from 'src/app/core/models/system-error-response';
import { SystemResponse } from 'src/app/core/models/system-response';
import { TopAuthor } from '../models/topAuthor';

@Injectable({
  providedIn: 'root'
})
export class AuthorService {

  private authorsEndPoint: string = 'v1/authors';

  constructor(private apiService: ApiService,
    private errorHandlingService: ErrorHandlingService
  ) { }

  getTop3AuthorsWithMostBooks(): Observable<TopAuthor[] | SystemResponse<SystemErrorResponse>> {
    return this.apiService.get<SystemResponse<TopAuthor[]>>( `${this.authorsEndPoint}/top3`).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

  getAuthorsCount(): Observable<number | SystemResponse<SystemErrorResponse>> {
    return this.apiService.get<SystemResponse<number>>(`${this.authorsEndPoint}/count`).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }
}
