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

	// CASE
	//   WHEN Z.using_type = 0 THEN 'Not Use'
	//   WHEN Z.using_type = 1 THEN 'HW'
	//   WHEN Z.using_type = 2 THEN 'SW'
	//   ELSE 'HW'
	// END AS using_type,
	// CASE
	//   WHEN Z.zcu_type = 0 THEN 'Std'
	//   WHEN Z.zcu_type = 1 THEN 'NType'
	//   ELSE 'Std'
	// END AS zcu_type,
	// CASE
	//   WHEN ZS.status = 5 THEN 'Error'
	//   ELSE 'Normal'
	// END AS status,

	public makeUsingTypeReadable(usingType: number): string {
		if (usingType === 0) return 'Not Use'
		if (usingType === 1) return 'HW'
		if (usingType === 2) return 'SW'
		return 'HW'
	}

	public makeZcuTypeReadable(zcuType: number): string {
		if (zcuType === 0) return 'Std'
		if (zcuType === 1) return 'NType'
		return 'Std'
	}

	public makeStatusReadable(status: number): string {
		return status === 5 ? 'Error' : 'Normal'
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
    ).width
  }
}
