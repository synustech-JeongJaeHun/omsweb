import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { KpiReportComponent } from './kpi/kpi-report.component';
import { ReportReportComponent } from './report/report-report.component';
import { SystemInfoReportComponent } from './systeminfo/systeminfo-report.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [ReportsComponent, KpiReportComponent, ReportReportComponent, SystemInfoReportComponent],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    SharedModule,
  ]
})
export class ReportsModule { }

