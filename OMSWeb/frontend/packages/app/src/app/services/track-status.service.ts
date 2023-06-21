import { EventEmitter, Injectable, Output } from '@angular/core'
import { StatusService } from './status.service'
import { HubService } from './hub.service'
import { Dto } from '../models/dto/track.model'
import { IDataChangeEvent } from '../models/notification.model'


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

	public async fetchTrack() {
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
		this.hubService.fireShutterMapChanged$.subscribe((e: IDataChangeEvent) => {
			this.handleFireShutterMapChanged(e)
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
		this.hubService.mtlChanged$.subscribe((e) => {
			this.handleMtlChanged(e)
		})
    this.hubService.clusterStatusChanged$.subscribe((e) => {
      this.handleClusterStateChanged(e)
    })
    this.hubService.clusterChanged$.subscribe((e) => {
      this.handleClusterChanged(e)
    })
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

	handleFireShutterMapChanged(e: IDataChangeEvent) {
		const finded = this.trackData.fireShutters.find((f) => f.id === e.data.id)
		switch (e.operation) {
			case 'UPDATE':
				if (finded) Object.assign(finded, e.data)
				break
			//NOTE: not yet implemented. use it on demand
			// case 'DELETE':
			// 	if (finded) {
			// 		const index = this.trackData.fireShutters.indexOf(finded)
			// 		this.trackData.fireShutters.splice(index, 1)
			// 	}
			// 	break

			default:
				break
		}
	}

	handleStationChanged(e: IDataChangeEvent) {
		const finded = this.trackData.stations.find((s) => s.id === e.id)
		switch (e.operation) {
			case 'UPDATE':
				// @ts-ignore
				if (finded) Object.assign(finded, { id: e.id, unuse: e.unuse, user: e?.user, note: e?.note })
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
				if (finded) Object.assign(finded, { id: e.id, unuse: e.unuse, carrierId: e.carrierId, user: e?.user, note: e?.note })
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

	handleMtlChanged(e: IDataChangeEvent) {
    this.trackData.mtls = e.data
	}

  handleClusterStateChanged(e: IDataChangeEvent){
    const row = {
      server_id: e.id!,
      id: e.converterId!,
      status: String(e.status ?? ''),
      backup_id: String(e.backupId ?? ''),
    }

    switch (e.operation) {
      case 'INSERT':
        this.trackData?.clusterStates?.push(row)
			case 'UPDATE':
        const finded = this.trackData?.clusterStates?.find(cs => cs.id === row.id)
				if (finded) Object.assign(finded, row)
				break
      case 'DELETE':
        const findedIndex = this.trackData?.clusterStates?.findIndex(cs => cs.id === row.id)
        if(findedIndex) this.trackData?.clusterStates?.splice(findedIndex, 1)
        break

			default:
				break
		}
  }

  handleClusterChanged(e: IDataChangeEvent){
    const row = e.data.find(d=> d.id === e.id)
    if(row<0) return

    switch (e.operation) {
      case 'INSERT':
        this.trackData?.clusters?.push(row)
      case 'UPDATE':
        const finded = this.trackData?.clusters?.find(cs => cs.id === row.id)
        if (finded) Object.assign(finded, row)
        break
      case 'DELETE':
        const findedIndex = this.trackData?.clusters?.findIndex(cs => cs.id === row.id)
        if(findedIndex) this.trackData?.clusters?.splice(findedIndex, 1)
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
    // sort by
    // 1)Disconnected 2) error 3) Manual 4) Maintenance 5) Idle
    vehicles.sort((a, b)=>
      this.compareDisconnect(a,b) ||
      this.compareError(a,b) ||
      this.compareManual(a,b) ||
      this.compareMaint(a,b)
    )

		return [ ...vehicles, ...stations, ...buffers, ...points, ...mtls]
	}

  compareDisconnect(a:Dto.IVehicle, b:Dto.IVehicle ): number{
    if(a.isConnected && !b.isConnected) return 1
    else if(!a.isConnected && b.isConnected) return -1
    return 0
  }

  compareError(a:Dto.IVehicle, b:Dto.IVehicle ): number{
    if(a.errorList && !b.errorList) return -1
    else if(!a.errorList && b.errorList) return 1
    return 0
  }

  compareManual(a:Dto.IVehicle, b:Dto.IVehicle ): number{
    if(a.mode.toUpperCase()==='M' && b.mode.toUpperCase()!=='M') return -1
    else if(a.mode.toUpperCase()!=='M' && b.mode.toUpperCase()==='M') return 1
    return 0
  }

  compareMaint(a:Dto.IVehicle, b:Dto.IVehicle ): number{
    if(a.isMaint && !b.isMaint) return 1
    else if(!a.isMaint && b.isMaint) return -1
    return 0
  }

	getGroupsFromObject(type: string, id: number) {
		const typeInLowerCase = type.toLowerCase()
		const groups = this.trackData?.groups ?? []

		const objectRelatedGroups = groups.filter((g) =>
			g.objects.some(
				(o: { id: number; type: string }) =>
					o.type === typeInLowerCase && o.id === id,
			),
		)

		return objectRelatedGroups.map((g) => g.id)
	}
}
