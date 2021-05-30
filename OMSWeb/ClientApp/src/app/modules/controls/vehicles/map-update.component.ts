import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import DataSource from 'devextreme/data/data_source';
import { DialogService } from '../../../services/dialog.service';
import { SystemsService } from '../../../services/systems.service';

@Component({
  selector: 'oms-map-update',
  templateUrl: './map-update.component.html',
  styleUrls: ['./map-update.component.scss'],
})
export class MapUpdateComponent implements OnInit {
  dataSource: DataSource;
  selectedIds: number[] = [];

  constructor(
    private systemSvc: SystemsService,
    private dialogSvc: DialogService,
    private t$: TranslateService
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
}
