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

  constructor(
    private router: Router,
    private auth: AuthService,
    private hubSvc: HubService,
    private statusService: StatusService
    // private messageSvc: MessagesService,
    // private settingSvc: SettingsService,
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

    this.viewer.setViewMode(this.viewMode)
    this.viewer.setPreference(this.preference)
    // @ts-ignore
    this.viewer.setTrack({ ...this.trackData, segmentParts: this.trackData.segments, clusters: this.trackData.clusters.map(c => ({ ...c, segments: c.segments.split(',').map(id => parseInt(id.trim())) })) })
    this.attachEvents()
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private attachEvents() {
    if ([ViewModes.public, ViewModes.viewer].includes(this.viewMode)) {
      this.hubSvc.connectionChanged$
        .pipe(takeUntil(this.destroy$))
        .subscribe((conn) => {
          // TODO
          this.statusService.getVehicles().subscribe((res) => {

            console.log("connection update", conn, res)
            if (res?.vehicles) {
              res.vehicles.forEach(v =>
                // @ts-ignore
                this.viewer.updateVehicle('UPDATE', v)
              )
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
          console.log("segment update", e)
        });
      this.hubSvc.segmentDisabledChanged$
        .pipe(takeUntil(this.destroy$))
        .subscribe((e: IDataChangeEvent) => {
          console.log("segment disabled update", e)
        });
      this.hubSvc.clusterChanged$
        .pipe(takeUntil(this.destroy$))
        .subscribe((e: IDataChangeEvent) => {
          console.log("cluster update", e)

        });

      if (this.auth.isAuthenticated) {
        this.hubSvc.vehiclePathChanged$
          .pipe(takeUntil(this.destroy$))
          .subscribe((e: IDataChangeEvent) => {
            console.log("vehicle path update", e)

          });

        this.hubSvc.stationChanged$
          .pipe(takeUntil(this.destroy$))
          .subscribe((e) => {
            console.log("station update", e)
          })

        this.hubSvc.groupChanged$
          .pipe(takeUntil(this.destroy$))
          .subscribe((e) => console.log("group update", e));

        this.hubSvc.zcuChanged$
          .pipe(takeUntil(this.destroy$))
          .subscribe((e) => console.log("zcu update", e));


        this.hubSvc.bufferChanged$
          .pipe(takeUntil(this.destroy$))
          .subscribe((e) => {
            console.log("buffer update", e)
          });

        this.hubSvc.mtlChanged$
          .pipe(takeUntil(this.destroy$))
          .subscribe((e) => {
            console.log("mtl update", e)
          });

        this.hubSvc.groupChanged$
          .pipe(takeUntil(this.destroy$))
          .subscribe((e) => {
            console.log("group update", e)
          });
      }
    }
  }

  // EPIC > OMS-TRACK-MONITOR
  public omsTrackMonitorSize = {
    width: window.innerWidth,
    height: window.innerHeight - 40
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
  public onRotate(event: CustomEvent) {
    console.log(event.type, getCustomEventPayload(event))
  }

  @HostListener('window:resize', ['$event.target'])
  onResize(window: Window) {
    this.omsTrackMonitorSize = {
      width: window.innerWidth,
      height: window.innerHeight - 40
    }
  }
}


function getCustomEventPayload<T>(event: CustomEvent<T[]>) {
  return event.detail[0]
}
