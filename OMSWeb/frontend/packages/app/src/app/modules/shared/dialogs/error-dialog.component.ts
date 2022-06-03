import { Component, Inject } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { TranslateService } from '@ngx-translate/core'

import { IErrorMessage } from '../../../models/base.model'

@Component({
	selector: 'oms-error-dialog',
	templateUrl: './error-dialog.component.html',
	styles: [],
})
export class ErrorDialogComponent {
	constructor(
		@Inject(MAT_DIALOG_DATA) public message: IErrorMessage<unknown>,
		private dialogRef: MatDialogRef<ErrorDialogComponent>,
		private $t: TranslateService,
	) {}

	get title() {
		const defaultTitle = this.$t.instant('messages.required', {
			field: 'TSC Paused',
		})
		return this.message.title ?? defaultTitle
	}
}
