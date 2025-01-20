import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashHomeComponent } from './components/dash-home.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'src/app/shared/shared.module';
import { GridstackModule } from 'gridstack/dist/angular';


@NgModule({
  declarations: [
    DashHomeComponent
  ],
  imports: [
    CommonModule,
    MatTooltipModule,
    MatSelectModule,
    FormsModule,
    MatInputModule,
    GridstackModule,
    MatFormFieldModule,
    SharedModule
  ],
  providers: [
  ]
})
export class HomeModule { }
