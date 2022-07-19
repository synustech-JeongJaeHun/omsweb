import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Injectable({
	providedIn: 'root',
})
export class ReportService {
	private baseUrl = '/api/report'

	constructor(private http: HttpClient) {}

  // only for map-viewer kpi trend
	loadTrend() {
		return this.http.get<TrendResponse>(`${this.baseUrl}/trend`)
	}
}

type TrendResponse = {
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
}
