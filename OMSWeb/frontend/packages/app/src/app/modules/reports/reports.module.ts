import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { CommonModule } from '@angular/common'

import { ReportsRoutingModule } from './reports-routing.module'
import { ReportsComponent } from './reports.component'
import { SharedModule } from '../shared/shared.module'

@NgModule({
	declarations: [
		ReportsComponent,
	], //ReportReportComponent], //SystemInfoReportComponent],
	imports: [CommonModule, SharedModule, ReportsRoutingModule],
})
export class ReportsModule {}
