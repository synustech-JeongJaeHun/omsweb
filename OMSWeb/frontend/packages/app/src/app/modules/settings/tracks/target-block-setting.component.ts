import { Component, OnInit } from '@angular/core'
import { forkJoin, Observable } from 'rxjs'
import { tap, map, flatMap } from 'rxjs/operators'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { ISettingsAlternateTransfer, ISettingsAlternateStation } from '../../../models/settings.model'; //지울거
import { ISettingsTargetBlocking, ISettingsBufferWithUnuse } from '../../../models/settings.model';
import { ISettingsStationWithUnuse, ISettingsVehicleReg } from '../../../models/settings.model';
import { SettingsService } from '../../../services/settings.service'
import { SystemsService } from '../../../services/systems.service'
import { MessagesService } from '../../../services/messages.service'
import { DialogService } from '../../../services/dialog.service'
import { TranslateService } from '@ngx-translate/core'
import { TscModeEnums } from '@oms/models/enums'
import { forEach } from 'lodash'
import { ISendTargetBlock } from '../../../models/command.model'



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

  constructor(
    private settingsSvc: SettingsService,
    private messageSvc: MessagesService,
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

    forkJoin(this.loadSettingsVehicles(), this.loadSettingStations(), this.loadSettingStations(), this.loadSettingTargetBlocks()).subscribe(() => {
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
    console.log("vehicle=" + vlogicalId + " // after Filter targetAllowDataSource Count=" + this.targetAllowDataSource.length);   
  }

  setInitialSelection() {
    if (this.vehicles.length > 0) {
      this.focusedVehicle = this.vehicles[0].logicalId;
      this.selectedVehicle = this.vehicles[0].logicalId;
    }
  }

  onSave() {

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


    this.messageSvc
      .sendTargetBlockingCommand({ request: "vehicle_manager", action: 'target_block_setting', target_block_list: sendTargetBlockData })
      .subscribe(() => {
        this.onRervert();
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

    this.resetSelecteds()
  }

  removeFromTargetBlockings() { 

    const selecteds = this.selectedTargetBlock.map((logicalId) =>
      this.targetBlockings.find((target) => target.targetBlockOnlineName === logicalId && target.vehicleOnlineName === this.selectedVehicle),
    )

    this.targetBlockings = this.targetBlockings.filter(
      (data) => !selecteds.includes(data)
    );
    this.targetBlockDataSource = this.targetBlockings.filter(block => block.vehicleOnlineName === this.selectedVehicle)
   
    this.targetAllowDataSource = this.targetAllowings
      .filter(vehicleT => vehicleT.vehicleOnlineName == this.selectedVehicle)
      .filter(item => !this.targetBlockings
        .some(blocking => item.vehicleOnlineName === blocking.vehicleOnlineName &&
          item.targetBlockOnlineName === blocking.targetBlockOnlineName)
      )

    //console.log("targetBlockingDataSource=" + this.targetBlockDataSource);
    //console.log("targetBlockings(" + this.targetBlockings.length + ")=" + JSON.stringify(this.targetBlockings));
    this.resetSelecteds()
  }

}



