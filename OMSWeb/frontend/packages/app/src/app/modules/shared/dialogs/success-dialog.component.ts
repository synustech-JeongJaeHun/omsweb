import { Component, Inject } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { TranslateService } from '@ngx-translate/core'

import { ISuccessMessage } from '../../../models/base.model'

@Component({
	selector: 'oms-success-dialog',
	templateUrl: './success-dialog.component.html',
	styles: [],
})
export class SuccessDialogComponent {
	constructor(
		@Inject(MAT_DIALOG_DATA) public message: ISuccessMessage<unknown>,
		private dialogRef: MatDialogRef<SuccessDialogComponent>,
		private $t: TranslateService,
	) {}

	get title() {
		const defaultTitle = this.$t.instant('messages.required', {
			field: 'TSC Paused',
		})
		return this.message.title ?? defaultTitle
	}
}
