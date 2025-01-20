import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  accessToken = 'accessToken';

  constructor() { }

  clean(): void {
    window.sessionStorage.removeItem(this.accessToken);
    window.sessionStorage.clear();
  }

  public saveAccessToken(user: any): void {
    window.sessionStorage.removeItem(this.accessToken);
    window.sessionStorage.setItem(this.accessToken, JSON.stringify(user));
  }

  public getAccessToken(): any {
    const token = window.sessionStorage.getItem(this.accessToken);
    if (token) {
      return JSON.parse(token);
    }
  }

  public showWelcomeBackMessage(): boolean {
    if (!window.sessionStorage.getItem("welcomeBack")) {
      return true;
    }
    return false;
  }

  public hasToken(): boolean {
    return window.sessionStorage.getItem(this.accessToken) ? true : false;
  }
}
