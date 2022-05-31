import { Component } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { TranslateService } from '@ngx-translate/core'
import { PermissionEnums } from '@oms/root/models/enums'
import { AuthService } from '@oms/root/services/auth.service'
import { DialogService } from '@oms/root/services/dialog.service'
import { MessagesService } from '@oms/root/services/messages.service'
import { SystemStatusService } from '@oms/services/system-status.service'

@Component({
	selector: 'oms-system-preference',
	templateUrl: './system-preference.component.html',
	styleUrls: ['./system-preference.component.scss'],
})
export class SystemPreferenceComponent {
	constructor(
		private $t: TranslateService,
		private auth: AuthService,
		private snackBar: MatSnackBar,
		private dialogSvc: DialogService,
		private messageSvc: MessagesService,
		private systemStatusService: SystemStatusService,
	) {}

	readonly permissionEnums = PermissionEnums

	get isHomeMode() {
		return this.systemStatusService.homeMode ?? false
	}

	hasPermissions(permissions: number[]): boolean {
		return this.auth.hasPermissions(permissions)
	}

	setHomeEditing() {
		if (
			!(
				this.systemStatusService.systemStates.tscMode === 0 ||
				this.systemStatusService.systemStates.tscMode === 1 ||
				this.systemStatusService.systemStates.tscMode === 2
			)
		) {
			this.snackBar.open(
				this.$t.instant('messages.confirmTSCStateNotPaused'),
				null,
				{
					duration: 3000,
					horizontalPosition: 'center',
					verticalPosition: 'top',
				},
			)

			return
		}

		this.dialogSvc
			.confirm({ body: this.$t.instant('messages.confirmCommand') })
			.subscribe((ok) => {
				if (ok) {
					this.messageSvc.sendHomeModeToggle().subscribe()
				}
			})
	}
}
