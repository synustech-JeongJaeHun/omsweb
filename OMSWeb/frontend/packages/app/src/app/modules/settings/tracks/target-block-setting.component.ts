import { Component, OnInit, ViewChild } from '@angular/core'
import { forkJoin, Observable } from 'rxjs'
import { tap, map, flatMap } from 'rxjs/operators'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { ISettingsAlternateTransfer, ISettingsAlternateStation } from '../../../models/settings.model';
import { ISettingsTargetBlocking, ISettingsBufferWithUnuse } from '../../../models/settings.model';
import { ISettingsStationWithUnuse, ISettingsVehicleReg } from '../../../models/settings.model';
import { SettingsService } from '../../../services/settings.service'
import { HubService } from '../../../services/hub.service';
import { SystemsService } from '../../../services/systems.service'
import { MessagesService } from '../../../services/messages.service'
import { DialogService } from '../../../services/dialog.service'
import { TranslateService } from '@ngx-translate/core'
import { TscModeEnums } from '@oms/models/enums'
import { forEach } from 'lodash'
import { ISendTargetBlock } from '../../../models/command.model'
import { IDataChangeEvent } from '../../../models/notification.model'
import { DxDataGridComponent } from 'devextreme-angular';


type TargetBlock ={
  vehicleOnlineName: string,
  targetBlockOnlineName: string[]
}

@Component({
  selector: 'oms-target-block-setting',
  templateUrl: './target-block-setting.component.html',
  styleUrls: ['./target-block-setting.component.scss'],
})
export class TargetBlockSettingComponent {
  @ViewChild('targetAllowDataGrid', { static: false }) targetAllowDataGrid!: DxDataGridComponent;
  @ViewChild('targetBlockDataGrid', { static: false }) targetBlockDataGrid!: DxDataGridComponent;

  ready = false
  private destroy$ = new Subject<void>()

/*  private settingTargetBlockings: TargetBlock[];*/

  public focusedVehicle: string | null = null;
  public selectedVehicle: string | null = null;

  public vehicles: ISettingsVehicleReg[] = [];
  public targetAllowDataSource: ISettingsTargetBlocking[] = []
  public targetBlockDataSource: ISettingsTargetBlocking[] = []

  public targetAllowings: ISettingsTargetBlocking[] = []
  public targetBlockings: ISettingsTargetBlocking[] = []

  public selectedTargetAllow: string[] = [];
  public selectedTargetBlock: string[] = [];

  public stations: ISettingsStationWithUnuse[] = [];
  public buffers: ISettingsBufferWithUnuse[] = []; 

  get isUpdated(): boolean {
    return this.ready
  }

  constructor(
    private settingsSvc: SettingsService,
    private messageSvc: MessagesService,
    private hubSvc: HubService,
    private systemSvc: SystemsService,
    private $t: TranslateService,
  ) {
    this.init()
  }


  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private init() {

    forkJoin(this.loadSettingsVehicles(), this.loadSettingStations(), this.loadSettingBuffers(), this.loadSettingTargetBlocks()).subscribe(() => {
      forkJoin(this.bindTargetAllow());
    });
  }


  private loadSettingStations() {

    return this.settingsSvc.settingsStations().pipe(
      tap((res) => {
        this.stations = res;
      })
    )
  }

  private loadSettingBuffers() {
    return this.settingsSvc.settingsBuffers().pipe(
      tap((res) => {
        this.buffers = res;
      })
    )
  }

  private loadSettingsVehicles() {
    return this.settingsSvc.settingsVehicles().pipe(
      tap((res) => {
      this.vehicles = res;
      })
    )
  }

  private loadSettingTargetBlocks() {
    return this.settingsSvc.settingsTargetBlocks().pipe(
      tap((res) => {
        this.targetBlockings = res;
      })
    )
  }

  private bindTargetAllow() {

    for (const bufferT of this.buffers) {
      for (const vehicle of this.vehicles) {
        this.targetAllowings.push({
          vehicleOnlineName: vehicle.logicalId,
          targetBlockOnlineName: bufferT.logicalId
        });
      }
    }

    for (const stationT of this.stations) {
      for (const vehicle of this.vehicles) {
        this.targetAllowings.push({
          vehicleOnlineName: vehicle.logicalId,
          targetBlockOnlineName: stationT.logicalId
        });
      }
    }
  }

  private resetSelecteds() {
    this.selectedTargetAllow = []
    this.selectedTargetBlock = []
  }

