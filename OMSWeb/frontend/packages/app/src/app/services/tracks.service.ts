import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { ICarrier } from '@oms/models/carrier.model'
import { ICarrierLoc } from '@oms/models/carrier.model'
import { ICarrierQuery } from '@oms/models/carrier.model'
import { Dto } from '@oms/models/dto/track.model'

@Injectable({
	providedIn: 'root',
})
export class TracksService {
    private baseUrl = '/api/tracks'
    private _states: ICarrier

	constructor(private http: HttpClient) {}

	// not used, using in map.interface.ts
	// getCarrierId(carrierLocation: string) {
	// 	return this.http.get<string>(`${this.baseUrl}/carriers/${carrierLocation}`)
	// }

    	getCarrierInfo(carrierLocation: string): Observable<ICarrier> {
        	return this.http.get<ICarrier>(`${this.baseUrl}/carrierinfo/${carrierLocation}`)
    	}

    	getCarrierLoc(carrierId: string): Observable<ICarrierLoc> {
        	return this.http.get<ICarrierLoc>(`${this.baseUrl}/carrierloc/${carrierId}`)
    	}

    	getCarrierQuery(carrierLoc: string, carrierId: string): Observable<ICarrierQuery> {
        	return this.http.get<ICarrierQuery>(`${this.baseUrl}/carrierquery/${carrierLoc}&${carrierId}`)
    	}

	loadGroups(): Observable<Dto.IGroup[]> {
		return this.http.get<Dto.IGroup[]>(`${this.baseUrl}/groups`)
	}

	updateGroup(id: number, group: Dto.IGroup): Observable<void> {
		return this.http.put<void>(`${this.baseUrl}/groups/${id}`, group)
	}

	loadClusters(): Observable<Dto.ICluster[]> {
		return this.http.get<Dto.ICluster[]>(`${this.baseUrl}/clusters`)
	}

	updateCluster(id: number, cluster: Dto.ICluster): Observable<void> {
		return this.http.put<void>(`${this.baseUrl}/clusters/${id}`, cluster)
	}

	loadSegments(): Observable<Dto.ISegment[]> {
		return this.http.get<Dto.ISegment[]>(`${this.baseUrl}/segments`)
	}

	loadPoints(): Observable<Dto.IPoint[]> {
		return this.http.get<Dto.IPoint[]>(`${this.baseUrl}/points`)
	}

	loadStations(): Observable<Dto.IStation[]> {
		return this.http.get<Dto.IStation[]>(`${this.baseUrl}/stations`)
	}

    loadBufferById(id: number) {
      return this.http.get<Dto.IBuffer>(`${this.baseUrl}/buffers/${id}`)
    }

    updateBuffer(bufferId: number, form: any): Observable<void> {
      return this.http.patch<void>(`${this.baseUrl}/buffers/${bufferId}`, form)
    }

	installBufferCarrier(bufferId: number, carrierId: number): Observable<void> {
		return this.http.post<void>(
			`${this.baseUrl}/buffers/${bufferId}/carrier/${carrierId}`,
			{},
		)
	}

	removeBufferCarrier(bufferId: number): Observable<void> {
		return this.http.delete<void>(`${this.baseUrl}/buffers/${bufferId}/carrier`)
	}
}
