import { Component } from '@angular/core';
import { TrackMonitorSettingService } from '@oms/root/services/track-monitor-setting.service';
import { main_css } from '../utils/css-loader';

@Component({
  selector: 'oms-legend-dialog',
  templateUrl: './legend-dialog.component.html',
  styleUrls: ['./legend-dialog.component.scss'],
})
export class LegendDialogComponent {
  main_css = main_css;

  get setting() {
    return this.trackMonitorSettingService.trackSetting;
  }

  get vehicleSecondaryContent() {
    return this.trackMonitorSettingService.trackSetting.vehicleSecondaryContent === 'order' 
      ? "order_id"
      : "carrier_id"
  }

  constructor(private trackMonitorSettingService: TrackMonitorSettingService) {}
}
