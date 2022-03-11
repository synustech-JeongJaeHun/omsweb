import {
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ViewModes } from '../../../models/enums';
import { Dto } from '../../../models/dto/track.model';
import { IPreferences } from '../../../models/settings.model';
import { HubService } from '../../../services/hub.service';
import { IDataChangeEvent } from '../../../models/notification.model';
import { AuthService } from '../../../services/auth.service';

import "oms-track-monitor"
import { OmsTrackMonitorElement, IOmsTrackMonitor } from "oms-track-monitor"
import { StatusService } from '@oms/root/services/status.service';
import { MapStatesService } from '../map-states.service';
import { SettingsService } from '@oms/root/services/settings.service';
import { TrackStatusService } from '../../../services/track-status.service'
import { TrackMonitorSettingService } from '../../../services/track-monitor-setting.service'
import d3 = require('d3');

@Component({
  selector: 'oms-map-viewer',
  templateUrl: './map-viewer.component.html',
  styleUrls: ['./map-viewer.component.scss'],
})
export class MapViewerComponent implements OnInit, OnDestroy {
  @Input() preference: IPreferences;
  @Input() viewMode: ViewModes;
  @Input() trackData: Dto.ITrackData;

  private viewer: IOmsTrackMonitor;
  private destroy$: Subject<void> = new Subject<void>();
  public detailsVisible = false;

  get tmSetting() {
    return this.trackMonitorSettingService.trackSetting
  }

  public viewerSetting = {
    rect: {
      width: window.innerWidth,
      height: window.innerHeight - 40,
    }
  }

  public selectedObject: any;
  public tooltipObject: { type: string, value: any } | undefined;
  public showTooltip = false


  get activeDetails(): boolean {
    return this.detailsVisible && this.auth.isAuthenticated;
  }
  get showToolbarText(): boolean {
    return this.settingSvc.globalPreferences.toggles.showToolName;
  }

