import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { IServiceProcessStates } from '../../../models/system.model';
import { DialogService } from '../../../services/dialog.service';
import { SystemsService } from '../../../services/systems.service';

@Component({
  selector: 'oms-server-update',
  templateUrl: './server-update.component.html',
  styleUrls: ['./server-update.component.scss'],
})
export class ServerUpdateComponent implements OnInit {
  dataSource: IServiceProcessStates[] = [];

  constructor(
    private systemSvc: SystemsService,
    private dialogSvc: DialogService,
    private t$: TranslateService
  ) {}

  ngOnInit(): void {
    this.systemSvc.processes().subscribe((res) => {
      this.dataSource = res;
    });
  }

  onCommand(command: string, process: IServiceProcessStates) {
    console.info('## command process >>', { command, process });

    this.dialogSvc
      .confirm({ body: this.t$.instant('messages.confirmCommand') })
      .subscribe((ok) => {
        if (ok) {
          // @TODO call api
        }
      });
  }
}
