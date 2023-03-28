import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import DataSource from 'devextreme/data/data_source'
import { Observable, of } from 'rxjs'
import { tap } from 'rxjs/operators'
import {
    ClientPreferences,
    ISettingsDelayedTransferTimeout,
    ISettingsAlternateTransfer,
    ISettingsAlternateStation,
	ISettingsBufferWithUnuse,
	ISettingsGroup,
	ISettingsGroupedObject,
	ISettingsCluster,
	ISettingsClusterPoint,
	ISettingsSegmentWithVPartsNBlocking,
	ISettingsStationWithUnuse,
	ISettingsVehicleReg,
    ISettingsZcu,
	ServiceConfig,
	ManualTransferFiltersSetting,
	NodeMarginSetting,
} from '../models/settings.model'
import { IQueryResult } from '@oms/models/query-result.model'
import * as AspNetData from 'devextreme-aspnet-data-nojquery'

@Injectable({
	providedIn: 'root',
})
export class SettingsService {
	private baseUrl = '/api/settings'

	private _globalPreferences: ClientPreferences
	private _serviceConfig: ServiceConfig

	get globalPreferences(): ClientPreferences {
		return this._globalPreferences
	}

	get serviceConfig(): Observable<ServiceConfig> {
		if (this._serviceConfig) return of(this._serviceConfig)
		return this.loadConfig()
	}

	constructor(private http: HttpClient) {
		this.loadPreferences()
	}

	public loadConfig(): Observable<ServiceConfig> {
		return this.http.get<ServiceConfig>(`/api/systems/settings/client`).pipe(
			tap((x) => {
				this._serviceConfig = x
			}),
		)
	}

	loadDefaultColors() {
		return this.http.get(`/api/systems/settings/default-colors`)
	}

	loadVehicleOrderIdContents() {
		return this.http.get<{orderId?: boolean, carrierId?: boolean}>(`/api/systems/settings/vehicle-orderid-contents`)
	}

	loadManualTransferFiltersSetting() {
		return this.http.get<ManualTransferFiltersSetting>(
			`/api/systems/settings/manual-transfer-filters`,
		)
	}

	loadNodeMarginsSettings() {
		return this.http.get<NodeMarginSetting>(
			`/api/systems/settings/node-margins`,
		)
	}

	loadPreferences() {
		this._globalPreferences = new ClientPreferences('global.pref')
	}

	settingsGroups(): Observable<ISettingsGroup[]> {
		return this.http.get<ISettingsGroup[]>(`${this.baseUrl}/groups`)
	}
	settingsGroupedObjects(): Observable<ISettingsGroupedObject[]> {
		return this.http.get<ISettingsGroupedObject[]>(
			`${this.baseUrl}/groups/grouped_objects`,
		)
	}

	settingsGroupIsAvailableHomePoints(groupId: number): Observable<number[]> {
		return this.http.get<number[]>(
			`${this.baseUrl}/groups/isavailablehomes/${groupId}`,
		)
	}

	settingsGroupIsAvailableStations(groupId: number): Observable<number[]> {
		return this.http.get<number[]>(
			`${this.baseUrl}/groups/isavailablestations/${groupId}`,
		)
	}

	settingsGroupIsAvailableVehicles(groupId: number): Observable<number[]> {
		return this.http.get<number[]>(
			`${this.baseUrl}/groups/isavailablevehicles/${groupId}`,
		)
	}

	settingsGroupIsAvailableBuffers(groupId: number): Observable<number[]> {
		return this.http.get<number[]>(
			`${this.baseUrl}/groups/isavailablebuffers/${groupId}`,
		)
	}

	settingsClusters(): Observable<ISettingsCluster[]> {
		return this.http.get<ISettingsCluster[]>(`${this.baseUrl}/clusters`)
	}

	settingsClusterPoints(): Observable<ISettingsClusterPoint[]> {
		return this.http.get<ISettingsClusterPoint[]>(
			`${this.baseUrl}/clusters/points`,
		)
	}

