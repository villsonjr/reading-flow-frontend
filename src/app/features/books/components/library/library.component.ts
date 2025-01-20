import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { RequestModalComponent } from './request-modal/request-modal.component';
import { EditBookModalComponent } from './edit-book-modal/edit-book-modal.component';
import { SystemErrorResponse } from 'src/app/core/models/system-error-response';
import { SystemResponse } from 'src/app/core/models/system-response';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { NewBookComponent } from './new-book/new-book.component';
import { AuthService } from 'src/app/authentication/services/auth.service';
import { Book } from 'src/app/core/models/book';
import { TopAuthor } from 'src/app/core/models/topAuthor';
import { RequestedBook } from 'src/app/core/models/requestedBook';
import { BookService } from 'src/app/core/services/book.service';
import { AuthorService } from 'src/app/core/services/author.service';
import { RequestBooksService } from 'src/app/core/services/request-books.service';
import { User } from 'src/app/core/models/user';
import { DescriptionModalComponent } from '../description-modal/description-modal.component';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit, AfterViewInit {


  displayedColumnsBook: string[] = ['title', 'authors', 'genre', 'categories', 'pages', 'description', 'actions'];
  displayedColumnsRequestedBooks: string[] = ['date', 'title', 'author', 'status', 'actions'];
  displayedColumnsTop5Authors: string[] = ['name', 'bookCount'];

  dataSourceBooks = new MatTableDataSource<Book>();
  dataSourceTop5Authors = new MatTableDataSource<TopAuthor>();
  dataSourceRequestedBooks = new MatTableDataSource<RequestedBook>();

  public filter!: string;
  hasText = false;

  isUser: boolean = false;
  isMod: boolean = false;
  isAdmin: boolean = false;

  @ViewChild('paginatorBooks') paginatorBooks!: MatPaginator;
  @ViewChild('paginatorRequests') paginatorRequests!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private bookService: BookService,
    private authorService: AuthorService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private requestedBookService: RequestBooksService,
    private dialog: MatDialog) {

    this.loadData();

  }

  loadData() {

    this.updateBooks();
    this.updateRequested();

    this.authorService.getTop3AuthorsWithMostBooks().subscribe({
      next: (response) => {
        response = response as TopAuthor[];
        var authors = response.map(TopAuthor.fromJSON);
        this.dataSourceTop5Authors.data = authors;
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.error("Erro ao realizar operação");
      }
    });
  }


  ngAfterViewInit(): void {
    this.dataSourceBooks.sort = this.sort;
    this.dataSourceBooks.sortingDataAccessor = (book: Book, sortHeaderID: string): string | number => {
      switch (sortHeaderID) {
        case 'title': return book.title;
        case 'authors': return book.getAuthorsName();
        case 'genre': return book.getGenreName();
        case 'categories': return book.getCategoriesName();
        case 'pages': return book.pages;
        case 'description': return book.description;
        default: return '';
      }

    };

    this.dataSourceBooks.paginator = this.paginatorBooks;
    this.dataSourceRequestedBooks.paginator = this.paginatorRequests;
  }

  displayPaginator = (page: number, pagesize: number, length: number) => {
    let initialText = 'Test'
    if (length == 0 || pagesize == 0) {
      return `${initialText} 0 de ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pagesize;
    const endIndex = startIndex < length
      ? Math.min(startIndex + pagesize, length)
      : startIndex + pagesize;
    return `${initialText} ${startIndex + 1} a ${endIndex} de ${length}`;
  };

  ngOnInit(): void {

    this.checkUser();

    this.dataSourceBooks.filterPredicate = (data: Book, filter: string) => {
      const lowerCaseFilter = filter.trim().toLowerCase();
      const pagesString = data.pages ? data.pages.toString() : 'N/A';
      const description = data.description || 'N/A';

      return data.title.toLowerCase().includes(lowerCaseFilter) ||
        data.authors.some(author => author.name.toLowerCase().includes(lowerCaseFilter)) ||
        pagesString.includes(lowerCaseFilter) ||
        description.toLowerCase().includes(lowerCaseFilter);
    };
  }

  checkUser() {
    this.authService.me().subscribe({
      next: (response) => {
        response = response as SystemResponse<User>;
        const user = User.fromJSON(response.payload);

        this.isUser = user.canAccessUserResources();
        this.isMod = user.canAccessModeratorResources();
        this.isAdmin = user.canAccessAdminResources();

      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.error("Erro ao realizar operação");
      }
    });
  }

  openBookModal(book: any, action: string) {
    this.dialog.open(EditBookModalComponent, {
      autoFocus: false,
      maxWidth: '100vw',
      panelClass: ['mobile:w-11/12', 'tablet:w-2/3', 'laptop:w-2/5'],
      data: { book, action }
    }).afterClosed().subscribe(() => this.updateBooks());
  }

  openRequestedModal(request: any, action: string): void {
    this.dialog.open(RequestModalComponent,
      {
        autoFocus: false,
        maxWidth: '100vw',
        panelClass: ['mobile:w-11/12', 'tablet:w-2/3', 'laptop:w-2/5'],
        data: { request, action }
      }).afterClosed().subscribe(() => this.updateRequested());
  }

  openDescriptionModal(title: string, description: string): void {
    this.dialog.open(DescriptionModalComponent, {
      autoFocus: false,
      maxWidth: '100vw',
      panelClass: ['mobile:w-11/12', 'tablet:w-4/5', 'laptop:w-3/5'],
      data: { description: description, title: title }
    });
  }

  newBook() {
    this.dialog.open(NewBookComponent, {
      autoFocus: false,
      maxWidth: '100vw',
      panelClass: ['mobile:w-11/12', 'tablet:w-2/3', 'laptop:w-2/5'],
      minHeight: '80%',
    }).afterClosed().subscribe(() => this.updateBooks());
  }

  applyFilter(event: Event) {
    this.hasText = true;
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceBooks.filter = filterValue.trim().toLowerCase();
  }

  clearFilterBook() {
    this.hasText = false;
    this.dataSourceBooks.filter = '';
    this.filter = '';
  }

  updateBooks(): void {
    this.bookService.getBooks().subscribe({
      next: (response) => {
        response = response as Book[];
        var books = response.map(Book.fromJSON);

        this.dataSourceBooks.data = books;
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.error("Erro ao realizar operação");
      }
    });
  }

  updateRequested() {
    this.requestedBookService.getLast3RequestedBooks().subscribe({
      next: (response) => {
        response = response as RequestedBook[];
        var requests = response.map(RequestedBook.fromJSON);
        this.dataSourceRequestedBooks.data = requests;
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.error("Erro ao realizar operação");
      }
    });
  }
}

