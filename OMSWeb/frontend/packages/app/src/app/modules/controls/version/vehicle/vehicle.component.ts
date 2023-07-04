import { Component, OnInit } from '@angular/core';
import {IVhlStatus} from "../../../../models/system.model";
import {SystemsService} from "../../../../services/systems.service";

@Component({
  selector: 'oms-vehicle',
  templateUrl: './vehicle.component.html',
  styleUrls: ['../server/server-control.component.scss'],
})
export class VehicleComponent implements OnInit {

  dataSource: IVhlStatus[] = [];

  constructor(
    private systemSvc: SystemsService,
  ) { }

  ngOnInit(): void {
    this.load();
    setInterval(()=>this.load(),60000*5)
  }


  load(){
    this.systemSvc.vhlStatus().subscribe((res) => {
      //alert(res);
      this.dataSource = res;
    });
  }

}
