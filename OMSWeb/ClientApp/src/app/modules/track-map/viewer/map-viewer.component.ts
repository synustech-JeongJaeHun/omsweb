import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import d3 = require('d3');

import { ViewModes } from '../../../models/enums';
import { ViewController } from './viewer-helper';
import { TrackIdService } from '../../../services/track-id.service';
import { Dto } from '../../../models/dto/track.model';
import { MapStatesService } from '../map-states.service';
import { MapDataService } from '../map-data.service';
import { IPreferences } from '../../../models/settings.model';
import { HubService } from '../../../services/hub.service';
import { IDataChangeEvent } from '../../../models/notification.model';
import { IMapMouseEvent } from '../../../models/map.interface';
import { AuthService } from '../../../services/auth.service';
import { main_css } from '../../shared/utils/css-loader';
import { MessagesService } from '../../../services/messages.service';
import { IVehicleCommandMessage } from '../../../models/command.model';
import { IPlaybackTrackChangeEvent } from '../../../models/playback.model';
import { Group } from '../../../models/group.model';
import { TracksService } from '../../../services/tracks.service';
import { SettingsService } from '../../../services/settings.service';
import { StatusService } from '../../../services/status.service';
import { DialogService } from '../../../services/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { PermissionEnums } from '../../../models/enums';

@Component({
  selector: 'oms-map-viewer',
  templateUrl: './map-viewer.component.html',
  styleUrls: ['./map-viewer.component.scss'],
})
export class MapViewerComponent implements OnInit, OnDestroy {
  @Input() preference: IPreferences;
  @Input() viewMode: ViewModes;
  @Input() trackData: Dto.ITrackData;
  @Output() ready = new EventEmitter<boolean>();
  @Output() trackRendered = new EventEmitter<void>();

  // loadingState = false;
  currentContextEvent: IMapMouseEvent;
  contextData: any;
  currentTooltipEvent: IMapMouseEvent;
  tooltipData: any;
  selectEvent: IMapMouseEvent;
  selectedObject: any;
  groupIds: number[] = [];

  private _minimapVisible = false;
  private _detailsVisible = false;
  private viewer: ViewController;
  private destroy$: Subject<void> = new Subject<void>();
  private _popupOffsetX = 10;
  private _popupOffsetY = 40;

  readonly permissionEnums: typeof PermissionEnums = PermissionEnums;

  get showMinimap(): boolean {
    return this._minimapVisible;
  }
  get activeDetails(): boolean {
    return this._detailsVisible && this.auth.isAuthenticated;
  }
  get showContextMenu(): boolean {
    return !!this.contextData;
  }
  get showTooltip(): boolean {
    return !!this.tooltipData;
  }
  get canSetSource(): boolean {
    return !this.statesSvc.transferCommandState.sourceDisabled;
  }
  get canSetDest(): boolean {
    return !this.statesSvc.transferCommandState.destDisabled;
  }
  get showToolbarText(): boolean {
    return this.settingSvc.globalPreferences.toggles.showToolName;
  }

  constructor(
    private auth: AuthService,
    private dataSvc: MapDataService,
    private trackIdSvc: TrackIdService,
    private trackSvc: TracksService,
    private statesSvc: MapStatesService,
    private statusSvc: StatusService,
    private hubSvc: HubService,
    private messageSvc: MessagesService,
    private settingSvc: SettingsService,
    private dialogSvc: DialogService,
    private router: Router,
    private $t: TranslateService
  ) {
    this.auth.certUpdated$.pipe(takeUntil(this.destroy$)).subscribe((cert) => {
      this.router.navigateByUrl('/', { skipLocationChange: false }).then(() => {
        this.router.navigate([cert ? '/monitor/status' : '/']);
      });
    });
  }

  ngOnDestroy(): void {
    this.saveUiStates();
    this.destroy$.next();
    this.destroy$.complete();
    this.dataSvc.clear();
    this.currentContextEvent = undefined;
    this.viewer && this.viewer.destroy();
    this.viewer = null;
  }

  ngOnInit(): void {
    // if (!this.trackData) return;

    this.initMap();
    this.trackData && this.drawMap(this.trackData);
  }

  hasPermissions(permissions: number[]): boolean {
    return this.auth.hasPermissions(permissions);
  }

