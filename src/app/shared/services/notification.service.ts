import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private readonly snackBar: MatSnackBar,
    public dialog: MatDialog) { }

  simple(message: string) {
    this.openSnackBar(message, '', 'simple-snackbar');
  }

  success(message: string) {
    this.openSnackBar(message, '', 'success-snackbar');
  }

  warn(message: string) {
    this.openSnackBar(message, '', 'warn-snackbar');
  }

  error(message: string) {
    this.openSnackBar(message, '', 'error-snackbar');
  }

  openSnackBar(
    message: string,
    action: string,
    className: string,
    duration = 2500
  ) {
    this.snackBar.open(message, action, {
      duration: duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [className]
    });
  }
}