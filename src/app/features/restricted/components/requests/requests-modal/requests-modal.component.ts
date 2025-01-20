import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabGroup } from '@angular/material/tabs';
import { map, Observable, startWith } from 'rxjs';
import { CategoriesModalComponent } from 'src/app/features/books/components/genres/categories-modal/categories-modal.component';
import { Book } from 'src/app/core/models/book';
import { Category } from 'src/app/core/models/category';
import { Genre } from 'src/app/core/models/genre';
import { RequestedBook } from 'src/app/core/models/requestedBook';
import { User } from 'src/app/core/models/user';
import { GenresService } from 'src/app/core/services/genres.service';
import { RequestBooksService } from 'src/app/core/services/request-books.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { SystemErrorResponse } from 'src/app/core/models/system-error-response';
import { SystemResponse } from 'src/app/core/models/system-response';
import { AuthService } from 'src/app/authentication/services/auth.service';

@Component({
  selector: 'app-requests-modal',
  templateUrl: './requests-modal.component.html',
  styleUrls: ['./requests-modal.component.scss']
})
export class RequestsModalComponent implements OnInit {

  titleControl = new FormControl();
  authorControl = new FormControl();
  assignedUser = new FormControl();

  bookTitleControl = new FormControl();
  bookAuthorControl = new FormControl();
  isbnControl = new FormControl('', [Validators.pattern('^[0-9]*$')]);
  bookPageControl = new FormControl();

  genreControl = new FormControl();
  descriptionControl = new FormControl();

  request: RequestedBook;
  sendMail: boolean = true;
  bookInformations: boolean = true;

  genres!: Genre[];
  selectedFileName: string[] = [];
  selectedGenre: Genre | undefined;

  bookFile!: File;
  action: string;

  hasText = false;

  isMod: boolean = false;

  filteredTitleOptions!: Observable<string[]>;
  isbnFilter!: string;

  displayedColumnsCategories: string[] = ['name', 'actions'];
  dataSourceCategories = new MatTableDataSource<Category>();

  @ViewChild('tabRequest') tabRequest!: MatTabGroup;
  @ViewChild('genreInput') genreInput!: ElementRef;

  constructor(
    private genreService: GenresService,
    private requestedBookService: RequestBooksService,
    private authService: AuthService,
    private dialogRef: MatDialogRef<RequestsModalComponent>,
    private dialog: MatDialog,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    this.request = data.request;
    this.action = data.action;
  }

  ngOnInit(): void {

    this.checkUser();

    this.genreService.getGenres().subscribe({
      next: (response) => {
        response = response as Genre[];
        var genres = response.map(Genre.fromJSON);
        this.genres = genres;

        this.filteredTitleOptions = this.genreControl.valueChanges.pipe(
          startWith(''),
          map(value => this.filter(value))
        );
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.error("Erro ao realizar operação");
      }
    });

    this.titleControl.disable();
    this.authorControl.disable();
    this.assignedUser.disable();

    if (this.request) {

      this.titleControl.setValue(this.request.bookTitle);
      this.authorControl.setValue(this.request.authorName);
      this.assignedUser.setValue(this.request.assigned?.name);

      if (this.request.assigned?.name === null) {
        this.assignedUser.setValue('Não Vinculado');
      }

      if (this.request.status === 'COMPLETE') {

        this.bookInformations = false;
        const b = Book.fromJSON(this.request.book);

        this.bookTitleControl.setValue(b.title);
        this.bookTitleControl.disable();
        this.bookAuthorControl.setValue(b.getAuthorsName());
        this.bookAuthorControl.disable();

        this.isbnFilter = b.isbn;
        this.isbnControl.disable();


        this.bookPageControl.setValue(b.pages);
        this.bookPageControl.disable();

        this.genreControl.setValue(b.genre.getName())
        this.genreControl.disable();

        this.dataSourceCategories.data = b.categories;
        this.descriptionControl.setValue(b.description);
        this.descriptionControl.disable();
      }
    }
  }

