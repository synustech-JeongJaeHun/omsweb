import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { HistoriesRoutingModule } from './histories-routing.module'
import { HistoriesComponent } from './histories.component'
import { TransferHistoryComponent } from './transfer/transfer-history.component'
import { VehicleHistoryComponent } from './vehicles/vehicle-history.component'
import { AlarmHistoryComponent } from './alarms/alarm-history.component'
import { SharedModule } from '../shared/shared.module'
import { WarningHistoryComponent } from './warnings/warning-history.component'

@NgModule({
	declarations: [
		HistoriesComponent,
		TransferHistoryComponent,
		VehicleHistoryComponent,
		AlarmHistoryComponent,
		WarningHistoryComponent,
	],
	imports: [CommonModule, HistoriesRoutingModule, SharedModule],
})
export class HistoriesModule {}
