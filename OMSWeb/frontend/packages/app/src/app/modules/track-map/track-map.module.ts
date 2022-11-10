import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { SharedModule } from '../shared/shared.module'
import { MapToolbarComponent } from './viewer/map-toolbar.component'
import { MapViewerComponent } from './viewer/map-viewer.component'
import { SearchDialogComponent } from './dialogs/search-dialog.component'
import { TrackVehicleDialogComponent } from './dialogs/track-vehicle-dialog.component'
import { CommandDialogComponent } from './dialogs/command-dialog.component'
import { ShowObjectDialogComponent } from './dialogs/show-object-dialog.component'
import { MapSidePanelComponent } from './side-panel/map-side-panel.component'
import { OverlapListComponent } from './side-panel/overlap-list.component'
import { VehicleStatusDialogComponent } from './dialogs/vehicle-status-dialog.component'
import { BufferStatusDialogComponent } from './dialogs/buffer-status-dialog.component'
import { MapOverlappedComponent } from './viewer/map-overlapped.component'
import { PlaybackMapToolbarComponent } from './viewer/playback-map-toolbar.component'
import { PlaybackMapViewerComponent } from './viewer/playback-map-viewer.component'
import { PlaybackTrackVehicleDialogComponent } from './dialogs/playback-track-vehicle-dialog.component'
import { PlaybackMapSidePanelComponent } from './side-panel/playback-map-side-panel.component'
import { PlaybackVehicleStatusDialogComponent } from './dialogs/playback-vehicle-status-dialog.component'

@NgModule({
	declarations: [
		MapViewerComponent,
		MapToolbarComponent,
		MapOverlappedComponent,
		SearchDialogComponent,
		TrackVehicleDialogComponent,
		CommandDialogComponent,
		ShowObjectDialogComponent,
		MapSidePanelComponent,
		OverlapListComponent,
		VehicleStatusDialogComponent,
		BufferStatusDialogComponent,
		// playback
		PlaybackMapViewerComponent,
		PlaybackMapToolbarComponent,
		PlaybackMapSidePanelComponent,
		PlaybackTrackVehicleDialogComponent,
		PlaybackVehicleStatusDialogComponent,
	],
	imports: [CommonModule, SharedModule],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	exports: [
		MapViewerComponent,
		PlaybackMapViewerComponent,
		MapToolbarComponent,
		PlaybackMapToolbarComponent,
	],
})
export class TrackMapModule {}
