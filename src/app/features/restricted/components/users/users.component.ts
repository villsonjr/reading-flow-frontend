import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { User } from 'src/app/core/models/user';
import { UserService } from 'src/app/core/services/user.service';
import { SystemErrorResponse } from 'src/app/core/models/system-error-response';
import { SystemResponse } from 'src/app/core/models/system-response';
import { NotificationService } from 'src/app/shared/services/notification.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, AfterViewInit {

  hasText = false;
  filter!: string;

  displayedColumns: string[] = ['username', 'name', 'email', 'phone', 'gender', 'kindleMail', 'role', 'status', 'actions'];
  dataSourceUser = new MatTableDataSource<User>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private userService: UserService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit(): void {

    this.userService.getUsers().subscribe({
      next: (response) => {
        response = response as User[];
        this.dataSourceUser.data = response.map(User.fromJSON);
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.error("Erro ao realizar operação");
      }
    });

    this.dataSourceUser.filterPredicate = (user: User, filter: string) => {
      const lowerCaseFilter = filter.trim().toLowerCase();

      return user.username.toLowerCase().includes(lowerCaseFilter) || user.name.toLowerCase().includes(lowerCaseFilter) ||
        user.email.toLowerCase().includes(lowerCaseFilter) || user.phone.includes(lowerCaseFilter) || user.getGender().toLowerCase().includes(lowerCaseFilter) ||
        user.kindleMail.toLowerCase().includes(lowerCaseFilter) || user.roles.join(' e ').toLowerCase().includes(lowerCaseFilter) ||
        user.status.toLowerCase().includes(lowerCaseFilter);
    };

  }

  ngAfterViewInit(): void {

    this.dataSourceUser.sortingDataAccessor = (user: User, sortHeaderID: string): string | number => {

      switch (sortHeaderID) {
        case 'username': return user.username;
        case 'name': return user.name;
        case 'email': return user.email;
        case 'phone': return user.phone;
        case 'gender': return user.gender;
        case 'kindleMail': return user.kindleMail;
        case 'role': return user.roles.join(' e ');
        case 'status': return user.status;
        default: return '';
      }
    };
    this.dataSourceUser.sort = this.sort;

    this.dataSourceUser.paginator = this.paginator;
    this.paginator._intl.itemsPerPageLabel = 'Itens';
    this.paginator._intl.previousPageLabel = 'Anterior';
    this.paginator._intl.nextPageLabel = 'Próxima';
    this.paginator._intl.getRangeLabel = this.getrangedisplaytext;
  }

  getrangedisplaytext = (page: number, pagesize: number, length: number) => {
    const initialtext = 'Usuários';
    if (length == 0 || pagesize == 0) {
      return `${initialtext} 0 de ${length}`;
    }
    length = Math.max(length, 0);
    const startindex = page * pagesize;
    const endindex = startindex < length
      ? Math.min(startindex + pagesize, length)
      : startindex + pagesize;
    return `${initialtext} ${startindex + 1} a ${endindex} de ${length}`;
  };

  clearFilterReading() {
    this.hasText = false;
    this.dataSourceUser.filter = '';
    this.filter = '';
  }

  applyFilter(event: Event) {
    this.hasText = true;
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceUser.filter = filterValue.trim().toLowerCase();
  }
}
