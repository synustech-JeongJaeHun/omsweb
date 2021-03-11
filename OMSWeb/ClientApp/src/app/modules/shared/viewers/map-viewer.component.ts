import { Component, NgZone, OnInit } from '@angular/core';
import * as _ from 'lodash';
import * as $ from 'jquery';
// import * as d3 from 'd3';
// import { Selection } from 'd3-selection';

import { ViewModes } from '../../../models/enums';
import { StatusService } from '../../../services/status.service';
import { ViewController } from './viewer-helper';

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
    `,
  ],
})
export class MapViewerComponent implements OnInit {
  omsData: any;

  constructor(private statusSvc: StatusService) {}

  ngOnInit(): void {
    this.statusSvc.getTrack().subscribe((res) => {
      console.info('## track info >>', res);
      this.omsData = res;
      this.drawMap();
    });
  }

  private drawMap() {

    console.info('# jquery test >>', $('#track-canvas'));
    const viewer = new ViewController(
      ViewModes.public,
      'track-canvas',
      'minimap'
    );

    viewer.setup();
    viewer.create_track(this.omsData);
    viewer.update_vehicles(this.omsData.vehicles, 'INSERT', null, false);
  }
}
