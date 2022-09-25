import { Component } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { PermissionEnums } from '@oms/root/models/enums'
import { AuthService } from '@oms/root/services/auth.service'
import { DialogService } from '@oms/root/services/dialog.service'
import { MessagesService } from '@oms/root/services/messages.service'
import { SystemStatusService } from '@oms/services/system-status.service'
import { SettingsService } from '../../../services/settings.service'
import { Subject } from 'rxjs'
import { ISettingsVehicleReg } from '../../../models/settings.model';

@Component({
	selector: 'oms-system-preference',
	templateUrl: './system-preference.component.html',
	styleUrls: ['./system-preference.component.scss'],
})
export class SystemPreferenceComponent {
    private destroy$ = new Subject<void>()

	constructor(
		private $t: TranslateService,
		private auth: AuthService,
		private dialogSvc: DialogService,
		private messageSvc: MessagesService,
        private systemStatusService: SystemStatusService,
        private settingsSvc: SettingsService,
    ) {
      this.init()
    }

	readonly permissionEnums = PermissionEnums

	readonly rebalanceModes = [
		{ key: 'home', label: this.$t.instant('names.home') },
		{ key: 'ivr', label: this.$t.instant('names.ivr') },
		{ key: 'none', label: this.$t.instant('names.none') },
    ]

    readonly rebalanceTabInex = ['home', 'ivr', 'none' ]

    public curselKey = 'none';
    public tabIndex = 2;
    public argumentKey = 'none';
    private homeMode = 0;
    private ivrMode = 0;
    private updateToConfig = false;

    // vehicle mileage
    dataSource: ISettingsVehicleReg[];
    selectedIds: number[] = [];

    delayedTranferTimeoutValue: number = 3600;
    warningNotifyValue: boolean = true;
    tableNotifyValue: boolean = true;

    get console() {
      return console
    }

	get selectedRebalanceMode() {
      return [this.curselKey]
    }

    get selectedTabIndex() {
      if (this.curselKey == 'home') return 0;
      if (this.curselKey == 'ivr') return 1;
      if (this.curselKey == 'none') return 2;
    }

    get translatedSelectedRebalancedMode() {
      const name = `names.${this.selectedRebalanceMode[0]}`
      return this.$t.instant(name)
    }

	get isChainManualCommandDisabled() {
		return this.systemStatusService.chainManualCommandDisabled ?? false
	}

    get canResetMileage(): boolean {
        return this.selectedIds.length > 0;
    }

