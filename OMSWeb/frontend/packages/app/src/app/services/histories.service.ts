import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import DataSource from 'devextreme/data/data_source'
import * as AspNetData from 'devextreme-aspnet-data-nojquery'
import { Console } from 'console'

@Injectable({
	providedIn: 'root',
})
export class HistoriesService {
	private baseUrl = '/api/histories'
	constructor(private http: HttpClient) {}

    ordersDataSource(source: any, startTime: Date, endTime: Date): DataSource {
 		return new DataSource({
			store: AspNetData.createStore({
				key: 'id',
				loadUrl: `${this.baseUrl}/orders`,
			}),
			filter: [
				['timeCreated', '>=', startTime],
				'and',
				['timeCreated', '<=', endTime],
            ],
            onLoadingChanged: (isLoading) => {
              if (source.bySearch === false) {
                  if (isLoading === true)
                      source.onDataSourceStarted();
              }
            },
            onChanged: () => {
                source.onDataSourceChanged();
            },
		})
	}

	vehiclesDataSource(source: any, startTime: Date, endTime: Date): DataSource {
		return new DataSource({
			store: AspNetData.createStore({
				key: 'id',
				loadUrl: `${this.baseUrl}/vehicles`,
			}),
			filter: [
				['historyChangeTime', '>=', startTime],
				'and',
				['historyChangeTime', '<=', endTime],
            ],
            onLoadingChanged: (isLoading) => {
              if (source.bySearch === false) {
                if (isLoading === true)
                  source.onDataSourceStarted();
              }
            },
            onChanged: () => {
                source.onDataSourceChanged();
            },
		})
	}

	alarmsDataSource(source: any, startTime: Date, endTime: Date): DataSource {
		return new DataSource({
			store: AspNetData.createStore({
				key: 'id',
				loadUrl: `${this.baseUrl}/alarms`,
			}),
            filter: [['time', '>=', startTime], 'and', ['time', '<=', endTime]],
            onLoadingChanged: (isLoading) => {
              if (source.bySearch === false) {
                if (isLoading === true)
                  source.onDataSourceStarted();
              }
            },
            onChanged: () => {
                source.onDataSourceChanged();
            },
		})
	}

	alertsDataSource(source: any, startTime: Date, endTime: Date): DataSource {
		return new DataSource({
			store: AspNetData.createStore({
				key: 'id',
				//loadUrl: `/assets/json/get-alerts.json`,
				loadUrl: `${this.baseUrl}/alerts`,
			}),
            filter: [['time', '>=', startTime], 'and', ['time', '<=', endTime]],
            onLoadingChanged: (isLoading) => {
              if (source.bySearch === false) {
                if (isLoading === true)
                  source.onDataSourceStarted();
              }
            },
            onChanged: () => {
                source.onDataSourceChanged();
            },
		})
    }

    nacksDataSource(source: any, startTime: Date, endTime: Date): DataSource {
        return new DataSource({
            store: AspNetData.createStore({
                key: 'id',
                loadUrl: `${this.baseUrl}/nacks`,
            }),
            filter: [
                ['ModifiedTime', '>=', startTime],
                'and',
                ['ModifiedTime', '<=', endTime],
            ],
            onLoadingChanged: (isLoading) => {
              if (source.bySearch === false) {
                if (isLoading === true)
                  source.onDataSourceStarted();
              }
            },
            onChanged: () => {
                source.onDataSourceChanged();
            },
        })
    }
}
