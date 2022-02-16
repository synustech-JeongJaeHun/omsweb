import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MonitorRoutingModule } from './monitor-routing.module';
import { MonitorStatusComponent } from './status/monitor-status.component';
import { MonitorMetricsComponent } from './metrics/monitor-metrics.component';
import { MonitorComponent } from './monitor.component';
import { SharedModule } from '../shared/shared.module';
import { TrackMapModule } from '../track-map/track-map.module';
import { StatusControlComponent } from './status/status-control.component';
import { OrderControlTableComponent } from './tables/order-control-table.component';
import { VehicleControlTableComponent } from './tables/vehicle-control-table.component';
import { StationControlTableComponent } from './tables/station-control-table.component';
import { BufferControlTableComponent } from './tables/buffer-control-table.component';
import { ZcuControlTableComponent } from './tables/zcu-control-table.component';
import { KpiModule } from '../kpi/kpi.module';

@NgModule({
  declarations: [
    MonitorStatusComponent,
    MonitorMetricsComponent,
    MonitorComponent,
    StatusControlComponent,
    OrderControlTableComponent,
    VehicleControlTableComponent,
    StationControlTableComponent,
    BufferControlTableComponent,
    ZcuControlTableComponent,
  ],
  imports: [CommonModule, MonitorRoutingModule, SharedModule, TrackMapModule, KpiModule],
})
export class MonitorModule { }
