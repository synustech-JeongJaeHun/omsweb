import { Component, OnInit } from '@angular/core';
import {SettingsService} from "@oms/services/settings.service";
import {TrackMonitorSettingService} from "@oms/services/track-monitor-setting.service";

@Component({
  selector: 'oms-monitor',
  templateUrl: './monitor.component.html',
  styles: [
    `
    :host {
      /* height: 100%; */
      /* display: flex; */
    }
    `
  ]
})
export class MonitorComponent implements OnInit {

  constructor(
    private settingSvc: SettingsService,
    public trackSettingService: TrackMonitorSettingService,
  ) {
    this.settingSvc.serviceConfig.subscribe((config) => {
      if(!config.backdrop){
        this.trackSettingService.update({
          key: 'isBackdropVisible',
          value: false
        })
      }
    })
  }

  ngOnInit(): void {
  }

}
