import { HttpClient, HttpEvent, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from 'src/app/authentication/services/storage.service';
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl: string = environment.baseUrl;

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) { }

  private createHeaders(): HttpHeaders {
    const token = this.storageService.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    });
  }

  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, {
      headers: this.createHeaders(),
      params,
    });
  }

  getArray<T>(endpoint: string, params?: HttpParams): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}/${endpoint}`, {
      headers: this.createHeaders(),
      params,
    });
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, {
      headers: this.createHeaders(),
    });
  }

  postWithParams<T>(endpoint: string, params: HttpParams): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, null, {
      headers: this.createHeaders(),
      params: params
    });
  }

  postFormData<T>(endpoint: string, formData: FormData): Observable<T> {
    let headers = this.createHeaders();
    headers = headers.delete('Content-Type');
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, formData, {
      headers
    });
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, {
      headers: this.createHeaders(),
    });
  }

  delete<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, {
      headers: this.createHeaders(),
      params,
    });
  }

  getImage(endpoint: string, params?: HttpParams): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${endpoint}`, {
      headers: this.createHeaders(),
      params,
      responseType: 'blob'
    });
  }

   getPdf(endpoint: string): Observable<HttpEvent<Blob>> {
    return this.http.get(`${this.baseUrl}/${endpoint}`, {
      headers: this.createHeaders(),
      observe: 'events',
      responseType: 'blob'
    });
  }
}
