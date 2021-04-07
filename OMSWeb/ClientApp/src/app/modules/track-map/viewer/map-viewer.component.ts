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
import { from, of, Subject, Subscription } from 'rxjs';
import { MapDataService } from '../map-data.service';
import { IPreferences } from '../../../models/settings.model';
import { HubService } from '../../../services/hub.service';
import { IDataChangeEvent } from '../../../models/notification.model';
import { flatMap, map, switchMap, takeUntil } from 'rxjs/operators';
import { IMapMouseEvent } from '../../../models/map.interface';
import d3 = require('d3');

@Component({
  selector: 'oms-map-viewer',
  templateUrl: './map-viewer.component.html',
  styleUrls: ['./map-viewer.component.scss'],
})
export class MapViewerComponent implements OnInit, OnDestroy {
  @Input() preference: IPreferences;

  omsData: Dto.ITrackData;
  loadingState = false;

  private _minimapVisible = false;
  private _detailsVisible = false;
  private viewer: ViewController;
  private destroy$: Subject<void> = new Subject<void>();
  private _currentContextEvent: IMapMouseEvent;
  private _contextData: any;

  get showMinimap(): boolean {
    return this._minimapVisible;
  }
  get showDetails(): boolean {
    return this._detailsVisible;
  }
  get showContextMenu(): boolean {
    return true;
    // return !!this._currentContextEvent;
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
    this.destroy$.next();
    this.destroy$.complete();
    this.dataSvc.clear();
    this.viewer && this.viewer.destroy();
  }

  ngOnInit(): void {
    this.loadingState = true;
    this.statusSvc.getTrack().subscribe((res) => {
      console.info('## track info >>', res);
      this.omsData = res;
      this._minimapVisible = this.preference.toggles.minimap;
      this._detailsVisible = this.preference.toggles.itemDetails;

      // this.drawMap();

      this.loadingState = false;
    });
    this.statesSvc.toolbarStates$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        if (event.type === 'minimap') {
          this._minimapVisible = event.value;
        } else if (event.type === 'itemDetails') {
          this._detailsVisible = event.value;
        } else {
          this.viewer?.onChangeVisibility(event);
        }
      });
    this.statesSvc.toolbarCommandStates$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        this.viewer.onCommandAction(event);
      });
    this.statesSvc.configStates$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        this.viewer.onChangeConfig(event);
      });

    // this.vehicleChanged$ = this.hubSvc.vehicleChanged$
    //   .pipe(switchMap((e) => of(e)))
    //   .subscribe((e: IDataChangeEvent) => this.applyVehicleChange(e));
    this.hubSvc.vehicleChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((e: IDataChangeEvent) => this.applyVehicleChange(e));
    this.hubSvc.segmentChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((e: IDataChangeEvent) => {
        this.applySegmentChange(e);
      });
    this.hubSvc.segmentDisabledChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((e: IDataChangeEvent) => {
        this.applySegmentDisabledChange(e);
      });
    this.hubSvc.clusterChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((e: IDataChangeEvent) => {
        this.applyClusterChange(e);
      });
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

    this.viewer.onMouseEvent$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => this.onMapMouseEvent(event));
  }

  private onMapMouseEvent(event: IMapMouseEvent) {
    const { type, targetId, targetType } = event;
    if (type === 'contextmenu') {
      this._contextData = this.dataSvc.find_layout_object(targetType, targetId);
      const leftThreshold = window.innerWidth / 2;
      const { pageX: x, pageY: y } = d3.event;

      const container = d3.select('#contextMenu').style('top', `${y - 40}px`);

      if (leftThreshold > x) {
        container.style('left', `${x}px`).style('right', 'inherit');
      } else {
        container
          .style('right', `${window.innerWidth - x}px`)
          .style('left', 'inherit');
      }
      this._currentContextEvent = event;
    }
  }

  private applyVehicleChange(event: IDataChangeEvent) {
    // console.log('### update vehicle push >>', event);
    const { data, operation, id } = event;
    // console.log('### update vehicle push >>', { data, operation, id });
    if (
      !this.viewer ||
      !this.dataSvc.data.points ||
      !this.dataSvc.data.points.length
    ) {
      console.log('### update vehicle - no object >>', {
        id,
        points: this.dataSvc.data.points,
        viewer: this.viewer,
      });
      return; // @TODO viewer가 아직 생성되지 않은 경우에는 지연 처리할 방법 구현
    }
    this.viewer.update_vehicles([data], operation, id, false);
    this.viewer.update_popup(
      this.dataSvc.data.vehicles.find((v) => v.id === id)
    );
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
