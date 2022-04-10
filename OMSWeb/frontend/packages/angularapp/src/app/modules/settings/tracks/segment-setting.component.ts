import { Component, OnDestroy, OnInit } from '@angular/core';
import { DxValidatorModule, DxTextBoxModule } from 'devextreme-angular';
import { forkJoin, Observable, of } from 'rxjs';
import { MessagesService } from '../../../services/messages.service';
import { SettingsService } from '../../../services/settings.service';
import { ISettingsSegment, ISettingsSegmentWithVParts, ISettingsSegmentWithVPartsNBlocking } from '../../../models/settings.model';

@Component({
  selector: 'oms-segment-setting',
  templateUrl: './segment-setting.component.html',
  styleUrls: ['./segment-setting.component.scss'],
})
export class SegmentSettingComponent implements OnInit {
  private _changedItems: any[] = [];

  dataSource: ISettingsSegmentWithVPartsNBlocking[];

  selectedIds: number[] = [];

  get isUpdated(): boolean {
    return this._changedItems.length > 0;
  }

  constructor(
    private settingsSvc: SettingsService,
    private messageSvc: MessagesService
  ) {
    this.settingsSvc.settingsSegments().subscribe((res) => {
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
      let segment = this._changedItems.find((u) => u.id === key);
      segment.unUse = data.unUse;
    } else {
      let segment = data;
      this._changedItems.push(segment);
      this.selectedIds.push(segment.id);
    }
  }

  onSelectionChanged(e) {
    //e.selectedRowKeys[0];
    //this.selectedIds.push(e.selectedRowKeys[0]);
    //this.selectedIds = this.selectedIds.filter((x) => x !== undefined);
  }

  onSave(grid) {
    const jobs: Observable<void>[] = [];
    if (this._changedItems.length > 0) {
      this.onSaveItems(this._changedItems);

      this.selectedIds = [];
      this._changedItems = [];
      grid.instance.refresh();

      this.settingsSvc.settingsSegments().subscribe((res) => {
        this.dataSource = res;
      });
    }
  }

  onRevert(grid) {
    this.selectedIds = [];
    this._changedItems = [];
    grid.instance.refresh();

    this.settingsSvc.settingsSegments().subscribe((res) => {
      this.dataSource = res;
    });
  }

  onSaveItems(items: any[]): Observable<void> {

    // 개별 Speed Ratio Mqtt Msg
    //for (let idx = 0; idx < items.length; idx++) {
    //  this.messageSvc
    //    .sendSpeedRatioSegmentCommand({ type: 'SEGMENT', action: 'segment-setting', segmentId: items[idx].id, speedRatio: items[idx].speedRatio })
    //    .subscribe();
    //}

    // 일괄 Speed Ratio Mqtt Msg
    let segmentIds: number[] = [];
    let speedRatios: number[] = [];

    for (let idx = 0; idx < items.length; idx++) {
      segmentIds.push(items[idx].id);
      speedRatios.push(items[idx].speedRatio);
    }

    this.messageSvc
      .sendSegmentSettingCommand({ type: 'SEGMENT', action: 'segment-setting', segmentIds: segmentIds, speedRatios: speedRatios })
      .subscribe();

    // DB Update
    //this.settingsSvc.saveSegments(items).subscribe();

    return;
  }

  onApplyAllSpeedRatio(inputAllSppedRatio) {
    this.messageSvc
      .sendAllSpeedRatioSegmentCommand({ type: 'SEGMENT-ALL', action: 'segment-setting' }, inputAllSppedRatio.value)
      .subscribe();
  }

  customSpeedRatio(cellInfo) {
    return cellInfo.value + ' %';
  }
}
