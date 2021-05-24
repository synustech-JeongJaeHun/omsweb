import { AfterViewInit, Component, OnInit } from '@angular/core';

import { SettingsService } from '@oms/services/settings.service';
import { Dto } from '../../../models/dto/track.model';
import { ViewModes } from '../../../models/enums';
import { IPreferences } from '../../../models/settings.model';
import { AuthService } from '../../../services/auth.service';
import { StatusService } from '../../../services/status.service';
import { MapDataService } from '../../track-map/map-data.service';

@Component({
  selector: 'oms-monitor-status',
  templateUrl: './monitor-status.component.html',
  styles: [
    `
      :host {
        background-color: var(--monitor-background-color);
        display: block;
        position: relative;
        z-index: 3;
        width: 100%;
        height: 100%;
        /* display: grid;
        grid-template-columns: 56px 1fr;
        column-gap: 20px;
        height: 100%; */
      }

      #status-control {
        position: absolute;
        /* border-radius: 5px; */
        box-shadow: 0px 0px 5px #aaa;
        display: inline-block;
        flex-direction: column;
        /* background: #77919d; */
        bottom: 0px;
        left: 0px;
        /* overflow: auto; */
        z-index: 10;
        width: 100%;
        /* height: 300px; */
        /* opacity: 0.9; */
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
export class MonitorStatusComponent implements OnInit, AfterViewInit {
  loadingState = true;
  ready = false;
  mapPreference: IPreferences;
  viewMode: ViewModes;
  trackData: Dto.ITrackData;

  // showControlTable = false;
  get showControlTable(): boolean {
    return this.mapPreference.toggles.controlTable;
  }

  constructor(
    private settingSvc: SettingsService,
    private auth: AuthService,
    private statusSvc: StatusService,
    private dataSvc: MapDataService
  ) {
    this.viewMode = this.auth.isAuthenticated
      ? ViewModes.viewer
      : ViewModes.public;
  }
  ngAfterViewInit(): void {
    this.statusSvc.getTrack().subscribe((res) => {
      // this.dataSvc.trackDataUpdated$.next(res);
      this.trackData = res;
      this.loadingState = false;
      this.ready = true;
    });
  }

  ngOnInit(): void {
    this.mapPreference = this.settingSvc.globalPreferences;

    // @TODO loading preference
    // this.mapPreference = {
    //   toggles: defaultToggleOptions,
    // };
  }

  onReady(ready: boolean) {}
}
