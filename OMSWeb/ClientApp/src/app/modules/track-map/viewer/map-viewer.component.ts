import { Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import * as _ from 'lodash';
// import * as d3 from 'd3';
// import { Selection } from 'd3-selection';

import { ViewModes } from '../../../models/enums';
import { StatusService } from '../../../services/status.service';
import { ViewController } from './viewer-helper';
import { TrackIdService } from '../../../services/track-id.service';
import { Dto } from '../../../models/dto/track.model';
import { MapStatesService } from '../map-states.service';
import { Subscription } from 'rxjs';
import { IMapPreferences } from '../../../models/drawing.model';

@Component({
  selector: 'oms-map-viewer',
  templateUrl: './map-viewer.component.html',
  styles: [
    `
      .track-container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      #map-toolbar {
        position: absolute;
        top: 0;
        left: 0;
        align-self: start;
        z-index: 5;
      }
      #loading-bar {
        position: absolute;
        top: 40%;
        left: 25%;
        width: 50%;
        text-align: center;
        background-color: white;
        padding: 20px;
        z-index: 5;
      }

      .mat-progress-bar {
        margin-top: 10px;
      }
    `,
  ],
})
export class MapViewerComponent implements OnInit, OnDestroy {
  @Input()
  preference: IMapPreferences;
  omsData: Dto.ITrackData;
  loadingState = false;

  private _minimapVisible = false;
  private viewer: ViewController;
  //#region subscriptions
  private minimapStateSub$: Subscription;
  private stationShowSub$: Subscription;
  //#endregion

  get showMinimap(): boolean {
    return this._minimapVisible;
  }

  constructor(
    private statusSvc: StatusService,
    private trackIdSvc: TrackIdService,
    private statesSvc: MapStatesService
  ) {}

  ngOnDestroy(): void {
    this.minimapStateSub$ && this.minimapStateSub$.unsubscribe();
    this.viewer && this.viewer.destroy();
  }

  ngOnInit(): void {
    this.loadingState = true;
    this.statusSvc.getTrack().subscribe((res) => {
      console.info('## track info >>', res);
      this.omsData = res;
      this.drawMap();
      this.loadingState = false;
    });
    this.minimapStateSub$ = this.statesSvc.toolbarStates$.minimap.subscribe(
      (state) => {
        this._minimapVisible = state;
        console.info('## minimap state changed >>', state);
      }
    );
    this.stationShowSub$ = this.statesSvc.toolbarStates$.stations.subscribe(
      (state) => {
        this.viewer.changeVisibility('stations', state);
      }
    );
  }

  private drawMap() {
    this.viewer = new ViewController(
      ViewModes.public,
      'track-canvas',
      'minimap',
      this.statesSvc
    );

    this.viewer.setup();
    this.viewer.create_track(this.omsData);
    this.viewer.update_vehicles(this.omsData.vehicles, 'INSERT', null, false);
    this.trackIdSvc.extract_id_from_track(this.viewer.layoutData);
  }
}
