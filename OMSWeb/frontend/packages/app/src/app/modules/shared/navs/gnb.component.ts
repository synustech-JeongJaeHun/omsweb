import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { SettingsService } from '../../../services/settings.service';
import { BrowserModule, Title } from '@angular/platform-browser';
import {DialogService} from "@oms/services/dialog.service";
import {TranslateService} from "@ngx-translate/core";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {HubService} from "@oms/services/hub.service";
import {SystemsService} from "@oms/services/systems.service";
import { MobileService } from '../../../services/mobile.service';
import { Subscription } from 'rxjs';
import {StatusService} from "@oms/services/status.service";

@Component({
  selector: 'oms-gnb',
  templateUrl: './gnb.component.html',
  styleUrls: ['gnb.component.scss'],
})
export class GnbComponent implements OnInit, OnDestroy {
  version: string;
  titleText: string = 'OMS';
  private destroy$: Subject<void> = new Subject<void>()
  isOpen =false;
  private subscribe = new Subscription();

  get showVersion(): boolean {
    return this.settingSvc.globalPreferences.toggles.showOmsVersion;
  }

  constructor(private auth: AuthService,
              private settingSvc: SettingsService,
              private title:Title,
              private dialogSvc: DialogService,
              private t$: TranslateService,
              private hubSvc: HubService,
              private systemSvc: SystemsService,
              private mobile: MobileService,
              private status: StatusService)
  {

  }

  ngOnInit(): void {
    this.settingSvc.serviceConfig.subscribe((config) => {
      this.version = config.version;
      this.titleText = config.titleText;
      this.title.setTitle(config.titleText+' UI')

      if (config.sid != this.auth.sid) {
        this.auth.updateSID(config.sid);
        this.auth.logout();
      }
    });

    this.hubSvc.mapUpdateStatus$.pipe(takeUntil(this.destroy$)).subscribe((e) => {
      if (e.operation === 'INSERT' || e.operation === 'UPDATE'){
        if(!this.isOpen){
          this.isOpen = true
          this.status.clearTrack().subscribe(res=>{
            this.dialogSvc
              .confirm({ body: this.t$.instant('messages.reload') })
              .subscribe((ok) => {
                if (ok) {
                  window.location.reload()
                }
                this.isOpen =false
              });
          })
        }

      }
    })

    this.getVersion()
  }

  getVersion() {
    this.systemSvc.moduleStatus().subscribe((res) => {
      const omsSrv = res.find(v=>v.id===1);
      if(omsSrv) this.version = omsSrv.version
    });
  }

  ngOnDestroy() {
    this.subscribe.unsubscribe();
    this.destroy$.next()
    this.destroy$.complete()
  }

  get isMobile(){
    return this.mobile.isMobile
  }

  clickToolbox(){
    this.mobile.showToolbox = !this.mobile.showToolbox
  }
}
