import { Component, Inject, OnInit } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { IConfirmMessage } from '../../../models/base.model'
import { TranslateService } from '@ngx-translate/core'

@Component({
	selector: 'oms-verify-dialog',
	templateUrl: './verify-dialog.component.html',
	styleUrls: ['./verify-dialog.component.scss'],
})
export class VerifyDialogComponent implements OnInit {
	form: FormGroup
	isValid: boolean = true

	constructor(
		@Inject(MAT_DIALOG_DATA) public message: IConfirmMessage<unknown>,
		private $t: TranslateService,
		private dialog: MatDialogRef<VerifyDialogComponent>,
	) {}

	ngOnInit(): void {
		this.initForm()
	}

	private initForm() {
		this.form = new FormGroup({
            operator: new FormControl('', [Validators.required]),
			reason: new FormControl('', [Validators.required]),
		})
	}
	onSubmit() {
		if (this.form.invalid) return
		this.isValid = true
		// No planned certification process
		const { operator, reason } = this.form.value
		this.dialog.close({ operator, reason })
		return true
	}
}
