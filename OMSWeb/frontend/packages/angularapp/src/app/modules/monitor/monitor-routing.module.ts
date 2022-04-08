import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MonitorMetricsComponent } from './metrics/monitor-metrics.component';
import { MonitorComponent } from './monitor.component';
import { MonitorStatusComponent } from './status/monitor-status.component';
import { AuthGuard } from '../../guards/auth.guard';
import { MonitorAuthGuard } from '../../guards/monitor-auth.guard';

const routes: Routes = [
  {
    path: 'monitor',
    component: MonitorComponent,
    children: [
      {
        path: 'public',
        component: MonitorStatusComponent,
        canActivate: [MonitorAuthGuard],
      },
      {
        path: 'status',
        component: MonitorStatusComponent,
        canActivate: [AuthGuard],
      },
      { path: 'metrics', component: MonitorMetricsComponent },
      { path: '', redirectTo: '/monitor/public', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MonitorRoutingModule { }
