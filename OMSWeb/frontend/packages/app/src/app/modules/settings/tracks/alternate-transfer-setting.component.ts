import { Component, OnInit } from '@angular/core'
import { forkJoin, Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { ISettingsAlternateTransfer, ISettingsAlternateStation } from '../../../models/settings.model';
import { ISettingsStationWithUnuse } from '../../../models/settings.model';
import { SettingsService } from '../../../services/settings.service'
import { SystemsService } from '../../../services/systems.service'
import { MessagesService } from '../../../services/messages.service'
import { DialogService } from '../../../services/dialog.service'
import { TranslateService } from '@ngx-translate/core'
import { TscModeEnums } from '@oms/models/enums'
import { forEach } from 'lodash'

type Stk = {
  id: string
  logicalId: string
}

@Component({
	selector: 'oms-alternate-transfer-setting',
	templateUrl: './alternate-transfer-setting.component.html',
	styleUrls: ['./alternate-transfer-setting.component.scss'],
})
export class AlternateTransferSettingComponent {

    private destroy$ = new Subject<void>()

    public mode: string = 'stk';
    public retryCntToSTB: number;
    public retryToNearStocker: boolean;

    private settingAlternateTransfer: ISettingsAlternateTransfer;
    private settingAlternateStations: ISettingsAlternateStation[];

    // stk related
    public candidateStks: ISettingsAlternateStation[] = []
    public selectedCandidateStks: Stk['id'][] = []
    public chosenStks: ISettingsAlternateStation[] = []
    public selectedChosenStks: Stk['id'][] = []
    public timeoutForAlternate: number =0;

    private priorityChanged = false;

    constructor(
      private settingsSvc: SettingsService,
      private messageSvc: MessagesService,
      private systemSvc: SystemsService,
      private dialogSvc: DialogService,
      private $t: TranslateService,
    ) {
      this.init()
	}

	get isModeStb() {
		return this.mode === 'stb'
	}
	get isModeStk() {
		return this.mode === 'stk'
	}
	get isPriorityChangable() {
		return this.selectedChosenStks.length === 1
    }

    get isUpdated(): boolean {
        if (this.settingAlternateTransfer?.mode !== this.mode) return true;
        if (parseInt(this.settingAlternateTransfer?.maxRetryToBuffer.toString()) !== this.retryCntToSTB) return true;
        if (this.settingAlternateTransfer?.retryToNearStocker !== this.retryToNearStocker) return true;
        if (this.settingAlternateTransfer?.stationList !== this.chosenStks) return true;
        if (this.priorityChanged) return true;
        if (this.settingAlternateTransfer?.timeoutForAlternate !== this.timeoutForAlternate && this.timeoutForAlternate <=300) return true

        return false;
    }

    ngOnInit(): void { }

    ngOnDestroy(): void {
      this.destroy$.next()
      this.destroy$.complete()
    }

    private init() {
        forkJoin(this.loadAlternateTransfer(), this.loadSettingStations()).subscribe(() => {
           forkJoin(this.bindStationListData());
        });
    }

    private loadAlternateTransfer() {
        return this.settingsSvc.settingsAlternateTransfer().pipe(
          tap((res) => {
            this.settingAlternateTransfer = res;

            this.mode = res.mode.toString();
            this.retryCntToSTB = parseInt(res.maxRetryToBuffer.toString());
            this.retryToNearStocker = res.retryToNearStocker;
            this.chosenStks = res.stationList;
            this.timeoutForAlternate = res.timeoutForAlternate
          }),
        )
    }

    private loadSettingStations() {
        return this.settingsSvc.settingsAlternateStations().pipe(
          tap((res) => {
            this.settingAlternateStations = res
          }),
        )
    }

    private bindStationListData() {
      for (var s of this.settingAlternateStations) {
          if (!this.isAssignedStation(s.id)) {
            this.candidateStks.push(s);
          }
        }
    }

    private isAssignedStation(id: string) {
        for (var s of this.chosenStks) {
          if (id == s.id) return true;
        }
        return false;
    }

	onSave() {
        //if (!this.chosenStks.length) return

        this.systemSvc.currentState$
          .pipe(takeUntil(this.destroy$))
          .subscribe((states) => {
            if (states.tscMode === TscModeEnums.PAUSED) {
              this.SaveMessages()
            } else {
              this.dialogSvc.alert({
                body: this.$t.instant('messages.confirmTSCStateNotPaused'),
              })
            }
          })
    }

    onRevert() {
        this.settingAlternateTransfer.mode = 'stk'
        this.settingAlternateTransfer.maxRetryToBuffer = 0
        this.settingAlternateTransfer.stationList = []
        this.settingAlternateStations = []

        this.mode = 'stk'
        this.retryCntToSTB = 0
        this.retryToNearStocker = false
        this.candidateStks = []
        this.selectedCandidateStks = []
        this.chosenStks = []
        this.selectedChosenStks = []

        this.priorityChanged = false

        this.init()
    }


    SaveMessages() {
        let ids: string = '';
        for (var s of this.chosenStks) { ids += s.id + ';' }
        if (ids.length == 0) ids = ';'  // prevent null

        this.settingsSvc
            .updateAlternateTransfer(
                this.mode,
                this.retryCntToSTB.toString(),
                this.retryToNearStocker.toString(),
                ids,
                this.timeoutForAlternate.toString()
            )
            .subscribe((res) => {
                if (res.retcode == 1) {
                  setTimeout(() => {
                    this.onRevert()
                  }, 500)
                }
            });
    }


    addToChosenStks() {
        const selecteds = this.selectedCandidateStks.map((id) =>
            this.candidateStks.find((stk) => stk.id === id),
        )

        this.chosenStks = [...this.chosenStks, ...selecteds]
        this.candidateStks = this.candidateStks
          .filter((stk) => selecteds.every((selected) => selected !== stk))
          .sort((a, b) => a.logicalId.localeCompare(b.logicalId))

        this.resetSelecteds()
    }
    removeFromChosenStks() {
        const selecteds = this.selectedChosenStks.map((id) =>
            this.chosenStks.find((stk) => stk.id === id),
        )

        this.candidateStks = [...this.candidateStks, ...selecteds].sort((a, b) =>
            a.logicalId.localeCompare(b.logicalId),
        )
        this.chosenStks = this.chosenStks.filter((stk) =>
            selecteds.every((selected) => selected !== stk),
        )

        this.resetSelecteds()
    }

    private resetSelecteds() {
        this.selectedCandidateStks = []
        this.selectedChosenStks = []
    }

    setHighestPriority() {
        const { index, stk } = this.getSelectedChosenStk()
        this.chosenStks.splice(index, 1)
        this.chosenStks = [stk, ...this.chosenStks]
        this.priorityChanged = true;
    }
    setHighPriority() {
        const { index, stk } = this.getSelectedChosenStk()
        if (index === 0) return
        this.chosenStks.splice(index, 1)
        this.chosenStks.splice(index - 1, 0, stk)
        this.priorityChanged = true;
    }
    setLowPriority() {
        const { index, stk } = this.getSelectedChosenStk()
        if (index === this.chosenStks.length - 1) return
        this.chosenStks.splice(index, 1)
        this.chosenStks.splice(index + 1, 0, stk)
        this.priorityChanged = true;
    }
    setLowestPriority() {
        const { index, stk } = this.getSelectedChosenStk()

        this.chosenStks.splice(index, 1)
        this.chosenStks = [...this.chosenStks, stk]
        this.priorityChanged = true;
    }

    private getSelectedChosenStk() {
        const index = this.chosenStks.findIndex((cs) =>
            this.selectedChosenStks.some((scs) => scs === cs.id),
        )
        const stk = this.chosenStks[index]

        return { index, stk }
    }
}
