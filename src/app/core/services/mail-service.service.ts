import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/api/api.service';
import { catchError, Observable, throwError } from 'rxjs';
import { HttpEvent } from '@angular/common/http';
import { RequestedBook } from '../models/requestedBook';
import { ErrorHandlingService } from 'src/app/shared/services/error-handling.service';

@Injectable({
  providedIn: 'root'
})
export class MailService {

  private readingBooksEndPoint: string = 'v1/mail';

  constructor(private apiService: ApiService,
    private errorHandlingService: ErrorHandlingService
  ) { }

  sendMail(bookFile: File, requestedBook: RequestedBook): Observable<HttpEvent<any>> {

    const formData = new FormData();
    formData.append("bookFile", bookFile);
    formData.append("requestedBook", new Blob([JSON.stringify(requestedBook)], { type: 'application/json' }));

    return this.apiService.postFormData<any>(`${this.readingBooksEndPoint}/sendBook`, formData).pipe(
      catchError(error => {
        console.error('Erro ao enviar e-mail (detalhado):', error);
        return throwError(() => this.errorHandlingService.handleError(error));
      })
    );
  }

  
}
