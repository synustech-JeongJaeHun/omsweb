import { Component } from '@angular/core'
import { MatDialogRef } from '@angular/material/dialog'
import { PlaybackPlayService } from '@oms/root/services/playback-play.service'
import { Observable, of } from 'rxjs'
import { ILookupUnit } from '../../../models/map.interface'
import { Vehicle } from '../../../models/vehicle.model'

@Component({
	selector: 'oms-playback-track-vehicle-dialog',
	templateUrl: './playback-track-vehicle-dialog.component.html',
	styleUrls: ['./playback-track-vehicle-dialog.component.scss'],
})
export class PlaybackTrackVehicleDialogComponent {
	dataSource: Observable<ILookupUnit[]>
	vehicles: Vehicle[] = []
	selectedVehicle: number[] = []

	get canTracking(): boolean {
		return this.selectedVehicle.length > 0
	}

	constructor(
		private playbackPlayService: PlaybackPlayService,
		private dialog: MatDialogRef<PlaybackTrackVehicleDialogComponent>,
	) {
		this.dataSource = of(
			Object.values(
				this.playbackPlayService.currentSnapshot.data.vehicles
					.map((v) => ({
						physicalId: v.physical_id,
						logicalId: v.logical_id,
						id: v.id,
					}))
					.sort((a, b) => a.id - b.id),
			),
		)

		this.dataSource.subscribe((res) => console.log(res))
	}

	onTrack() {
		if (!this.canTracking) return
		const [id] = this.selectedVehicle
		this.dialog.close(id)
	}

	onDblClickRow(event: any) {
		this.onTrack()
	}
}
