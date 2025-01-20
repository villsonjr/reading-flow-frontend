import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { LayoutModule } from './layout/layout.module';
import { BooksModule } from './features/books/books.module';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthenticationModule } from './authentication/authentication.module';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from './core/api/api.service';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatNativeDateModule } from '@angular/material/core';
import { HomeModule } from './features/home/home.module';
import { SettingsModule } from './features/settings/settings.module';
import { RestrictedModule } from './features/restricted/restricted.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';


@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    LayoutModule,
    BooksModule,
    HomeModule,
    SettingsModule,
    RestrictedModule,
    NgxMaskDirective,
    ReactiveFormsModule,
    AuthenticationModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatNativeDateModule,
  ],
  providers: [
    ApiService,
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    provideNgxMask({})
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
