import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { SystemErrorResponse } from 'src/app/core/models/system-error-response';
import { SystemResponse } from 'src/app/core/models/system-response';
import { AuthService } from 'src/app/authentication/services/auth.service';
import { User } from 'src/app/core/models/user';
import { Category } from 'src/app/core/models/category';
import { GenresService } from 'src/app/core/services/genres.service';
import { CategoriesModalComponent } from '../categories-modal/categories-modal.component';
import { Genre } from 'src/app/core/models/genre';

@Component({
  selector: 'app-genre-modal',
  templateUrl: './genres-modal.component.html',
  styleUrls: ['./genres-modal.component.scss']
})
export class GenresModalComponent implements OnInit {

  @ViewChild('nameGenre') inputName: ElementRef | undefined;
  @ViewChild('iconGenre') inputIcon: ElementRef | undefined;

  displayedColumnsCategories: string[] = ['name', 'actions'];
  dataSourceCategories = new MatTableDataSource<Category>();

  action: string;
  genre: Genre;

  isMod: boolean = false;

  nameControl = new FormControl();
  iconControl = new FormControl();

  constructor(
    private genreService: GenresService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<GenresModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    this.action = data.action;
    this.genre = data.genre;
  }

  ngOnInit(): void {

    this.checkUser();

    if (this.genre) {
      this.action = 'Visualizar'
      this.nameControl.disable();
      this.nameControl.setValue(this.genre.name);
      this.iconControl.setValue(this.genre.icon);
      this.dataSourceCategories.data = this.genre.categories;
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

  removerCategoria(categoria: Category): void {
    const index = this.genre.categories.indexOf(categoria);
    this.genre.categories.splice(index, 1);
    this.dataSourceCategories.data = this.genre.categories;
  }

  openCategoryModal(): void {
    const dialogRef = this.dialog.open(CategoriesModalComponent, {
      autoFocus: false,
      maxWidth: '100vw',
      panelClass: ['mobile:w-11/12', 'tablet:w-2/4', 'laptop:w-1/4'],
      data: null
    }).afterClosed().subscribe(result => {
      if (result !== null && result !== '' && result !== undefined) {
        this.genre.categories.push(result);
        this.dataSourceCategories.data = this.genre.categories;
      }
    });
  }

  save() {
    const name = this.nameControl.value;
    const icon = this.iconControl.value;

    if (name === null || name === "") {
      this.notificationService.error("Informe um Gênero");
      this.inputName?.nativeElement.focus();
    } else if (icon === null || icon === "") {
      this.notificationService.error("Informe o Ícone correspondente");
      this.inputIcon?.nativeElement.focus();
    } else {
      const newGenre = new Genre(name, icon, []);

      this.genreService.saveGenre(newGenre).subscribe({
        next: (response) => {
          this.notificationService.success('Gênero Salvo com Sucesso!');
          this.dialogRef.close();
        }, error: (error: SystemResponse<SystemErrorResponse>) => {
          this.notificationService.error("Erro ao realizar operação");
        }
      });
    }
  }

  update() {
    if (this.genre) {
      const icon = this.iconControl.value;
      this.genre.icon = icon;

      this.genreService.updateGenre(this.genre).subscribe({
        next: (response) => {
          this.notificationService.success('Gênero Salvo com Sucesso!');
          this.dialogRef.close();
        }, error: (error: SystemResponse<SystemErrorResponse>) => {
          this.notificationService.error("Erro ao realizar operação");
        }
      });
    }
  }

  delete() {
    if (this.genre) {
      this.genreService.deleteGenre(this.genre).subscribe({
        next: (response) => {
          this.notificationService.success('Gênero Removido com Sucesso!');
          this.dialogRef.close();
        }, error: (error: SystemResponse<SystemErrorResponse>) => {
          this.notificationService.error("Erro ao realizar operação");
        }
      });
    }
  }
}