  onChangePointProperty(name: string, value: any) {
    console.log('## changed point property >>', { name, value });
    // @TODO: change point prop api 연동
  }
  onChangeSegmentProperty(name: string, value: any) {
    console.log('## changed segment property >>', { name, value });
    let isDisable: boolean = value;
    if (isDisable) {
      this.messageSvc
        .sendDisableSegmentCommand({ action: 'disable-segment' }, this.contextData.id)
        .subscribe();
    }
    else {
      this.messageSvc
        .sendDisableSegmentCommand({ action: 'enable-segment' }, this.contextData.id)
        .subscribe();
    }
  }
  onApplyPointChange(isHome: boolean, selectedGroup: number) {
    this.trackSvc
      .updatePoint(this.contextData.id, {
        isHome,
        group: selectedGroup,
      })
      .subscribe();
  }
  onApplyZcuChange(value: number) {
    this.dialogSvc
      .confirm({ body: this.$t.instant('messages.confirmZcuChange') })
      .subscribe((confirm) => {
        confirm &&
          this.trackSvc
            .updateZcu(this.contextData.id, {
              zcuType: value,
            })
            .subscribe();
      });
  }
  onRemoveCarrier() {
    this.dialogSvc
      .confirm({ body: this.$t.instant('messages.confirmBufferChange') })
      .subscribe((confirm) => {
        confirm &&
          this.trackSvc.removeBufferCarrier(this.contextData.id).subscribe();
      });
  }
  onInstallCarrier(carrierId: number) {
    this.dialogSvc
      .confirm({ body: this.$t.instant('messages.confirmBufferChange') })
      .subscribe((confirm) => {
        confirm &&
          this.trackSvc
            .installBufferCarrier(this.contextData.id, carrierId)
            .subscribe();
      });
  }
  onVehicleCommand(name: string) {
    let commandMessage: IVehicleCommandMessage;
    switch (name) {
      case 'initialize':
        commandMessage = { action: 'initialize' };
        break;
      case 'reset':
        commandMessage = { action: 'reset' };
        break;
      case 'stop':
        commandMessage = { action: 'stop' };
        break;
      case 'zcu_go':
        commandMessage = { action: 'zcu_go' };
        break;
      case 'push:enable':
        commandMessage = { action: 'set_behavior', canBePushed: true };
        break;
      case 'hostOrder:enable':
        commandMessage = { action: 'set_behavior', hostOrder: true };
        break;
      case 'rail_out':
        commandMessage = { action: 'remove' };
        break;
      default:
        commandMessage = { action: name };
        break;
    }
    this.messageSvc
      .sendVehicleCommand(commandMessage, [this.contextData])
      .subscribe();
  }
  onSetSource() {
    const { id, objectType } = this.contextData;
    this.statesSvc.transferCommandState.source = {
      id,
      objectType,
    };
  }
  onSetDest() {
    const { id, objectType } = this.contextData;
    this.statesSvc.transferCommandState.dest = {
      id,
      objectType,
    };
  }

