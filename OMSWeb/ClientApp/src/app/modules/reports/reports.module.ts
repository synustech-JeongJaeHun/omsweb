import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { KpiReportComponent } from './kpi/kpi-report.component';
//import { ReportReportComponent } from './report/report-report.component';
import { NormalTRReportComponent } from './report/normal-tr-report.component';
import { AbnormalTRReportComponent } from './report/abnormal-tr-report.component';
import { AlarmReportComponent } from './report/alarm-report.component';
//import { SystemInfoReportComponent } from './systeminfo/systeminfo-report.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [ReportsComponent, KpiReportComponent, NormalTRReportComponent, AbnormalTRReportComponent, AlarmReportComponent],  //ReportReportComponent], //SystemInfoReportComponent],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    SharedModule,
  ]
})
export class ReportsModule { }
