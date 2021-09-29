import { Component, OnInit } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { MessagesService } from '../../../services/messages.service';
import { SettingsService } from '../../../services/settings.service';
import { ISettingsBufferWithUnuse } from '../../../models/settings.model';

@Component({
  selector: 'oms-buffer-setting',
  templateUrl: './buffer-setting.component.html',
  styleUrls: ['./buffer-setting.component.scss']
})
export class BufferSettingComponent implements OnInit {
  private _changedItems: any[] = [];

  dataSource: ISettingsBufferWithUnuse[];

  selectedIds: number[] = [];

  get isUpdated(): boolean {
    return this._changedItems.length > 0;
  }

  constructor(
    private settingsSvc: SettingsService,
    private messageSvc: MessagesService
  ) {
    this.settingsSvc.settingsBuffers().subscribe((res) => {
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
      let buffer = this._changedItems.find((u) => u.id === key);
      buffer.unUse = data.unUse;
    } else {
      let buffer = data;
      this._changedItems.push(buffer);
      this.selectedIds.push(buffer.id);
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
    if (this._changedItems.length)
      this.onUseUnuse(this._changedItems);

    jobs.length &&
      forkJoin(jobs).subscribe(() => {
        this._changedItems = [];
        grid.instance.refresh();
        //this.settingsSvc.settingsBuffers().subscribe((res) => {
        //  this.dataSource = res;
        //});
      });
  }

  onRevert(grid) {
    this.selectedIds = [];
    this._changedItems = [];

    grid.instance.refresh();

    this.settingsSvc.settingsBuffers().subscribe((res) => {
      this.dataSource = res;
    });
  }

  onUseUnuse(items: any[]) {
    let useBufferIds: number[] = [];
    let unUseBufferIds: number[] = [];

    for (let idx = 0; idx < items.length; idx++) {
      if (items[idx].unUse)
        unUseBufferIds.push(items[idx].id);
      else
        useBufferIds.push(items[idx].id);
    }

    if (useBufferIds.length > 0)
      this.messageSvc
        .sendBufferUseCommand({ type: 'BUFFER', action: 'use-buffer' }, useBufferIds)
        .subscribe();

    if (unUseBufferIds.length > 0)
      this.messageSvc
        .sendBufferUseCommand({ type: 'BUFFER', action: 'unuse-buffer' }, unUseBufferIds)
        .subscribe();

    return;
  }
}
