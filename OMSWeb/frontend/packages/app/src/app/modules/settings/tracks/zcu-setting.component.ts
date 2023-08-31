import DataSource from 'devextreme/data/data_source'
import { Component, OnInit } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { MessagesService } from '../../../services/messages.service';
import { SettingsService } from '../../../services/settings.service';
import { ISettingsZcu } from '../../../models/settings.model';

@Component({
  selector: 'oms-zcu-setting',
  templateUrl: './zcu-setting.component.html',
  styleUrls: ['./zcu-setting.component.scss'],
})
export class ZcuSettingComponent implements OnInit {
  private _changedItems: any[] = [];

  dataSource: ISettingsZcu[];

  selectedIds: number[] = [];

  zcuTypes = [
    { type: 0, text: 'Standard' },
    { type: 1, text: 'NType' },
  ]

  zcuUsingTypes = [
   // { type: 0, text: 'Not Use' },
    { type: 1, text: 'Use HW' },
    { type: 2, text: 'Use SW' },
  ];

  disableHWZCU=false

  get isUpdated(): boolean {
    return this._changedItems.length > 0;
  }

  constructor(
    private settingsSvc: SettingsService,
    private messageSvc: MessagesService
  ) {
    this.settingsSvc.settingsZcus().subscribe((res) => {
      this.dataSource = res;
    });

    this.settingsSvc.serviceConfig.subscribe(
      (config) => {
        this.disableHWZCU = config?.disableHWZCU
      })
  }

  ngOnInit(): void {
    this.init();
  }

  private init() {
  }

  onUpdateRow(e) {
    const { data, key } = e;
    if (this._changedItems.some((c) => c.id === key)) {
      let zcu = this._changedItems.find((u) => u.id === key);
      zcu.usingType = data.usingType;
    } else {
      let zcu = data;
      this._changedItems.push(zcu);
      this.selectedIds.push(zcu.id);
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
    //  jobs.push(this.settingsSvc.sendZcuUseUnuseMessage(this._changedItems));
    if (this._changedItems.length > 0)
      this.onSettingZcu(this._changedItems);

    jobs.length &&
      forkJoin(jobs).subscribe(() => {
        this._changedItems = [];
        grid.instance.refresh();

        //this.settingsSvc.settingsZcus().subscribe((res) => {
        //  this.dataSource = res;
        //});
      });
  }

  onRevert(grid) {
    this.selectedIds = [];
    this._changedItems = [];
    grid.instance.refresh();

    this.settingsSvc.settingsZcus().subscribe((res) => {
      this.dataSource = res;
    });
  }

  onSettingZcu(items: any[]): Observable<void> {
    const noneUsingZcus = items.filter(item => item.usingType == 0).map(item => parseInt(item.id))
    const hwUsingZcus = items.filter(item => item.usingType == 1).map(item => parseInt(item.id))
    const swUsingZcus = items.filter(item => item.usingType == 2).map(item => parseInt(item.id))


    if (noneUsingZcus.length > 0)
      this.messageSvc
        .sendSettingZcuCommand({ type: 'ZCU', action: 'zcu-setting', zcuIds: noneUsingZcus, zcuUsingType: 'none' })
        .subscribe();

    if (hwUsingZcus.length > 0)
      this.messageSvc
        .sendSettingZcuCommand({ type: 'ZCU', action: 'zcu-setting', zcuIds: hwUsingZcus, zcuUsingType: 'hw' })
        .subscribe();

    if (swUsingZcus.length > 0)
      this.messageSvc
        .sendSettingZcuCommand({ type: 'ZCU', action: 'zcu-setting', zcuIds: swUsingZcus, zcuUsingType: 'sw' })
        .subscribe();

    return;
  }
}
