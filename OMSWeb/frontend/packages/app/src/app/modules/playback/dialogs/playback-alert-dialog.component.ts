import { Component } from '@angular/core'
import { IVehicleAlarm } from '@oms/root/models/notification.model'
import { RemainedAlarm } from '@oms/root/models/playback.model'
import { PlaybackPlayService } from '@oms/root/services/playback-play.service'
import { ClockChangedEvent } from '../../../models/playback.model'

@Component({
	selector: 'oms-playback-alert-dialog',
	templateUrl: './playback-alert-dialog.component.html',
	styleUrls: ['./playback-alert-dialog.component.scss'],
})
export class PlaybackAlertDialogComponent {
	public isLoading = false
	currentItem: IVehicleAlarm
	selectedIds: number[] = []
	dataSource: RemainedAlarm[] = []
	constructor(playService: PlaybackPlayService) {
		this.dataSource = playService.currentAlarms
		playService.clockChanged.subscribe((event: ClockChangedEvent) => {
			this.dataSource = playService.currentAlarms
		})
	}
	transform(value: number): string {
		if (value === undefined) return ''
		const hour: number = Math.floor(value / 3600)
		const minutes: number = Math.floor((value % 3600) / 60)
		const seconds: number = Math.floor(value % 60)
		return (
			hour.toString().padStart(2, '0') +
			':' +
			minutes.toString().padStart(2, '0') +
			':' +
			seconds.toString().padStart(2, '0')
		)
	}
	onClickRow(row: any) {
		const {
			data: { id },
		} = row
		if (this.currentItem?.id === id) {
			this.currentItem = undefined
			this.selectedIds = []
			return
		}
		this.currentItem = row.data
	}
}
