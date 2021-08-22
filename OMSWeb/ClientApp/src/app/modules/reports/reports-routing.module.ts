import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportsComponent } from './reports.component';
import { KpiReportComponent } from './kpi/kpi-report.component';
import { ReportReportComponent } from './report/report-report.component';
import { SystemInfoReportComponent } from './systeminfo/systeminfo-report.component';

const routes: Routes = [
  {
    path: '',
    component: ReportsComponent,
    children: [
      { path: 'report', component: ReportReportComponent },
      { path: 'kpi', component: KpiReportComponent },
      { path: 'systeminfo', component: SystemInfoReportComponent },
      { path: '', redirectTo: 'report', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule { }
