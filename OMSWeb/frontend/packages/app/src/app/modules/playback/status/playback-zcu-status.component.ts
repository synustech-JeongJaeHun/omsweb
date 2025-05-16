import { Component, Input, ViewChild } from '@angular/core'
import { PlaybackPlayService } from '@oms/root/services/playback-play.service'
import { DxDataGridComponent } from 'devextreme-angular'
import { IVehicleStatusRow } from '../../../models/vehicle-status.model'
import {SettingsService} from "../../../services/settings.service";
import {ClientPreferences} from "../../../models/settings.model";

@Component({
	selector: 'oms-playback-zcu-status',
	templateUrl: './playback-zcu-status.component.html',
	styles: [`
    dx-data-grid{
      max-width: 100vw !important;
    }
  `],
})
export class PlaybackZcuStatusComponent {
	@Input() tableHeight: number

	@ViewChild(DxDataGridComponent, { static: false })
	dataGrid: DxDataGridComponent

  zcuDetail:boolean =false
  preference: ClientPreferences

	get dataSource() {
		return this.playService.currentZcus
	}
	selectedRows: number[] = []

	get selectedItems(): IVehicleStatusRow[] {
		return this.dataGrid.instance.getSelectedRowsData()
	}

	constructor(private playService: PlaybackPlayService,
              private settingSvc: SettingsService) {
    this.preference = this.settingSvc.globalPreferences
    settingSvc.serviceConfig.subscribe(
      (config) => {
        this.zcuDetail = config.zcuDetail
      })
  }

	getBgColor(type: number, value: number): string {
		return this.getColor_Status(value) // Status
	}

  makeUsingTypeReadable(rowData) {
    if (rowData.usingType === 0) return 'Not Use'
		if (rowData.usingType === 1) return 'HW'
    if (rowData.usingType === 2) return 'SW'
		return 'HW'
	}

  makeZcuTypeReadable(rowData) {
		if (rowData.zcuType === 0) return 'Std'
    if (rowData.zcuType === 1) return 'NType'
    if (rowData.zcuType === 2) return 'Slope'
		return 'Std'
	}

  makeStatusReadable(rowData): string {
    return rowData.status === 5 ? 'Error' : 'Normal'
	}

	private color_normal: string = 'rgba(240, 255, 255, 1.0)'
	private color_error: string = 'rgba(255, 0, 0, 0.5)'

	private getColor_Status(value: number): string {
		return value === 5 ? this.color_error : this.color_normal
	}

  canDisplayTable(type: string): boolean {
    return this.preference.controlTables[type]
  }

  getDisplayTableColumnIndex(type: string): number {
    return this.preference.controlTables.zcus_order.findIndex(
      (column) => column.name === type,
    )
  }

  getDisplayTableColumnWidth(type: string) {
    return this.preference.controlTables.zcus_order.find(
      (column) => column.name === type,
    )?.width
  }

  getDisplayTableLabel(type: string): string {
    return this.preference.controlTables.zcus_order.find(
      (column) => column.name === type,
    )?.i18nLabel
  }
}
