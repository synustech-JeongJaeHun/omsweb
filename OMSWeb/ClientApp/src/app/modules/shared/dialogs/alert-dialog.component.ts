import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { alertSeverities, IAlert } from '../../../models/notification.model';
import { MessagesService } from '../../../services/messages.service';
import { NotificationsService } from '../../../services/notifications.service';

@Component({
  selector: 'oms-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.scss'],
})
export class AlertDialogComponent implements OnInit, AfterViewInit {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;
  selectedRows: number[] = [];

  warnList: IAlert[] = [];
  severityLookup = alertSeverities;

  get canClearAll(): boolean {
    return this.dataGrid?.instance && this.dataGrid.instance?.totalCount() > 0;
  }

  get canClear(): boolean {
    return this.selectedRows.length > 0;
  }

  constructor(
    private messageSvc: MessagesService,
    private notifySvc: NotificationsService
  ) { }

  ngAfterViewInit(): void {
    this.loadWarnList();
  }

  ngOnInit(): void {}

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
    // console.log('## clear one >>', this.selectedRows);
    //this.notifySvc.clearAlerts(this.selectedRows).subscribe();
    //this.messageSvc
    //  .sendWarningClearCommand({ action: 'warning_clear' }, this.selectedRows, this.email)
    //  .subscribe();
  }

  onClearAll() {
    this.dataGrid.instance.selectAll().then(() => {
      this.onClear();
    });
  }

  private loadWarnList() {
    this.notifySvc.alerts().subscribe((res) => {
      this.warnList = res;
    });
  }
}
