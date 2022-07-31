import { Injectable } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { IConfirmMessage, IErrorMessage, ISuccessMessage } from '../models/base.model'
import { ErrorDialogComponent } from '../modules/shared/dialogs/error-dialog.component'
import { SuccessDialogComponent } from '../modules/shared/dialogs/success-dialog.component'
import { ConfirmDialogComponent } from '../modules/shared/dialogs/confirm-dialog.component'

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
			.pipe(map((res) => !!res))
	}

	alert<T>(message: IErrorMessage<T>) {
		return this.dialog
			.open(ErrorDialogComponent, {
				disableClose: true,
				autoFocus: false,
				width: '400px',
				data: message,
			})
			.afterClosed()
			.pipe(map((res) => true))
    }

    success<T>(message: ISuccessMessage<T>) {
      return this.dialog
        .open(SuccessDialogComponent, {
          disableClose: true,
          autoFocus: false,
          width: '400px',
          data: message,
        })
        .afterClosed()
        .pipe(map((res) => true))
    }
}
