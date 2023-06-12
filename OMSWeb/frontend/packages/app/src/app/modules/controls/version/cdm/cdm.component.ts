import { Component, OnInit } from '@angular/core';
import {ICdmStatus} from "../../../../models/system.model";
import {SystemsService} from "../../../../services/systems.service";

@Component({
  selector: 'oms-cdm',
  templateUrl: './cdm.component.html',
  styleUrls: ['../server/server-control.component.scss'],
})
export class CdmComponent implements OnInit {

  dataSource: ICdmStatus[] = [];

  constructor(
    private systemSvc: SystemsService,
  ) { }

  ngOnInit(): void {
    this.load();
  }


  load(){
    this.systemSvc.cdmStatus().subscribe((res) => {
      //alert(res);
      this.dataSource = res;
    });
  }

}
