import { Component, Input, OnInit, ViewChild } from '@angular/core'
import { PlaybackPlayService } from '@oms/root/services/playback-play.service'
import { DxDataGridComponent } from 'devextreme-angular'
import { IVehicleStatusRow } from '../../../models/vehicle-status.model'
@Component({
	selector: 'oms-playback-vehicle-status',
	templateUrl: './playback-vehicle-status.component.html',
	styles: [],
})
export class PlaybackVehicleStatusComponent {
	@Input() tableHeight: number

	@ViewChild(DxDataGridComponent, { static: false })
	dataGrid: DxDataGridComponent

	get dataSource() {
		return this.playService.currentVehicles
	}
	selectedRows: number[] = []

	get selectedItems(): IVehicleStatusRow[] {
		return this.dataGrid.instance.getSelectedRowsData()
	}

	constructor(private playService: PlaybackPlayService) {}
}
