import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import {interval, Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {SettingsService} from "@oms/services/settings.service";

@Injectable({
	providedIn: 'root',
})
export class ReportService {
	private baseUrl = '/api/report'
  private destroy$: Subject<void> = new Subject<void>();

  public trendSubject$ = new Subject<TrendResponse>();
  enabled = false
	constructor(private http: HttpClient, private settingSvc: SettingsService,) {
    this.settingSvc.serviceConfig.subscribe(cfg => {
      this.enabled = cfg.kpiEnabled;
    })
    this.loadTrend()
    interval(5000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(e => this.loadTrend())
  }

  // only for map-viewer kpi trend
	loadTrend() {
    if(!this.enabled) return
		this.http.get<TrendResponse>(`${this.baseUrl}/trend`).subscribe(res=>{
      if(res){
        this.trendSubject$.next(res)
      }
    })
	}
}

export type TrendResponse = {
	cpu: {
		usage: number
		model: string
		ghz: number
	}
	memory: {
		total: number
		used: number
		usedPercent: number
	}
  utilization: {
    value: number,
  }
  delivery_time: {
    value: number,
  }
  vehicles : {
    auto?: number
    disconnected?: number
    error?: number
    manual?: number
    railOut?: number
  }
}
