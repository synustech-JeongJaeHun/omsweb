import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ReportService, ZcuResponse} from "@oms/services/report.service";
import {takeUntil} from "rxjs/operators";
import {interval, Subject} from "rxjs";
import {CdkDragEnd} from "@angular/cdk/drag-drop";
import {SettingsService} from "@oms/services/settings.service";

@Component({
  selector: 'oms-zcu-status',
  templateUrl: './zcu-status.component.html',
	styleUrls: ['./zcu-status.component.scss'],
})
export class ZcuStatusComponent implements OnInit, OnDestroy {

	private destroy$: Subject<void> = new Subject<void>();
	
	public zcus: ZcuResponse
	zcuInterval = 0

	dragPosition = {x: 0, y: 0}

	dragEnded($event: CdkDragEnd) {
		const { offsetLeft, offsetTop } = $event.source.element.nativeElement;
		const { x, y } = $event.distance;
		this.dragPosition.x = offsetLeft + x;
		this.dragPosition.y = offsetTop + y;
	}
	constructor(private reportService: ReportService, private settingSvc: SettingsService) {
		this.settingSvc.serviceConfig.subscribe(cfg=>{
			this.zcuInterval = cfg.zcuStatusIntervalSec
		})
		this.loadZcus()
		
		interval(this.zcuInterval*1000)
			.pipe(takeUntil(this.destroy$))
			.subscribe(e => {
				this.loadZcus()
			})
	}
	
	loadZcus(){
		this.reportService.loadZcuStatus().subscribe(res=>{
			if(res){
				this.zcus = res
			}
		})
	}

  ngOnInit(): void {
  }

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

}
