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
import { PlaybackPlayService } from '@oms/root/services/playback-play.service'
import { Subscription } from 'rxjs'

@Component({
	selector: 'oms-playback-map-side-panel',
	templateUrl: './playback-map-side-panel.component.html',
	styleUrls: ['./playback-map-side-panel.component.scss'],
})
export class PlaybackMapSidePanelComponent implements OnChanges, OnDestroy {
	@Input('selectedObject') data: any
	@Output() focus = new EventEmitter<any>()

	hasOverlap = true
	overlapList = []

	private selfUpdateSubscription: Subscription
	private overlapObjectsUpdateSubscription: Subscription

	// segment disableds
	disableds = []
	get disabledByMtl() {
		return this.disableds.some((sd) =>
			sd.disabledBy.toLowerCase().includes('mtl'),
		)
	}

	constructor(
		private statesSvc: MapStatesService,
		private playService: PlaybackPlayService,
		private auth: AuthService,
	) {}

	ngOnChanges(changes: SimpleChanges): void {
		this.disableds = []
		this.clearSubscription()

		if (changes?.data?.currentValue) {
			this.bindObject()
		}
	}
	ngOnDestroy(): void {
		this.clearSubscription()
	}

	clearSubscription() {
		if (this.selfUpdateSubscription) {
			this.selfUpdateSubscription.unsubscribe()
			this.selfUpdateSubscription = undefined
		}
		if (this.overlapObjectsUpdateSubscription) {
			this.overlapObjectsUpdateSubscription.unsubscribe()
			this.overlapObjectsUpdateSubscription = undefined
		}
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
				this.startUpdateDataSelfWhenClockChanged(type, this.data.id)
				this.hasOverlap = false
				break

			case 'POINT':
			case 'STATION':
			case 'BUFFER':
			case 'VEHICLE':
			case 'MTL':
				this.startUpdateDataSelfWhenClockChanged(type, this.data.id)
				this.startUpdateOverlapObjectsWhenClockChanged(type, this.data.id)
				this.hasOverlap = true
				break

			default:
				break
		}
	}

	private startUpdateDataSelfWhenClockChanged(type, id) {
		// playback doesnt support group
		const update = () => {
			switch (type) {
				case 'MTL':
					{
						const current = this.playService.track.data.mtls.find(
							(m) => m.id === id,
						)
						this.data = { ...current, objectType: 'MTL' }
					}
					break
				case 'SEGMENT':
					{
						const current = this.playService.track.data.segments.find(
							(s) => s.id === id,
						)
						const disableds = (this.playService.currentSegmentBlockings ?? [])
							.filter((sd) => sd.segmentId === id)
							.sort((a, b) => a.id - b.id)
							.map((sb) => ({ ...sb, disabledReason: sb.reason }))

						this.data = {
							...current,
							logicalId: current.logical_id,
							physicalId: current.physical_id,
							startPoint: current.start_point,
							endPoint: current.end_point,
							objectType: 'SEGMENT',
						}
						this.disableds = disableds
					}
					break
				case 'ZCU':
					// no zcus in playback track data
					// {
					// 	const current = this.playService.track.data.zcus.find(
					// 		(z) => z.id === id,
					// 	)
					// 	this.data = { ...current, objectType: 'ZCU' }
					// }
					break

				case 'POINT':
					{
						const current = this.playService.track.data.points.find(
							(p) => p.id === id,
						)
						this.data = {
							...current,
							logicalId: current.logical_id,
							physicalId: current.physical_id,
							objectType: 'POINT',
						}
					}
					break
				case 'STATION':
					{
						const current = this.playService.track.data.stations.find(
							(s) => s.id === id,
						)
						this.data = {
							...current,
							logicalId: current.logical_id,
							physicalId: current.physical_id,
							pointId: current.point,
							objectType: 'STATION',
							groupId: undefined,
						}
					}
					break
				case 'BUFFER':
					{
						const current = this.playService.track.data.buffers.find(
							(b) => b.id === id,
						)
						this.data = {
							...current,
							logicalId: current.logical_id,
							physicalId: current.physical_id,
							pointId: current.point,
							objectType: 'BUFFER',
							groupId: undefined,
						}
					}
					break
				case 'VEHICLE':
					{
						const current = this.playService.currentVehicles.find(
							(v) => v.id === id,
						)

						this.data = {
							...current,
							curPoint: current.lastPoint,
							cargoState: current.cargoState,
							objectType: 'VEHICLE',
							groupId: undefined,
						}
					}
					break

				default:
					break
			}
		}

		update()
		this.selfUpdateSubscription = this.playService.clockChanged.subscribe(() =>
			setTimeout(update, 50),
		)
	}

	private startUpdateOverlapObjectsWhenClockChanged(type, id) {
		const update = () => {
			const pointId = (() => {
				switch (type) {
					case 'POINT':
						return this.data.id
					case 'MTL':
						return this.data.pointId ?? this.data.point
					case 'STATION':
						return this.data.pointId ?? this.data.point
					case 'BUFFER':
						return this.data.pointId
					case 'VEHICLE':
						return this.playService.currentVehicles.find((cv) => cv.id === id)
							?.lastPoint
				}
			})()

			this.overlapList = this.playService.getOverlapObjectOnPoint(pointId)
		}

		update()
		this.overlapObjectsUpdateSubscription =
			this.playService.clockChanged.subscribe(() => setTimeout(update, 50))
	}

	closePanel() {
		this.statesSvc.changeToolbarState('itemDetails', false)
	}
}
