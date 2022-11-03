import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import * as AspNetData from 'devextreme-aspnet-data-nojquery'
import DataSource from 'devextreme/data/data_source'

import { Dto } from '@oms/models/dto/track.model'

// Document about DataGrid
// https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/RealTimeUpdates/Angular/Light/

@Injectable({
	providedIn: 'root',
})
export class StatusService {
	private baseUrl = '/api/status'
	constructor(private http: HttpClient) {}

	getTrack(): Observable<Dto.ITrackData> {
		return this.http.get<Dto.ITrackData>(`${this.baseUrl}/tracks`)
	}

	getVehicles(): Observable<Dto.IVehicleTrackData> {
		return this.http.get(`${this.baseUrl}/tracks/vehicles`)
	}

	orderStatusDataSource(): DataSource {
		return new DataSource({
			store: AspNetData.createStore({
				key: 'id',
				loadUrl: `${this.baseUrl}/orders`,
			}),
			reshapeOnPush: true,
		})
	}
	vehicleStatusDataSource(): DataSource {
		return new DataSource({
			store: AspNetData.createStore({
				key: 'id',
				loadUrl: `${this.baseUrl}/vehicles`,
			}),
			reshapeOnPush: true,
		})
	}
	stationStatusDataSource(): DataSource {
		return new DataSource({
			store: AspNetData.createStore({
				key: 'id',
				loadUrl: `${this.baseUrl}/stations`,
			}),
			reshapeOnPush: true,
		})
	}
	bufferStatusDataSource(): DataSource {
		return new DataSource({
			store: AspNetData.createStore({
				key: 'id',
				loadUrl: `${this.baseUrl}/buffers`,
			}),
			reshapeOnPush: true,
		})
	}
	zcuStatusDataSource(): DataSource {
		return new DataSource({
			store: AspNetData.createStore({
				key: 'id',
				loadUrl: `${this.baseUrl}/zcus`,
			}),
			reshapeOnPush: true,
		})
	}
	clusterStatusDataSource(): DataSource {
		return new DataSource({
			store: AspNetData.createStore({
				key: 'id',
				loadUrl: `${this.baseUrl}/clusters`,
			}),
			reshapeOnPush: true,
		})
    }
    unuseStatusDataSource(): DataSource {
      return new DataSource({
        store: AspNetData.createStore({
          key: 'id',
          loadUrl: `${this.baseUrl}/unuseLists`,
        }),
        reshapeOnPush: true,
      })
    }
}
