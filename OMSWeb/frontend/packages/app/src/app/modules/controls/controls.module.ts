import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleControlComponent } from './vehicles/vehicle-control.component';
import { TokenHistoryControlComponent } from './token-history/token-history-control.component';
import { ControlsComponent } from './controls.component';
import { ControlsRoutingModule } from './controls-routing.module';
import { SharedModule } from '../shared/shared.module';
import { MapComponent } from './map/map.component';
import {ServerControlComponent} from "./version/server/server-control.component";
import {VehicleComponent} from "./version/vehicle/vehicle.component";
import {CdmComponent} from "./version/cdm/cdm.component";
import {VersionComponent} from "./version/version.component";
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  declarations: [
    VehicleControlComponent,
    TokenHistoryControlComponent,
    ControlsComponent,
    MapComponent,
    ServerControlComponent,
    VehicleComponent,
    CdmComponent,
    VersionComponent
  ],
  imports: [CommonModule, SharedModule, ControlsRoutingModule, TranslateModule],
})
export class ControlsModule { }
