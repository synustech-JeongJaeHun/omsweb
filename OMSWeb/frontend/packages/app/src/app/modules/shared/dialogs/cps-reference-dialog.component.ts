import { Component, OnDestroy } from '@angular/core'
import { Subject } from 'rxjs'

export interface PeriodicElement {
  position: number,
  name: string;
  normal: string;
  warning: string;
  fault: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Voltage', normal: '510 ~ 650 V', warning: '430 ~ 510 V\n650 ~ 675 V', fault: '< 430 V\n> 675 V' },
  { position: 2, name: 'Current IGBT', normal: '0 ~ 130 A', warning: '130 ~ 145 A', fault: '> 145 A' },
  { position: 3, name: 'Current Track', normal: '70 ~ 85 A', warning: '<70 A\n85 ~ 90 A', fault: '> 90 A' },
  { position: 4, name: 'Temp Radiator', normal: '0 ~ 60 ℃', warning: '60 ~ 80 ℃', fault: '> 80 ℃' },
  { position: 5, name: 'Temp Internal', normal: '0 ~ 35 ℃', warning: '35 ~ 40 ℃', fault: '> 40 ℃' },
];

@Component({
	selector: 'oms-cps-reference-dialog',
	templateUrl: './cps-reference-dialog.component.html',
	styleUrls: ['./cps-reference-dialog.component.scss'],
})
export class CpsReferenceDialogComponent implements OnDestroy {

    displayedColumns: string[] = ['position', 'name', 'normal', 'warning', 'fault'];
    cpsDataSource = ELEMENT_DATA;

    private destroy$: Subject<void> = new Subject<void>()

	constructor(
	) {
	}

	ngOnDestroy(): void {
		this.destroy$.next()
		this.destroy$.complete()
	}
}
