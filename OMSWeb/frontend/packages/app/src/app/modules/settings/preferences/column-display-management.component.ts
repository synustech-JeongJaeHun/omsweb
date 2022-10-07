import { Component } from '@angular/core'
import { Subject } from 'rxjs'
import { IControlTableEvent } from '../../../models/drawing.model'
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

	controlTableCommandEvent$ = new Subject<IControlTableEvent>()

	getCheckedState(target: string): boolean {
		const pref = this.preference
		return pref.controlTables[target]
	}

	constructor(private settingSvc: SettingsService) {
		this.preference = this.settingSvc.globalPreferences
		settingSvc.serviceConfig.subscribe(
			(config) => (this.bufferEnabled = config.bufferEnabled),
		)
	}

	onChangeControlTable(target: string, value: any) {
		this.changeControlTableState(target, value.currentTarget.checked)
	}

	changeTableColumnOrder(
		target: string,
		columnName: string,
		direction: 'up' | 'down',
	) {
		const orders = {
			orders_order: this.preference.controlTables.orders_order,
			vehicles_order: this.preference.controlTables.vehicles_order,
			stations_order: this.preference.controlTables.stations_order,
			buffers_order: this.preference.controlTables.buffers_order,
			zcus_order: this.preference.controlTables.zcus_order,
			cps_order: this.preference.controlTables.cps_order,
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

	private changeControlTableState(type: string, value: any) {
		const pref = this.preference
		pref.controlTables[type] = value
		pref.save()
		this.controlTableCommandEvent$.next({ type, value })
	}
}
