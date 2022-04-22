import { AfterViewInit, Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { alertSeverities, IAlert, IDataChangeEvent } from '../../../models/notification.model';
import { AuthService } from '../../../services/auth.service';
import { HubService } from '../../../services/hub.service';
import { MessagesService } from '../../../services/messages.service';
import { NotificationsService } from '../../../services/notifications.service';

@Component({
  selector: 'oms-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.scss'],
})
export class AlertDialogComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;
  selectedRows: number[] = [];

  warnList: IAlert[] = [];
  severityLookup = alertSeverities;
  dataSource: DataSource;

  private destroy$: Subject<void> = new Subject<void>();

  get canClearAll(): boolean {
    return this.dataGrid?.instance && this.dataGrid.instance?.totalCount() > 0;
  }

  get canClear(): boolean {
    return this.selectedRows.length > 0;
  }

  constructor(
    private auth: AuthService,
    private hubSvc: HubService,
    private messageSvc: MessagesService,
    private notifySvc: NotificationsService
  ) { }

  ngAfterViewInit(): void {
    //this.loadWarnList();
  }

  ngOnInit(): void {
    this.hubSvc.alertChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((e) => this.onAlertChanged(e));

    this.dataSource = this.notifySvc.alertsDataSource();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private onAlertChanged(event: IDataChangeEvent) {
    this.dataSource.reload();
  }

  onChangeFilter(value: any) {
    console.log('## filter changed >>', value);
    if (value) {
      this.dataGrid.instance.filter([['ackTime', value, null]]);
    } else {
      console.log('remove filter');
      this.dataGrid.instance.clearFilter();
    }
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
