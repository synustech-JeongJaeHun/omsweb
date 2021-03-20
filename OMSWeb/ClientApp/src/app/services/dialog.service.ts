import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IConfirmMessage } from '../models/base.model';
import { ConfirmDialogComponent } from '../modules/shared/dialogs/confirm-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  confirm<T>(message: IConfirmMessage<T>): Observable<boolean> {
    return this.dialog
      .open(ConfirmDialogComponent, {
        disableClose: true,
        autoFocus: false,
        width: '400px',
        data: message,
      })
      .afterClosed()
      .pipe(map((res) => !!res));
  }
}
