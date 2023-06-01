import { Component, OnDestroy } from '@angular/core'
import { Subject } from 'rxjs'
import {SystemsService} from "../../../services/systems.service";
import {rangeToRef} from "../../../models/cps-status.model";

export interface PeriodicElement {
  position: number,
  name: string;
  normal: string;
  warning: string;
  fault: string;
}



@Component({
	selector: 'oms-cps-reference-dialog',
	templateUrl: './cps-reference-dialog.component.html',
	styleUrls: ['./cps-reference-dialog.component.scss'],
})
export class CpsReferenceDialogComponent implements OnDestroy {

    displayedColumns: string[] = ['position', 'name', 'normal', 'warning', 'fault'];
    cpsDataSource:PeriodicElement[]

    private destroy$: Subject<void> = new Subject<void>()

	constructor(
    private systemSvc: SystemsService
	) {
    systemSvc.reference.subscribe(res=>{
      this.cpsDataSource = res.map((item)=>{
        return {
          position: item.position,
          name: item.name,
          normal: item.normal.map(m=>rangeToRef(m)).toString().replace(',', '\n'),
          warning: item.warning.map(m=>rangeToRef(m)).toString().replace(',', '\n'),
          fault: item.fault.map(m=>rangeToRef(m)).toString().replace(',', '\n')
        }
      }) as unknown as PeriodicElement[]
    })

	}

	ngOnDestroy(): void {
		this.destroy$.next()
		this.destroy$.complete()
	}
}
