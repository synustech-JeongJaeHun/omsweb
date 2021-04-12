import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MonitorMetricsComponent } from './metrics/monitor-metrics.component';
import { MonitorComponent } from './monitor.component';
import { MonitorStatusComponent } from './status/monitor-status.component';

const routes: Routes = [
  {
    path: '',
    component: MonitorComponent,
    children: [
      { path: 'public', component: MonitorStatusComponent },
      { path: 'status', component: MonitorStatusComponent },
      { path: 'metrics', component: MonitorMetricsComponent },
      { path: '', redirectTo: '/monitor/public', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MonitorRoutingModule {}
