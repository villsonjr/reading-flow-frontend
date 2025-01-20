import { Injectable } from '@angular/core';
import { User } from 'src/app/core/models/user';
import { Observable, catchError, map, throwError } from 'rxjs';
import { SystemErrorResponse } from 'src/app/core/models/system-error-response';
import { SystemResponse } from 'src/app/core/models/system-response';
import { ErrorHandlingService } from 'src/app/shared/services/error-handling.service';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private usersEndPoint: string = 'v1/users';

  constructor(private apiService: ApiService,
    private errorHandlingService: ErrorHandlingService
  ) { }

  profileImage(username: String): Observable<Blob> {
    return this.apiService.getImage(`${this.usersEndPoint}/${username}/profile-image`).pipe(
      catchError(error => throwError(() => this.errorHandlingService.handleError(error)))
    );
  }

  uploadProfile(username: string, file: File): Observable<SystemResponse<string> | SystemResponse<SystemErrorResponse>> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('image', file, file.name);

    return this.apiService.postFormData<SystemResponse<string>>(`${this.usersEndPoint}/upload-profile-image`, formData).pipe(
      map(response => response as SystemResponse<string>),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

  updateUser(user: User): Observable<User | SystemResponse<SystemErrorResponse>> {
    return this.apiService.put<SystemResponse<User>>(`${this.usersEndPoint}/`, user).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

  getUsers(): Observable<User[] | SystemResponse<SystemErrorResponse>> {
    return this.apiService.get<SystemResponse<User[]>>(`${this.usersEndPoint}`).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

}
