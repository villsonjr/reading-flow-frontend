import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { Category } from 'src/app/core/models/category';
import { Genre } from 'src/app/core/models/genre';

@Component({
  selector: 'app-categories-modal',
  templateUrl: './categories-modal.component.html',
  styleUrls: ['./categories-modal.component.scss']
})
export class CategoriesModalComponent {

  genre!: Genre;
  categories!: Category[];

  nameControl = new FormControl();
  categoriesControl = new FormControl();

  @ViewChild('nameCategory') inputName: ElementRef | undefined;
  @ViewChild('nameCategories') selectNames!: MatSelect;

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<CategoriesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data) {
      this.genre = data;
      this.categories = data.categories;

      if (this.genre) {
        this.categories = this.genre.categories;
      }

    }
  }

  vincular(): void {
    const catName = this.categoriesControl.value;
    if (catName !== null && catName !== '') {
      let selectedCategory = this.categories.find(cat => cat === catName);
      let categoryObject = { name: selectedCategory };
      this.dialogRef.close(categoryObject);
    } else {
      this.selectNames.focus();
    }
  }

  salvar(): void {
    const catName = this.nameControl.value;
    if (catName !== null && catName !== '') {
      this.dialogRef.close(catName);
    } else {
      this.inputName?.nativeElement.focus();
    }
  }
}
