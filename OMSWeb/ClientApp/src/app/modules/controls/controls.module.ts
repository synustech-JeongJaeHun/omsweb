import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapUpdateComponent } from './vehicles/map-update.component';
import { ServerUpdateComponent } from './server/server-update.component';
import { ControlsComponent } from './controls.component';
import { ControlsRoutingModule } from './controls-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [MapUpdateComponent, ServerUpdateComponent, ControlsComponent],
  imports: [CommonModule, SharedModule, ControlsRoutingModule],
})
export class ControlsModule {}
