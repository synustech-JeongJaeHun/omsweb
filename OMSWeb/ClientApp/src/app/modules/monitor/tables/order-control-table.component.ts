import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { forkJoin, Subject, Subscription } from 'rxjs';
import DataSource from 'devextreme/data/data_source';

import { StatusService } from '../../../services/status.service';
import { TrackIdService } from '../../../services/track-id.service';
import { HubService } from '../../../services/hub.service';
import { IDataChangeEvent } from '../../../models/notification.model';
import { UserPermissions } from '../../../models/enums';
import { AuthService } from '../../../services/auth.service';
import { AccountUtil } from '../../shared/utils/account.util';
import { takeUntil } from 'rxjs/operators';
import { MessagesService } from '../../../services/messages.service';
import { DxDataGridComponent } from 'devextreme-angular';

@Component({
  selector: 'oms-order-control-table',
  templateUrl: './order-control-table.component.html',
  styleUrls: ['./order-control-table.component.scss'],
})
export class OrderControlTableComponent implements OnInit, OnDestroy {
  @Input() tableHeight: number;
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;

  dataSource: DataSource;
  // dataSource: any;
  selectedRows: number[] = [];

  //#region Subscriptions
  private destroy$: Subject<void> = new Subject<void>();
  //#endregion

  get hasControlAccess(): boolean {
    return (
      this.auth.isAuthenticated &&
      AccountUtil.hasPermission(
        UserPermissions.controlActions,
        this.auth.currentUser
      )
    );
  }

  get canDelete(): boolean {
    return this.selectedRows.length > 0;
  }

  transformVehicleId = ({ value = '' }): string => {
    const text =
      this.idSvc.get_alternative_id('vehicle', 'logicalId', value) || value;
    return text.toString();
  };

  transformLocationId = ({ value = '' }): string => {
    return this.idSvc.guessLocationId(value);
  };

  constructor(
    private auth: AuthService,
    private statusSvc: StatusService,
    private messageSvc: MessagesService,
    private idSvc: TrackIdService,
    private hubSvc: HubService
  ) {
    this.dataSource = this.statusSvc.orderStatusDataSource();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.hubSvc.orderTableChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((e: IDataChangeEvent) => {
        e && this.onTableChanged(e);
      });
  }

  onDelete() {
    if (!this.canDelete) return;
    const items = this.dataGrid.instance.getSelectedRowsData();
    const jobs = items.map((x) => this.messageSvc.sendDeleteOrder(x));
    forkJoin(jobs).subscribe();
  }

  private onTableChanged(payload: IDataChangeEvent) {
    let needReload = false;
    if (payload && payload.id && payload.operation) {
      if (['INSERT', 'DELETE'].includes(payload.operation)) {
        needReload = true;
      } else {
        needReload = this.dataSource.items().every((x) => x.id !== payload.id);
      }
    } else {
      needReload = true;
    }
    needReload && this.dataSource.reload();
  }
}
