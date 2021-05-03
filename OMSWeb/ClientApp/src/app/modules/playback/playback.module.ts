import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlaybackRoutingModule } from './playback-routing.module';
import { PlaybackComponent } from './playback.component';
import { PlaybackControlDialogComponent } from './dialogs/playback-control-dialog.component';
import { SharedModule } from '../shared/shared.module';
import { TrackMapModule } from '../track-map/track-map.module';


@NgModule({
  declarations: [PlaybackComponent, PlaybackControlDialogComponent],
  imports: [
    CommonModule,
    SharedModule,
    PlaybackRoutingModule,
    TrackMapModule,
  ]
})
export class PlaybackModule { }
