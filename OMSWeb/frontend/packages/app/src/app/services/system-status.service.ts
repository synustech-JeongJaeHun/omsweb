import { Injectable } from '@angular/core'
import { HubService } from './hub.service'
import { SystemsService } from './systems.service'

@Injectable({
	providedIn: 'root',
})
export class SystemStatusService {
	public homeMode?: boolean = undefined

	constructor(
		private hubService: HubService,
		private systemsService: SystemsService,
	) {
		this.systemsService.settingMode().subscribe((res) => {
			this.homeMode = res.homeMode
		})

		this.hubService.settingModeChanged$.subscribe((res) => {
			// TODO
		})
	}
}
