import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { AuthService } from '../../../services/auth.service';
import { DialogService } from '../../../services/dialog.service';
import { MessagesService } from '../../../services/messages.service';
import { SystemsService } from '../../../services/systems.service';

@Component({
  selector: 'oms-vehilce-control',
  templateUrl: './vehicle-control.component.html',
  styleUrls: ['./vehicle-control.component.scss'],
})
export class VehicleControlComponent implements OnInit {
  dataGrid: DxDataGridComponent;
  dataSource: DataSource;
  selectedIds: number[] = [];

  get hasControlAccess(): boolean {
    return this.auth.isAuthenticated;
  }

  get canControl(): boolean {
    return this.selectedIds.length > 0;
  }

  constructor(
    private auth: AuthService,
    private systemSvc: SystemsService,
    private dialogSvc: DialogService,
    private messageSvc: MessagesService,
    private t$: TranslateService,
  ) {
    this.dataSource = this.systemSvc.vehicles();
  }

  ngOnInit(): void {}

  onRefresh() {
    console.info('# refresh >>', this.selectedIds);
  }
  onUpdate() {
    this.dialogSvc
      .confirm({ body: this.t$.instant('messages.confirmCommand') })
      .subscribe((ok) => {
        if (ok) {
          // @TODO call update
        }
      });
  }
  onRemoveVehicle() {
    if (!this.canControl) return;
    this.dialogSvc
      .confirm({ body: this.t$.instant('messages.confirmCommand') })
      .subscribe((ok) => {
        if (ok) {
          this.messageSvc
            .sendVehicleDirectCommand({ action: 'remove' }, this.selectedIds)
            .subscribe();
        }
      });
  }
}
