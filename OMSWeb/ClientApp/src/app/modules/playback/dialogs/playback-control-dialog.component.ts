import { Component, OnInit } from '@angular/core';

import {
  IPlaybackOptions,
  IPlaybackState,
  playbackSpeedValues,
} from '@oms/models/playback.model';

@Component({
  selector: 'oms-playback-control-dialog',
  templateUrl: './playback-control-dialog.component.html',
  styleUrls: ['./playback-control-dialog.component.scss'],
})
export class PlaybackControlDialogComponent implements OnInit {
  options: IPlaybackOptions;
  states: IPlaybackState;

  speedValues = playbackSpeedValues;

  constructor() {}

  ngOnInit(): void {
    const now: Date = new Date();
    this.options = {
      speed: 1,
      eventsStep: 5,
      snapshot: 0,
      event: 0,
    };

    this.states = {
      playing: false,
      event: 0,
      nextEvent: 0,
      playTime: '00:00:00'
    };
  }
}
