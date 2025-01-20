import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { UserService } from 'src/app/core/services/user.service';
import { User } from 'src/app/core/models/user';
import { StorageService } from 'src/app/authentication/services/storage.service';
import { SystemErrorResponse } from 'src/app/core/models/system-error-response';
import { SystemResponse } from 'src/app/core/models/system-response';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { AuthService } from 'src/app/authentication/services/auth.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {


  private currentDate: Date = new Date();
  private subscription!: Subscription;
  private semana = ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sábado"];
  private diaSemana!: string;
  profileImageUrl: string = '';

  isAdmin: boolean = false;
  showClock: boolean = false;

  constructor(private authService: AuthService,
    private notificationService: NotificationService,
    private storageService: StorageService,
    private userService: UserService) { }

  ngOnInit(): void {
    this.subscription = interval(1000).subscribe(() => {
      this.currentDate = new Date();
      this.diaSemana = this.semana[this.currentDate.getDay()];
    });

    this.checkUserAndGetImage();
  }

  checkUserAndGetImage() {
    this.authService.me().subscribe({
      next: (response) => {
        response = response as SystemResponse<User>;
        const user = User.fromJSON(response.payload);

        const showClock = user.preferences.find(pref => pref.key === 'showClock');
        if (showClock) {
          this.showClock = showClock.value.toLowerCase() === 'true';
        }
        

        this.userService.profileImage(user.username).subscribe(
          (res: Blob) => {
            var reader = new FileReader();
            reader.onload = () => {
              this.profileImageUrl = reader.result as string;
            }
            reader.readAsDataURL(res);
          }
        );
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.error("Erro ao realizar operação");
      }
    });
  }

  logout(): void {
    const accessToken = this.storageService.getAccessToken();
    this.authService.logout(accessToken).subscribe({
      next: (response) => {
        response = response as SystemResponse<string>;
        this.notificationService.simple(response.payload);
        window.sessionStorage.setItem('welcomeBack', 'false');
        setTimeout(() => {
          this.storageService.clean();
          window.location.reload();
        }, 1000);    
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.error("Erro ao realizar operação");
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getDay(): string {
    return this.diaSemana;
  }

  getDate() {
    return this.currentDate;
  }
}
