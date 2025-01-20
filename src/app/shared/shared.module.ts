import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthorPipe } from './pipes/author.pipe';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NumberDotsPipe } from './pipes/number-dots.pipe';
import { RolePipe } from './pipes/roles.pipe';
import { CategoryPipe } from './pipes/category.pipe';
import { PagesPipe } from './pipes/pages.pipe';
import { PhoneMaskPipe } from './pipes/phone-mask.pipe';



@NgModule({
  declarations: [
    AuthorPipe,
    NumberDotsPipe,
    RolePipe,
    CategoryPipe,
    PagesPipe,
    PhoneMaskPipe,

  ],
  imports: [
    CommonModule,
    MatSnackBarModule
  ],
  exports: [

    AuthorPipe,
    NumberDotsPipe,
    CategoryPipe,
    PhoneMaskPipe,
    RolePipe
  ]
})
export class SharedModule { }
