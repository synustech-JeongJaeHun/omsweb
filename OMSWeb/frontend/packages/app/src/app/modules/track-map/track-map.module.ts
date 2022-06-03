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
import { LegacyMapToolbarComponent } from './viewer/legacy-map-toolbar.component'
import { LegacyMapViewerComponent } from './viewer/legacy-map-viewer.component'
import { LegacySearchDialogComponent } from './dialogs/legacy-search-dialog.component'
import { LegacyShowObjectDialogComponent } from './dialogs/legacy-show-object-dialog.component'
import { LegacyTrackVehicleDialogComponent } from './dialogs/legacy-track-vehicle-dialog.component'
import { LegacyMapSidePanelComponent } from './side-panel/legacy-map-side-panel.component'
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
		// legacy
		LegacyMapViewerComponent,
		LegacyMapToolbarComponent,
		LegacyMapSidePanelComponent,
		LegacySearchDialogComponent,
		LegacyShowObjectDialogComponent,
		LegacyTrackVehicleDialogComponent,
		// playback
		PlaybackVehicleStatusDialogComponent,
	],
	imports: [CommonModule, SharedModule],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	exports: [
		MapViewerComponent,
		LegacyMapViewerComponent,
		MapToolbarComponent,
		LegacyMapToolbarComponent,
	],
})
export class TrackMapModule {}
