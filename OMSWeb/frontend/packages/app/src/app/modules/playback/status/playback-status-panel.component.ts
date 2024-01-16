import { Component, OnDestroy, OnInit } from '@angular/core'
import { SettingsService } from '@oms/root/services/settings.service'
import { MapStatesService } from '../../track-map/map-states.service'
import {ClientPreferences} from "../../../models/settings.model";
import {AuthService} from "../../../services/auth.service";
import {auditTime, takeUntil} from "rxjs/operators";
import {AuditTimeDuration} from "../../monitor/tables/constants";
import {Subject} from "rxjs";
@Component({
	selector: 'oms-playback-status-panel',
	templateUrl: './playback-status-panel.component.html',
	styleUrls: ['./playback-status-panel.component.scss'],
})
export class PlaybackStatusPanelComponent implements OnInit, OnDestroy {
	resizeHandler: any
	tableHeightNum = 300

	bufferEnabled: boolean = true

	get tableHeight(): number {
		return this.tableHeightNum
	}

	currentTab: number = 0

  currentTabName: string = 'orders'

  tableKeys:string[] = []
  preference: ClientPreferences

  private destroy$: Subject<void> = new Subject<void>()

  get canControl(): boolean {
    return this.auth.isAuthenticated
  }
	constructor(
    private auth: AuthService,
		private mapStateSvc: MapStatesService,
		private settingSvc: SettingsService,
	) {
    this.preference = this.settingSvc.globalPreferences
		settingSvc.serviceConfig.subscribe(
			(config) => (this.bufferEnabled = config.bufferEnabled),
		)

    this.currentTab = this.settingSvc.globalPreferences.uiStates.playbackTab
    this.initLoad()
    settingSvc.tableChanged$
      .pipe(auditTime(AuditTimeDuration), takeUntil(this.destroy$))
      .subscribe(()=>{
        this.initLoad()
      })
	}

  initLoad(){
    this.preference = this.settingSvc.globalPreferences
    this.settingSvc.serviceConfig.subscribe(
      (config) => {
        this.bufferEnabled = config.bufferEnabled
        if(!this.bufferEnabled){
          this.settingSvc.globalPreferences.controlTables.buffers =false
        }
      },
    )
    const keys = Object
      .keys(this.settingSvc.globalPreferences.controlTables)
      .filter(key=> {
        if(this.canControl){
          if(!key.includes('_')) return key
        }
        else{
          if(key.endsWith('orders') || key.endsWith('vehicles')) return key
        }
      })
    this.tableKeys = keys.filter(k=>{
      if(this.settingSvc.globalPreferences.controlTables[k]) return k
    })

    this.resizeHandler = this.onMouseMove.bind(this)
    this.resizeTableHeight(this.tableHeightNum)


    this.currentTab = this.tableKeys.findIndex(t=>t===this.currentTabName)
    this.currentTab = this.currentTab<0 ? 0 : this.currentTab
    this.currentTabName=this.tableKeys[this.currentTab]
  }

	ngOnInit(): void {
		this.resizeHandler = this.onMouseMove.bind(this)

		this.resizeTableHeight(this.tableHeightNum)
	}
	ngOnDestroy(): void {
		this.resizeTableHeight(0)
    this.destroy$.next()
    this.destroy$.complete()
	}
	resizeTableHeight(height: number) {
		this.tableHeightNum = height
		setTimeout(() => {
			this.mapStateSvc.statusTableHeight = this.tableHeightNum
			this.mapStateSvc.statusTableResizeEvent$.next(this.tableHeightNum)
		}, 0)
	}

	onMouseMove(event) {
		let resizedH = window.innerHeight - event.clientY
		if (resizedH < 40) {
			resizedH = 40
			this.resizeViewerStop(event)
		} else if (resizedH > window.innerHeight) {
			resizedH = window.innerHeight
			window.removeEventListener('mousemove', this.resizeHandler)
		}
		document.getElementById('status-control-container').style.height =
			resizedH + 'px'

		this.resizeTableHeight(resizedH - 37)
	}
	onChangeTab(selectedIndex: number) {
		const pref = this.settingSvc.globalPreferences
		pref.uiStates.playbackTab = selectedIndex
		this.settingSvc.globalPreferences.save()
    this.currentTabName=this.tableKeys[selectedIndex]
	}

	resizeViewerStart() {
		window.addEventListener('mousemove', this.resizeHandler)
	}

	resizeViewerStop(event) {
		if (event.type === 'mouseleave') {
			if (window.innerHeight - event.clientY < 0) {
				window.removeEventListener('mousemove', this.resizeHandler)
			}
		}
		if (event.type === 'mouseup') {
			window.removeEventListener('mousemove', this.resizeHandler)
		}
	}

	viewerHide() {
		this.mapStateSvc.changeToolbarState('controlTable', false)
		this.resizeTableHeight(0)
	}
	shrinkViewer() {
		const height = document.getElementById('status-control-container').style
			.height
		if (height === '40px') {
			document.getElementById('status-control-container').style.height = '365px'
			this.resizeTableHeight(300)
		} else {
			document.getElementById('status-control-container').style.height = '40px'
			this.resizeTableHeight(0)
		}
	}

  canDisplayTable(type: string): boolean {
    return this.preference.controlTables[type]
  }

  onTabIndex(type: string):boolean{
    const index = this.tableKeys.findIndex(key=>key.toLowerCase()===type);
    return this.currentTab===index;
  }

  labelDisplayTable(type: string): string {
    return this.preference.controlTables[type]
  }
}
