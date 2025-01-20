import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ReadingModalComponent } from './reading-modal/reading-modal.component';
import { SystemErrorResponse } from 'src/app/core/models/system-error-response';
import { SystemResponse } from 'src/app/core/models/system-response';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { Reading } from 'src/app/core/models/reading';
import { ReadingBooksService } from 'src/app/core/services/reading-books.service';
import { Book } from 'src/app/core/models/book';
import { DescriptionModalComponent } from '../description-modal/description-modal.component';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { saveAs } from 'file-saver';


@Component({
  selector: 'readings',
  templateUrl: './readings.component.html',
  styleUrls: ['./readings.component.scss']
})
export class ReadingsComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['readingDate', 'title', 'authors', 'genre', 'categories', 'pages', 'description', 'rating', 'actions'];
  dataSourceReading = new MatTableDataSource<Reading>;

  public filter!: string;
  hasText = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  downloadProgress = 0;

  constructor(private dialog: MatDialog,
    private http: HttpClient,
    private notificationService: NotificationService,
    private readingService: ReadingBooksService) {

    this.updateReadings();
  }

  ngOnInit(): void {
    this.dataSourceReading.filterPredicate = (data: Reading, filter: string) => {
      const lowerCaseFilter = filter.trim().toLowerCase();
      const pagesString = data.book.pages ? data.book.pages.toString() : 'N/A';
      const description = data.book.description || 'N/A';

      return data.book.title.toLowerCase().includes(lowerCaseFilter) ||
        data.book.authors.some(author => author.name.toLowerCase().includes(lowerCaseFilter)) ||
        pagesString.includes(lowerCaseFilter) ||
        description.toLowerCase().includes(lowerCaseFilter);
    };
  }

  ngAfterViewInit(): void {
    this.dataSourceReading.paginator = this.paginator;
    this.dataSourceReading.sort = this.sort;

    this.dataSourceReading.sortingDataAccessor = (reading: any, sortHeaderID: string) => {
      if (sortHeaderID == "authors") {
        return reading.getAuthors();
      } if (sortHeaderID == "title") {
        return reading.getBook().title;
      } if (sortHeaderID == "pages") {
        return reading.getBook().pages;
      } if (sortHeaderID == "description") {
        return reading.getBook().description;
      }
      return reading[sortHeaderID as keyof typeof reading];
    };

    this.paginator._intl.itemsPerPageLabel = 'Itens';
    this.paginator._intl.previousPageLabel = 'Anterior';
    this.paginator._intl.nextPageLabel = 'Próxima';
    this.paginator._intl.getRangeLabel = this.displayPaginatorReadings;
  }

  openReadingModal(read: any, action: string): void {
    this.dialog.open(ReadingModalComponent,
      {
        autoFocus: false,
        maxWidth: '100vw',
        panelClass: ['mobile:w-11/12', 'tablet:w-2/3', 'laptop:w-2/5'],
        data: { read: read, action }
      }).afterClosed().subscribe(() => {
        this.updateReadings();
      });
  }

  editReading(book: Book) {
    this.dialog.open(ReadingModalComponent,
      {
        autoFocus: false,
        maxWidth: '100vw',
        panelClass: ['mobile:w-11/12', 'tablet:w-1/3', 'laptop:w-2/5'],
        data: book,
      }).afterClosed().subscribe(() => {
        this.updateReadings();
      });
  }

  displayPaginatorReadings = (page: number, pagesize: number, length: number) => {
    const initialtext = 'Leituras';
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

  applyFilter(event: Event) {
    this.hasText = true;
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceReading.filter = filterValue.trim().toLowerCase();
  }

  readingsReport() {
    this.readingService.getReport().subscribe({
      next: (event: HttpEvent<Blob>) => {
        switch (event.type) {
          case HttpEventType.DownloadProgress:
            if (event.total) {
              this.downloadProgress = Math.round((event.loaded / event.total) * 100);
            }
            break;
          case HttpEventType.Response:
            this.downloadProgress = 100;
            if (event.body) {
              saveAs(event.body as Blob, 'relatorio_de_leituras.pdf');
              setTimeout(() => {
                this.downloadProgress = 0;
              }, 600);
            }
            break;
        }
      },
      error: (error) => {
        console.error(error);
        this.downloadProgress = 0;
        this.notificationService.error('Erro ao baixar o relatório');
      },
      complete: () => {
        this.notificationService.success('Download completo');
      }
    });
  }

  openDescriptionModal(title: string, description: string) {
    const dialogDescription = this.dialog.open(DescriptionModalComponent, {
      autoFocus: false,
      maxWidth: '100vw',
      panelClass: ['mobile:w-11/12', 'tablet:w-4/5', 'laptop:w-3/5'],
      data: { description: description, title: title }
    });
  }

  updateReadings(): void {

    this.readingService.getReadings().subscribe({
      next: (response) => {
        response = response as Reading[];
        var readings = response.map(Reading.fromJSON);
        this.dataSourceReading.data = readings;
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.error("Erro ao realizar operação");
      }
    });
  }

  clearFilterReading() {
    this.hasText = false;
    this.dataSourceReading.filter = '';
    this.filter = '';
  }
}