  onFocusedVehicleRowChanged(e) {

    const vlogicalId = e.row.data.logicalId;
    this.selectedVehicle = vlogicalId;

    this.targetAllowDataSource = this.targetAllowings
      .filter(vehicleT => vehicleT.vehicleOnlineName == vlogicalId)
      .filter(item => !this.targetBlockings
        .some(blocking => item.vehicleOnlineName === blocking.vehicleOnlineName &&
          item.targetBlockOnlineName === blocking.targetBlockOnlineName)
    )

    this.targetBlockDataSource = this.targetBlockings.filter(block => block.vehicleOnlineName == vlogicalId)

    //selected delete 
    if (this.targetAllowDataGrid && this.targetAllowDataGrid.instance) {
      this.targetAllowDataGrid.instance.clearSelection();
    }

    if (this.targetBlockDataGrid && this.targetBlockDataGrid.instance) {
      this.targetBlockDataGrid.instance.clearSelection();
    }
  }

  setInitialSelection() {
    if (this.vehicles.length > 0) {
      this.focusedVehicle = this.vehicles[0].logicalId;
      this.selectedVehicle = this.vehicles[0].logicalId;
    }
  }

  onSave() {
    this.ready = false

    const sendTargetBlockData: ISendTargetBlock[] = Object.values(
      this.targetBlockings.reduce((acc, curr) => {

        const key = curr.vehicleOnlineName;
        if (!acc[key]) {
          acc[key] = {
            vehicle_online_name: key,
            target_block_online_names: [] // targetBlockOnlineName 배열 초기화
          };
        }

        acc[key].target_block_online_names.push(curr.targetBlockOnlineName);

        return acc;
      }, {})
    );

    this.messageSvc.sendTargetBlockingCommand({ action: 'target_block_setting', target_block_list: sendTargetBlockData }).pipe(
      tap(() => {
        this.targetBlockings = [];//초기화
        this.onTargetBlockChanged();
      })
    ).subscribe(() => {
    });
  }

  onTargetBlockChanged() {
 
    this.hubSvc.targetBlockChanged$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (e) => {
        if (e.operation === 'INSERT') {

          const exixtTarget = this.targetBlockings.some(item =>
            item.vehicleOnlineName === e.vehicleOnlineName &&
            item.targetBlockOnlineName === e.targetBlockOnlineName
          );
          //중복데이터 push안하는 걸로 처리.
          if (!exixtTarget) {
            this.targetBlockings.push({
              vehicleOnlineName: e.vehicleOnlineName,
              targetBlockOnlineName: e.targetBlockOnlineName
            });

            this.targetAllowDataSource = this.targetAllowings
              .filter(vehicleT => vehicleT.vehicleOnlineName == this.selectedVehicle)
              .filter(item => !this.targetBlockings
                .some(blocking => item.vehicleOnlineName === blocking.vehicleOnlineName &&
                  item.targetBlockOnlineName === blocking.targetBlockOnlineName)
            )
          }
          this.resetSelecteds()
        }
      }
    });
  }

  onRervert() {
    console.log("onRevert");
    this.resetSelecteds();
    this.init();
  }

  addToTargetBlockings() {

    const selecteds = this.selectedTargetAllow.map((logicalId) =>
      this.targetAllowings.find((target) => target.targetBlockOnlineName === logicalId && target.vehicleOnlineName === this.selectedVehicle),
    )
    
    this.targetBlockings = [...this.targetBlockings, ...selecteds]
    this.targetBlockDataSource = this.targetBlockings.filter(block => block.vehicleOnlineName === this.selectedVehicle)

    this.targetAllowDataSource = this.targetAllowings
      .filter(vehicleT => vehicleT.vehicleOnlineName == this.selectedVehicle)
      .filter(item => !this.targetBlockings
        .some(blocking => item.vehicleOnlineName === blocking.vehicleOnlineName &&
          item.targetBlockOnlineName === blocking.targetBlockOnlineName)
    )

    this.ready =true
    this.resetSelecteds()
  }

  removeFromTargetBlockings() { 

    const selecteds = this.selectedTargetBlock.map((logicalId) =>
      this.targetBlockings.find((target) => target.targetBlockOnlineName === logicalId && target.vehicleOnlineName === this.selectedVehicle)
    )

    this.targetBlockings = this.targetBlockings.filter((data) => !selecteds.includes(data));

    this.targetBlockDataSource = this.targetBlockings.filter(block => block.vehicleOnlineName === this.selectedVehicle)
   
    this.targetAllowDataSource = this.targetAllowings
      .filter(vehicleT => vehicleT.vehicleOnlineName == this.selectedVehicle)
      .filter(item => !this.targetBlockings
        .some(blocking => item.vehicleOnlineName === blocking.vehicleOnlineName &&
          item.targetBlockOnlineName === blocking.targetBlockOnlineName)
    )
    this.ready = true
    this.resetSelecteds()
  }
}



