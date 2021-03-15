import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { MapToolbarComponent } from './viewer/map-toolbar.component';
import { MapViewerComponent } from './viewer/map-viewer.component';
@NgModule({
  declarations: [MapViewerComponent, MapToolbarComponent],
  imports: [CommonModule, SharedModule],
  exports: [MapViewerComponent, MapToolbarComponent],
})
export class TrackMapModule {}
