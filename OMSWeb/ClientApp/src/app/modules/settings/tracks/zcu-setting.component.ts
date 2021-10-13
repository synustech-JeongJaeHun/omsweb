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
    { type: 0, text: 'Not Use' },
    { type: 1, text: 'Use HW' },
    { type: 2, text: 'Use SW' },
  ];

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
      this.onUsingType(this._changedItems);

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

  onUsingType(items: any[]): Observable<void> {
    //for (let idx = 0; idx < items.length; idx++) {
    //  let zcuId = items[idx].id;
    //  let zcuUsingType = ((items[idx].usingType == 0) ? "none" : ((items[idx].usingType == 1) ? "hw" : ((items[idx].usingType == 2) ? "sw" : "none")));
    //  this.messageSvc
    //    .sendZcuUsingTypeCommand({ type: 'ZCU', action: 'zcu_using_type', zcuId: zcuId, zcuUsingType: zcuUsingType })
    //    .subscribe();
    //}
    let noneUsingZcus: number[] = [];
    let hwUsingZcus: number[] = [];
    let swUsingZcus: number[] = [];

    for (let idx = 0; idx < items.length; idx++) {
      if (items[idx].usingType == 0)
        noneUsingZcus.push(items[idx].id);
      else if (items[idx].usingType == 1)
        hwUsingZcus.push(items[idx].id);
      else if (items[idx].usingType == 2)
        swUsingZcus.push(items[idx].id);
    }

    if (noneUsingZcus.length > 0)
      this.messageSvc
        .sendZcusUsingTypeCommand({ type: 'ZCU', action: 'zcu_using_type', zcuIds: noneUsingZcus, zcuUsingType: 'none' })
        .subscribe();

    if (hwUsingZcus.length > 0)
      this.messageSvc
        .sendZcusUsingTypeCommand({ type: 'ZCU', action: 'zcu_using_type', zcuIds: hwUsingZcus, zcuUsingType: 'hw' })
        .subscribe();

    if (swUsingZcus.length > 0)
      this.messageSvc
        .sendZcusUsingTypeCommand({ type: 'ZCU', action: 'zcu_using_type', zcuIds: swUsingZcus, zcuUsingType: 'sw' })
        .subscribe();

    return;
  }
}