  private attachEvents() {
    this.statesSvc.toolbarToggleEvent$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        if (event.type === 'minimap') {
          this._minimapVisible = event.value;
        } else if (event.type === 'itemDetails') {
          this._detailsVisible = event.value;
        } else if (event.type === 'controlTable') {
          setTimeout(() => {
            this.viewer.adjust_floaters();
          }, 100);
        } else {
          this.viewer?.onChangeVisibility(event);
        }
      });
    this.statesSvc.toolbarCommandEvent$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        this.viewer.onCommandAction(event);
      });
    this.statesSvc.configChangeEvent$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        this.viewer.onChangeConfig(event);
      });

    this.statesSvc.actionState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => this.onMapMouseEvent(event));

    this.statesSvc.statusTableResizeEvent$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.viewer.adjust_floaters();
      });

    [ViewModes.public, ViewModes.viewer].includes(this.viewMode) &&
      this.attachHubEvents();

    this.viewMode === ViewModes.playback && this.attachPlaybackEvents();
  }

  private attachHubEvents() {
    this.hubSvc.connectionChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((conn) => {
        conn && this.refreshVehicles();
      });
    this.hubSvc.vehicleChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((e: IDataChangeEvent) => {
        this.applyVehicleChange(e)
      });
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

    if (this.auth.isAuthenticated) {
      this.hubSvc.vehiclePathChanged$
        .pipe(takeUntil(this.destroy$))
        .subscribe((e: IDataChangeEvent) => {
          this.applyVehiclePathChange(e)
        });

      this.hubSvc.stationChanged$
        .pipe(takeUntil(this.destroy$))
        .subscribe((e) => this.applyStationChange(e));

      this.hubSvc.bufferChanged$
        .pipe(takeUntil(this.destroy$))
        .subscribe((e) => this.applyBufferChange(e));

      this.hubSvc.mtlChanged$
        .pipe(takeUntil(this.destroy$))
        .subscribe((e) => this.applyMtlChange(e));

      this.hubSvc.groupChanged$
        .pipe(takeUntil(this.destroy$))
        .subscribe((e) => this.applyGroupChange(e));
    }
  }

  private refreshVehicles() {
    this.statusSvc.getVehicles().subscribe((res) => {
      if (!res || !res.vehicles) return;
      if (!this.dataSvc.data.vehicles?.length) {
        this.viewer.update_vehicles(res.vehicles, 'INSERT', null, false);
        this.trackIdSvc.extract_id_from_track(this.dataSvc.data);
      } else {
        res.vehicles.forEach((v) => {
          this.viewer.update_vehicles([v], 'UPDATE', v.id, false);
        });
      }
    });
  }

  private attachPlaybackEvents() {
    this.dataSvc.snapshotUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applySnapshotUpdated());
    this.dataSvc.playbackTrackUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => this.applyPlaybackTrackUpdated(data));
    this.dataSvc.afterPlaybackTrackUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyAfterPlaybackTrackUpdated());
  }

  private initMap() {
    this.viewer = new ViewController(
      this.viewMode,
      'track-canvas',
      'minimap',
      this.dataSvc,
      this.statesSvc
    );

    this.viewer.setup(this.preference);

    this._minimapVisible = this.preference.toggles.minimap;
    this._detailsVisible = this.preference.toggles.itemDetails;

    this.dataSvc.trackDataUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.drawMap(data);
      });
    this.ready.emit(true);
  }

  private drawMap(track: Dto.ITrackData) {
    this.viewer.create_track(track);
    this.viewer.update_vehicles(track.vehicles, 'INSERT', null, false);
    this.trackIdSvc.extract_id_from_track(this.dataSvc.data);
    this.groupIds = this.dataSvc.data.groups.map((g) => g.id);

    this.attachEvents();
    this.applyUiStates();

    this.trackRendered.emit();
  }

  private onMapMouseEvent(event: IMapMouseEvent) {
    const { type } = event;

    switch (type) {
      case 'contextmenu':
        this.closeContextMenu();
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
      case 'selectUnit':
        this.showDetails(event);
        break;
      default:
        break;
    }
  }

  private openContextMenu(event: IMapMouseEvent) {
    const leftThreshold = window.innerWidth - 200;
    const { pageX: x, pageY: y } = d3.event;

    const container = d3
      .select('#contextMenu')
      .style('top', `${y - this._popupOffsetY}px`);

    if (leftThreshold > x) {
      container
        .style('left', `${x + this._popupOffsetX}px`)
        .style('right', 'inherit');
    } else {
      container
        .style('right', `${window.innerWidth - x + this._popupOffsetX}px`)
        .style('left', 'inherit');
    }
    setTimeout(() => {
      const { targetId, targetType } = event;
      this.contextData = this.dataSvc.find_layout_object(targetType, targetId);
      console.log('### context data >>', this.contextData);
      this.currentContextEvent = event;
    }, 0);
  }
  private applyUiStates() {
    this.viewer.setUiStates(this.settingSvc.globalPreferences.uiStates);
  }
  private saveUiStates() {
    const states = this.viewer.getUiStates();
    const pref = this.settingSvc.globalPreferences;
    pref.uiStates = { ...pref.uiStates, ...states };
    this.settingSvc.globalPreferences.save();
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
        .style('right', `${window.innerWidth - x + this._popupOffsetX}px`)
        .style('left', 'inherit');
    }
  }
  private closeTooltip() {
    this.tooltipData = undefined;
    this.currentTooltipEvent = undefined;
  }
  private showDetails(event: IMapMouseEvent) {
    if (!this.activeDetails) return;
    this.selectEvent = event;
    const { targetId, targetType } = event;
    this.selectedObject = this.dataSvc.find_layout_object(targetType, targetId);
    this.viewer.init_selection(true);
    this.viewer.highlight(
      targetType,
      targetId,
      main_css[targetType.toLowerCase()],
      'LAYOUT',
      'SELECT'
    );
  }

  private updateSelectedObject(
    objectType: string,
    objects: any[] = [],
    updateFiltering = true
  ) {
    if (
      objects.length === 0 ||
      !this.selectedObject ||
      objectType !== this.selectedObject.objectType.toUpperCase()
    )
      return;
    updateFiltering &&
      (objects = objects
        .filter((x) => x.status === 'UPDATE')
        .map((x) => x.object));
    const updatedObject = objects.find((x) => x.id === this.selectedObject.id);
    updatedObject && (this.selectedObject = updatedObject);
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
    this.updateSelectedObject(
      'VEHICLE',
      [this.dataSvc.data.vehicles.find((v) => v.id === id)],
      false
    );
    this.trackIdSvc.update_vehicle_ids(data);
  }
  private applySegmentChange({ data }: IDataChangeEvent) {
    if (!this.viewer) return;
    const updated = this.dataSvc.getChangedSegments(data);
    this.viewer.update_segments(updated, false, false);
    this.updateSelectedObject('SEGMENT', updated, true);
  }
  private applySegmentDisabledChange({
    data,
    operation,
    id,
  }: IDataChangeEvent) {
    if (!this.viewer) return;
    this.viewer.update_disable_segment(data, operation, id);
    const selected_segment = this.viewer.get_selected_objects('SEGMENT')[0];
    if (selected_segment) {
      this.updateSelectedObject(
        'SEGMENT',
        [this.dataSvc.find_layout_object('SEGMENT', selected_segment.id)],
        false
      );
    }
  }
  private applyClusterChange({ data }: IDataChangeEvent) {
    if (!this.viewer) return;
    const updated = this.dataSvc.getChangedClusters(data);
    this.viewer.update_clusters(updated, false, false);
  }
  private applyGroupChange({ data }: IDataChangeEvent): void {
    if (!this.viewer) return;
    const updated = this.dataSvc.getChangedGroups(data);
    this.viewer.update_groups(updated, false, false);
  }
  private applyMtlChange({ data }: IDataChangeEvent): void {
    if (!this.viewer) return;
    const updated = this.dataSvc.getChangedMtls(data);
    this.viewer.update_mtls(updated, false, false);
    this.updateSelectedObject('MTL', updated, true);
  }
  private applyBufferChange({ data }: IDataChangeEvent): void {
    if (!this.viewer) return;
    const updated = this.dataSvc.getChangedBuffers(data);
    this.viewer.update_buffers(updated, false, false);
    this.updateSelectedObject('BUFFER', updated, true);
  }
  private applyStationChange({ data }: IDataChangeEvent): void {
    if (!this.viewer) return;
    const updated = this.dataSvc.getChangedStations(data);
    this.viewer.update_stations(updated, false, false);
    this.updateSelectedObject('STATION', updated, true);
  }
  private applyVehiclePathChange({ data }: IDataChangeEvent): void {
    if (!this.viewer) return;
    const updated = this.dataSvc.getChangedExpectedPaths(data);
    this.dataSvc.updateExpectedPath(updated);

    this.viewer.applyUpdatedExpectedPath();
  }
  private applySnapshotUpdated() {
    this.viewer.applyAfterSnapshotUpdated();
  }
  private applyPlaybackTrackUpdated(event: IPlaybackTrackChangeEvent) {
    const { table, skipRender, data, id, operation, useVehicleChangedProps } =
      event;
    if (table === 'segment_blocking_history') {
      this.viewer.update_disable_segment(data, operation, id, skipRender);
      if (!skipRender) {
        this.updateSelectedObject(
          'VEHICLE',
          [this.dataSvc.data.vehicles.find((v) => v.id === id)],
          false
        );
      }
    } else if (table === 'order_history') {
      // @TODO update table
    } else if (table === 'vehicle_history') {
      const updated = this.viewer.update_vehicles(
        [data],
        operation,
        id,
        skipRender
      );
      if (useVehicleChangedProps) {
        this.dataSvc.updateVehicleChangedProps(updated, id);
      }
      if (!skipRender) {
        const selected = this.viewer.get_selected_objects('SEGMENT')[0];
        selected &&
          this.updateSelectedObject(
            'SEGMENT',
            [this.dataSvc.find_layout_object('SEGMENT', selected.id)],
            false
          );
      }
      this.trackIdSvc.update_vehicle_ids(data);
      // @TODO update table
    }
  }
  private applyAfterPlaybackTrackUpdated() {
    this.viewer.applyAfterSnapshotUpdated(this.dataSvc.updatedVehicleList);
    this.viewer.update_segment_svg(
      this.dataSvc.get_layout_objects('SEGMENT'),
      main_css.segment,
      null,
      false
    );
    // this.dataSvc.updatedVehicleList = {};
  }
}
