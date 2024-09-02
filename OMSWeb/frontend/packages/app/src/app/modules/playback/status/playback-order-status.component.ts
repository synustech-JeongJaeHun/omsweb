import { Component, Input, ViewChild } from '@angular/core'
import { PlaybackPlayService } from '@oms/root/services/playback-play.service'
import { DxDataGridComponent } from 'devextreme-angular'
import { DateUtil } from '../../shared/utils/date.util'
import {PlaybackBuffer, PlaybackStation} from "../../../models/playback.model";
import {SettingsService} from "../../../services/settings.service";
import {ClientPreferences} from "../../../models/settings.model";

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

  private color_normal: string = 'rgba(255, 255, 255, 1.0)'
  private color_warning: string = 'rgba(255, 210, 0, 0.5)'

  preference: ClientPreferences
  vhlAlias: string

	constructor(private playService: PlaybackPlayService,
              private settingSvc: SettingsService,) {

    this.preference = this.settingSvc.globalPreferences

    this.settingSvc.serviceConfig.subscribe(
      (config) => {
        this.vhlAlias = config?.vhlAlias || ''
      },
    )
  }

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

  transformVehicleAlias = ({ value = '' }): string => {
    const vehicle = this.playService.currentVehicles.find(
      (v) => v.id === parseInt(value),
    )
    return vehicle?.physicalId? this.vhlAlias+vehicle?.physicalId : ''
  }

	transformLocationId = ({ value }: { value: string | undefined | null }) => {
		if (value == null) return ''

		const locationType = value[0]
		const id = parseInt(value.substring(1))

		const list =
			locationType === 's'
				? this.playService.track?.data?.stations ?? []
				: locationType === 'b'
				? this.playService.track?.data?.buffers
				: []

		const location = list.find((e) => e.id === id)

		return location?.logical_id ?? ''
	}
  canDisplayTable(type: string): boolean {
    return this.preference.controlTables[type]
  }
  getDisplayTableColumnIndex(type: string): number {
    return this.preference.controlTables.orders_order.findIndex(
      (column) => column.name === type,
    )
  }

  getDisplayTableColumnWidth(type: string) {
    return this.preference.controlTables.orders_order.find(
      (column) => column.name === type,
    )?.width
  }

  getDisplayTableLabel(type: string) {
    return this.preference.controlTables.orders_order.find(
      (column) => column.name === type,
    )?.i18nLabel
  }

  getBgColor(type: number, value: string): string {
    return this.getColor_Status(value) // Status
  }

  private getColor_Status(value: string): string {
    if (!value) {
      if (value?.includes('transfer') && value?.includes('delayed'))
        return this.color_warning
    }
    return this.color_normal
  }
}
