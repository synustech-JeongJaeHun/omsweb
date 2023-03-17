import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import DataSource from 'devextreme/data/data_source'
import * as AspNetData from 'devextreme-aspnet-data-nojquery'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

import {
	IModuleStatus,
	IServiceProcessStates,
	ISystemStates,
	IFileItem,
	ISettingMode,
} from '@oms/models/system.model'
import {IPreferences} from "@oms/models/settings.model";
import {SettingsService} from "@oms/services/settings.service";
@Injectable({
	providedIn: 'root',
})
export class SystemsService {
	private baseUrl = '/api/systems'
	private _states: ISystemStates

	get currentState$(): Observable<ISystemStates> {
		return this.states()
	}

	constructor(private http: HttpClient, private settingSvc: SettingsService,) {}

	states(): Observable<ISystemStates> {
		return this.http.get<ISystemStates>(`${this.baseUrl}/states`).pipe(
			tap((res) => {
				this._states = res
			}),
		)
	}

	settingMode() {
		return this.http.get<ISettingMode>(`${this.baseUrl}/settings/mode`)
	}

  zcusWithFireshutter() {
    return this.http.get<number[]>(`${this.baseUrl}/zcus-with-fireshutter`)
  }

	vehicles(): DataSource {
		return new DataSource({
			store: AspNetData.createStore({
				key: 'id',
				loadUrl: `/assets/json/vehicles.json`,
			}),
		})
	}

	processes(): Observable<IServiceProcessStates[]> {
		return this.http.get<IServiceProcessStates[]>('/assets/json/processes.json')
	}

	moduleStatus(): Observable<IModuleStatus[]> {
		return this.http.get<IModuleStatus[]>(`${this.baseUrl}/module-status`)
	}

	fileItems(): Observable<IFileItem[]> {
		return this.http.get<IFileItem[]>(`${this.baseUrl}/logs`)
	}

  controlTables(): Observable<IPreferences['controlTables']> {
    return this.http.get<IPreferences['controlTables']>(`${this.baseUrl}/controlTables`)
  }

  loadControlTables(){
    this.settingSvc.serviceConfig.subscribe((config) => {
      if(!config.customSet) return

      const pref = this.settingSvc.globalPreferences;
      this.controlTables().subscribe((res)=>{
        if(res && res['ControlTables']){
          const r = res['ControlTables']
          Object.keys(pref.controlTables).forEach((key) => {
            if(typeof r[key] === 'boolean')
              pref.controlTables[key] = r[key]
            else if(Array.isArray(r[key])
              && pref.controlTables[key].length === r[key].length){
              pref.controlTables[key] = r[key]
            }
          });
          this.settingSvc.globalPreferences.save()
        }
      })
    });
  }

	maps() {
		return this.http.get<string[]>(`${this.baseUrl}/maps`)
	}
	currentMap() {
		return this.http.get<{
			dbName: string
			dbVersion: number
			srcMapFile: string
		}>(`${this.baseUrl}/current-map`)
	}

	downloadFile(name: string, path: string): Observable<Blob> {
		let params = new HttpParams()
		params = params.append('fileFullPath', path)
		return this.http.get(`${this.baseUrl}/logs/downloadFile/${name}`, {
			params: params,
			responseType: 'blob',
		})
	}

	downloadFoldersNFiles(name: string, paths: any): Observable<Blob> {
		let params = new HttpParams()
		params = params.append('folderFullPaths', paths)
		return this.http.get(`${this.baseUrl}/logs/downloadFoldersNFiles/${name}`, {
			params: params,
			responseType: 'blob',
		})
	}

	downloadFolder(name: string, path: string): Observable<Blob> {
		let params = new HttpParams()
		params = params.append('folderFullPath', path)
		return this.http.get(`${this.baseUrl}/logs/downloadFolder/${name}`, {
			params: params,
			responseType: 'blob',
		})
	}

	updateMap(mapName: string, mapFile: string, overWrite: boolean) {
		return this.http.post<{ message: string; bResult: boolean }>(
			`${this.baseUrl}/control/updateMap/${mapName}`,
			{ mapFile, overWrite },
		)
	}

  dbHistory(): DataSource {
    return new DataSource({
      store: AspNetData.createStore({
        key: 'id',
        loadUrl: `${this.baseUrl}/db-history`,
      }),
    });
  }
}
