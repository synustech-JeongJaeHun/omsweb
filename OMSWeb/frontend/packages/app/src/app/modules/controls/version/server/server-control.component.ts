import { Component, OnInit } from '@angular/core';
import {IModuleStatus} from "../../../../models/system.model";
import {SystemsService} from "../../../../services/systems.service";

@Component({
  selector: 'oms-server-control',
  templateUrl: './server-control.component.html',
  styleUrls: ['./server-control.component.scss'],
})
export class ServerControlComponent implements OnInit {
  dataSource: IModuleStatus[] = [];

  constructor(
    private systemSvc: SystemsService,
  ) { }

  ngOnInit(): void {
    this.load()
    setInterval(()=>this.load(),60000*5)
  }

  load(){
    this.systemSvc.moduleStatus().subscribe((res) => {
      this.dataSource = res;
    });
  }
}
