import { ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { User } from 'src/app/core/models/user';
import { UserService } from 'src/app/core/services/user.service';
import { StorageService } from 'src/app/authentication/services/storage.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { SystemErrorResponse } from 'src/app/core/models/system-error-response';
import { SystemResponse } from 'src/app/core/models/system-response';
import * as moment from 'moment';
import { AuthService } from 'src/app/authentication/services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {


  protected fb = inject(FormBuilder);
  protected cd = inject(ChangeDetectorRef);

  form = this.fb.group({
    code: [null, [Validators.required]],
  });

  profileImageUrl: string = '';
  user!: User;

  showPhone: boolean = false;
  showMail: boolean = false;
  showKindle: boolean = false;

  nameControl = new FormControl();
  birthDateControl = new FormControl();
  mailControl = new FormControl();
  phoneControl = new FormControl();
  genderControl = new FormControl();

  statusControl = new FormControl();
  roleControl = new FormControl();
  kindleControl = new FormControl();

  isEmailChecked!: boolean;
  isClockChecked!: boolean;
  isChartChecked!: boolean;

  username: string = '';

  @ViewChild('avatarInput') avatarInput!: ElementRef;

  constructor(private storageService: StorageService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private userService: UserService) { }


  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.authService.me().subscribe({
      next: (response) => {
        response = response as SystemResponse<User>;
        this.user = User.fromJSON(response.payload);
        this.showData();

        this.userService.profileImage(this.user.username).subscribe(
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

  showData() {
    this.username = this.user.username;
    this.nameControl.setValue(this.user.name);

    const bday = moment(this.user.birthday).toDate();

    this.birthDateControl.setValue(bday);
    this.mailControl.setValue(this.user.email);
    this.phoneControl.setValue(this.user.phone);
    this.statusControl.setValue(this.user.status);

    this.roleControl.setValue(this.user.getRoles());
    this.kindleControl.setValue(this.user.kindleMail);
    this.genderControl.setValue(this.user.getGender());

    this.isClockChecked = this.user.preferences.find(pref => pref.key === 'showClock')?.value.toLowerCase() === 'true'
    this.isEmailChecked = this.user.preferences.find(pref => pref.key === 'notifyByMail')?.value.toLowerCase() === 'true'
    this.isChartChecked = this.user.preferences.find(pref => pref.key === 'dynamicChart')?.value.toLowerCase() === 'true'
  }

  phoneVisibility() {
    this.showPhone = !this.showPhone;
  }

  mailVisibility() {
    this.showMail = !this.showMail;
  }

  kindleVisibility() {
    this.showKindle = !this.showKindle;
  }

  openFileDialog() {
    this.avatarInput.nativeElement.click();
  }

  saveUser() {

    this.user.name = this.nameControl.value;
    this.user.email = this.mailControl.value;
    this.user.birthday = this.birthDateControl.value;
    this.user.phone = this.phoneControl.value;
    this.user.gender = this.genderControl.value;
    this.user.kindleMail = this.kindleControl.value;

    const showClock = this.user.preferences.find(pref => pref.key === 'showClock');
    const notifyByMail = this.user.preferences.find(pref => pref.key === 'notifyByMail');
    const dynamicChart = this.user.preferences.find(pref => pref.key === 'dynamicChart');

    if (!showClock) {
      this.user.preferences.push({ key: 'showClock', value: 'false' });
    }
    if (!notifyByMail) {
      this.user.preferences.push({ key: 'notifyByMail', value: 'false' });
    }
    if (!dynamicChart) {
      this.user.preferences.push({ key: 'dynamicChart', value: 'false' });
    }

    if (showClock) {
      showClock.value = this.isClockChecked.toString();
    }

    if (notifyByMail) {
      notifyByMail.value = this.isEmailChecked.toString();
    }

    if (dynamicChart) {
      dynamicChart.value = this.isChartChecked.toString();
    }

    this.userService.updateUser(this.user).subscribe({
      next: (response) => {
        this.notificationService.success('Usuário atualizado com sucesso!');
        window.location.reload();
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.error("Erro ao realizar operação");
      }
    });
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.userService.uploadProfile(this.user.username, file).subscribe({
        next: (response) => {
          response = response as SystemResponse<string>;
          this.notificationService.success('Imagem de perfil atualizada com sucesso!');
          window.location.reload();
        }, error: (error: SystemResponse<SystemErrorResponse>) => {
          this.notificationService.error('Erro ao atualizar imagem de perfil!');
        }
      });
    }
  }
}


/**
 * 
initializeMostrarRelogio(): void {
  if (this.user) {
    const preference = this.user.preferences.find(pref => pref.key === 'mostrarRelogio');
    if (!preference) {
      this.user.preferences.push({ key: 'mostrarRelogio', value: 'false' });
    }
  }
}

toggleMostrarRelogio(): void {
  if (this.user) {
    const preference = this.user.preferences.find(pref => pref.key === 'mostrarRelogio');
    if (preference) {
      preference.value = preference.value === 'true' ? 'false' : 'true';
    }
  }
}
 * 
 */


