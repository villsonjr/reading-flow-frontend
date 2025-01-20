import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { SystemErrorResponse } from 'src/app/core/models/system-error-response';
import { SystemResponse } from 'src/app/core/models/system-response';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Book } from 'src/app/core/models/book';
import { Genre } from 'src/app/core/models/genre';
import { Category } from 'src/app/core/models/category';
import { BookService } from 'src/app/core/services/book.service';
import { GenresService } from 'src/app/core/services/genres.service';
import { GoogleService } from 'src/app/core/services/google.service';
import { CategoriesModalComponent } from '../../genres/categories-modal/categories-modal.component';
import { Author } from 'src/app/core/models/author';

@Component({
  selector: 'app-new-book',
  templateUrl: './new-book.component.html',
  styleUrls: ['./new-book.component.scss']
})
export class NewBookComponent implements OnInit {

  book!: Book;
  selectedFileName: string[] = [];

  bookTitleControl = new FormControl();
  bookAuthorControl = new FormControl();
  isbnControl = new FormControl('', [Validators.pattern('^[0-9]*$')]);
  bookPageControl = new FormControl();
  genreControl = new FormControl();
  descriptionControl = new FormControl();

  bookFile!: File;

  filteredTitleOptions!: Observable<string[]>;
  isbnFilter!: string;
  hasText = false;

  genres!: Genre[];
  selectedGenre: Genre | undefined;
  categories: Category[] = [];

  displayedColumnsCategories: string[] = ['name', 'actions'];
  dataSourceCategories = new MatTableDataSource<Category>();

  @ViewChild('genreInput') genreInput!: ElementRef;

  constructor(
    private dialog: MatDialog,
    private bookService: BookService,
    private genreService: GenresService,
    private googleService: GoogleService,
    private dialogRef: MatDialogRef<NewBookComponent>,
    private notificationService: NotificationService,
  ) { }

  ngOnInit(): void {

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

    if (this.bookFile == null) {
      this.bookTitleControl.disable();
      this.bookAuthorControl.disable();
      this.isbnControl.disable();
      this.bookPageControl.disable();
      this.descriptionControl.disable();
    }

  }

  filter(value: string): any {
    const filterValue = value.toLowerCase();
    return this.genres.map(genre => genre.name).filter(option => option.toLowerCase().includes(filterValue));
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file && file.type === 'application/epub+zip') {
      this.selectedFileName = file.name.replace(".epub", "").split(" - ");
      if (this.selectedFileName.length < 2) {
        this.selectedFileName[0] = 'NOMENCLATURA INVÁLIDA';
        this.notificationService.error("Nomenclatura Inválida");
      } else {
        this.bookFile = file;
        this.bookTitleControl.enable();
        this.bookAuthorControl.enable();
        this.isbnControl.enable();
        this.bookPageControl.enable();
        this.descriptionControl.enable();
        this.notificationService.success("Arquivo anexo: " + file.name);
      }
    } else {
      this.notificationService.error("Por favor, selecione um arquivo EPUB válido.");
    }
  }

  searchISBN() {

    if (this.isbnControl.value != null && this.isbnControl.value != undefined) {
      var isbn: string = this.isbnControl.value;

      this.googleService.getBookByISBN(isbn).subscribe({
        next: (response) => {
          response = response as Book;
          var book = Book.fromJSON(response);

          this.bookTitleControl.setValue(book.title);
          this.bookAuthorControl.setValue(book.getAuthorsName());
          this.bookPageControl.setValue(book.pages);
          this.descriptionControl.setValue(book.description);

          book.isbn = isbn;

          this.book = book;

          this.notificationService.success("Informações atualizadas com sucesso!");
        }, error: (error: SystemResponse<SystemErrorResponse>) => {
          this.notificationService.error("ISBN não encontrado!");
        }
      });
    }
  }

  onGenreSelected(genreName: string) {
    this.selectedGenre = this.genres.find(genre => genre.name === genreName);

    if (this.selectedGenre) {
      this.genreControl.setValue(this.selectedGenre.name);
    }
  }

  adicionarCategoria() {
    if (this.genreControl.value !== null && this.genreControl.value !== '') {
      this.dialog.open(CategoriesModalComponent, {
        autoFocus: false,
        maxWidth: '100vw',
        panelClass: ['mobile:w-11/12', 'tablet:w-2/4', 'laptop:w-1/4'],
        data: this.selectedGenre
      }).afterClosed().subscribe((category: Category) => {
        if (category) {
          this.categories.push(category);
          this.dataSourceCategories.data = this.categories;
        }
      });
    } else {
      this.genreInput.nativeElement.focus();
    }
  }

  removerCategoria(categoria: Category) {
    const index = this.categories.indexOf(categoria);
    this.categories.splice(index, 1);
    this.dataSourceCategories.data = this.categories;
  }

  save() {

    if (this.bookFile && typeof this.book === 'undefined') {
      this.book = new Book();

      this.book.title = this.bookTitleControl.value;
      this.book.authors = this.splitAndGetAuthors(this.bookAuthorControl.value);

      if (this.isbnControl.value) {
        this.book.isbn = this.isbnControl.value;
      }
      this.book.pages = this.bookPageControl.value;
      this.book.description = this.descriptionControl.value;
    }

    if (this.bookFile && this.book) {
      if (this.selectedGenre) {
        this.book.genre = this.selectedGenre;
        this.book.categories = this.categories;
      }

      this.bookService.createBook(this.book, this.bookFile).subscribe({
        next: (response) => {
          this.notificationService.success("Livro registrado com sucesso!");
          this.dialogRef.close();
        }, error: (error: SystemResponse<SystemErrorResponse>) => {
          this.notificationService.error("Erro ao realizar operação");
        }
      });
    }
  }

  keyup(event: KeyboardEvent) {
    if (this.isbnFilter) {
      this.hasText = true;
    } else {
      this.hasText = false;
    }
  }

  splitAndGetAuthors(str: string): Author[] {
    const regex = /^(.*),\s*e\s+(.*)$/;
    const match = str.match(regex);

    var names: string[] = [];

    if (match) {
      names = (match[1] + ', ' + match[2]).split(/\s*,\s*/);
    } else {
      names = str.split(/\s*,\s*/);
    }

    return names.map(name => new Author(name));

  }
}
