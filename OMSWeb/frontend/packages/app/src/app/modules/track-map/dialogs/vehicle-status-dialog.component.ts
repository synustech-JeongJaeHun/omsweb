import { Component, OnDestroy, OnInit } from '@angular/core'
import { MatDialog, MatDialogRef } from '@angular/material/dialog'
import { TranslateService } from '@ngx-translate/core'
import { TrackStatusService } from '@oms/root/services/track-status.service'
import { DialogService } from '@oms/root/services/dialog.service'
import { MessagesService } from '@oms/root/services/messages.service'
import { TracksService } from '@oms/root/services/tracks.service';
import { TransfersService } from '@oms/root/services/transfers.service';
import { VehicleService } from '@oms/root/services/vehicle.service'
import { Dto } from '@oms/root/models/dto/track.model'
import { IVehicleDioCategory } from '@oms/root/models/vehicle-status.model'
import { ICarrierCommandMessage } from '@oms/root/models/command.model'
import {
	convertPatternToColor,
	convertSignedIntegerToBitString,
	parsePIO,
} from '../../shared/utils/dio.util'

@Component({
	selector: 'oms-vehicle-status-dialog',
	templateUrl: './vehicle-status-dialog.component.html',
	styleUrls: ['./vehicle-status-dialog.component.scss'],
})
export class VehicleStatusDialogComponent implements OnInit, OnDestroy {
    public carrierId: string

	visiblePIOTrend = false

	vehicles: Dto.IVehicle[]
	currentVehicle: Dto.IVehicle | any

	categories: {
		name: string
		dis: { label: string; index: number }[]
		dos: { label: string; index: number }[]
		show: boolean
	}[] = []
	dioInfos: IVehicleDioCategory[] = []
	dis: ('0' | '1')[] = []
	dos: ('0' | '1')[] = []
	pioIndice = [64, 65, 66, 67, 68, 69, 70, 71] as const

	dioHistoriesIn30Seconds: {
		historyChangeTimeFrom30SecondsBefore: number
		po_valid: number
		po_cs_0: number
		po_cs_1: number
		po_tr_req: number
		po_busy: number
		po_compt: number
		po_cont: number
		pi_l_req: number
		pi_u_req: number
		pi_ready: number
		pi_ho_avbl: number
		pi_es: number
		pattern: string
	}[] = []

	intervalId

	valueFieldName(inout: 'pi' | 'po', index: number) {
		return `${inout}${index}`
	}

	get parseInt() {
		return parseInt
	}

  constructor(
    	private $t: TranslateService,
        private trackSvc: TracksService,
        private transferSvc: TransfersService,
	    private dialogRef: MatDialogRef<VehicleStatusDialogComponent>,
	    private trackStatusService: TrackStatusService,
    	private vehicleService: VehicleService,
    	private dialogSvc: DialogService,
        private messageSvc: MessagesService,
        private t$: TranslateService,
	) {}

	ngOnInit(): void {
		this.vehicleService.getVehicleDioCategories().subscribe((dios) => {
			this.dioInfos = dios

			const diCategoryMap = new Map<
				string,
				{ label: string; index: number }[]
			>()
			const doCategoryMap = new Map<
				string,
				{ label: string; index: number }[]
			>()
			const categorySet = new Set<string>()
			dios.forEach((dio) => {
				if (dio?.inCategory?.length > 0) {
					const values = diCategoryMap.get(dio.inCategory) ?? []
					diCategoryMap.set(dio.inCategory, [
						...values,
						{ label: dio.inName, index: dio.id },
					])
					categorySet.add(dio.inCategory)
				}
				if (dio?.outCategory?.length > 0) {
					const values = doCategoryMap.get(dio.outCategory) ?? []
					doCategoryMap.set(dio.outCategory, [
						...values,
						{ label: dio.outName, index: dio.id },
					])
					categorySet.add(dio.outCategory)
				}
			})

			this.categories = [...categorySet.values()].map((category) => {
				return {
					name: category,
					show: true,
					dis: diCategoryMap.get(category) ?? [],
					dos: doCategoryMap.get(category) ?? [],
				}
			})
		})

		this.vehicles = JSON.parse(
			JSON.stringify(this.trackStatusService.trackData.vehicles),
		)

		if (this.vehicles.length > 0)
			this.onVehicleSelect({ selectedItem: this.vehicles[0] })
	}

	ngOnDestroy(): void {
		clearInterval(this.intervalId)
	}

