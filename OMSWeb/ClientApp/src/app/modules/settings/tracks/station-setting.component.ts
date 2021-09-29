import { Component, OnInit } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { MessagesService } from '../../../services/messages.service';
import { SettingsService } from '../../../services/settings.service';
import { ISettingsStationWithUnuse } from '../../../models/settings.model';

@Component({
  selector: 'oms-station-setting',
  templateUrl: './station-setting.component.html',
  styleUrls: ['./station-setting.component.scss'],
})
export class StationSettingComponent implements OnInit {
  private _changedItems: any[] = [];

  dataSource: ISettingsStationWithUnuse[];

  selectedIds: number[] = [];

  get isUpdated(): boolean {
    return this._changedItems.length > 0;
  }

  constructor(
    private settingsSvc: SettingsService,
    private messageSvc: MessagesService
  ) {
    this.settingsSvc.settingsStations().subscribe((res) => {
      this.dataSource = res;
    });
  }

  ngOnInit(): void {
    this.init();
  }

  private init() {
  }

  onUpdateRow(e) {
    const { data, key } = e;
    if (this._changedItems.some((c) => c.id === key)) {
      let station = this._changedItems.find((u) => u.id === key);
      station.unUse = data.unUse;
    } else {
      let station = data;
      this._changedItems.push(station);
      this.selectedIds.push(station.id);
    }
  }

  onSelectionChanged(e) {
    //e.selectedRowKeys[0];
    //this.selectedIds.push(e.selectedRowKeys[0]);
    //this.selectedIds = this.selectedIds.filter((x) => x !== undefined);
  }

  onSave(grid) {
    const jobs: Observable<void>[] = [];
    //this._changedItems.length &&
    //  jobs.push(this.onUseUnuse(this._changedItems));
    if (this._changedItems.length > 0)
      this.onUseUnuse(this._changedItems);

    jobs.length &&
      forkJoin(jobs).subscribe(() => {
        this._changedItems = [];
        grid.instance.refresh();

        //this.settingsSvc.settingsStations().subscribe((res) => {
        //  this.dataSource = res;
        //});
      });
  }

  onRevert(grid) {
    this.selectedIds = [];
    this._changedItems = [];
    grid.instance.refresh();

    this.settingsSvc.settingsStations().subscribe((res) => {
      this.dataSource = res;
    });
  }

  onUseUnuse(items: any[]): Observable<void> {
    let useStationIds: number[] = [];
    let unUseStationIds: number[] = [];

    for (let idx = 0; idx < items.length; idx++) {
      if (items[idx].unUse)
        unUseStationIds.push(items[idx].id);
      else
        useStationIds.push(items[idx].id);
    }

    if (useStationIds.length > 0)
      this.messageSvc
        .sendStationUseCommand({ type: 'STATION', action: 'use-station' }, useStationIds)
        .subscribe();

    if (unUseStationIds.length > 0)
      this.messageSvc
        .sendStationUseCommand({ type: 'STATION', action: 'unuse-station' }, unUseStationIds)
        .subscribe();

    return;
  }
}
