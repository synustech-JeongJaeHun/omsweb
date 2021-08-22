import { Component, OnInit } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import { Observable } from 'rxjs';
import { Dto } from '../../../models/dto/track.model';
import { SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'oms-station-setting',
  templateUrl: './station-setting.component.html',
  styleUrls: ['./station-setting.component.scss'],
})
export class StationSettingComponent implements OnInit {
  dataSource: DataSource;
  //dataSource$: Observable<Dto.IStation[]>;

  constructor(private settingSvc: SettingsService) {
    // this.dataSource = [
    //   {
    //     id: 1,
    //     onlineName: 'station-1',
    //     maxRetrySec: 60,
    //     retryIntervalSec: 5,
    //     unuse: false,
    //   },
    //   {
    //     id: 2,
    //     onlineName: 'station-2',
    //     maxRetrySec: 60,
    //     retryIntervalSec: 5,
    //     unuse: true,
    //   },
    //   {
    //     id: 3,
    //     onlineName: 'station-3',
    //     maxRetrySec: 60,
    //     retryIntervalSec: 5,
    //     unuse: false,
    //   },
    // ];

    //this.dataSource$ = this.trackSvc.loadStations();
    this.dataSource = this.settingSvc.settingsStationsDataSource();
  }

  ngOnInit(): void {}

  onUpdateRow(event) {}
}
