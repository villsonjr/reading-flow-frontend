import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { SystemErrorResponse } from 'src/app/core/models/system-error-response';
import { SystemResponse } from 'src/app/core/models/system-response';
import { RequestedBook } from 'src/app/core/models/requestedBook';
import { RequestBooksService } from 'src/app/core/services/request-books.service';
import { RequestBook } from 'src/app/core/models/requestBook';

@Component({
  selector: 'app-request-modal',
  templateUrl: './request-modal.component.html',
  styleUrls: ['./request-modal.component.scss']
})
export class RequestModalComponent implements OnInit {

  editRequest: RequestedBook;
  action: string;

  titleControl = new FormControl();
  authorControl = new FormControl();

  constructor(public dialogRef: MatDialogRef<RequestModalComponent>,
    private requestedBookService: RequestBooksService,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    this.editRequest = data.request;
    this.action = data.action;
  }

  ngOnInit(): void {

    if (this.editRequest) {
      this.titleControl.setValue(this.editRequest.bookTitle)
      this.authorControl.setValue(this.editRequest.authorName);
    }

    if (this.action == 'Cancelar' || this.action == 'Remover') {
      this.titleControl.disable();
      this.authorControl.disable();
    }
  }

  requestBook() {

    const bookTitle = this.titleControl.value;
    const authorName = this.authorControl.value;

    if (bookTitle && authorName && bookTitle.trim() !== '' && authorName.trim() !== '') {
      if (!this.editRequest) {
        const requestBook = new RequestBook(bookTitle, authorName);
        this.requestedBookService.saveRequest(requestBook).subscribe({
          next: (response) => {
            this.notificationService.success('Livro solicitado com sucesso!');
          }, error: (error: SystemResponse<SystemErrorResponse>) => {
            this.notificationService.error("Erro ao realizar operação");
          }
        });
      } else {
        this.editRequest.bookTitle = bookTitle;
        this.editRequest.authorName = authorName;

        this.requestedBookService.updateRequest(this.editRequest).subscribe({
          next: (response) => {
            this.notificationService.success('Solicitação atualizada com sucesso!');
          }, error: (error: SystemResponse<SystemErrorResponse>) => {
            this.notificationService.error("Erro ao realizar operação");
          }
        });
      }
      this.dialogRef.close();
    } else {
      this.notificationService.error('Título e/ou Autor não informado');
    }
  }

  cancelar() {
    this.requestedBookService.cancelRequest(this.editRequest).subscribe({
      next: (response) => {
        this.notificationService.success('Solicitação cancelada com sucesso!');
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        console.error('Error cancelling request:', error);
        this.notificationService.error("Erro ao realizar operação");
      }
    });
  }

  remover() {
    this.requestedBookService.deleteRequest(this.editRequest).subscribe({
      next: (response) => {
        this.notificationService.error('Solicitação removida com sucesso!');
      }, error: (error: SystemResponse<SystemErrorResponse>) => {
        this.notificationService.error("Erro ao realizar operação");
      }
    });
  }
}
