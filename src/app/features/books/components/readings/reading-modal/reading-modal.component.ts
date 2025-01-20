import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { MatTableDataSource } from '@angular/material/table';
import { SystemErrorResponse } from 'src/app/core/models/system-error-response';
import { SystemResponse } from 'src/app/core/models/system-response';
import { Book } from 'src/app/core/models/book';
import { Reading } from 'src/app/core/models/reading';
import { Category } from 'src/app/core/models/category';
import { BookService } from 'src/app/core/services/book.service';
import { ReadingBooksService } from 'src/app/core/services/reading-books.service';
import { Author } from 'src/app/core/models/author';

@Component({
  selector: 'app-reading-modal',
  templateUrl: './reading-modal.component.html',
  styleUrls: ['./reading-modal.component.scss']
})
export class ReadingModalComponent implements OnInit {

  books: Book[] = [];
  selectedBook: Book | undefined;
  today: Date = new Date();
  readingForm !: FormGroup;

  genreControl = new FormControl();
  dateControl = new FormControl(this.today);
  titleControl = new FormControl();
  descriptionControl = new FormControl();
  authorControl = new FormControl();
  pagesControl = new FormControl();

  filteredTitleOptions!: Observable<string[]>;

  rating: number = 0;
  hoveredRating: number = 0;
  ratingArr = [1, 2, 3, 4, 5];

  editReading!: Reading;
  action!: string;

  displayedColumnsCategories: string[] = ['name'];
  dataSourceCategories = new MatTableDataSource<Category>();

  @ViewChild('titleInput') titleInput!: ElementRef;
  @ViewChild('star_0', { static: true }) starating!: ElementRef;

  constructor(
    private bookService: BookService,
    private readingService: ReadingBooksService,
    private notificationService: NotificationService,
    private dialogRef: MatDialogRef<ReadingModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data) {
      this.editReading = data.read;
      this.action = data.action;
    }
  }

  ngOnInit(): void {
    this.initializeFormControls();

    this.bookService.getBooks().subscribe({
      next: (response) => {
        response = response as Book[];
        this.books = response.map(Book.fromJSON);
        this.setupFilteredTitleOptions();

        if (this.editReading) {
          this.selectedBook = this.books.find(book => book.title === this.editReading.book.title);
          if (this.selectedBook) {
            this.populateFormWithSelectedBook();
          }
        }
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.error("Erro ao realizar operação");
      }
    });

    if (this.action === 'Remover') {
      this.dateControl.disable();
      this.titleControl.disable();
    }
  }

  private initializeFormControls(): void {
    this.dateControl = new FormControl(this.today, [
      Validators.required,
      this.dateNotGreaterThanToday.bind(this)
    ]);
  }

  private setupFilteredTitleOptions(): void {
    this.filteredTitleOptions = this.titleControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filter(value))
    );
  }

  private populateFormWithSelectedBook(): void {
    this.titleControl.setValue(this.selectedBook!.title);
    this.rating = this.editReading.getRating();
    this.dataSourceCategories.data = this.selectedBook!.categories;
  }

  dateNotGreaterThanToday(control: AbstractControl): ValidationErrors | null {
    const selectedDate = control.value;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (selectedDate > currentDate) {
      return { 'dateGreaterThanToday': true };
    }

    return null;
  }

  private filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.books.map(book => book.title).filter(option => option.toLowerCase().includes(filterValue));
  }

  onBookSelected(bookTitle: string) {
    this.selectedBook = this.books.find(book => book.title === bookTitle);
    if (this.selectedBook) {
      this.titleControl.setValue(this.selectedBook.title);
      this.titleControl.disable();
      this.dataSourceCategories.data = this.selectedBook.categories;
    }
  }

  getAuthorsNames(authors: Author[] | undefined): string {
    return authors?.map(author => author.name).join(', ') || '';
  }

  showStar(index: number) {
    if (this.rating >= index + 1 || this.hoveredRating >= index + 1) {
      return 'star';
    } else {
      return 'star_border';
    }
  }

  rate(rating: number) {
    this.rating = rating;
  }

  onMouseEnter(rating: number) {
    this.hoveredRating = rating;
  }

  onMouseLeave() {
    this.hoveredRating = 0;
  }

  tooltipText(index: number): string {
    switch (index) {
      case 0:
        return 'Muito Ruim';
      case 1:
        return 'Ruim';
      case 2:
        return 'Mediano';
      case 3:
        return 'Bom';
      case 4:
        return 'Muito Bom';
      default:
        return '';
    }
  }

  save() {
    const date = this.dateControl.value;

    if (this.titleControl.value === null) {
      this.titleInput.nativeElement.focus();
      this.notificationService.error('Selecione o livro correspondente a sua leitura');
      return;
    }

    if (this.rating <= 0) {
      const button = document.getElementById('star_2') as HTMLElement;
      button.focus();
      //button.blur();
      this.notificationService.error('Avalie a sua leitura');
    }

    if (this.selectedBook && date && this.rating > 0) {
      const readingDate = this.formatDate(date);

      if (this.editReading) {
        const reading = new Reading(this.editReading.key, readingDate, this.rating, this.selectedBook);
        this.readingService.updateReading(reading).subscribe({
          next: (response) => {
            this.notificationService.success('Leitura atualizada com sucesso!');
          }, error: (error: SystemResponse<SystemErrorResponse>) => {
            this.notificationService.error("Erro ao realizar operação");
          }
        });
      } else {
        const reading = new Reading('', readingDate, this.rating, this.selectedBook);

        this.readingService.saveReading(reading).subscribe({
          next: (response) => {
            this.notificationService.success('Leitura registrada com sucesso!');
          }, error: (error: SystemResponse<SystemErrorResponse>) => {
            this.notificationService.error("Erro ao realizar operação");
          }
        });
      }
      this.dialogRef.close();
    }
  }

  private formatDate(date: Date): string {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);
    return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
  }

  remover() {
    this.readingService.deleteReading(this.editReading).subscribe({
      next: (response) => {
        this.notificationService.error('Leitura removida com sucesso!');
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.error("Erro ao realizar operação");
      }
    });
  }
}