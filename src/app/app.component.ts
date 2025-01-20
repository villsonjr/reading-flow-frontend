import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { StorageService } from './authentication/services/storage.service';
import { Router } from '@angular/router';
import { NotificationService } from './shared/services/notification.service';
import { User } from './core/models/user';
import { SystemErrorResponse } from './core/models/system-error-response';
import { SystemResponse } from './core/models/system-response';
import { AuthService } from './authentication/services/auth.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(@Inject(DOCUMENT) private document: Document,
    private storageService: StorageService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private render: Renderer2
  ) { }

  ngOnInit(): void {
    this.render.addClass(this.document.body, 'orangeTheme');
    const hasToken = this.storageService.hasToken();

    if (hasToken) {
      this.authService.me().subscribe({
        next: (response) => {
          response = response as SystemResponse<User>;
          const user = User.fromJSON(response.payload);
          if (this.storageService.showWelcomeBackMessage()) {
            this.notificationService.simple("Welcome back " + user.username);
            window.sessionStorage.setItem('welcomeBack', 'true');
          }          
        }, error: (error: SystemResponse<SystemErrorResponse>) => {
          this.notificationService.simple("Usuário não autenticado");
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 500);
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }
}
