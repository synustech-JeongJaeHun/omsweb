import { Component } from '@angular/core'
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
		private dialogSvc: DialogService,
		private messageSvc: MessagesService,
		private systemStatusService: SystemStatusService,
	) {}

	readonly permissionEnums = PermissionEnums

	readonly rebalanceModes = [
		{ key: 'home', label: this.$t.instant('names.home') },
		{ key: 'ivr', label: this.$t.instant('names.ivr') },
		{ key: 'none', label: this.$t.instant('names.none') },
	]

  get console() {
    return console
  }

	get selectedRebalanceMode() {
		return ['none']
	}

  get translatedSelectedRebalancedMode() {
    const name = `names.${this.selectedRebalanceMode[0]}`
    return this.$t.instant(name)
  }

	get isChainManualCommandDisabled() {
		return this.systemStatusService.chainManualCommandDisabled ?? false
	}

	hasPermissions(permissions: number[]): boolean {
		return this.auth.hasPermissions(permissions)
	}

	setRebalanceMode(value: "home" | "ivr" | "none") {
		if (
			!(
				this.systemStatusService.systemStates.tscMode === 0 ||
				this.systemStatusService.systemStates.tscMode === 1 ||
				this.systemStatusService.systemStates.tscMode === 2
			)
		) {
			this.dialogSvc.alert({
				body: this.$t.instant('messages.confirmTSCStateNotPaused'),
			})

			return
		}

		// this.dialogSvc
		// 	.confirm(
		// 		this.getConfirmMessage(
		// 			this.$t.instant(`names.homeMode`),
		// 			this.isHomeMode
		// 				? [this.$t.instant(`names.on`), this.$t.instant('names.off')]
		// 				: [this.$t.instant(`names.off`), this.$t.instant('names.on')],
		// 		),
		// 	)
		// 	.subscribe((ok) => {
		// 		if (ok) {
		// 			this.messageSvc.sendHomeModeToggle().subscribe()
		// 		}
		// 	})
	}

	setChainManualCommandDisabled() {
		this.dialogSvc
			.confirm(
				this.getConfirmMessage(
					this.$t.instant(`names.chainManualCommandDisabled`),
					this.isChainManualCommandDisabled
						? [this.$t.instant(`names.on`), this.$t.instant('names.off')]
						: [this.$t.instant(`names.off`), this.$t.instant('names.on')],
				),
			)
			.subscribe((ok) => {
				if (ok) {
					this.messageSvc.sendChainManualCommandDisabled().subscribe()
				}
			})
	}

	private getConfirmMessage(displayName: string, param: string[]) {
		const transParam = { name: displayName, from: param[0], to: param[1] }
		return {
			title: this.$t.instant('names.changeConfirm', transParam),
			body: this.$t.instant('messages.changeStateConfirm', transParam),
		}
	}
}
