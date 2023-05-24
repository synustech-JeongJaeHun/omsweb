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
import {
  ClientPreferences,
  MonitorControlTable,
  ToggleOptionsType,
  TrackObjectConfig,
  TTSConfig
} from "@oms/models/settings.model";
import {SettingsService} from "@oms/services/settings.service";
import {TrackMonitorSetting, TrackMonitorSettingService} from "@oms/services/track-monitor-setting.service";
import {JsonObject} from "@angular/compiler-cli/ngcc/src/packages/entry_point";
import {DEFAULT_ELEMENT_DATA, PeriodicElement} from "@oms/models/cps-status.model";
@Injectable({
	providedIn: 'root',
})
export class SystemsService {
	private baseUrl = '/api/systems'
	private _states: ISystemStates
  private cpsDataSource:PeriodicElement[]
	get currentState$(): Observable<ISystemStates> {
		return this.states()
	}

  get reference(): PeriodicElement[] {
    if(this.cpsDataSource) return this.cpsDataSource;
    this.loadReference().subscribe(res=> {
      if(res){
        this.cpsDataSource = res['cps'] as any as PeriodicElement[]
      }else{
        this.cpsDataSource = DEFAULT_ELEMENT_DATA
      }
      return this.cpsDataSource;
    }, error => this.cpsDataSource=DEFAULT_ELEMENT_DATA)
  }

	constructor(private http: HttpClient,
              private settingSvc: SettingsService,
              private trackMonitorSettingSvc: TrackMonitorSettingService) {
  }

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

  controlTables(): Observable<JsonObject> {
    return this.http.get<JsonObject>(`${this.baseUrl}/customSettings`)
  }

  loadReference(): Observable<JsonObject> {
    return this.http.get<JsonObject>(`${this.baseUrl}/reference`)
  }
  loadControlTables(){
    this.settingSvc.serviceConfig.subscribe((config) => {
      if(!config.customSetting) return

      this.controlTables().subscribe((res)=>{
        if(res){
          let globalPreferences = this.settingSvc.globalPreferences;
          let trackSetting = this.trackMonitorSettingSvc.trackSetting;

          this.jsonToSetting(res['ControlTables'] as MonitorControlTable, globalPreferences.controlTables)
          this.jsonToSetting(res['ToggleOptionsType'] as ToggleOptionsType, globalPreferences.toggles)
          this.jsonToSetting(res['TrackObjectConfig'] as TrackObjectConfig, globalPreferences.trackDisplay)
          this.jsonToSetting(res['TTSConfig'] as TTSConfig, globalPreferences.tts)
          this.jsonToSetting(res['TrackMonitorSetting'] as TrackMonitorSetting, trackSetting )

          this.settingSvc.globalPreferences.save()
          this.trackMonitorSettingSvc.updateCustom(trackSetting)
        }
      })
    });
  }

  jsonToSetting(obj: MonitorControlTable | ToggleOptionsType | TrackObjectConfig | TTSConfig | TrackMonitorSetting,
                pref: MonitorControlTable | ToggleOptionsType | TrackObjectConfig | TTSConfig | TrackMonitorSetting){
    if(obj){
      Object.keys(pref).forEach((key) => {
        if(obj[key]!==undefined && obj[key]!==null) pref[key] = obj[key]
      });
    }
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
