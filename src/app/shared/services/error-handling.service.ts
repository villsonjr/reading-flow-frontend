import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { SystemErrorResponse } from 'src/app/core/models/system-error-response';
import { SystemResponse } from 'src/app/core/models/system-response';
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {

  private logging: boolean = environment.logging;

  constructor() { }

  handleError(error: HttpErrorResponse): Observable<SystemResponse<SystemErrorResponse>> {

    if(this.logging) {
      console.error(error);
    }

    const systemErrorResponse: SystemResponse<SystemErrorResponse> = {
      timeStamp: error.error.timestamp,
      message: error.error.message,
      payload: {
        httpStatus: error.status,
        errorKey: error.error.errorKey,
        details: error.error.details
      }
    };
    return throwError(() => systemErrorResponse);
  }
}
