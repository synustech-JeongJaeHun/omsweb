import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { IServiceProcessStates, IModuleStatus } from '../../../models/system.model';
import { DialogService } from '../../../services/dialog.service';
import { SystemsService } from '../../../services/systems.service';
import { MessagesService } from '../../../services/messages.service';

@Component({
  selector: 'oms-server-control',
  templateUrl: './server-control.component.html',
  styleUrls: ['./server-control.component.scss'],
})
export class ServerControlComponent implements OnInit {
  dataSource2: IServiceProcessStates[] = [];
  dataSource: IModuleStatus[] = [];

  constructor(
    private systemSvc: SystemsService,
    private dialogSvc: DialogService,
    private messageSvc: MessagesService,
    private t$: TranslateService
  ) { }

  ngOnInit(): void {
    this.load();
  }

  onCommand(action: string, module: IModuleStatus) {
    //console.info('## command process >>', { command, process });
    this.dialogSvc
      .confirm({ body: this.t$.instant('messages.confirmCommand') })
      .subscribe((ok) => {
        if (ok) {
          //alert('action : ' + action + ' - status(module name) : ' + module.name);
          if (module.name == "OMS Server") {
            this.messageSvc.sendServerModuleControlCommand({ action: action, state: 'oms-srv' }).subscribe();
          } else if (module.name == "VAS") {
            this.messageSvc.sendServerModuleControlCommand({ action: action, state: 'vas' }).subscribe();
          } else if (module.name == "HAS") {
            this.messageSvc.sendServerModuleControlCommand({ action: action, state: 'has' }).subscribe();
          }
        }
      });
  }

  load(){
    this.systemSvc.moduleStatus().subscribe((res) => {
      //alert(res);
      this.dataSource = res;
    });
  }
}
