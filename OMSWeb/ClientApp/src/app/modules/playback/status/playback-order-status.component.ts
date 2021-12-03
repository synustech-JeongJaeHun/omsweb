import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PlaybackService } from '../../../services/playback.service';
import { TrackIdService } from '../../../services/track-id.service';

@Component({
  selector: 'oms-playback-order-status',
  templateUrl: './playback-order-status.component.html',
  styles: [],
})
export class PlaybackOrderStatusComponent implements OnInit {
  @Input() tableHeight: number;

  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;

  dataSource: any[] = [];
  selectedRows: number[] = [];

  //#region Subscriptions
  private destroy$: Subject<void> = new Subject<void>();
  //#endregion

  transformVehicleId = ({ value = '' }): string => {
    const text =
      this.idSvc.get_alternative_id('vehicle', 'logicalId', value) || value;
    return text.toString();
  };

  transformLocationId = ({ value = '' }): string => {
    return this.idSvc.guessLocationId(value);
  };

  constructor(
    private playbackSvc: PlaybackService,
    private idSvc: TrackIdService
  ) {
    this.playbackSvc.ordersChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.dataSource = data;
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void { }
}
