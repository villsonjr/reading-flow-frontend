import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReadingsComponent } from './components/readings/readings.component';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LibraryComponent } from './components/library/library.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatDialogModule } from '@angular/material/dialog';
import { DescriptionModalComponent } from './components/description-modal/description-modal.component';
import { RequestModalComponent } from './components/library/request-modal/request-modal.component';
import { EditBookModalComponent } from './components/library/edit-book-modal/edit-book-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReadingModalComponent } from './components/readings/reading-modal/reading-modal.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { BrowserModule } from '@angular/platform-browser';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { CategoriesComponent } from './components/genres/genres.component';
import { GenresModalComponent } from './components/genres/genres-modal/genres-modal.component';
import { CategoriesModalComponent } from './components/genres/categories-modal/categories-modal.component';
import { NewBookComponent } from './components/library/new-book/new-book.component';
import { ProgressBarComponent } from 'src/app/shared/components/progress-bar/progress-bar.component';

@NgModule({
  declarations: [
    ReadingsComponent,
    LibraryComponent,
    DescriptionModalComponent,
    RequestModalComponent,
    EditBookModalComponent,
    ProgressBarComponent,
    ReadingModalComponent,
    CategoriesComponent,
    GenresModalComponent,
    CategoriesModalComponent,
    NewBookComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    SharedModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    BrowserModule,
    MatSelectModule,
    MatCardModule
  ]
})
export class BooksModule { }
