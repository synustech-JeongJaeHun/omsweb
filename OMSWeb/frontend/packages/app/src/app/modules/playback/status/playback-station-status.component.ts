import { Component, Input, ViewChild } from '@angular/core'
import { PlaybackPlayService } from '@oms/root/services/playback-play.service'
import { DxDataGridComponent } from 'devextreme-angular'
import { IVehicleStatusRow } from '../../../models/vehicle-status.model'
import {SettingsService} from "../../../services/settings.service";
import {ClientPreferences} from "../../../models/settings.model";

@Component({
	selector: 'oms-playback-station-status',
	templateUrl: './playback-station-status.component.html',
	styles: [`
    dx-data-grid{
      max-width: 100vw !important;
    }
  `],
})
export class PlaybackStationStatusComponent {
	@Input() tableHeight: number

	@ViewChild(DxDataGridComponent, { static: false })
	dataGrid: DxDataGridComponent
  preference: ClientPreferences

	get dataSource() {
		return this.playService.currentStations
	}
	selectedRows: number[] = []

	get selectedItems(): IVehicleStatusRow[] {
		return this.dataGrid.instance.getSelectedRowsData()
	}

	constructor(private playService: PlaybackPlayService,
              private settingSvc: SettingsService,) {
    this.preference = this.settingSvc.globalPreferences
  }

  canDisplayTable(type: string): boolean {
    return this.preference.controlTables[type]
  }
  getDisplayTableColumnIndex(type: string): number {
    return this.preference.controlTables.stations_order.findIndex(
      (column) => column.name === type,
    )
  }

  getDisplayTableColumnWidth(type: string) {
    return this.preference.controlTables.stations_order.find(
      (column) => column.name === type,
    ).width
  }
}