    onRemoveCarrier(carrierIdInput: string) {
      this.transferSvc.checkCarrierChange("remove", this.currentVehicle.logicalId, "vehicle", carrierIdInput, "none")
        .subscribe((res) => {
          console.log(res);

          if (res.hcack === 0 || res.hcack === 4) {
             this.messageSvc.sendCarrierCommand({
                  action: 'remove_carrier',
                  carrierLabel: carrierIdInput,
                  newCarrierId: "",
                  logicalId: this.currentVehicle.logicalId
             }).subscribe()

            this.dialogSvc.success({
              title: this.t$.instant('names.success'),
              body: this.t$.instant('messages.confirmSuccessRemoveCarrier'),
            })
          }
          else {
            var errorMessage = "";
            if (res.hcack === 2) errorMessage = 'messages.confirmNotAbleToExcute';
            else if (res.hcack === 3) {
              if (res.cpname === 'CARRIERID') errorMessage = 'messages.confirmParameterInvalidCarrierID';
              else if (res.cpname === 'CARRIERLOC') errorMessage = 'messages.confirmParameterInvalidCarrierLoc';
              else errorMessage = 'messages.confirmParameterInvalid';
            }
            else if (res.hcack === 5) errorMessage = 'messages.confirmReject';
            else errorMessage = 'messages.confirmNotAbleToExcute';

            this.dialogSvc.alert({
              title: this.t$.instant('names.failed'),
              body: this.t$.instant(errorMessage),
            })
          }
        })
    }
    onInstallCarrier(carrierId: string) {
      this.transferSvc.checkCarrierChange("install", this.currentVehicle.logicalId, "buffer", carrierId, "none")
        .subscribe((res) => {
          console.log(res);

          if (res.hcack === 0 || res.hcack === 4) {
            this.messageSvc.sendCarrierCommand({
              action: 'install_carrier',
              carrierLabel: carrierId,
              logicalId: this.currentVehicle.logicalId
            }).subscribe()

            this.dialogSvc.success({
              title: this.t$.instant('names.success'),
              body: this.t$.instant('messages.confirmSuccessInstallCarrier'),
            })
          }
          else {
            var errorMessage = "";
            if (res.hcack === 2) errorMessage = 'messages.confirmNotAbleToExcute';
            else if (res.hcack === 3) {
              if (res.cpname === 'CARRIERID') errorMessage = 'messages.confirmParameterInvalidCarrierID';
              else if (res.cpname === 'CARRIERLOC') errorMessage = 'messages.confirmParameterInvalidCarrierLoc';
              else errorMessage = 'messages.confirmParameterInvalid';
            }
            else if (res.hcack === 5) errorMessage = 'messages.confirmReject';
            else errorMessage = 'messages.confirmNotAbleToExcute';

            this.dialogSvc.alert({
              title: this.t$.instant('names.failed'),
              body: this.t$.instant(errorMessage),
            })
          }
        })
    }
    onRenameCarrier(carrierIdInput: string, newCarrierIdInput: string) {
      this.transferSvc.checkCarrierChange("rename", this.currentVehicle.logicalId, "vehicle", carrierIdInput, newCarrierIdInput)
        .subscribe((res) => {
          console.log(res);

          if (res.hcack === 0 || res.hcack === 4) {
            this.messageSvc.sendCarrierCommand({
              action: 'rename_carrier',
              carrierLabel: carrierIdInput,
              newCarrierId: newCarrierIdInput,
              logicalId: this.currentVehicle.logicalId
            }).subscribe()

            this.dialogSvc.success({
              title: this.t$.instant('names.success'),
              body: this.t$.instant('messages.confirmSuccessRenameCarrier'),
            })
          }
          else {
            var errorMessage = "";
            if (res.hcack === 2) errorMessage = 'messages.confirmNotAbleToExcute';
            else if (res.hcack === 3) {
              if (res.cpname === 'CARRIERID') errorMessage = 'messages.confirmParameterInvalidCarrierID';
              else if (res.cpname === 'CARRIERLOC') errorMessage = 'messages.confirmParameterInvalidCarrierLoc';
              else errorMessage = 'messages.confirmParameterInvalid';
            }
            else if (res.hcack === 5) errorMessage = 'messages.confirmReject';
            else errorMessage = 'messages.confirmNotAbleToExcute';

            this.dialogSvc.alert({
              title: this.t$.instant('names.failed'),
              body: this.t$.instant(errorMessage),
            })
          }
        })
    }

