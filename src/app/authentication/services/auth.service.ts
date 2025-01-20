import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { User } from 'src/app/core/models/user';
import { SystemResponse } from 'src/app/core/models/system-response';
import { SystemErrorResponse } from 'src/app/core/models/system-error-response';
import { ErrorHandlingService } from 'src/app/shared/services/error-handling.service';
import { HttpParams } from '@angular/common/http';
import { ApiService } from 'src/app/core/api/api.service';
import { AuthResponse } from 'src/app/core/models/auth-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authEndPoint: string = 'v1/auth';

  constructor(
    private apiService: ApiService,
    private errorHandlingService: ErrorHandlingService
  ) { }

  login(username: string, password: string):  Observable<SystemResponse<AuthResponse> | SystemResponse<SystemErrorResponse>> {
    const authRequest = { username, password };
    return this.apiService.post<SystemResponse<AuthResponse> | SystemResponse<SystemErrorResponse>>(`${this.authEndPoint}/sign-in`, authRequest).pipe(
      map(response => response as SystemResponse<AuthResponse>),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

  me(): Observable<SystemResponse<User> | SystemResponse<SystemErrorResponse>> {
    return this.apiService.get<SystemResponse<User>>(`${this.authEndPoint}/me`).pipe(
      map(response => response as SystemResponse<User>),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

  logout(accessToken: string): Observable<SystemResponse<string> | SystemResponse<SystemErrorResponse>>  {
    const params = new HttpParams().set('accessToken', accessToken);
    return this.apiService.postWithParams<SystemResponse<string>>(`${this.authEndPoint}/sign-out`, params).pipe(
      map(response => response as SystemResponse<string>),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }
}
