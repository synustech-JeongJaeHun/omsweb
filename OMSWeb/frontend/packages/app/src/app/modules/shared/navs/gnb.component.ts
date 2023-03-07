import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { AccountUtil } from '@oms/utils/account.util';
import { UserPermissions } from '../../../models/enums';
import { SettingsService } from '../../../services/settings.service';
import { BrowserModule, Title } from '@angular/platform-browser';
import {DialogService} from "@oms/services/dialog.service";
import {TranslateService} from "@ngx-translate/core";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {HubService} from "@oms/services/hub.service";

@Component({
  selector: 'oms-gnb',
  templateUrl: './gnb.component.html',
  styleUrls: ['gnb.component.scss'],
})
export class GnbComponent implements OnInit {
  version: string;
  titleText: string = 'OMS';
  private destroy$: Subject<void> = new Subject<void>()

  get showVersion(): boolean {
    return this.settingSvc.globalPreferences.toggles.showOmsVersion;
  }

  constructor(private auth: AuthService,
              private settingSvc: SettingsService,
              private title:Title,
              private dialogSvc: DialogService,
              private $t: TranslateService,
              private hubSvc: HubService,
              ) { }

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
        this.dialogSvc
          .confirm({ body: this.$t.instant('messages.reload') })
          .subscribe((ok) => {
            if (ok) {
              window.location.reload()
            }
          });
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
