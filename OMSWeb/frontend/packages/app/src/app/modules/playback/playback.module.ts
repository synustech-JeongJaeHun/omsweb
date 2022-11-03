import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { PlaybackRoutingModule } from './playback-routing.module'
import { PlaybackComponent } from './playback.component'
import { PlaybackAlertDialogComponent } from './dialogs/playback-alert-dialog.component'
import { PlaybackControlDialogComponent } from './dialogs/playback-control-dialog.component'
import { SharedModule } from '../shared/shared.module'
import { TrackMapModule } from '../track-map/track-map.module'
import { MonitorModule } from '../monitor/monitor.module'
import { PlaybackOrderStatusComponent } from './status/playback-order-status.component'
import { PlaybackVehicleStatusComponent } from './status/playback-vehicle-status.component'
import { PlaybackStatusPanelComponent } from './status/playback-status-panel.component'

@NgModule({
	declarations: [
		PlaybackComponent,
		PlaybackControlDialogComponent,
		PlaybackOrderStatusComponent,
		PlaybackVehicleStatusComponent,
		PlaybackStatusPanelComponent,
		PlaybackAlertDialogComponent,
	],
	imports: [
		CommonModule,
		SharedModule,
		PlaybackRoutingModule,
		TrackMapModule,
		MonitorModule,
	],
})
export class PlaybackModule {}
