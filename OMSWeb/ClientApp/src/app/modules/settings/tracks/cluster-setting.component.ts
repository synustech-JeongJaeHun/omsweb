import { Component, ViewChild, OnInit } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ISettingsCluster, ISettingsClusterPoint } from '../../../models/settings.model';
import { SettingsService } from '../../../services/settings.service';
import { MessagesService } from '../../../services/messages.service';
import { UnitPickerComponent } from './unit-picker.component';

@Component({
  selector: 'oms-cluster-setting',
  templateUrl: './cluster-setting.component.html',
  styleUrls: ['./cluster-setting.component.scss'],
})
export class ClusterSettingComponent implements OnInit {
  selectedItem: ISettingsCluster;
  clusters: ISettingsCluster[] = [];

  points: number[] = [];
  assignedPoints: number[] = [];

  private _changedItems: ISettingsCluster[] = [];

  get isUpdated(): boolean {
    return this.clusters.length > 0 && this._changedItems.length > 0;
  }

  constructor(
    private settingsSvc: SettingsService,
    private messageSvc: MessagesService
  ) {
    this.init();
  }

  ngOnInit(): void { }

  private init() {
    forkJoin([this.loadClusters()]).subscribe(() => {
      if (this.clusters.length) {
        this.selectedItem = this.clusters[0];
        forkJoin(this.bindClusterData(this.selectedItem.id));
      }
    });
  }

  private loadClusters() {
    return this.settingsSvc.settingsClusters().pipe(
      tap((res) => {
        this.clusters = res;
      })
    );
  }

  //private loadClusterPointIds() {
  //  return this.settingsSvc.settingsClusterPoints().pipe(
  //    tap((res) => {
  //      this.points = Object.values(res).map((x) => x.id);
  //    })
  //  );
  //}

  private bindClusterData(clusterId: number) {
    this.settingsSvc.settingsClusterIsAvailablePoints(clusterId).subscribe((res) => {
      this.points = res;
    });
    this.settingsSvc.settingsClusterAssignedPoints(clusterId).subscribe((res) => {
      this.assignedPoints = res;
    });
  }

  onClusterChanged() {
    this.bindClusterData(this.selectedItem.id);
  }

  onAssignChanged(picked: number[]) {
    //this.selectedItem.points = picked.join(',');
    //this.changeItem(this.selectedItem);
  }
  onMaxVehiclesChanged(value: number) {
    this.selectedItem.maxVehicles = value;
    this.changeItem(this.selectedItem);
  }

  private changeItem(item: ISettingsCluster) {
    if (this._changedItems.every((x) => x.id !== item.id)) {
      this._changedItems.push(item);
    }
  }

  onSave() {
    if (!this._changedItems.length) return;

    this.SaveMessages(this._changedItems);
    this._changedItems = [];
    this.bindClusterData(this.selectedItem.id);
  }

  onRevert() {
    this._changedItems = [];
    this.init();
  }

  SaveMessages(items: ISettingsCluster[]): Observable<void> {
    // 개별 Max Vehicle 설정
    for (let idx = 0; idx < items.length; idx++) {
      this.messageSvc
        .sendMaxVehiclesClusterCommand({ type: 'CLUSTER', action: 'max-vehicles', clusterId: items[idx].id, maxVehicles: items[idx].maxVehicles })
        .subscribe();
    }
    return;
  }
}
