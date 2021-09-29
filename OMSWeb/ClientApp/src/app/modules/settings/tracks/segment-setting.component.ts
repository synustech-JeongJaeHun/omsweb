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
    //this._changedItems.length &&
    //  jobs.push(this.settingsSvc.sendSegementUseUnuseMessage(this._changedItems));
    if (this._changedItems.length > 0)
      this.onUseUnuse(this._changedItems);

    jobs.length &&
      forkJoin(jobs).subscribe(() => {
        this._changedItems = [];
        grid.instance.refresh();

        //this.settingsSvc.settingsSegments().subscribe((res) => {
        //  this.dataSource = res;
        //});
      });
  }

  onRevert(grid) {
    this.selectedIds = [];
    this._changedItems = [];
    grid.instance.refresh();

    this.settingsSvc.settingsSegments().subscribe((res) => {
      this.dataSource = res;
    });
  }

  onUseUnuse(items: any[]): Observable<void> {
    let useSegmentIds: number[] = [];
    let unUseSegmentIds: number[] = [];

    for (let idx = 0; idx < items.length; idx++) {
      if (items[idx].unUse)
        unUseSegmentIds.push(items[idx].id);
      else
        useSegmentIds.push(items[idx].id);
    }

    if (useSegmentIds.length > 0) {
      this.messageSvc
        .sendDisableSegmentsCommand({ type: 'TRACK', action: 'enable-segment' }, useSegmentIds)
        .subscribe();
      //  for (let useSegIdx = 0; useSegIdx < useSegmentIds.length; useSegIdx++)
      //    this.messageSvc
      //      .sendDisableSegmentCommand({ type: 'TRACK', action: 'enable-segment' }, useSegmentIds[useSegIdx])
      //      .subscribe();
    }

    if (unUseSegmentIds.length > 0) {
      this.messageSvc
        .sendDisableSegmentsCommand({ type: 'TRACK', action: 'disable-segment' }, unUseSegmentIds)
        .subscribe();
      //  for (let unUseSegIdx = 0; unUseSegIdx < unUseSegmentIds.length; unUseSegIdx++)
      //    this.messageSvc
      //      .sendDisableSegmentCommand({ type: 'TRACK', action: 'disable-segment' }, unUseSegmentIds[unUseSegIdx])
      //      .subscribe();
    }

    return;
  }

  onApplyAllSpeedRatio(inputAllSppedRatio) {
    //alert('ApplyAllSpeedRatio' + inputAllSppedRatio.value);
    this.messageSvc
      .sendAllSpeedRatioSegmentCommand({ type: 'SEGMENT_ALL', action: '' }, inputAllSppedRatio.value)
      .subscribe();
  }

  customSpeedRatio(cellInfo) {
    return cellInfo.value + ' %';
  }
}
