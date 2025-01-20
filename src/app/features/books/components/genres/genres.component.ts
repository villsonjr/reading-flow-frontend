import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GenresModalComponent } from './genres-modal/genres-modal.component';
import { SystemErrorResponse } from 'src/app/core/models/system-error-response';
import { SystemResponse } from 'src/app/core/models/system-response';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { AuthService } from 'src/app/authentication/services/auth.service';
import { Genre } from 'src/app/core/models/genre';
import { GenresService } from 'src/app/core/services/genres.service';
import { User } from 'src/app/core/models/user';

@Component({
  selector: 'app-categories',
  templateUrl: './genres.component.html',
  styleUrls: ['./genres.component.scss']
})
export class CategoriesComponent implements OnInit {

  genres!: Genre[];

  isMod: boolean = false;

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private notificationService: NotificationService,
    private genreService: GenresService
  ) {
    this.updateGenres();
  }

  ngOnInit(): void {
    this.checkUser();
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

  openGenreModal(genre: Genre | null) {
    var action: String;
    if (genre !== null) {
      action = 'Editar';
    } else {
      action = 'Novo';
    }

    this.dialog.open(GenresModalComponent, {
      autoFocus: false,
      maxWidth: '100vw',
      panelClass: ['mobile:w-[95%]', 'tablet:w-2/3', 'laptop:w-2/5'],
      data: { genre, action }
    }).afterClosed().subscribe(() => this.updateGenres());
  }

  updateGenres(): void {
    this.genreService.getGenres().subscribe({
      next: (response) => {
        response = response as Genre[];
        var genres = response.map(Genre.fromJSON);
        this.genres = genres;
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.error("Erro ao realizar operação");
      }
    });
  }
}


