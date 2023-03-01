import { Component, OnDestroy, ViewChild } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { alertSeverities, IAlert, IDataChangeEvent } from '../../../models/notification.model';
import { AuthService } from '../../../services/auth.service';
import { HubService } from '../../../services/hub.service';
import { MessagesService } from '../../../services/messages.service';
import { NotificationsService } from '../../../services/notifications.service';
import { AccountUtil } from '../utils/account.util';
import { PermissionEnums } from '../../../models/enums';

@Component({
  selector: 'oms-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.scss'],
})
export class AlertDialogComponent implements OnDestroy {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;
  selectedRows: number[] = [];

  warnList: IAlert[] = [];
  severityLookup = alertSeverities;
  dataSource: DataSource;

  dataSourceClear: DataSource;

  private destroy$: Subject<void> = new Subject<void>();

  selectedFilter= '='

  get canClearAll(): boolean {
    return this.dataGrid?.instance && this.dataGrid.instance?.totalCount() > 0 && this.selectedFilter==='=';
  }

  get canClear(): boolean {
    return this.selectedRows.length > 0 && this.selectedFilter==='=';
  }

  constructor(
    private auth: AuthService,
    private hubSvc: HubService,
    private messageSvc: MessagesService,
    private notifySvc: NotificationsService
  ) {
    this.dataSource = this.notifySvc.alertsDataSource();
    this.dataSourceClear =this.notifySvc.alertsDataSourceClear();
    this.hubSvc.alertChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((e) => this.onAlertChanged(e));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private onAlertChanged(event: IDataChangeEvent) {
    this.dataSource.reload();
    this.dataSourceClear.reload();
  }

  onChangeFilter(value: any) {
  }

  get hasControlAccess() {
    return this.auth.isAuthenticated;
  }

  onClear() {
    console.log('## clear one >>', this.selectedRows);

    this.messageSvc
      .sendWarningClearCommand({ action: 'warning_clear' }, this.selectedRows, this.auth.currentUser.userId)
      .subscribe();
  }

  onClearAll() {
    this.messageSvc
      .sendWarningAllClearCommand({ action: 'warning_clear' }, this.auth.currentUser.userId)
      .subscribe();
  }

  private loadWarnList() {
    this.notifySvc.alerts().subscribe((res) => {
      this.warnList = res;
    });
  }
}
