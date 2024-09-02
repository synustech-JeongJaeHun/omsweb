import { Component, Input, ViewChild } from '@angular/core'
import { PlaybackPlayService } from '@oms/root/services/playback-play.service'
import { DxDataGridComponent } from 'devextreme-angular'
import { IVehicleStatusRow } from '../../../models/vehicle-status.model'
import {SettingsService} from "../../../services/settings.service";
import {ClientPreferences} from "../../../models/settings.model";
@Component({
	selector: 'oms-playback-buffer-status',
	templateUrl: './playback-buffer-status.component.html',
	styles: [`
    dx-data-grid{
      max-width: 100vw !important;
    }
  `],
})
export class PlaybackBufferStatusComponent {
	@Input() tableHeight: number

	@ViewChild(DxDataGridComponent, { static: false })
	dataGrid: DxDataGridComponent

	get dataSource() {
		return this.playService.currentBuffers
	}
	selectedRows: number[] = []

  preference: ClientPreferences

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
    return this.preference.controlTables.buffers_order.findIndex(
      (column) => column.name === type,
    )
  }

  getDisplayTableColumnWidth(type: string) {
    return this.preference.controlTables.buffers_order.find(
      (column) => column.name === type,
    )?.width
  }

  getDisplayTableLabel(type: string): string {
    return this.preference.controlTables.buffers_order.find(
      (column) => column.name === type,
    )?.i18nLabel
  }
}
