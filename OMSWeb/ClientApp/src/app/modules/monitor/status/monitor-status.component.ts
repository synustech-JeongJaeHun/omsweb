import { Component, OnInit } from '@angular/core';

import { SettingsService } from '@oms/services/settings.service';
import { IPreferences } from '../../../models/settings.model';

@Component({
  selector: 'oms-monitor-status',
  templateUrl: './monitor-status.component.html',
  styles: [
    `
      :host {
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
        overflow-x: hidden;
        overflow-y: hidden;
        position: absolute;
        /* border-radius: 5px; */
        box-shadow: 3px 3px 15px #7f7f7f;
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
    `,
  ],
})
export class MonitorStatusComponent implements OnInit {
  mapPreference: IPreferences;

  // showControlTable = false;
  get showControlTable(): boolean {
    return this.mapPreference.toggles.controlTable;
  }

  constructor(private settingSvc: SettingsService) {}

  ngOnInit(): void {
    this.mapPreference = this.settingSvc.globalPreferences;
    // @TODO loading preference
    // this.mapPreference = {
    //   toggles: defaultToggleOptions,
    // };
  }
}
