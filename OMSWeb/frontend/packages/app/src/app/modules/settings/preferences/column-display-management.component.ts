import { Component } from '@angular/core'
import { ClientPreferences } from '../../../models/settings.model'
import { SettingsService } from '../../../services/settings.service'

@Component({
	selector: 'oms-column-display-management',
	templateUrl: './column-display-management.component.html',
	styleUrls: ['./column-display-management.component.scss'],
})
export class ColumnDisplayManagementComponent {
	preference: ClientPreferences
	bufferEnabled: boolean

	constructor(private settingSvc: SettingsService) {
		this.preference = this.settingSvc.globalPreferences
		settingSvc.serviceConfig.subscribe(
			(config) => (this.bufferEnabled = config.bufferEnabled),
		)
	}

	getCheckedState(category: 'monitor' | 'history', target: string): boolean {
		const tables =
			category === 'monitor'
				? this.preference.controlTables
				: this.preference.historyTables

		return tables[target]
	}

	onChangeTable(category: 'monitor' | 'history', target: string, value: any) {
		const tables =
			category === 'monitor'
				? this.preference.controlTables
				: this.preference.historyTables

		tables[target] = value.currentTarget.checked
		this.preference.save()
	}

	changeTableColumnOrder(
		category: 'monitor' | 'history',
		target: string,
		columnName: string,
		direction: 'up' | 'down',
	) {
		const orders =
			category === 'monitor'
				? {
						orders_order: this.preference.controlTables.orders_order,
						vehicles_order: this.preference.controlTables.vehicles_order,
						stations_order: this.preference.controlTables.stations_order,
						buffers_order: this.preference.controlTables.buffers_order,
						zcus_order: this.preference.controlTables.zcus_order,
						cps_order: this.preference.controlTables.cps_order,
				  }
				: {
						transfers_order: this.preference.historyTables.transfers_order,
						vehicles_order: this.preference.historyTables.vehicles_order,
						alarms_order: this.preference.historyTables.alarms_order,
						nacks_order: this.preference.historyTables.nacks_order,
				  }

		const order = orders[target]

		const fromIndex = order.findIndex((c) => c.name === columnName)
		const toIndex = (() => {
			if (direction === 'up' && fromIndex === 0) return fromIndex
			else if (direction === 'up') return fromIndex - 1
			else if (direction === 'down' && fromIndex === order.length - 1)
				return fromIndex
			// direction === 'down'
			else return fromIndex + 1
		})()

		const selected = { ...order[fromIndex] }
		const affected = { ...order[toIndex] }
		order[fromIndex] = affected
		order[toIndex] = selected

		this.preference.save()
	}
}
