import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MobileFrameRoutingModule} from "./mobile-frame-routing.module";
import {MobileFrameComponent} from "./mobile-frame.component";
import {SharedModule} from "../shared/shared.module";
import {TrackMapModule} from "../track-map/track-map.module";
import {KpiModule} from "../kpi/kpi.module";
import {MonitorModule} from "../monitor/monitor.module";



@NgModule({
  declarations: [
    MobileFrameComponent
  ],
  imports: [
    CommonModule,
    MobileFrameRoutingModule,
    SharedModule,
    TrackMapModule,
    KpiModule,
    MonitorModule
  ]
})
export class MobileFrameModule { }