	hasPermissions(permissions: number[]): boolean {
		return this.auth.hasPermissions(permissions)
	}

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
      this.destroy$.next()
      this.destroy$.complete()
    }

    private init() {
      this.loadSettingsRebalance();
      this.loadDelayedTransferTimeout();
      this.loadVehicleMileageSetting();
    }

    private getConfirmMessage(displayName: string, param: string[]) {
      const transParam = { name: displayName, from: param[0], to: param[1] }
      return {
        title: this.$t.instant('names.changeConfirm', transParam),
        body: this.$t.instant('messages.changeStateConfirm', transParam),
      }
    }

    loadDelayedTransferTimeout() {
      this.settingsSvc.settingsDelayedTransferTimeout()
        .subscribe((res) => {
            this.delayedTranferTimeoutValue = res.timeout;
            this.warningNotifyValue = res.warningNotify;
            this.tableNotifyValue = res.tableNotify;
        });
    }

    loadVehicleMileageSetting() {
      this.settingsSvc.settingsVehicles().subscribe((res) => {
        this.dataSource = res;
      });
    }


    // rebalance
	setRebalanceMode(value: "home" | "ivr" | "none") {
		if (
			!(
				this.systemStatusService.systemStates.tscMode === 0 ||
				this.systemStatusService.systemStates.tscMode === 1 ||
				this.systemStatusService.systemStates.tscMode === 2
			)
		) {
			this.dialogSvc.alert({
				body: this.$t.instant('messages.confirmTSCStateNotPaused'),
			})

			return
        }

        this.updateToConfig = false;
        this.argumentKey = value;

        if (this.argumentKey === this.curselKey)
            return;

        let strAs: string = "";
        if (this.curselKey === 'home') strAs = this.$t.instant(`names.home`)
        if (this.curselKey === 'ivr') strAs = this.$t.instant(`names.ivr`)
        if (this.curselKey === 'none') strAs = this.$t.instant(`names.none`)

        let strTo: string = "";
        if (this.argumentKey === 'home') strTo = this.$t.instant(`names.home`)
        if (this.argumentKey === 'ivr') strTo = this.$t.instant(`names.ivr`)
        if (this.argumentKey === 'none') strTo = this.$t.instant(`names.none`)

        this.dialogSvc.confirm(this.getConfirmMessage(this.$t.instant(`names.rebalance`), [strAs, strTo]))
		 	.subscribe((ok) => {
                if (ok) {
                    if (this.argumentKey === 'home') {
                        this.messageSvc.sendHomeModeChange('on').subscribe(); 
                        this.messageSvc.sendIvrModeChange('off').subscribe(); 
                    }
                    else if (this.argumentKey === 'ivr') {
                        this.messageSvc.sendHomeModeChange('off').subscribe();
                        this.messageSvc.sendIvrModeChange('on').subscribe(); 
                    }
                    else if (this.argumentKey === 'none') {
                        this.messageSvc.sendHomeModeChange('off').subscribe(); 
                        this.messageSvc.sendIvrModeChange('off').subscribe(); 
                    }

                    this.updateToConfig = true;

                    setTimeout(() => {
                        this.loadSettingsRebalance()
                    }, 500)
                }
		 	})
    }

    private loadSettingsRebalance() {
        this.settingsSvc
            .settingsRebalance()
            .subscribe((res) => {
              if (res.message == 'home' ||
                  res.message == 'ivr' ||
                  res.message == 'none')
              {
                  this.curselKey = res.message;
                  this.tabIndex = this.selectedTabIndex;

                  this.homeMode = res.message == 'home' ? 1 : 0;
                  this.ivrMode = res.message == 'ivr' ? 1 : 0;

                  if (this.updateToConfig)
                      this.updateSettingsRebalanceToConfig();
              }
          });
    }

    private updateSettingsRebalanceToConfig() {
        this.settingsSvc.updateSettingsRebalanceCfg(this.homeMode.toString(), this.ivrMode.toString())
            .subscribe((res) => {
                if (res.retcode == 1) {
                }
        });
    }


    // chain manual disabled 
	setChainManualCommandDisabled() {
		this.dialogSvc
			.confirm(
				this.getConfirmMessage(
					this.$t.instant(`names.chainManualCommandDisabled`),
					this.isChainManualCommandDisabled
						? [this.$t.instant(`names.on`), this.$t.instant('names.off')]
						: [this.$t.instant(`names.off`), this.$t.instant('names.on')],
				),
			)
			.subscribe((ok) => {
				if (ok) {
					this.messageSvc.sendChainManualCommandDisabled().subscribe()
				}
			})
	}


    // set Delayted Transfer Timeout
    onChangeDelayedTransferTimeout(value?: number) {
      this.delayedTranferTimeoutValue = value ?? 3600
    }

    setDelayedTransferTimeout() {
      if (this.delayedTranferTimeoutValue == null || this.delayedTranferTimeoutValue === undefined ||
        this.delayedTranferTimeoutValue < 0 || this.delayedTranferTimeoutValue > 2147483) {
        this.dialogSvc.alert({
            title: this.$t.instant('names.setDelayedTransferTimeout'),
            body: this.$t.instant('messages.confirmDelayTransferTimeoutValue'),
        })
        return;
      }

      this.dialogSvc
        .confirm({ body: this.$t.instant('messages.confirmCommand') })
        .subscribe((ok) => {
          if (ok) {
            this.settingsSvc.updateSettingsDelayedTransferTimeout(
                  this.delayedTranferTimeoutValue.toString(),
                  this.warningNotifyValue.toString(),
                  this.tableNotifyValue.toString()
              )
              .subscribe((res) => {
                  if (res.retcode == 1) {
                     this.loadDelayedTransferTimeout();
                  }
              });
          }
        })
    }


    // reset mileage
    onSelectionChanged(e) {
      this.selectedIds = this.selectedIds.filter((x) => x !== undefined);
    }

    resetVehicleMileageTotal(type: string) {
      this.dialogSvc
          .confirm({ body: this.$t.instant('messages.confirmCommand') })
          .subscribe((ok) => {
                if (ok) {
                  this.messageSvc.sendResetVehicleMileageTotal(type, this.selectedIds)
                    .subscribe()
                }
            })
    }

}