  onGenreSelected(genreName: string) {
    this.selectedGenre = this.genres.find(genre => genre.name === genreName);

    if (this.selectedGenre) {
      this.genreControl.setValue(this.selectedGenre.name);
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file && file.type === 'application/epub+zip') {
      this.selectedFileName = file.name.replace(".epub", "").split(" - ");

      if (this.selectedFileName.length < 2) {
        this.bookInformations = true;
        this.selectedFileName[0] = 'NOMENCLATURA INVÁLIDA';
        this.notificationService.error("Nomenclatura Inválida");
      } else {
        this.bookFile = file;
        this.notificationService.success("Arquivo anexo: " + file.name);
        this.bookInformations = false;
        this.tabRequest.selectedIndex = 1;
      }
    } else {
      this.notificationService.error("Por favor, selecione um arquivo EPUB válido.");
    }
  }

  checkUser() {
    this.authService.me().subscribe({
      next: (response) => {
        response = response as SystemResponse<User>;
        const user = User.fromJSON(response.payload);

        this.isMod = user.canAccessModeratorResources();
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.simple("Usuário não autenticado");
      }
    });
  }

  keyup(event: KeyboardEvent) {
    // const input = event.target as HTMLInputElement;
    // input.value = input.value.replace(/[^0-9]/g, '');
    if (this.isbnFilter) {
      this.hasText = true;
    } else {
      this.hasText = false;
    }
  }

  searchISBN() {

    this.request.book.isbn = this.isbnFilter

    this.requestedBookService.getBookByISBN(this.request).subscribe({
      next: (response) => {
        
        response = response as RequestedBook;
        if (response.book.title != null) {
          this.request.book = Book.fromJSON(response.book);

          this.bookTitleControl.setValue(this.request.book.title);
          this.bookAuthorControl.setValue(this.request.book.getAuthorsName());
          this.descriptionControl.setValue(this.request.book.description);
          this.bookPageControl.setValue(this.request.book.pages);

          this.notificationService.success("Informações atualizadas com sucesso!");
        } else {
          this.notificationService.error("ISBN não encontrado!");
        }
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.error("ISBN não encontrado!");
      }
    });
  }

  filter(value: string): any {
    const filterValue = value.toLowerCase();
    return this.genres.map(genre => genre.name).filter(option => option.toLowerCase().includes(filterValue));
  }

  adicionarCategoria() {
    if (this.genreControl.value !== null && this.genreControl.value !== '') {
      const dialogRef = this.dialog.open(CategoriesModalComponent, {
        autoFocus: false,
        maxWidth: '100vw',
        panelClass: ['mobile:w-11/12', 'tablet:w-2/4', 'laptop:w-1/4'],
        data: this.selectedGenre
      }).afterClosed().subscribe((category: Category) => {
        if (category) {
          if (!this.request.book.categories) {
            this.request.book.categories = [];
          }
          this.request.book.categories.push(category);
          this.dataSourceCategories.data = this.request.book.categories;
        }
      });
    } else {
      this.genreInput.nativeElement.focus();
    }
  }

  removerCategoria(categoria: Category) {
    const index = this.request.book.categories.indexOf(categoria);
    this.request.book.categories.splice(index, 1);
    this.dataSourceCategories.data = this.request.book.categories;
  }

  removeRequest(request: RequestedBook) {
    this.requestedBookService.deleteRequest(request).subscribe({
      next: (response) => {
        this.notificationService.error('Solicitação removida com sucesso!');
        this.dialogRef.close();
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.error("Erro ao realizar operação");
      }
    });
  }

  saveAndSend() {

    if (this.bookFile) {

      this.request.book.title = this.bookTitleControl.value;
      this.request.authorName = this.bookAuthorControl.value;
      this.request.book.isbn = this.isbnFilter;
      this.request.book.pages = this.bookPageControl.value;

      if (this.selectedGenre) {
        this.request.book.genre = this.selectedGenre;
      }

      this.requestedBookService.uploadBook(this.bookFile, this.request, this.sendMail).subscribe({
        next: (response) => {
          this.notificationService.success("Solicitação Concluída com Sucesso!");
          this.dialogRef.close();
        }, error: (error: SystemResponse<SystemErrorResponse>) => {
          this.notificationService.error("Erro ao realizar operação");
        }
      });

    }
  }
}
