import {
  Component,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
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
  currentContextEvent: IMapMouseEvent;
  contextData: any;
  currentTooltipEvent: IMapMouseEvent;
  tooltipData: any;

  private _minimapVisible = false;
  private _detailsVisible = false;
  private viewer: ViewController;
  private destroy$: Subject<void> = new Subject<void>();
  private _popupOffsetX = 10;
  private _popupOffsetY = 40;

  get showMinimap(): boolean {
    return this._minimapVisible;
  }
  get showDetails(): boolean {
    return this._detailsVisible;
  }
  get showContextMenu(): boolean {
    return !!this.contextData;
  }
  get showTooltip(): boolean {
    return !!this.tooltipData;
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
    this.currentContextEvent = undefined;
    this.viewer && this.viewer.destroy();
  }

  ngOnInit(): void {
    this.loadingState = true;
    this.statusSvc.getTrack().subscribe((res) => {
      console.info('## track info >>', res);
      this.omsData = res;
      this._minimapVisible = this.preference.toggles.minimap;
      this._detailsVisible = this.preference.toggles.itemDetails;

      this.drawMap();

      this.loadingState = false;
    });
    this.attachEvents();
  }

  private attachEvents() {
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
    const { type } = event;

    switch (type) {
      case 'contextmenu':
        this.openContextMenu(event);
        break;
      case 'mouseenter':
        this.openTooltip(event);
        break;
      case 'mouseout':
        this.closeTooltip();
        break;
      case 'backdrop':
        this.closeContextMenu();
        break;
      default:
        break;
    }
  }

  private openContextMenu(event: IMapMouseEvent) {
    const { targetId, targetType } = event;
    this.contextData = this.dataSvc.find_layout_object(targetType, targetId);
    const leftThreshold = window.innerWidth - 200;
    const { pageX: x, pageY: y } = d3.event;

    const container = d3
      .select('#contextMenu')
      .style('top', `${y - this._popupOffsetY}px`);

    if (leftThreshold > x) {
      container.style('left', `${x}px`).style('right', 'inherit');
    } else {
      container
        .style('right', `${window.innerWidth - x}px`)
        .style('left', 'inherit');
    }
    this.currentContextEvent = event;
  }
  private closeContextMenu() {
    this.contextData = undefined;
    this.currentContextEvent = undefined;
  }
  private openTooltip(event: IMapMouseEvent) {
    const { targetId, targetType } = event;
    if (this.viewer.hasShownLayoutObjects(targetType, targetId)) return;
    this.tooltipData = this.dataSvc.find_layout_object(targetType, targetId);
    if (targetType === 'SEGMENT') {
      const { pointFrom, pointTo } = this.tooltipData;
      this.tooltipData.point =
        pointFrom && pointTo ? `${pointFrom.id} . ${pointTo.id}` : null;
    } else if (targetType === 'VEHICLE') {
      const { orderLogicalId, orderId } = this.tooltipData;
      this.tooltipData.orderLogicalId = orderLogicalId
        ? orderLogicalId
        : orderId
        ? orderId
        : null;
    }

    this.currentTooltipEvent = event;

    const leftThreshold = window.innerWidth - 200;
    const { pageX: x, pageY: y } = d3.event;

    const container = d3
      .select('#tooltipView')
      .style('top', `${y - this._popupOffsetY}px`);

    if (leftThreshold > x) {
      container
        .style('left', `${x + this._popupOffsetX}px`)
        .style('right', 'inherit');
    } else {
      container
        .style('right', `${window.innerWidth - x - this._popupOffsetX}px`)
        .style('left', 'inherit');
    }
  }
  private closeTooltip() {
    this.tooltipData = undefined;
    this.currentTooltipEvent = undefined;
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
