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

	constructor(
		private hubService: HubService,
		private systemsService: SystemsService,
	) {
		this.systemsService.settingMode().subscribe((res) => {
			this.homeMode = res.homeMode
		})
		this.hubService.settingModeChanged$.subscribe((res) => {
			this.updateSystemState()
		})

		this.updateSystemState()
		this.hubService.modeStateChanged$.subscribe((e) => {
			setTimeout(() => {
				this.updateSystemState()
			}, 80)
		})
	}

	private updateSystemState() {
		this.systemsService.currentState$.subscribe(
			(states) => (this.systemStates = states),
		)
	}
}
