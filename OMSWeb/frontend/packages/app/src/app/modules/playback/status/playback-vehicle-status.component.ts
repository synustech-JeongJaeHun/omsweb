import { Component, Input, OnInit, ViewChild } from '@angular/core'
import { CurrentVehicle } from '@oms/root/models/playback.model'
import { PlaybackPlayService } from '@oms/root/services/playback-play.service'
import { DxDataGridComponent } from 'devextreme-angular'
import { IVehicleStatusRow } from '../../../models/vehicle-status.model'
import { isHostOrder } from '../utils/playback-parse.util'
import {SettingsService} from "../../../services/settings.service";
import {ClientPreferences} from "../../../models/settings.model";
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
  preference: ClientPreferences
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
    this.preference = this.settingSvc.globalPreferences
  }

	calculateHostOrder(rowData: CurrentVehicle) {
		return isHostOrder(rowData.orderOrigin)
	}

  canDisplayTable(type: string): boolean {
    return this.preference.controlTables[type]
  }
  getDisplayTableColumnIndex(type: string): number {
    return this.preference.controlTables.vehicles_order.findIndex(
      (column) => column.name === type,
    )
  }
  getDisplayTableColumnWidth(type: string) {
    return this.preference.controlTables.vehicles_order.find(
      (column) => column.name === type,
    ).width
  }

  transform_distance(value: number): string {
    if (value == undefined) {
      return ''
    } else {
      const distance: number = Math.floor(value <0 ? (value/1000000)+4294 : value/1000000)

      return `${distance}km`
    }
  }

  transform_runtime(value: number): string {
    if (value == undefined) {
      return ''
    } else {
      const day: number = Math.floor(value / 86400) //3600 * 24
      const hour: string = ((value % 86400) / 3600).toFixed(1)

      return `${day}d ` + hour.toString().padStart(2, '0') + 'h'
    }
  }
}
