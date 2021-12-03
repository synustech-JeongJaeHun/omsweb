import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleControlComponent } from './vehicles/vehicle-control.component';
import { ServerControlComponent } from './server/server-control.component';
import { ControlsComponent } from './controls.component';
import { ControlsRoutingModule } from './controls-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [VehicleControlComponent, ServerControlComponent, ControlsComponent],
  imports: [CommonModule, SharedModule, ControlsRoutingModule],
})
export class ControlsModule { }
