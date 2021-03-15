import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MonitorRoutingModule } from './monitor-routing.module';
import { MonitorStatusComponent } from './status/monitor-status.component';
import { MonitorMetricsComponent } from './metrics/monitor-metrics.component';
import { MonitorComponent } from './monitor.component';
import { SharedModule } from '../shared/shared.module';
import { TrackMapModule } from '../track-map/track-map.module';

@NgModule({
  declarations: [
    MonitorStatusComponent,
    MonitorMetricsComponent,
    MonitorComponent,
  ],
  imports: [CommonModule, MonitorRoutingModule, SharedModule, TrackMapModule],
})
export class MonitorModule {}
