import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {ReportService, TrendResponse} from "@oms/services/report.service";
import { CdkDragEnd } from '@angular/cdk/drag-drop';

@Component({
  selector: 'oms-vhl-status',
  templateUrl: './vhl-status.component.html',
  styleUrls: ['./vhl-status.component.scss'],
})
export class VhlStatusComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();

  public vehicles: Vehicles

  dragPosition = {x: 0, y: 0}

  dragEnded($event: CdkDragEnd) {
    const { offsetLeft, offsetTop } = $event.source.element.nativeElement;
    const { x, y } = $event.distance;
    this.dragPosition.x = offsetLeft + x;
    this.dragPosition.y = offsetTop + y;
  }
  constructor(private reportService: ReportService) {
    this.reportService.trendSubject$
      .pipe(takeUntil(this.destroy$))
      .subscribe(res=>{
        if(res) {
          this.vehicles = res.vehicles as Vehicles
        }
      })
  }



  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get run(){
    let sum =0;
    ['auto', 'manual', 'error'].forEach(v=> {
      if(this.vehicles){
        sum += Number.parseInt(this.vehicles[v])
      }
    })
    return sum;
  }

}

type Vehicles = TrendResponse["vehicles"]
