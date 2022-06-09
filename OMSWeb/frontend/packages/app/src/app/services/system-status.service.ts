import { Injectable } from '@angular/core'
import { ISystemStates } from '../models/system.model'
import { HubService } from './hub.service'
import { SystemsService } from './systems.service'

@Injectable({
	providedIn: 'root',
})
export class SystemStatusService {
	public systemStates: ISystemStates
    public homeMode?: boolean = undefined
    public chainManualCommandDisabled?: boolean = undefined

	constructor(
		private hubService: HubService,
		private systemsService: SystemsService,
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
	}

	private updateSettingMode() {
		this.systemsService.settingMode().subscribe((res) => {
            this.homeMode = res.homeMode,
            this.chainManualCommandDisabled = res.chainManualCommandDisabled
		})
	}

	private updateSystemState() {
		this.systemsService.currentState$.subscribe(
			(states) => (this.systemStates = states),
		)
	}
}
