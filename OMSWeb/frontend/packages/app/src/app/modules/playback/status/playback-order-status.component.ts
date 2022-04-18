import { Component, Input, ViewChild } from '@angular/core'
import { PlaybackPlayService } from '@oms/root/services/playback-play.service'
import { DxDataGridComponent } from 'devextreme-angular'
import { TrackIdService } from '../../../services/track-id.service'
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

	transformLocationId = ({ value = '' }): string => {
		return this.idSvc.guessLocationId(value)
	}

	constructor(
		private idSvc: TrackIdService,
		private playService: PlaybackPlayService,
	) {}
}
