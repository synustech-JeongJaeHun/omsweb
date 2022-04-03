import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IVehicleStatusRow } from '../../../models/vehicle-status.model';
import { PlaybackService } from '../../../services/playback.service';
import { TrackIdService } from '../../../services/track-id.service';

@Component({
  selector: 'oms-playback-vehicle-status',
  templateUrl: './playback-vehicle-status.component.html',
  styles: [],
})
export class PlaybackVehicleStatusComponent implements OnInit {
  @Input() tableHeight: number;

  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;

  dataSource: any[] = [];
  selectedRows: number[] = [];

  //#region Subscriptions
  private destroy$: Subject<void> = new Subject<void>();
  //#endregion

  get selectedItems(): IVehicleStatusRow[] {
    return this.dataGrid.instance.getSelectedRowsData();
  }

  constructor(
    private playbackSvc: PlaybackService,
    private idSvc: TrackIdService
  ) {
    // this.playbackSvc.vehiclesChanged$
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((data) => {
    //     this.dataSource = data;
    //   });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {}
}
