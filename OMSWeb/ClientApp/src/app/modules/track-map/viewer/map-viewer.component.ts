import { Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';
// import * as d3 from 'd3';
// import { Selection } from 'd3-selection';

import { ToggleOptionKeyType, ViewModes } from '../../../models/enums';
import { StatusService } from '../../../services/status.service';
import { ViewController } from './viewer-helper';
import { TrackIdService } from '../../../services/track-id.service';
import { Dto } from '../../../models/dto/track.model';
import { MapStatesService } from '../map-states.service';
import { Subscription } from 'rxjs';
import { MapDataService } from '../map-data.service';
import { IPreferences } from '../../../models/settings.model';
import { HubService } from '../../../services/hub.service';
import { IDataChangeEvent } from '../../../models/notification.model';

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
        width: 32px;
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
  preference: IPreferences;
  omsData: Dto.ITrackData;
  loadingState = false;

  private _minimapVisible = false;
  private viewer: ViewController;
  //#region subscriptions
  private toolbarToggleEvent$: Subscription;
  private toolbarCommandEvent$: Subscription;
  private mapConfigChangeEvent$: Subscription;

  private vehicleChanged$: Subscription;
  private segmentChanged$: Subscription;
  private segmentDisabledChanged$: Subscription;
  private clusterChanged$: Subscription;
  //#endregion

  get showMinimap(): boolean {
    return this._minimapVisible;
  }

  constructor(
    private dataSvc: MapDataService,
    private statusSvc: StatusService,
    private trackIdSvc: TrackIdService,
    private statesSvc: MapStatesService,
    private hubSvc: HubService,
    private dialog: MatDialog
  ) {}

  ngOnDestroy(): void {
    this.toolbarToggleEvent$ && this.toolbarToggleEvent$.unsubscribe();
    this.toolbarCommandEvent$ && this.toolbarCommandEvent$.unsubscribe();
    this.mapConfigChangeEvent$ && this.mapConfigChangeEvent$.unsubscribe();

    this.vehicleChanged$ && this.vehicleChanged$.unsubscribe();
    this.segmentChanged$ && this.segmentChanged$.unsubscribe();
    this.segmentDisabledChanged$ && this.segmentDisabledChanged$.unsubscribe();
    this.clusterChanged$ && this.clusterChanged$.unsubscribe();
    this.viewer && this.viewer.destroy();
  }

  ngOnInit(): void {
    this.loadingState = true;
    this.statusSvc.getTrack().subscribe((res) => {
      console.info('## track info >>', res);
      this.omsData = res;
      this._minimapVisible = this.preference.toggles.minimap;

      // console.warn('테스트 : 맵 랜더링 bypass'); // @TODO test
      this.drawMap();
      this.loadingState = false;
    });
    this.toolbarToggleEvent$ = this.statesSvc.toolbarStates$.subscribe(
      (event) => {
        if (event.type === 'minimap') {
          this._minimapVisible = event.value;
        } else {
          this.viewer?.onChangeVisibility(event);
        }
      }
    );
    this.toolbarCommandEvent$ = this.statesSvc.toolbarCommandStates$.subscribe(
      (event) => {
        this.viewer.onCommandAction(event);
      }
    );
    this.mapConfigChangeEvent$ = this.statesSvc.configStates$.subscribe(
      (event) => {
        this.viewer.onChangeConfig(event);
      }
    );

    this.vehicleChanged$ = this.hubSvc.vehicleChanged$.subscribe(
      (e: IDataChangeEvent) => this.applyVehicleChange(e)
    );
    this.segmentChanged$ = this.hubSvc.segmentChanged$.subscribe(
      (e: IDataChangeEvent) => {
        this.applySegmentChange(e);
      }
    );
    this.segmentDisabledChanged$ = this.hubSvc.segmentDisabledChanged$.subscribe(
      (e: IDataChangeEvent) => {
        this.applySegmentDisabledChange(e);
      }
    );
    this.clusterChanged$ = this.hubSvc.clusterChanged$.subscribe(
      (e: IDataChangeEvent) => {
        this.applyClusterChange(e);
      }
    );
  }

  private drawMap() {
    this.viewer = new ViewController(
      ViewModes.public,
      'track-canvas',
      'minimap',
      this.dataSvc,
      this.statesSvc
    );

    this.viewer.setup(this.preference);
    this.viewer.create_track(this.omsData);
    this.viewer.update_vehicles(this.omsData.vehicles, 'INSERT', null, false);
    this.trackIdSvc.extract_id_from_track(this.dataSvc.data);
  }

  private applyVehicleChange({ data, operation, id }: IDataChangeEvent) {
    // console.log('### update vehicle push >>', { data, operation, id });
    if (
      !this.viewer ||
      !this.dataSvc.data.points ||
      !this.dataSvc.data.points.length
    ) {
      console.warn('### update vehicle - no object >>', {
        id,
        points: this.dataSvc.data.points,
        viewer: this.viewer,
      });
      return; // @TODO viewer가 아직 생성되지 않은 경우에는 지연 처리할 방법 구현
    }
    this.viewer.update_vehicles([data], operation, id, false);
    // @TODO update_popup 구현
    // this.viewer.update_popup(
    //   this.dataSvc.data.vehicles.find((v) => v.id === id)
    // );
  }
  private applySegmentChange({ data }: IDataChangeEvent) {
    if (!this.viewer) return;
    const updated = this.dataSvc.getChangedSegments(data);
    this.viewer.update_segments(updated, false, false);
  }
  private applySegmentDisabledChange({
    data,
    operation,
    id,
  }: IDataChangeEvent) {
    if (!this.viewer) return;
    this.viewer.update_disable_segment(data, operation, id);
    const selected = this.viewer.get_selected_objects('SEGMENT')[0];
    if (selected) {
      this.viewer.update_popup(
        this.viewer.find_layout_object('SEGMENT', selected.id)
      );
    }
  }
  private applyClusterChange({ data }: IDataChangeEvent) {
    if (!this.viewer) return;
    const updated = this.dataSvc.getChangedClusters(data);
    this.viewer.update_clusters(updated, false, false);
  }
}
