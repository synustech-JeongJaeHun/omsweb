import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {SettingsService} from "@oms/services/settings.service";
import {ReportService } from "@oms/services/report.service";

@Component({
  selector: 'oms-vhl-status',
  templateUrl: './vhl-status.component.html',
  styleUrls: ['./vhl-status.component.scss'],
})
export class VhlStatusComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();

  public vehicles: Vehicles

  constructor(private settingSvc: SettingsService,
              private reportService: ReportService) {
    this.reportService.trendSubject$
      .pipe(takeUntil(this.destroy$))
      .subscribe(res=>{
        if(res) this.vehicles = res.vehicles as Vehicles
      })
  }

  ngOnInit(): void {
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}

type Vehicles = {
  auto?: number
  disconnected?: number
  error?: number
  manual?: number
  railOut?: number
}
