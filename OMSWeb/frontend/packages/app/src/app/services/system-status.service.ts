import { Injectable } from '@angular/core'
import {
	ManualTransferFiltersSetting,
	NodeMarginSetting,
} from '../models/settings.model'
import { ISystemStates } from '../models/system.model'
import { HubService } from './hub.service'
import { SettingsService } from './settings.service'
import { SystemsService } from './systems.service'

@Injectable({
	providedIn: 'root',
})
export class SystemStatusService {
	public systemStates: ISystemStates
	public homeMode?: boolean = undefined
	public chainManualCommandDisabled?: boolean = undefined
	public manualTransferFilterSetting?: ManualTransferFiltersSetting = undefined
	public nodeMarginSetting?: NodeMarginSetting = undefined

	constructor(
		private hubService: HubService,
		private systemsService: SystemsService,
		private settingsService: SettingsService,
	) {
		this.updateSettingMode()
		this.hubService.settingModeChanged$.subscribe((res) => {
			this.updateSettingMode()
		})

		this.updateSystemState()
		this.hubService.modeStateChanged$.subscribe((e) => {
			setTimeout(() => {
				this.updateSystemState()
			}, 80)
		})

		this.updateManualTransferFiltersSetting()
		this.updateNodeMarginsSetting()
	}

	private updateSettingMode() {
		this.systemsService.settingMode().subscribe((res) => {
			this.homeMode = res.homeMode
			this.chainManualCommandDisabled = res.chainManualCommandDisabled
		})
	}

	private updateSystemState() {
		this.systemsService.currentState$.subscribe(
			(states) => (this.systemStates = states),
		)
	}

	private updateManualTransferFiltersSetting() {
		this.settingsService
			.loadManualTransferFiltersSetting()
			.subscribe((res) => (this.manualTransferFilterSetting = res))
	}

	public updateNodeMarginsSetting() {
		this.settingsService
			.loadNodeMarginsSettings()
			.subscribe((res) => (this.nodeMarginSetting = res))

	}
}
