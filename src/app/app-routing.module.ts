import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReadingsComponent } from './features/books/components/readings/readings.component';
import { DashboardComponent } from './layout/dashboard/dashboard.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { DashHomeComponent } from './features/home/components/dash-home.component';
import { LibraryComponent } from './features/books/components/library/library.component';
import { authGuard } from './authentication/guards/auth.guard';
import { SettingsComponent } from './features/settings/components/settings/settings.component';
import { UsersComponent } from './features/restricted/components/users/users.component';
import { RequestsComponent } from './features/restricted/components/requests/requests.component';
import { CategoriesComponent } from './features/books/components/genres/genres.component';
import { LoginComponent } from './authentication/components/login/login.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashHomeComponent, data: { title: 'Dashboard' } },
      { path: 'books/reading', component: ReadingsComponent, data: { title: 'Books' } },
      { path: 'books/library', component: LibraryComponent, data: { title: 'Library' } },
      { path: 'books/categories', component: CategoriesComponent, data: { title: 'Categories' } },
      { path: 'settings', component: SettingsComponent, data: { title: 'Settings' } },
      { path: 'restricted/users', component: UsersComponent, data: { title: 'Users' } },
      { path: 'restricted/requests', component: RequestsComponent, data: { title: 'Requests' } },
    ]
  },
  { path: 'not-found', component: PageNotFoundComponent },
  { path: '**', redirectTo: '/not-found' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
