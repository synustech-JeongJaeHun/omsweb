import { Component, Input, OnInit, ViewChild } from '@angular/core'
import { CurrentVehicle } from '@oms/root/models/playback.model'
import { PlaybackPlayService } from '@oms/root/services/playback-play.service'
import { DxDataGridComponent } from 'devextreme-angular'
import { IVehicleStatusRow } from '../../../models/vehicle-status.model'
import { isHostOrder } from '../utils/playback-parse.util'
import {SettingsService} from "../../../services/settings.service";
@Component({
	selector: 'oms-playback-vehicle-status',
	templateUrl: './playback-vehicle-status.component.html',
	styles: [],
})
export class PlaybackVehicleStatusComponent {
	@Input() tableHeight: number

	@ViewChild(DxDataGridComponent, { static: false })
	dataGrid: DxDataGridComponent
  vhlAlias: string
	get dataSource() {
		return this.playService.currentVehicles
	}
	selectedRows: number[] = []

	get selectedItems(): IVehicleStatusRow[] {
		return this.dataGrid.instance.getSelectedRowsData()
	}

	constructor(private playService: PlaybackPlayService,
              private settingSvc: SettingsService) {
    this.settingSvc.serviceConfig.subscribe(
      (config) => {
        this.vhlAlias = config.vhlAlias
      },
    )
  }

	calculateHostOrder(rowData: CurrentVehicle) {
		return isHostOrder(rowData.orderOrigin)
	}
}
