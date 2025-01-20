import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { ApiService } from 'src/app/core/api/api.service';
import { ErrorHandlingService } from 'src/app/shared/services/error-handling.service';
import { SystemErrorResponse } from 'src/app/core/models/system-error-response';
import { SystemResponse } from 'src/app/core/models/system-response';
import { Genre } from '../models/genre';

@Injectable({
  providedIn: 'root'
})
export class GenresService {

  private genresEndPoint: string = 'v1/genres';

  constructor(private apiService: ApiService,
    private errorHandlingService: ErrorHandlingService
  ) { }

  getGenres(): Observable<Genre[] | SystemResponse<SystemErrorResponse>> {
    return this.apiService.get<SystemResponse<Genre[]>>(`${this.genresEndPoint}/`).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

  saveGenre(genre: Genre): Observable<Genre | SystemResponse<SystemErrorResponse>> {
    return this.apiService.post<SystemResponse<Genre>>(`${this.genresEndPoint}/`, genre).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

  updateGenre(genre: Genre): Observable<Genre | SystemResponse<SystemErrorResponse>> {
    return this.apiService.put<SystemResponse<Genre>>(`${this.genresEndPoint}/`, genre).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }

  deleteGenre(genre: Genre): Observable<Boolean | SystemResponse<SystemErrorResponse>> {
    return this.apiService.delete<SystemResponse<Boolean>>(`${this.genresEndPoint}/${genre.name}`).pipe(
      map(response => response.payload),
      catchError(error => this.errorHandlingService.handleError(error))
    );
  }
}
