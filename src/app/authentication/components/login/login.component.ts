import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { AuthService } from '../../services/auth.service';
import { AuthResponse } from 'src/app/core/models/auth-response';
import { SystemResponse } from 'src/app/core/models/system-response';
import { SystemErrorResponse } from 'src/app/core/models/system-error-response';
import { StorageService } from '../../services/storage.service';
import { Router } from '@angular/router';
import { User } from 'src/app/core/models/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {


  username = new FormControl();
  password = new FormControl();

  showPassword: boolean = false;
  credentials: boolean = true;
  isSignIn: boolean = true;
  dateControl = new FormControl();

  constructor(
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
    const hasToken = this.storageService.hasToken();
    if (hasToken) {
      this.authService.me().subscribe({
        next: (response) => {
          response = response as SystemResponse<User>;
          this.router.navigate(['/dashboard']);
        }, error: (error: SystemResponse<SystemErrorResponse>) => {
          this.notificationService.simple("Usuário não autenticado");
        }
      });
    }
  }

  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  changeCard() {
    this.isSignIn = !this.isSignIn;
  }

  login() {
    var user = this.username.value;
    var password = this.password.value;

    if (null == user || null == password) {
      this.notificationService.error("Credenciais Inválidas");
      return;
    }

    this.authService.login(user, password).subscribe({
      next: (response) => {
        response = response as SystemResponse<AuthResponse>;
        this.storageService.saveAccessToken(response.payload.accessToken);
        this.router.navigate(['/dashboard']);
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.error("Credenciais Inválidas");
      }
    });
  }

  register() {
    this.notificationService.error("Desculpe, não estamos aceitando registro no momento.");
  }

}
