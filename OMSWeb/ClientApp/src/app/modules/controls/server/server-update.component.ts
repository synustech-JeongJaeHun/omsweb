import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { IServiceProcessStates, IModuleStatus } from '../../../models/system.model';
import { DialogService } from '../../../services/dialog.service';
import { SystemsService } from '../../../services/systems.service';
import { MessagesService } from '../../../services/messages.service';

@Component({
  selector: 'oms-server-update',
  templateUrl: './server-update.component.html',
  styleUrls: ['./server-update.component.scss'],
})
export class ServerUpdateComponent implements OnInit {
  dataSource2: IServiceProcessStates[] = [];
  dataSource: IModuleStatus[] = [];

  constructor(
    private systemSvc: SystemsService,
    private dialogSvc: DialogService,
    private messageSvc: MessagesService,
    private t$: TranslateService
  ) {}

  ngOnInit(): void {
    this.systemSvc.processes().subscribe((res) => {
      this.dataSource2 = res;
    });

    this.systemSvc.moduleStatus().subscribe((res) => {
      //alert(res);
      this.dataSource = res;
    });    
  }

  onCommand(action: string, module: IModuleStatus) {
    //console.info('## command process >>', { command, process });
    this.dialogSvc
      .confirm({ body: this.t$.instant('messages.confirmCommand') })
      .subscribe((ok) => {
        if (ok) {
          //alert('action : ' + action + ' - status(module name) : ' + module.name);
          if (module.name == "OMS Server") {
            this.messageSvc.sendServerModuleControlCommand({ type: 'MODULE', action: action, state: 'oms-srv' }).subscribe();
          } else if (module.name == "VAS") {
            this.messageSvc.sendServerModuleControlCommand({ type: 'MODULE', action: action, state: 'vas' }).subscribe();
          } else if (module.name == "HAS") {
            this.messageSvc.sendServerModuleControlCommand({ type: 'MODULE', action: action, state: 'has' }).subscribe();
          }
        }
      });
  } 
}
