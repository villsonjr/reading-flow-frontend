import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RequestedBook } from 'src/app/core/models/requestedBook';
import { RequestBooksService } from 'src/app/core/services/request-books.service';
import { RequestsModalComponent } from './requests-modal/requests-modal.component';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { SystemErrorResponse } from 'src/app/core/models/system-error-response';
import { SystemResponse } from 'src/app/core/models/system-response';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit, AfterViewInit {


  displayedColumns: string[] = ['date', 'title', 'author', 'owner', 'status', 'responsible', 'book', 'actions'];
  dataSourceRequests = new MatTableDataSource<RequestedBook>;

  hasText = false;
  filter!: string;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private requestsService: RequestBooksService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {

    this.getData();

    this.dataSourceRequests.filterPredicate = (request: RequestedBook, filter: string) => {

      const lowerCaseFilter = filter.trim().toLowerCase();

      const date = new Date(request.requestedDate);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear();

      const gDriveID = request.book.gDriveID || 'Não Vinculado';

      return `${day}/${month}/${year}`.includes(lowerCaseFilter) || request.bookTitle.toLowerCase().includes(lowerCaseFilter) ||
        request.authorName.toLowerCase().includes(lowerCaseFilter) || request.getStatus().toLowerCase().includes(lowerCaseFilter) ||
        request.owner.name.toLowerCase().includes(lowerCaseFilter) || gDriveID.toLowerCase().includes(lowerCaseFilter);

    };
  }

  private getData() {
    this.requestsService.getRequestedBooks().subscribe({
      next: (response) => {
        response = response as RequestedBook[];
        var requests = response.map(RequestedBook.fromJSON);
        this.dataSourceRequests.data = requests;
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.error("Erro ao realizar operação");
      }
    });
  }

  ngAfterViewInit(): void {

    this.dataSourceRequests.sortingDataAccessor = (request: any, sortHeaderID: string): string | number => {

      switch (sortHeaderID) {
        case 'date': return request.requestedDate;
        case 'title': return request.bookTitle;
        case 'author': return request.authorName;
        case 'user': return request.user.username;
        case 'status': return request.getStatus();
        case 'book': return request.book.gDriveID || 'Não Vinculado';
        default: return request[sortHeaderID];
      }
    };
    this.dataSourceRequests.sort = this.sort;


    this.dataSourceRequests.paginator = this.paginator;
    this.paginator._intl.itemsPerPageLabel = 'Itens';
    this.paginator._intl.previousPageLabel = 'Anterior';
    this.paginator._intl.nextPageLabel = 'Próxima';
    this.paginator._intl.getRangeLabel = this.getrangedisplaytext;
  }

  getrangedisplaytext = (page: number, pagesize: number, length: number) => {
    const initialtext = 'Solicitações';
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

  openRequestedBookModal(request: RequestedBook) {
    const action = 'create';
    this.dialog.open(RequestsModalComponent, {
      autoFocus: false,
      maxWidth: '100vw',
      panelClass: ['mobile:w-11/12', 'tablet:w-2/3', 'laptop:w-2/5'],
      minHeight: '80%',
      data: { request, action }
    }).afterClosed().subscribe(() => this.getData());
  }

  assignRequest(request: RequestedBook) {

    this.requestsService.assignRequest(request).subscribe({
      next: request => {
        this.notificationService.success('Solicitação vinculada com sucesso!');
        this.getData();
      }, error: error => {
        this.notificationService.error('Erro ao vincular-se a solicitação');
      }
    });
  }

  clearFilterReading() {
    this.hasText = false;
    this.dataSourceRequests.filter = '';
    this.filter = '';
  }

  remove(request: RequestedBook) {
    const action = 'delete';
    this.dialog.open(RequestsModalComponent, {
      autoFocus: false,
      maxWidth: '100vw',
      panelClass: ['mobile:w-11/12', 'tablet:w-1/3', 'laptop:w-2/5'],
      minHeight: '80%',
      data: { request, action }
    }).afterClosed().subscribe(() => this.getData());
  }

  applyFilter(event: Event) {
    this.hasText = true;
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceRequests.filter = filterValue.trim().toLowerCase();
  }
}
