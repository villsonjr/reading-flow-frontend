import { AfterViewInit, Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { User } from 'src/app/core/models/user';
import { StorageService } from 'src/app/authentication/services/storage.service';
import * as feather from 'feather-icons';
import { SystemErrorResponse } from 'src/app/core/models/system-error-response';
import { SystemResponse } from 'src/app/core/models/system-response';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { AuthService } from 'src/app/authentication/services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})

export class SidebarComponent implements
  OnInit, AfterViewInit {

  isPanelBooksExpanded: boolean = false;
  isPanelRestrictedExpanded: boolean = false;

  isAdmin: boolean = false;


  constructor(private renderer: Renderer2,
    private storageService: StorageService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private reference: ElementRef) { }


  ngAfterViewInit() {
    setTimeout(() => {
      this.checkAndAdjustExpansionIndicators();
    }, 50);
    feather.replace();
  }

  checkAndAdjustExpansionIndicators() {
    const matExpansionIndicators = this.reference.nativeElement.querySelectorAll('.mat-expansion-indicator');
    if (matExpansionIndicators.length > 0) {
      matExpansionIndicators.forEach((element: any) => {
        this.renderer.setStyle(element, 'display', 'none');
      });
    }
  }

  ngOnInit() {

    const toggle = document.getElementById('toggle-sidebar')!;
    const aside = document.getElementById('aside')!;

    toggle.addEventListener('click', () => {
      aside.classList.toggle('open');
      this.expandSide();

      if (this.isPanelBooksExpanded) {
        this.isPanelBooksExpanded = false;
      }

      if (this.isPanelRestrictedExpanded) {
        this.isPanelRestrictedExpanded = false;
      }
    });

    this.checkUser();
    this.checkAndAdjustExpansionIndicators();
  }

  checkUser() {
    this.authService.me().subscribe({
      next: (response) => {
        response = response as SystemResponse<User>;
        const user = User.fromJSON(response.payload);

        this.isAdmin = user.canAccessAdminResources();
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.simple("Usuário não autenticado");
      }
    });
  }

  expandBooks(): void {
    const aside = document.getElementById('aside')!;
    if (!aside.classList.contains('open')) {
      aside.classList.toggle('open');
      this.expandSide();
    }
  }

  expandRestricted(): void {
    const aside = document.getElementById('aside')!;
    if (!aside.classList.contains('open')) {
      aside.classList.toggle('open');
      this.expandSide();
    }
  }

  expandSide(): void {

    const sidebarImage = document.getElementById('sidebar-image') as HTMLImageElement;
    const links = document.querySelectorAll('.menu-text');
    const aside = document.getElementById('aside')!;

    aside.classList.replace(aside.classList.contains('open') ? 'w-[4.5rem]' : 'w-72', aside.classList.contains('open') ? 'w-72' : 'w-[4.5rem]');
    sidebarImage.src = aside.classList.contains('open') ? '/assets/images/ulk-orange.png' : '/assets/images/ulk-white.png';
      
    if(aside.classList.contains('open')) {
      this.renderer.removeClass(sidebarImage, 'size-6');
      this.renderer.addClass(sidebarImage, 'size-10');
    } else {
      this.renderer.removeClass(sidebarImage, 'size-10');
      this.renderer.addClass(sidebarImage, 'size-6');
    }

    links.forEach(link => link.classList.toggle('hidden', !aside.classList.contains('open')));

    const matExpansionIndicators = this.reference.nativeElement.querySelectorAll('.mat-expansion-indicator');
    if (matExpansionIndicators) {
      const displayValue = aside.classList.contains('open') ? '' : 'none';
      matExpansionIndicators.forEach((element: any) => {
        this.renderer.setStyle(element, 'display', displayValue);
      });
    }
  }

  logout(): void {
    const accessToken = this.storageService.getAccessToken();
    this.authService.logout(accessToken).subscribe({
      next: (response) => {
        response = response as SystemResponse<string>;
        window.sessionStorage.setItem('welcomeBack', 'true');
        this.notificationService.simple(response.payload);
        setTimeout(() => {
          this.storageService.clean();
          window.location.reload();
        }, 1000);    
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.error("Erro ao realizar operação");
      }
    });
  }
}


