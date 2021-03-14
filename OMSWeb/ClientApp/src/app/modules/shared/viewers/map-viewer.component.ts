import { Component, NgZone, OnInit } from '@angular/core';
import * as _ from 'lodash';
// import * as d3 from 'd3';
// import { Selection } from 'd3-selection';

import { ViewModes } from '../../../models/enums';
import { StatusService } from '../../../services/status.service';
import { ViewController } from './viewer-helper';
import { TrackIdService } from '../../../services/track-id.service';
import { Dto } from '../../../models/dto/track.model';

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
    `,
  ],
})
export class MapViewerComponent implements OnInit {
  omsData: Dto.ITrackData;

  constructor(
    private statusSvc: StatusService,
    private trackIdSvc: TrackIdService
  ) {}

  ngOnInit(): void {
    this.statusSvc.getTrack().subscribe((res) => {
      console.info('## track info >>', res);
      this.omsData = res;
      this.drawMap();
    });
  }

  private drawMap() {
    const viewer = new ViewController(
      ViewModes.public,
      'track-canvas',
      'minimap'
    );

    viewer.setup();
    viewer.create_track(this.omsData);
    viewer.update_vehicles(this.omsData.vehicles, 'INSERT', null, false);
    this.trackIdSvc.extract_id_from_track(viewer.layoutData);
  }
}
