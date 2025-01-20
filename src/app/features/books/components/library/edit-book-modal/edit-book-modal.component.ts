import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { Observable, map, startWith } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { SystemErrorResponse } from 'src/app/core/models/system-error-response';
import { SystemResponse } from 'src/app/core/models/system-response';
import { AuthService } from 'src/app/authentication/services/auth.service';
import { Book } from 'src/app/core/models/book';
import { Genre } from 'src/app/core/models/genre';
import { Category } from 'src/app/core/models/category';
import { BookService } from 'src/app/core/services/book.service';
import { GenresService } from 'src/app/core/services/genres.service';
import { Author } from 'src/app/core/models/author';
import { CategoriesModalComponent } from '../../genres/categories-modal/categories-modal.component';
import { User } from 'src/app/core/models/user';

@Component({
  selector: 'app-edit-book-modal',
  templateUrl: './edit-book-modal.component.html',
  styleUrls: ['./edit-book-modal.component.scss']
})
export class EditBookModalComponent implements OnInit {

  editBook!: Book;
  action: string;

  genres!: Genre[];

  titleControl = new FormControl();
  authorControl = new FormControl();
  pageControl = new FormControl();
  genreControl = new FormControl();
  descriptionControl = new FormControl();

  selectedGenre: Genre | undefined;

  isMod: boolean = false;

  filteredTitleOptions!: Observable<string[]>;

  displayedColumnsCategories: string[] = ['name', 'actions'];
  dataSourceCategories = new MatTableDataSource<Category>();

  @ViewChild('genreInput') genreInput: ElementRef | undefined;

  constructor(public dialogRef: MatDialogRef<EditBookModalComponent>,
    private bookService: BookService,
    private dialog: MatDialog,
    private authService: AuthService,
    private genreService: GenresService,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    this.editBook = data.book;
    this.action = data.action;
  }

  ngOnInit(): void {

    this.checkUser();

    this.genreService.getGenres().subscribe({
      next: (response) => {
        response = response as Genre[];
        this.genres = response.map(Genre.fromJSON);
        this.filteredTitleOptions = this.genreControl.valueChanges.pipe(
          startWith(''),
          map(value => this.filter(value))
        );
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.error("Erro ao realizar operação");
      }
    });

    if (this.editBook) {

      this.dataSourceCategories.data = this.editBook.categories;

      this.titleControl.setValue(this.editBook.title);
      this.authorControl.setValue(this.editBook.getAuthorsName());
      this.pageControl.setValue(this.editBook.pages);
      this.genreControl.setValue(this.editBook.genre.name);
      this.descriptionControl.setValue(this.editBook.description);
    }
    if (this.action == 'Remover' || this.action == 'Visualizar') {
      this.titleControl.disable();
      this.authorControl.disable();
      this.pageControl.disable();
      this.genreControl.disable();
      this.descriptionControl.disable();
    }
  }

  filter(value: string): any {
    const filterValue = value.toLowerCase();
    return this.genres.map(genre => genre.name).filter(option => option.toLowerCase().includes(filterValue));
  }

  save() {
    let bookTitle = this.titleControl.value;
    let authorName = this.authorControl.value;

    let pages = this.pageControl.value;
    let description = this.descriptionControl.value;

    if (this.editBook && authorName.trim() !== '') {

      let authorNames = authorName.split(' e ');
      let authors = authorNames.map((authorName: string) => new Author(authorName.trim()));

      this.editBook.title = bookTitle;
      this.editBook.description = description;

      this.editBook.pages = pages;
      this.editBook.authors = authors;

      this.bookService.updateBook(this.editBook).subscribe({
        next: (response) => {
          this.notificationService.success('Livro atualizado com sucesso!');
        }, error: (error: SystemResponse<SystemErrorResponse>) => {
          this.notificationService.error("Erro ao realizar operação");
        }
      });
    }
  }

  remove() {
    this.bookService.deleteBook(this.editBook).subscribe({
      next: (response) => {
        this.notificationService.success('Livro removido com sucesso!');
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.error("Erro ao realizar operação");
      }
    });
  }

  onGenreSelected(genreName: string) {
    this.selectedGenre = this.genres.find(genre => genre.name === genreName);

    if (this.selectedGenre) {
      this.genreControl.setValue(this.selectedGenre.name);
      this.editBook.genre = this.selectedGenre;
    }
  }

  adicionarCategoria() {
    if (this.genreControl.value !== null && this.genreControl.value !== '') {
      const dialogRef = this.dialog.open(CategoriesModalComponent, {
        autoFocus: false,
        maxWidth: '100vw',
        panelClass: ['mobile:w-11/12', 'tablet:w-1/3', 'laptop:w-1/4'],
        data: this.editBook.genre
      }).afterClosed().subscribe((category: Category) => {
        if (category) {
          this.editBook.categories.push(category);
          this.dataSourceCategories.data = this.editBook.categories;
        }
      });
    } else {
      this.genreInput?.nativeElement.focus();
    }
  }

  checkUser() {
    this.authService.me().subscribe({
      next: (response) => {
        response = response as SystemResponse<User>;
        const user = User.fromJSON(response.payload);
        this.isMod = user.canAccessModeratorResources();
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.error("Erro ao realizar operação");
      }
    });
  }

  removerCategoria(cat: Category): void {
    const index = this.editBook.categories.indexOf(cat);
    this.editBook.categories.splice(index, 1);
    this.dataSourceCategories.data = this.editBook.categories;
  }
}
