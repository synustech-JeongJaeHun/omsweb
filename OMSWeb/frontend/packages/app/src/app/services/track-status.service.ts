import { EventEmitter, Injectable, Output } from '@angular/core'
import { StatusService } from './status.service'
import { HubService } from './hub.service'
import { Dto } from '../models/dto/track.model'
import { IDataChangeEvent } from '../models/notification.model'

/**
 * # What we need
 *
 * ## realtime data
 *
 * - point x
 * - segment o|x
 * - station x
 * - buffer x
 * - mtl x
 * - vhl o
 * - home o
 * - group o
 *
 */

@Injectable({
	providedIn: 'root',
})
export class TrackStatusService {
	@Output() isTrackReadyChanged = new EventEmitter<boolean>()

	public isTrackReady = false
	public trackData?: Dto.ITrackData = undefined

	constructor(
		private statusService: StatusService,
		private hubService: HubService, // private authService: AuthService,
	) {
		this.fetchTrack().then(() => this.attachHubEvents())
	}

	private async fetchTrack() {
		const trackData = await this.statusService.getTrack().toPromise()

		this.trackData = trackData
		this.isTrackReady = true
		this.isTrackReadyChanged.emit(this.isTrackReady)
	}

	private attachHubEvents() {
		this.hubService.connectionChanged$.subscribe((conn) => {
			this.handleConnectionChanged(conn)
		})
		this.hubService.vehicleChanged$.subscribe((e: IDataChangeEvent) => {
			this.handleVehicleChanged(e)
		})
		this.hubService.segmentDisabledChanged$.subscribe((e: IDataChangeEvent) => {
			this.handleSegmentDisabledChanged(e)
		})
		this.hubService.zcuMapChanged$.subscribe((e: IDataChangeEvent) => {
			this.handleZcuMapChanged(e)
		})
		this.hubService.stationChanged$.subscribe((e) => {
			this.handleStationChanged(e)
		})
		this.hubService.bufferChanged$.subscribe((e) => {
			this.handleBufferChanged(e)
		})
		this.hubService.groupChanged$.subscribe((e) => {
			this.handleGroupChanged(e)
		})
		this.hubService.homeChanged$.subscribe((e) => {
			this.handleHomeChanged(e)
		})

		// this.hubService.segmentChanged$
		//   .subscribe((e: IDataChangeEvent) => {
		//     // what happened on event?
		//     console.log("segment update", e)
		//   });
		// this.hubService.clusterChanged$
		//   .subscribe((e: IDataChangeEvent) => {
		//     // what happened on event?
		//     console.log("cluster update", e)
		//   });

		// if (this.authService.isAuthenticated) {
		// this.hubService.vehiclePathChanged$
		//   .subscribe((e: IDataChangeEvent) => {
		//     // what happened on event?
		//     console.log("vehicle path update", e)
		//   });

		// this.hubService.stationChanged$
		//   .subscribe((e) => {
		//     //  what happened on event?
		//     console.log("station update", e)
		//   })

		// this.hubService.groupChanged$
		//   .subscribe((e) => {
		//     // what happened on event?
		//     console.log("group update", e)
		//   });

		// this.hubService.bufferChanged$
		//   .subscribe((e) => {
		//     // what happened on event?
		//     console.log("buffer update", e)
		//   });

		// this.hubService.mtlChanged$
		//   .subscribe((e) => {
		//     // what happened on event?
		//     console.log("mtl update", e)
		//   });

		// this.hubService.groupChanged$
		//   .subscribe((e) => {
		//     console.log("group update", e)
		//   });
		// }
	}

	handleConnectionChanged(connection) {
		this.statusService.getVehicles().subscribe((res) => {
			if (connection && res?.vehicles) this.trackData.vehicles = res.vehicles
		})
	}

