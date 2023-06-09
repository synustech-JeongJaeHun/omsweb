import {Injectable} from '@angular/core';
import {Subject} from "rxjs";
import {TrackMonitorSetting, TrackMonitorSettingService} from "@oms/services/track-monitor-setting.service";
import {SettingsService} from "@oms/services/settings.service";

@Injectable({
  providedIn: 'root'
})
export class MobileService {

  public isMobileChanged$= new Subject<boolean>();
  private _isMobile = false
  private _showToolbox = false

  keys = ['isMinimapVisible', 'isVhlStatusVisible']
  constructor(
    private trackMonitorSettingService: TrackMonitorSettingService,
  ) {
  }

  checkMobile(isOn= false) {
    this.isMobile = isOn ? this.detectMobileDevice(window.navigator.userAgent) : false
  }

  get isMobile() : boolean {
    return this._isMobile
  }

  set isMobile(value : boolean){
    this._isMobile= value
    this.isMobileChanged$.next(this._isMobile);


    if(!this._isMobile){
      this.showToolbox = true
      this.reset()
    }
    else{
      this.mobileSet()
    }
  }


  get showToolbox() : boolean{
    return this._showToolbox
  }

  set showToolbox(value: boolean) {
    this._showToolbox=value
  }

  mobileSet(){
    this.keys.forEach(k=>{
      this.trackMonitorSettingService.update({
        // @ts-ignore
        key: k,
        value: false
      })
    })
  }

  reset(){
    this.keys.forEach(k=>{
      this.trackMonitorSettingService.reset(k as keyof TrackMonitorSetting)
    })
  }

  detectMobileDevice(agent) {
    const mobileRegex = [
      /Android/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i
    ]
    return mobileRegex.some(mobile => agent.match(mobile))
  }
}
