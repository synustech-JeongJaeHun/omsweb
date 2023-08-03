import {Component, EventEmitter, HostListener, OnDestroy, OnInit} from '@angular/core'
import { SystemStatusService } from '@oms/root/services/system-status.service'
import { TrackStatusService } from '@oms/root/services/track-status.service'

import { SettingsService } from '@oms/services/settings.service'
import { Dto } from '../../../models/dto/track.model'
import { ViewModes } from '../../../models/enums'
import { IPreferences } from '../../../models/settings.model'
import { AuthService } from '../../../services/auth.service'
import {CdkDragEnd, CdkDragMove} from "@angular/cdk/drag-drop";
import {TrackMonitorSettingService} from "@oms/services/track-monitor-setting.service";
import {MobileService} from "../../../services/mobile.service";
import {HubService} from "@oms/services/hub.service";
import { takeUntil } from 'rxjs/operators'
import {Subject} from "rxjs";
import {Router} from "@angular/router";


@Component({
	selector: 'oms-monitor-status',
	templateUrl: './monitor-status.component.html',
	styles: [
		`
      :host {
        background-color: var(--monitor-background-color);
        display: block;
        position: relative;
        z-index: 3;
        width: 100%;
        height: 100%;
      }

      #status-control {
        position: absolute;
        /* border-radius: 5px; */
        box-shadow: 0px 0px 5px #aaa;
        display: inline-block;
        flex-direction: column;
        bottom: 0px;
        left: 0px;
        z-index: 10;
        width: 100%;
      }

      #loading-bar {
        position: absolute;
        top: 40%;
        left: 25%;
        width: 50%;
        text-align: center;
        background-color: white;
        padding: 20px;
        z-index: 5;
      }

      .mat-progress-bar {
        margin-top: 10px;
      }

      @keyframes box-ani {
        0% {opacity:0;}
        50% {opacity:1;}
        100% {opacity:0;}
      }

      .bound {
        position: absolute;
        background-color: rgb(251, 41, 41);
        z-index: 16;
        animation: box-ani 2s infinite;
      }
    `,
	],
})
export class MonitorStatusComponent implements OnInit,OnDestroy {
	loadingState = true
	ready = false
	mapPreference: IPreferences
	viewMode: ViewModes
	trackData: Dto.ITrackData

  enabled = false
  vhlDisplay = true

  includesWords  = []
  indicatorFireEmergency = false
  fireEmergency = false

  isInit = true

	findEvent = new EventEmitter<{ type: string; id: number }>()
	focusEvent = new EventEmitter<{
		type: string
		id: number
		focusType?: string
	}>()
	dropFocusEvent = new EventEmitter<{ focusType?: string }>()

  private destroy$: Subject<void> = new Subject<void>();

	get showControlTable(): boolean {
		return this.mapPreference.toggles.controlTable
	}

  pageLoaded: boolean = false;

	constructor(
		private auth: AuthService,
		private settingSvc: SettingsService,
		private trackStatusService: TrackStatusService,
		systemStatusService: SystemStatusService,
    private trackMonitorSettingService: TrackMonitorSettingService,
    private mobileSvc: MobileService,
    private hubSvc: HubService,
    private router: Router
	) {
		this.viewMode = this.auth.isAuthenticated
			? ViewModes.viewer
			: ViewModes.public

    trackStatusService.isTrackReadyChanged.subscribe(isReady=>{
      this.loadingState = !isReady
      this.ready = isReady
      if(isReady){
        this.isInit && this.loadedTrack()
      }
    })

    settingSvc.serviceConfig.subscribe(
      (config) => {
        const fireStationFilters = config?.fireStationFilters
        this.includesWords = [
          ...fireStationFilters?.startWords,
          ...fireStationFilters?.endWords,
          ...fireStationFilters?.includeWords].filter(i=>i&&i)
        this.trackStatusService.fetchTrack().then(()=>{
          this.loadedTrack()
        })
        this.indicatorFireEmergency = config?.indicatorFireEmergency
      },
    )

		systemStatusService.updateNodeMarginsSetting()

    this.settingSvc.serviceConfig.subscribe(cfg => {
      this.enabled = cfg.kpiEnabled;
    })

    this.vhlDisplay = this.trackMonitorSettingService.trackSetting.isVhlStatusVisible
    this.trackMonitorSettingService.vhlStatusChanged.subscribe((checked) =>{
      this.vhlDisplay = checked
      this.resetVhlStatus()
    })
	}

	ngOnInit() {
		this.mapPreference = this.settingSvc.globalPreferences
    this.dragPosition = this.settingSvc.globalPreferences.map.vhlStatusPos || {x: 0, y: 0}

    this.hubSvc.systemState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((e) => {
        this.fireEmergency = e.fireEmergency
      });

    this.pageLoaded = true;
	}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleFindAndFocus = (event: { type: string; id: number }) => {
		this.findEvent.emit(event)
		this.focusEvent.emit(event)
	}

	handleFocus = (event: { type: string; id: number; focusType?: string }) => {
		this.focusEvent.emit(event)
	}
	handleDropFocus = (event: { focusType?: string }) => {
		this.dropFocusEvent.emit(event)
	}
  dragPosition = {x: 0, y: 0}

  dragEnded($event: CdkDragEnd) {
    this.settingSvc.globalPreferences.map.vhlStatusPos = $event.source.getFreeDragPosition()
    this.settingSvc.globalPreferences.save()
  }

  resetVhlStatus(){
    this.dragPosition = {x: 0, y: 0}
    this.settingSvc.globalPreferences.map.vhlStatusPos =this.dragPosition
    this.settingSvc.globalPreferences.save()
  }

  includeCheck(word: string){
    return this.includesWords.some(i=>word.includes(i))
  }

  get isMobile(){
    return this.mobileSvc.isMobile
  }

  @HostListener('document:visibilitychange', ['$event'])
  private visibilitychange() {
    if(document.hidden){
      this.hubSvc.stop()
      this.trackStatusService.isTrackReady =false
      this.trackStatusService.isTrackReadyChanged.emit(false)
    }
    else{
      if(!this.isPlayback){
        this.trackStatusService.reloadMap()
        this.hubSvc.start();
      }
    }
  }

  private loadedTrack(){
    this.trackData = this.trackStatusService.trackData
    this.trackData.stations.map(s=>{
      if(!this.includeCheck(s.logicalId)) s.carrierId =null
    })
    this.isInit =false
  }

  get isPlayback(){
    return this.router.url.includes('/playback')
  }
}
