import { Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';
// import * as d3 from 'd3';
// import { Selection } from 'd3-selection';

import { MapToolbarStatusKeys, ViewModes } from '../../../models/enums';
import { StatusService } from '../../../services/status.service';
import { ViewController } from './viewer-helper';
import { TrackIdService } from '../../../services/track-id.service';
import { Dto } from '../../../models/dto/track.model';
import { MapStatesService } from '../map-states.service';
import { Subscription } from 'rxjs';
import { IMapPreferences } from '../../../models/drawing.model';
import { SearchDialogComponent } from '../dialogs/search-dialog.component';
import { MapDataService } from '../map-data.service';

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
  private toolbarToggleEvent$: Subscription;
  private toolbarCommandEvent$: Subscription;
  //#endregion

  get showMinimap(): boolean {
    return this._minimapVisible;
  }

  constructor(
    private dataSvc: MapDataService,
    private statusSvc: StatusService,
    private trackIdSvc: TrackIdService,
    private statesSvc: MapStatesService,
    private dialog: MatDialog
  ) {}

  ngOnDestroy(): void {
    this.toolbarToggleEvent$ && this.toolbarToggleEvent$.unsubscribe();
    this.toolbarCommandEvent$ && this.toolbarCommandEvent$.unsubscribe();
    this.viewer && this.viewer.destroy();
  }

  ngOnInit(): void {
    this.loadingState = true;
    this.statusSvc.getTrack().subscribe((res) => {
      console.info('## track info >>', res);
      this.omsData = res;
      this._minimapVisible = this.preference.visibilities.minimap;
      this.drawMap();
      this.loadingState = false;
    });
    this.toolbarToggleEvent$ = this.statesSvc.toolbarStates$.subscribe(
      (event) => {
        if (event.type === 'minimap') {
          this._minimapVisible = event.value;
        } else {
          this.viewer.onChangeVisibility(event);
        }
      }
    );
    this.toolbarCommandEvent$ = this.statesSvc.toolbarCommandStates$.subscribe(
      (event) => {
        this.viewer.onCommandAction(event);
      }
    );
  }

  onSearch() {
    const dlg = this.dialog.open(SearchDialogComponent, {
      width: '300px',
      hasBackdrop: false,
      disableClose: true,
      position: { left: '40px', top: '108px' },
    });

    dlg.afterClosed().subscribe((payload: any) => {
      if (!payload || !payload.type || !payload.value) return;
      this.viewer.onCommandAction({ type: 'search', value: payload });
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
    this.trackIdSvc.extract_id_from_track(this.viewer.layoutData);
  }
}
