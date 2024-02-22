import { Component, OnInit } from '@angular/core';
import {IVhlStatus} from "../../../../models/system.model";
import {SystemsService} from "../../../../services/systems.service";
import {Observable, of} from "rxjs";
import {DEFAULT_ELEMENT_DATA, PeriodicElement} from "@oms/models/cps-status.model";

@Component({
  selector: 'oms-vehicle',
  templateUrl: './vehicle.component.html',
  styleUrls: ['../server/server-control.component.scss'],
})
export class VehicleComponent implements OnInit {

  dataSource: IVhlStatus[] = [];
  ref: IVhlStatus[] = []

  constructor(
    private systemSvc: SystemsService,
  ) { }

  ngOnInit(): void {
    this.loadVehicleRef()
    this.load();
    setInterval(()=>this.load(),60000*5)
  }


  load(){
    this.systemSvc.vhlStatus().subscribe((res) => {
      this.dataSource = res.map(d=>{
        const v = this.ref.find(r=>d.id===r.id&&d.logicalId===r.logicalId)
        return {...d, ip:v?.ip || '-'}
      })
    });
  }
  
  loadVehicleRef() {
    this.systemSvc.loadVehicleRef().subscribe(ref=>{
      this.ref = ref as unknown as IVhlStatus[] || []
    })
  }
}
