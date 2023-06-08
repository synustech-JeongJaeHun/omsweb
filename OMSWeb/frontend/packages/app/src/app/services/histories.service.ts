import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import DataSource from 'devextreme/data/data_source'
import * as AspNetData from 'devextreme-aspnet-data-nojquery'
import { Console } from 'console'
import { AuthService } from './auth.service'
import {Observable, of} from "rxjs";

@Injectable({
	providedIn: 'root',
})
export class HistoriesService {
	private baseUrl = '/api/histories'
	constructor(private http: HttpClient, private auth: AuthService) {}


  ordersDataSource(source: any, startTime: Date =null, endTime: Date =null): Observable<DataSource> {
    const token =this.auth.token;
    return of(new DataSource({
      store: AspNetData.createStore({
        key: 'id',
        loadUrl: `${this.baseUrl}/orders`,
        onBeforeSend: function(operation, ajaxSettings){
          ajaxSettings.headers = {
            "Authorization": 'Bearer ' + token
          }
        },
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
    }))

    /*ordersDataSource(source: any, startTime: Date, endTime: Date): DataSource {
      const token =this.auth.token;
 		return new DataSource({
			store: AspNetData.createStore({
				key: 'id',
				loadUrl: `${this.baseUrl}/orders`,
        onBeforeSend: function(operation, ajaxSettings){
            ajaxSettings.headers = {
                "Authorization": 'Bearer ' + token
            }
        },
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
		})*/
	}

	vehiclesDataSource(source: any, startTime: Date, endTime: Date, startSearch): DataSource {
    const token =this.auth.token;
		return new DataSource({
			store: AspNetData.createStore({
				key: 'id',
				loadUrl: `${this.baseUrl}/vehicles`,
        onBeforeSend: function(operation, ajaxSettings){
          ajaxSettings.headers = {
              "Authorization": 'Bearer ' + token
          }
      },
			}),
			filter: [
				['historyChangeTime', '>=', startTime],
				'and',
				['historyChangeTime', '<=', endTime],
      ],
      onChanged: () => {
          source.onDataSourceChanged(startSearch);
      },
		})
	}

  vehiclesDataSourceRange(source: any, startTime: Date, endTime: Date, startSearch): DataSource {
    const token =this.auth.token;
    return new DataSource({
      store: AspNetData.createStore({
        key: 'id',
        loadUrl: `${this.baseUrl}/vehicles`,
        onBeforeSend: function(operation, ajaxSettings){
          ajaxSettings.headers = {
            "Authorization": 'Bearer ' + token
          }
        },
      }),
      filter: [
        ['historyChangeTime', '>=', startTime],
        'and',
        ['historyChangeTime', '<=', endTime],
      ],
      onChanged: () => {
        source.onDataSourceRangeChanged(startSearch);
      },
    })
  }

	alarmsDataSource(source: any, startTime: Date, endTime: Date): DataSource {
    const token =this.auth.token;
		return new DataSource({
			store: AspNetData.createStore({
				key: 'id',
				loadUrl: `${this.baseUrl}/alarms`,
        onBeforeSend: function(operation, ajaxSettings){
          ajaxSettings.headers = {
              "Authorization": 'Bearer ' + token
          }
      },
			}),
      filter: [['time', '>=', startTime], 'and', ['time', '<=', endTime]],
      onChanged: () => {
          source.onDataSourceChanged();
      },
		})
	}

	alertsDataSource(source: any, startTime: Date, endTime: Date): DataSource {
    const token =this.auth.token;
		return new DataSource({
			store: AspNetData.createStore({
				key: 'id',
				//loadUrl: `/assets/json/get-alerts.json`,
				loadUrl: `${this.baseUrl}/alerts`,
        onBeforeSend: function(operation, ajaxSettings){
          ajaxSettings.headers = {
              "Authorization": 'Bearer ' + token
          }
      },
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
      const token =this.auth.token;
        return new DataSource({
            store: AspNetData.createStore({
                key: 'id',
                loadUrl: `${this.baseUrl}/nacks`,
                onBeforeSend: function(operation, ajaxSettings){
                  ajaxSettings.headers = {
                      "Authorization": 'Bearer ' + token
                  }
              },
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
