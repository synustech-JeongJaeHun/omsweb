import { Component, Input, ViewChild } from '@angular/core'
import { PlaybackPlayService } from '@oms/root/services/playback-play.service'
import { DxDataGridComponent } from 'devextreme-angular'
import { DateUtil } from '../../shared/utils/date.util'

@Component({
	selector: 'oms-playback-order-status',
	templateUrl: './playback-order-status.component.html',
	styles: [],
})
export class PlaybackOrderStatusComponent {
	@Input() tableHeight: number

	@ViewChild(DxDataGridComponent, { static: false })
	dataGrid: DxDataGridComponent

	dateTimeFormat = DateUtil.DateTimeFormat

	constructor(private playService: PlaybackPlayService) {}

	get dataSource() {
		return this.playService.currentOrders
	}
	selectedRows: number[] = []

	transformVehicleId = ({ value = '' }): string => {
		const vehicle = this.playService.currentVehicles.find(
			(v) => v.id === parseInt(value),
		)
		return vehicle?.logicalId ?? ''
	}

	transformLocationId = ({ value }: { value: string }) => {
		const locationType = value[0]
		const id = parseInt(value.substring(1))

		const list =
			locationType === 's'
				? this.playService.track.data.stations ?? []
				: locationType === 'b'
				? this.playService.track.data.buffers
				: []

		const location = list.find((e) => e.id === id)

		return location?.logical_id ?? ''
	}
}
