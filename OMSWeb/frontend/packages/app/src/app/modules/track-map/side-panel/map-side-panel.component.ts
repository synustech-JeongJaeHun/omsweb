import {
	Component,
	EventEmitter,
	Input,
	OnChanges,
	OnDestroy,
	Output,
	SimpleChanges,
} from '@angular/core'
import { AuthService } from '../../../services/auth.service'
import { AccountUtil } from '../../shared/utils/account.util'
import { MapStatesService } from '../map-states.service'
import { MessagesService } from '../../../services/messages.service'
import { PermissionEnums } from '../../../models/enums'
import { TrackStatusService } from '@oms/root/services/track-status.service'

@Component({
	selector: 'oms-map-side-panel',
	templateUrl: './map-side-panel.component.html',
	styleUrls: ['./map-side-panel.component.scss'],
})
export class MapSidePanelComponent implements OnChanges, OnDestroy {
	@Input('selectedObject') data: any
	@Output() focus = new EventEmitter<any>()

	hasOverlap = true
	private selfUpdateIntervalId
	private overlapObjectsUpdateIntervalId
	overlapList = []

	readonly permissionEnums: typeof PermissionEnums = PermissionEnums

	// segment disableds
	disableds = []
	get disabledByMtl() {
		return this.disableds.some((sd) =>
			sd.disabledBy.toLowerCase().includes('mtl'),
		)
	}

	constructor(
		private statesSvc: MapStatesService,
		private messageSvc: MessagesService,
		private trackStatusService: TrackStatusService,
		private auth: AuthService,
	) {}

	ngOnChanges(changes: SimpleChanges): void {
		this.disableds = []
		if (this.selfUpdateIntervalId) clearInterval(this.selfUpdateIntervalId)
		if (this.overlapObjectsUpdateIntervalId)
			clearInterval(this.overlapObjectsUpdateIntervalId)

		if (changes?.data?.currentValue) {
			this.bindObject()
		}
	}
	ngOnDestroy(): void {
		if (this.selfUpdateIntervalId) clearInterval(this.selfUpdateIntervalId)
		if (this.overlapObjectsUpdateIntervalId)
			clearInterval(this.overlapObjectsUpdateIntervalId)
	}

	hasPermission(permission: number): boolean {
		return AccountUtil.hasPermission(permission, this.auth.currentUser)
	}

	private bindObject() {
		const type = this.data.objectType.toUpperCase()
		switch (type) {
			case 'ZCU':
				this.hasOverlap = false
				break
			case 'SEGMENT':
				this.startIntervalUpdateDataSelf(type, this.data.id)
				this.hasOverlap = false
				break

			case 'POINT':
			case 'STATION':
			case 'BUFFER':
			case 'VEHICLE':
			case 'MTL':
				this.startIntervalUpdateDataSelf(type, this.data.id)
				this.startIntervalUpdateOverlapObjects(type, this.data.id)
				this.hasOverlap = true
				break

			default:
				break
		}
	}

	private startIntervalUpdateDataSelf(type, id) {
		const action = () => {
			switch (type) {
				case 'MTL':
					{
						const current = this.trackStatusService.trackData.mtls.find(
							(m) => m.id === id,
						)
						const groups = this.trackStatusService.getGroupsFromObject('mtl', id)
						this.data = { ...current, objectType: 'MTL', groups }
					}
					break
				case 'SEGMENT':
					{
						const current = this.trackStatusService.trackData.segments.find(
							(s) => s.id === id,
						)
						const disableds = (
							this.trackStatusService.trackData.segmentDisabled ?? []
						)
							.filter((sd) => sd.segmentId === id)
							.sort((a, b) => a.id - b.id)

						this.data = { ...current, objectType: 'SEGMENT' }
						this.disableds = disableds
					}
					break
				case 'ZCU':
					{
						const current = this.trackStatusService.trackData.zcus.find(
							(z) => z.id === id,
						)
						this.data = { ...current, objectType: 'ZCU' }
					}
					break

				case 'POINT':
					{
						const current = this.trackStatusService.trackData.points.find(
							(p) => p.id === id,
						)
						this.data = { ...current, objectType: 'POINT' }
            this.data.groups = current.homeId 
              ? this.trackStatusService.getGroupsFromObject('home', this.data.homeId)
              : []
					}
					break
				case 'STATION':
					{
						const current = this.trackStatusService.trackData.stations.find(
							(s) => s.id === id,
						)
						const groups = this.trackStatusService.getGroupsFromObject('station', id)
						this.data = {
							...current,
							objectType: 'STATION',
							groups
						}
					}
					break
				case 'BUFFER':
					{
						const current = this.trackStatusService.trackData.buffers.find(
							(b) => b.id === id,
						)
						const groups = this.trackStatusService.getGroupsFromObject('buffer', id)
						this.data = { ...current, objectType: 'BUFFER', groups }
					}
					break
				case 'VEHICLE':
					{
						const current = this.trackStatusService.trackData.vehicles.find(
							(v) => v.id === id,
						)
						const groups = this.trackStatusService.getGroupsFromObject('vehicle', id)
						this.data = {
							...current,
							objectType: 'VEHICLE',
							groups,
						}
					}
					break

				default:
					break
			}
		}
		action()
		this.selfUpdateIntervalId = setInterval(action, 800)
	}

	private startIntervalUpdateOverlapObjects(type, id) {
		const getPointId = () => {
			switch (type) {
				case 'POINT':
					return this.data.id
				case 'MTL':
					return this.data.pointId
				case 'STATION':
					return this.data.pointId
				case 'BUFFER':
					return this.data.pointId
				case 'VEHICLE':
					return this.trackStatusService.trackData.vehicles.find(
						(v) => v.id === id,
					)?.curPoint
			}
		}

		this.overlapList = this.trackStatusService.getOverlapObjectOnPoint(
			getPointId(),
		)
		this.overlapObjectsUpdateIntervalId = setInterval(() => {
			this.overlapList = this.trackStatusService.getOverlapObjectOnPoint(
				getPointId(),
			)
		}, 800)
	}

	changeSegmentDisabled(value: boolean) {
		if (value) {
			this.messageSvc
				.sendDisableSegmentCommand({ action: 'disable-segment' }, this.data.id)
				.subscribe()
		} else {
			this.messageSvc
				.sendDisableSegmentCommand({ action: 'enable-segment' }, this.data.id)
				.subscribe()
		}
	}

	closePanel() {
		this.statesSvc.changeToolbarState('itemDetails', false)
	}
}