	settingsClusterIsAvailablePoints(clusterId: number): Observable<number[]> {
		return this.http.get<number[]>(
			`${this.baseUrl}/clusters/isavailablepoints/${clusterId}`,
		)
	}

	settingsClusterAssignedPoints(clusterId: number): Observable<number[]> {
		return this.http.get<number[]>(
			`${this.baseUrl}/clusters/assignedpoints/${clusterId}`,
		)
	}

	settingsSegments(): Observable<ISettingsSegmentWithVPartsNBlocking[]> {
		return this.http.get<ISettingsSegmentWithVPartsNBlocking[]>(
			`${this.baseUrl}/segments`,
		)
	}

	saveSegments(form: ISettingsSegmentWithVPartsNBlocking[]): Observable<void> {
		return this.http.post<void>(`${this.baseUrl}/segments/save`, form)
	}

	settingsStations(): Observable<ISettingsStationWithUnuse[]> {
		return this.http.get<ISettingsStationWithUnuse[]>(
			`${this.baseUrl}/stations`,
		)
	}

	settingsBuffers(): Observable<ISettingsBufferWithUnuse[]> {
		return this.http.get<ISettingsBufferWithUnuse[]>(`${this.baseUrl}/buffers`)
	}

	settingsPointsDataSource(): DataSource {
		return new DataSource({
			store: AspNetData.createStore({
				key: 'id',
				loadUrl: `${this.baseUrl}/points`,
			}),
		})
	}

	settingsZcus(): Observable<ISettingsZcu[]> {
		return this.http.get<ISettingsZcu[]>(`${this.baseUrl}/zcus`)
	}

	settingsVehicles(): Observable<ISettingsVehicleReg[]> {
		return this.http.get<ISettingsVehicleReg[]>(`${this.baseUrl}/vehicleRegs`)
    }

	deleteVehicleRegs(form: any[]): Observable<void> {
		return this.http.post<void>(`${this.baseUrl}/vehicleRegs/remove`, form)
	}

	saveVehicleRegs(form: any[]): Observable<void> {
		return this.http.post<void>(`${this.baseUrl}/vehicleRegs/save`, form)
    }

    settingsAlternateTransfer(): Observable<ISettingsAlternateTransfer> {
        return this.http.get<ISettingsAlternateTransfer>(`${this.baseUrl}/alternateTransfer`)
    }

    settingsAlternateStations(): Observable<ISettingsAlternateStation[]> {
        return this.http.get<ISettingsAlternateStation[]>(`${this.baseUrl}/alternateStations`)
    }

    updateAlternateTransfer(mode: string, rertyTostb: string, retryToNearStocker: string, stations: string, timeoutForAlternate: string): Observable<IQueryResult> {
        return this.http.post<IQueryResult>(`${this.baseUrl}/updateAlternateTransfer/${mode}&${rertyTostb}&${retryToNearStocker}&${stations}&${timeoutForAlternate}`, '')
    }

    settingsRebalance(): Observable<IQueryResult> {
        return this.http.get<IQueryResult>(`${this.baseUrl}/settingsRebalance`)
    }

    updateSettingsRebalanceCfg(homeMode: string, ivrMode: string): Observable<IQueryResult> {
        return this.http.post<IQueryResult>(`${this.baseUrl}/updateSettingsRebalanceCfg/${homeMode}&${ivrMode}`, '')
    }

    settingsDelayedTransferTimeout(): Observable<ISettingsDelayedTransferTimeout> {
        return this.http.get<ISettingsDelayedTransferTimeout>(`${this.baseUrl}/settingsDelayedTransferTimeout`)
    }

    updateSettingsDelayedTransferTimeout(timeout: string, warningNotify: string, tableNotify: string): Observable<IQueryResult> {
        return this.http.post<IQueryResult>(`${this.baseUrl}/updateSettingsDelayedTransferTimeout/${timeout}&${warningNotify}&${tableNotify}`, '')
    }
}