	onVehicleSelect({ selectedItem: value }) {
		if (value) {
			this.currentVehicle = value
			if (this.intervalId) clearInterval(this.intervalId)

			const update = () => {
				this.vehicleService
					.getVehicleStatus(this.currentVehicle.id)
					.subscribe((res) => {
						Object.assign(this.currentVehicle, res)
					})
				this.vehicleService
					.getRecentVehicleDio(this.currentVehicle.id)
					.subscribe(
						(res) => {
							this.dis = (
								convertSignedIntegerToBitString(res.di1, 32) +
								convertSignedIntegerToBitString(res.di2, 32) +
								convertSignedIntegerToBitString(res.di3, 32)
							).split('') as ('0' | '1')[]

							this.dos = (
								convertSignedIntegerToBitString(res.do1, 32) +
								convertSignedIntegerToBitString(res.do2, 32) +
								convertSignedIntegerToBitString(res.do3, 32)
							).split('') as ('0' | '1')[]
						},
						(error) => {
							this.dis = Array(96).fill('0')
							this.dos = Array(96).fill('0')
						},
					)

				this.vehicleService
					.getVehicleDioHistories(
						this.currentVehicle.id,
						new Date(Date.now() - 30000),
						new Date(),
					)
					.subscribe((res) => {
						console.log('dio res', res)
						// if no data, use last
						if (res.length === 0) {
							this.vehicleService
								.getRecentVehicleDio(this.currentVehicle.id)
								.subscribe((res) => {
									const di3Binary = convertSignedIntegerToBitString(
										res.di3,
										32,
									).split('') as ('0' | '1')[]

									const do3Binary = convertSignedIntegerToBitString(
										res.do3,
										32,
									).split('') as ('0' | '1')[]

									// this!
									this.dioHistoriesIn30Seconds = [
										{
											historyChangeTimeFrom30SecondsBefore: 0,
											po_valid: parseInt(do3Binary[8]),
											po_cs_0: parseInt(do3Binary[9]),
											po_cs_1: parseInt(do3Binary[10]),
											po_tr_req: parseInt(do3Binary[12]),
											po_busy: parseInt(do3Binary[13]),
											po_compt: parseInt(do3Binary[14]),
											po_cont: parseInt(do3Binary[16]),
											pi_l_req: parseInt(di3Binary[0]),
											pi_u_req: parseInt(di3Binary[1]),
											pi_ready: parseInt(di3Binary[3]),
											pi_ho_avbl: parseInt(di3Binary[6]),
											pi_es: parseInt(di3Binary[7]),
											pattern: parsePIO(
												{
													L_REQ: di3Binary[0],
													U_REQ: di3Binary[1],
													READY: di3Binary[3],
													HO_AVBL: di3Binary[6],
													ES: di3Binary[7],
												},
												{
													VALID: do3Binary[8],
													CS_0: do3Binary[9],
													CS_1: do3Binary[10],
													TR_REQ: do3Binary[12],
													BUSY: do3Binary[13],
													COMPT: do3Binary[14],
												},
											),
										},
										{
											historyChangeTimeFrom30SecondsBefore: 30,
											po_valid: parseInt(do3Binary[8]),
											po_cs_0: parseInt(do3Binary[9]),
											po_cs_1: parseInt(do3Binary[10]),
											po_tr_req: parseInt(do3Binary[12]),
											po_busy: parseInt(do3Binary[13]),
											po_compt: parseInt(do3Binary[14]),
											po_cont: parseInt(do3Binary[16]),
											pi_l_req: parseInt(di3Binary[0]),
											pi_u_req: parseInt(di3Binary[1]),
											pi_ready: parseInt(di3Binary[3]),
											pi_ho_avbl: parseInt(di3Binary[6]),
											pi_es: parseInt(di3Binary[7]),
											pattern: '',
										},
									]
								})
							return
						}

						// if histories exists

						const data = res.map((moment) => {
							const di3Binary = convertSignedIntegerToBitString(
								moment.di3,
								32,
							).split('') as ('0' | '1')[]

							const do3Binary = convertSignedIntegerToBitString(
								moment.do3,
								32,
							).split('') as ('0' | '1')[]

							return {
								historyChangeTimeFrom30SecondsBefore:
									(new Date(moment.historyChangeTime).getTime() -
										(Date.now() - 30000)) /
									1000,
								po_valid: parseInt(do3Binary[8]),
								po_cs_0: parseInt(do3Binary[9]),
								po_cs_1: parseInt(do3Binary[10]),
								po_tr_req: parseInt(do3Binary[12]),
								po_busy: parseInt(do3Binary[13]),
								po_compt: parseInt(do3Binary[14]),
								po_cont: parseInt(do3Binary[16]),
								pi_l_req: parseInt(di3Binary[0]),
								pi_u_req: parseInt(di3Binary[1]),
								pi_ready: parseInt(di3Binary[3]),
								pi_ho_avbl: parseInt(di3Binary[6]),
								pi_es: parseInt(di3Binary[7]),
								pattern: parsePIO(
									{
										L_REQ: di3Binary[0],
										U_REQ: di3Binary[1],
										READY: di3Binary[3],
										HO_AVBL: di3Binary[6],
										ES: di3Binary[7],
									},
									{
										VALID: do3Binary[8],
										CS_0: do3Binary[9],
										CS_1: do3Binary[10],
										TR_REQ: do3Binary[12],
										BUSY: do3Binary[13],
										COMPT: do3Binary[14],
									},
								),
							}
						})

						const startCorrection = data[0]
						const endCorrection = data[data.length - 1]

						this.dioHistoriesIn30Seconds = [
							{
								...startCorrection,
								historyChangeTimeFrom30SecondsBefore: 0,
								pattern: '',
							},
							...data,
							{
								...endCorrection,
								historyChangeTimeFrom30SecondsBefore: 30,
								pattern: '',
							},
						]
					})
			}

			update()
			this.intervalId = setInterval(() => {
				update()
			}, 500)
		}
	}

	onToggleVehicleStatusNPIOTrend(element) {
		this.visiblePIOTrend = !this.visiblePIOTrend
	}

	patternColor = convertPatternToColor
}