	handleVehicleChanged(e: IDataChangeEvent) {
		const changedVehicle = e.data as Dto.IVehicle

		const finded = this.trackData.vehicles.find(
			(v) => v.id === changedVehicle.id,
		)

		switch (e.operation) {
			case 'INSERT':
			case 'UPDATE':
				if (finded) Object.assign(finded, changedVehicle)
				else this.trackData.vehicles.push(changedVehicle)

				break
			case 'DELETE':
				if (finded) {
					const index = this.trackData.vehicles.indexOf(finded)
					this.trackData.vehicles.splice(index, 1)
				}
				break
		}
	}

	handleSegmentDisabledChanged(e: IDataChangeEvent) {
		switch (e.operation) {
			case 'INSERT':
				this.trackData.segmentDisabled.push(e.data)
				break
			case 'DELETE':
				const index = this.trackData.segmentDisabled.findIndex(
					(sd) => sd.id === e.id,
				)
				if (index > -1) this.trackData.segmentDisabled.splice(index, 1)
				break
		}
	}

	handleZcuMapChanged(e: IDataChangeEvent) {
		const finded = this.trackData.zcus.find((z) => z.id === e.data.id)
		switch (e.operation) {
			case 'UPDATE':
				if (finded) Object.assign(finded, e.data)
				break
			case 'DELETE':
				if (finded) {
					const index = this.trackData.zcus.indexOf(finded)
					this.trackData.zcus.splice(index, 1)
				}
				break

			default:
				break
		}
	}

	handleStationChanged(e: IDataChangeEvent) {
		const finded = this.trackData.stations.find((s) => s.id === e.id)
		switch (e.operation) {
			case 'UPDATE':
				// @ts-ignore
				if (finded) Object.assign(finded, { id: e.id, unuse: e.unuse })
				break

			default:
				break
		}
	}

	handleBufferChanged(e: IDataChangeEvent) {
		const finded = this.trackData.buffers.find((s) => s.id === e.id)
		switch (e.operation) {
			case 'UPDATE':
				// @ts-ignore
				if (finded) Object.assign(finded, { id: e.id, unuse: e.unuse })
				break

			default:
				break
		}
	}

	handleGroupChanged(e: IDataChangeEvent) {
		this.trackData.groups = e.data
	}

	handleHomeChanged(e: IDataChangeEvent) {
		const row = { id: e.id as number, point: e.point as number }

		const pointByRowHome = this.trackData.points.find(
			(p) => p.homeId === row.id,
		)
		const pointByRowPoint = this.trackData.points.find(
			(p) => p.id === row.point,
		)

		switch (e.operation) {
			case 'INSERT':
				{
					if (pointByRowPoint) pointByRowPoint.homeId = row.id
				}
				break
			case 'UPDATE':
				{
					if (pointByRowHome) pointByRowHome.homeId = undefined
					if (pointByRowPoint) pointByRowPoint.homeId = row.id
				}
				break
			case 'DELETE':
				{
					if (pointByRowPoint) pointByRowPoint.homeId = undefined
				}
				break

			default:
				break
		}
	}

	getOverlapObjectOnPoint(pointId: number) {
		const points =
			this.trackData?.points
				.filter((p) => p.id === pointId)
				.map((p) => ({ ...p, objectType: 'point' })) ?? []
		const stations =
			this.trackData?.stations
				.filter((s) => s.pointId === pointId)
				.map((s) => ({ ...s, objectType: 'station' })) ?? []
		const buffers =
			this.trackData?.buffers
				.filter((b) => b.pointId === pointId)
				.map((b) => ({ ...b, objectType: 'buffer' })) ?? []
		const mtls =
			this.trackData?.mtls
				.filter((m) => m.pointId === pointId)
				.map((m) => ({ ...m, objectType: 'mtl' })) ?? []
		const vehicles =
			this.trackData?.vehicles
				.filter((v) => v.curPoint === pointId)
				.map((v) => ({
					...v,
					objectType: 'vehicle',
					type: v.type ?? 'STANDARD',
				})) ?? []

		return [...points, ...stations, ...buffers, ...vehicles, ...mtls]
	}
}