  constructor(
    private router: Router,
    private auth: AuthService,
    private hubSvc: HubService,
    private statusService: StatusService,
    private mapStatesService: MapStatesService,
    private settingSvc: SettingsService,
    private trackStatusService: TrackStatusService,
    private trackMonitorSettingService: TrackMonitorSettingService,
    // private messageSvc: MessagesService,
    // private dialogSvc: DialogService,
    // private $t: TranslateService
  ) {
    this.auth.certUpdated$.pipe(takeUntil(this.destroy$)).subscribe((cert) => {
      this.router.navigateByUrl('/', { skipLocationChange: false }).then(() => {
        this.router.navigate([cert ? '/monitor/status' : '/']);
      });
    });
  }
  ngOnInit(): void {
    // @ts-ignore
    this.viewer = document.getElementById('track-canvas')._instance.exposed
    this.viewer.setPreference(this.preference)
    // @ts-ignore
    this.viewer.setTrack({ ...this.trackData, segmentParts: this.trackData.segments, clusters: this.trackData.clusters.map(c => ({ ...c, segments: c.segments.split(',').map(id => parseInt(id.trim())) })) })
    this.attachEvents()
    this.attachHubEvents()
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private attachEvents() {
    this.mapStatesService.toolbarToggleEvent$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        if (event.type === 'itemDetails') {
          this.detailsVisible = event.value;
        } else if (event.type === 'controlTable') {
          // setTimeout(() => {
          //   this.viewer.adjust_floaters();
          // }, 100);
        } else {
          // this.viewer?.onChangeVisibility(event);
        }
      });
    this.mapStatesService.toolbarCommandEvent$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        // this.viewer.onCommandAction(event);
      });
    this.mapStatesService.configChangeEvent$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        // this.viewer.onChangeConfig(event);
      });

    this.mapStatesService.actionState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        // this.onMapMouseEvent(event)
      });

    this.mapStatesService.statusTableResizeEvent$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // this.viewer.adjust_floaters();
      });
  }
  private attachHubEvents() {
    if ([ViewModes.public, ViewModes.viewer].includes(this.viewMode)) {
      this.hubSvc.connectionChanged$
        .pipe(takeUntil(this.destroy$))
        .subscribe((conn) => {
          this.statusService.getVehicles().subscribe((res) => {
            console.log("connection update", conn, res)
            if (conn && res?.vehicles) {
              res.vehicles.forEach(v => this.viewer.updateVehicle('UPDATE', v))
            }
          })
        });
      this.hubSvc.vehicleChanged$
        .pipe(takeUntil(this.destroy$))
        .subscribe((e: IDataChangeEvent) => {
          // @ts-ignore
          this.viewer.updateVehicle(e.operation, e.data)
        });
      this.hubSvc.segmentChanged$
        .pipe(takeUntil(this.destroy$))
        .subscribe((e: IDataChangeEvent) => {
          // TODO what happened on event?
          console.log("segment update", e)
        });
      this.hubSvc.segmentDisabledChanged$
        .pipe(takeUntil(this.destroy$))
        .subscribe((e: IDataChangeEvent) => {
          this.viewer.updateSegmentDisabled(e.operation, {
            id: e.id,
            operation: e.operation,
            data: e.data
          })
        });
      this.hubSvc.clusterChanged$
        .pipe(takeUntil(this.destroy$))
        .subscribe((e: IDataChangeEvent) => {
          // TODO what happened on event?
          console.log("cluster update", e)
        });

      this.hubSvc.zcuMapChanged$
        .pipe(takeUntil(this.destroy$))
        .subscribe((e) => {
          this.viewer.updateZcu(e.operation, e.data)
        });

      if (this.auth.isAuthenticated) {
        this.hubSvc.vehiclePathChanged$
          .pipe(takeUntil(this.destroy$))
          .subscribe((e: IDataChangeEvent) => {
            // TODO what happened on event?
            console.log("vehicle path update", e)
          });

        this.hubSvc.stationChanged$
          .pipe(takeUntil(this.destroy$))
          .subscribe((e) => {
            // TODO what happened on event?
            console.log("station update", e)
          })

        this.hubSvc.groupChanged$
          .pipe(takeUntil(this.destroy$))
          .subscribe((e) => {
            // TODO what happened on event?
            console.log("group update", e)
          });

        this.hubSvc.bufferChanged$
          .pipe(takeUntil(this.destroy$))
          .subscribe((e) => {
            // TODO what happened on event?
            console.log("buffer update", e)
          });

        this.hubSvc.mtlChanged$
          .pipe(takeUntil(this.destroy$))
          .subscribe((e) => {
            // TODO what happened on event?
            console.log("mtl update", e)
          });

        this.hubSvc.groupChanged$
          .pipe(takeUntil(this.destroy$))
          .subscribe((e) => {
            // TODO what happened on event?
            console.log("group update", e)
          });
      }
    }
  }

  changeFocus(event: any) {
    this.selectedObject = event
    // @ts-ignore
    this.focusOnTM({ type: event.objectType, id: event.id })
  }

  // EPIC > OMS-TRACK-MONITOR
  @HostListener('window:resize', ['$event.target'])
  onResize(window: Window) {
    this.viewerSetting.rect.width = window.innerWidth
    this.viewerSetting.rect.height = window.innerHeight - 40
  }

  public onCenterZoom() {
    this.viewer.centerZoom();
    this.getCameraAndRotation();
  }

  public findOnTM(event: { type: string, id: any }) {
    this.viewer.find(event.type, event.id)
  }
  public focusOnTM(event: { type: string, id: any }) {
    this.viewer.focus(event.type, event.id)
  }

  public trackOnTM(event: { type: string, id: any }) {
    this.viewer.track(event.type, event.id)
  }

  public onTooltipOn(event: CustomEvent) {
    // console.log(event.type, getCustomEventPayload(event))
    const payload = getCustomEventPayload(event)

    // @ts-ignore
    if (!(payload.type && payload.value && payload.event)) return

    // @ts-ignore
    this.tooltipObject = { type: payload.type, value: payload.value }


    if (this.tooltipObject.type === 'SEGMENT') {
      const { startPoint, endPoint } = this.tooltipObject.value;
      this.tooltipObject.value.point =
        startPoint && endPoint ? `${startPoint} → ${endPoint}` : null;
    }

    // @ts-ignore
    const { pageX: x, pageY: y } = payload.event;

    const leftThreshold = window.innerWidth - 200;
    const popupOffsetX = 10;
    const popupOffsetY = 40;

    const container = d3
      .select('#tooltipView')
      .style('top', `${y - popupOffsetY}px`);

    if (leftThreshold > x) {
      container
        .style('left', `${x + popupOffsetX}px`)
        .style('right', 'inherit');
    } else {
      container
        .style('right', `${window.innerWidth - x + popupOffsetX}px`)
        .style('left', 'inherit');
    }



    this.showTooltip = true
  }
  public onTooltipOff(event: CustomEvent) {
    this.showTooltip = false
    this.tooltipObject = undefined
  }
  public onFocus(event: CustomEvent) {
    const payload = getCustomEventPayload(event)
    // @ts-ignore
    this.selectedObject = { objectType: payload.type, ...payload.value }
    // @ts-ignore
    this.focusOnTM({ type: payload.type, id: payload.value.id })
  }
  public onContectMenuOn(event: CustomEvent) {
    console.log(event.type, getCustomEventPayload(event))
  }
  public onBackdrop(event: CustomEvent) {
    this.selectedObject = undefined
    this.viewer.dropFocus()
    this.viewer.stopTrack()
  }
  public getCameraAndRotation() {
    // const data = this.viewer.getCameraAndRotation()
    // console.log(data)
  }

}

function getCustomEventPayload<T>(event: CustomEvent<T[]>) {
  return event.detail[0]
}
