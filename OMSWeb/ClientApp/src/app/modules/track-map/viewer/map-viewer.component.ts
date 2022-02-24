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
import d3 = require('d3');

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
  public isMinimapVisible = true;

  public viewerSetting = {
    rect: {
      width: window.innerWidth,
      height: window.innerHeight - 40,
    },
    scale: {
      vehicleSize: 10,
      segmentWidth: 5,
      segmentDirectionSize: 10
    },
    rotation: 0,
    visible: {
      isMinimapVisible: true,
      isVehicleLineVisible: true,
      isSegmentDirectionVisible: true,
      isPointLabelVisible: true,
      isStationVisible: true,
      isBufferVisible: true,
      isGroupVisible: true,
      isClusterVisible: true,
      isOverlappingObjectsVisible: true
    }
  }

  public selectedObject: any;


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
        if (event.type === 'minimap') {
          this.isMinimapVisible = event.value;
        } else if (event.type === 'itemDetails') {
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

  public onToggleMinimap() {
    this.viewerSetting.visible.isMinimapVisible = !this.viewerSetting.visible.isMinimapVisible
  }

  public onScaleChanged(event: {
    type: "Vehicle" | "SegmentWidth" | "SegmentDirection";
    value: number;
  }) {
    switch (event.type) {
      case 'Vehicle':
        this.viewerSetting.scale.vehicleSize = event.value
        break;
      case 'SegmentDirection':
        this.viewerSetting.scale.segmentDirectionSize = event.value
        break;
      case 'SegmentWidth':
        this.viewerSetting.scale.segmentWidth = event.value
        break;

      default:
        break;
    }
  }

  public onRotationChanged(event: number) {
    this.viewerSetting.rotation = event
  }

  public onVisibleChanged(event: {
    type: "VehicleLine" | "SegmentDirection" | "PointLabel" | "Station" | "Buffer" | "Group" | "Cluster" | "OverlappingObjects",
    value: boolean
  }) {
    switch (event.type) {
      case 'VehicleLine':
        this.viewerSetting.visible.isVehicleLineVisible = event.value
        break;
      case 'SegmentDirection':
        this.viewerSetting.visible.isSegmentDirectionVisible = event.value
        break;
      case 'PointLabel':
        this.viewerSetting.visible.isPointLabelVisible = event.value
        break;
      case 'Station':
        this.viewerSetting.visible.isStationVisible = event.value
        break;
      case 'Buffer':
        this.viewerSetting.visible.isBufferVisible = event.value
        break;
      case 'Group':
        this.viewerSetting.visible.isGroupVisible = event.value
        break;
      case 'Cluster':
        this.viewerSetting.visible.isClusterVisible = event.value
        break;
      case 'OverlappingObjects':
        this.viewerSetting.visible.isOverlappingObjectsVisible = event.value
        break;

      default:
        break;
    }
  }

  public onTooltipOn(event: CustomEvent) {
    console.log(event.type, getCustomEventPayload(event))
  }
  public onTooltipOff(event: CustomEvent) {
    console.log(event.type)
  }
  public onFocus(event: CustomEvent) {
    console.log(event.type, getCustomEventPayload(event))
  }
  public onContectMenuOn(event: CustomEvent) {
    console.log(event.type, getCustomEventPayload(event))
  }
  public onBackdrop(event: CustomEvent) {
    console.log(event.type)
  }
  public getCameraAndRotation() {
    const data = this.viewer.getCameraAndRotation()
    console.log(data)
  }

}

function getCustomEventPayload<T>(event: CustomEvent<T[]>) {
  return event.detail[0]
}
