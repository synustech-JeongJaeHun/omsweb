import { Component, OnInit } from '@angular/core';
import {
  defaultMapVisibilityOptions,
  IMapPreferences,
} from '../../../models/drawing.model';

@Component({
  selector: 'oms-monitor-status',
  templateUrl: './monitor-status.component.html',
  styles: [
    `
      :host {
        position: relative;
        z-index: 3;
        /* display: grid;
        grid-template-columns: 56px 1fr;
        column-gap: 20px;
        height: 100%; */
      }
    `,
  ],
})
export class MonitorStatusComponent implements OnInit {
  mapPreference: IMapPreferences;

  constructor() {}

  ngOnInit(): void {

    // @TODO loading preference
    this.mapPreference = {
      visibilities: defaultMapVisibilityOptions,
    };
  }
}
