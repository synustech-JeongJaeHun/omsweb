import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { MapToolbarComponent } from './viewer/map-toolbar.component';
import { MapViewerComponent } from './viewer/map-viewer.component';
import { SearchDialogComponent } from './dialogs/search-dialog.component';
@NgModule({
  declarations: [MapViewerComponent, MapToolbarComponent, SearchDialogComponent],
  imports: [CommonModule, SharedModule],
  exports: [MapViewerComponent, MapToolbarComponent],
})
export class TrackMapModule {}
