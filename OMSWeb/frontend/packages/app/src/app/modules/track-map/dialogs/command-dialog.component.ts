import { Component, OnDestroy, OnInit } from '@angular/core'
import { MatDialogRef } from '@angular/material/dialog'
import { TranslateService } from '@ngx-translate/core'
import { DialogService } from '../../../services/dialog.service'
import { MessagesService } from '../../../services/messages.service'
import {
	IOrderCommandMessage,
	IVehicleCommandMessage,
} from '../../../models/command.model'
import {
	TransferCommandCategoryType,
	TransferCommandState,
} from '../../../models/map.interface'
import { MapStatesService } from '../map-states.service'
import { TrackStatusService } from '@oms/root/services/track-status.service'
import * as DateFns from 'date-fns'
import { SystemStatusService } from '@oms/root/services/system-status.service'
import { TracksService } from '@oms/root/services/tracks.service'

@Component({
	selector: 'oms-command-dialog',
	templateUrl: './command-dialog.component.html',
	styleUrls: ['./command-dialog.component.scss'],
})
export class CommandDialogComponent implements OnInit, OnDestroy {
	currentTab = 0
	isAuto = true

	tabs: TransferCommandCategoryType[] = ['fromTo', 'from', 'to', 'move', 'mtl']

	get canApply(): boolean {
		return this.validate() === undefined
	}
	get commandState(): TransferCommandState {
		return this.statesSvc.transferCommandState
	}

	get sourceFilterWords() {
		return this.systemStatusService.manualTransferFilterSetting
			?.sourceFilterEnabled
			? this.systemStatusService.manualTransferFilterSetting.sourceWords
			: undefined
	}

	get destinationFilterWords() {
		return this.systemStatusService.manualTransferFilterSetting
			.destinationFilterEnabled
			? this.systemStatusService.manualTransferFilterSetting?.destinationWords
			: undefined
	}

	constructor(
		private statesSvc: MapStatesService,
		private dialog: MatDialogRef<CommandDialogComponent>,
		private dialogSvc: DialogService,
		private messageSvc: MessagesService,
		private t$: TranslateService,
		private trackStatusService: TrackStatusService,
		private systemStatusService: SystemStatusService,
		private tracksService: TracksService,
	) {}

	ngOnInit(): void {
		this.statesSvc.transferCommandState.active = true
		this.currentTab = this.tabs.findIndex(
			(t) => t === this.statesSvc.transferCommandState.category,
		)
	}

	ngOnDestroy(): void {
		this.statesSvc.transferCommandState.active = false
	}

	onTabChanged() {
		this.statesSvc.transferCommandState.category = this.tabs[this.currentTab]

		this.commandState.source = undefined
		this.commandState.dest = undefined
		this.commandState.carrier = ''
	}

	onApply() {
		const error = this.validate()
		if (error) {
			throw error
		}

		const {
			category,
			vehicle,
			vehicleDisabled,
			pointDisabled,
			point,
			sourceDisabled,
			source,
			dest,
			destDisabled,
			carrier,
			mtl,
			mtlInOut,
		} = this.commandState

		if (category === 'mtl') {
			const mtlInfo = (this.trackStatusService.trackData?.mtls ?? []).find(
				(m) => m.id === mtl.id,
			)
			if (mtlInfo.unuse) {
				this.dialogSvc.alert({
					title: this.t$.instant('messages.confirmCommand'),
					body: this.t$.instant('errors.NotAvailiable', { name: 'MTL' }),
				})
				return
			}

			if (mtlInOut) {
				const now = new Date()
				const cmd: IOrderCommandMessage = {
					type: 'ORDER',
					action: 'N',
					orderOrigin: 'OMS',
					priority: 1, // @TODO priority 기본값 확인
					vehicleId: vehicle.id,
					locationMoveType: 'Point',
					locationMove: mtlInfo.pointId.toString(),
					// 2022_05_31_11_09_52.94
					// @ts-ignore
					commandID: `MTL_IN-OC_OHTC_01-${DateFns.format(
						now,
						'yyyyMMddHHmmssSS',
					)}`,
				}

				this.dialogSvc
					.confirm({ body: this.t$.instant('messages.confirmCommand') })
					.subscribe((ok) => {
						if (ok) {
							this.messageSvc.sendOrderCommand(cmd).subscribe()
						}
					})
			} else {
				const cmd: IVehicleCommandMessage = {
					action: 'mtl_out',
					vehicleId: String(vehicle.id),
					mtlId: String(mtl.id),
				}

				this.dialogSvc
					.confirm({ body: this.t$.instant('messages.confirmMtloutCommand') })
					.subscribe((ok) => {
						if (ok) {
							this.messageSvc.sendVehicleCommand(cmd).subscribe()
						}
					})
			}

			return
		}

		const cmd: IOrderCommandMessage = {
			type: 'ORDER',
			action: 'N',
			orderOrigin: 'OMS',
			priority: 1, // @TODO priority 기본값 확인
			carrierLabel: carrier,
		}

		if (category == 'move') {
			if (!pointDisabled && point)
				!pointDisabled && (cmd.locationMoveType = point.objectType)
			else if (!destDisabled && dest)
				!destDisabled && (cmd.locationMoveType = dest.objectType)
		} else {
			!pointDisabled && (cmd.locationMoveType = point.objectType)
			!destDisabled && (cmd.locationDropoffType = dest.objectType)
		}
		!sourceDisabled && (cmd.locationPickupType = source.objectType)

		!vehicleDisabled && (cmd.vehicleId = vehicle.id)
		if (category == 'move') {
			if (!pointDisabled && point)
				!pointDisabled && (cmd.locationMove = point.id.toString())
			else if (!destDisabled && dest)
				!destDisabled && (cmd.locationMove = dest.id.toString())
		} else {
			!pointDisabled && (cmd.locationMove = point.id.toString())
			!destDisabled && (cmd.locationDropoff = dest.id.toString())
		}
		!sourceDisabled && (cmd.locationPickup = source.id.toString())

		//this.dialog.close(cmd);
		//this.messageSvc.sendOrderCommand(cmd).subscribe();

		this.dialogSvc
			.confirm({ body: this.t$.instant('messages.confirmCommand') })
			.subscribe((ok) => {
				if (ok) {
					// fromto from to : carrier value validation
					// carrierid input must be same in current status
					if (
						((category === 'fromTo' || category === 'from') &&
							source?.objectType?.toLowerCase() === 'buffer') ||
						category === 'to'
					) {
						const logicalId =
							category === 'to'
								? vehicle?.logicalId ?? ''
								: source?.logicalId ?? ''

						this.tracksService.getCarrierInfo(logicalId).subscribe((res) => {
							// exit this function with alert
							if (res.carrierId === carrier) {
								this.messageSvc.sendOrderCommand(cmd).subscribe()
							} else {
								this.dialogSvc.alert({
									title: this.t$.instant('names.blocked'),
									body: this.t$.instant('messages.confirmCarrierNotSame'),
								})
							}
						})
					} else {
						this.messageSvc.sendOrderCommand(cmd).subscribe()
					}
				}
			})
	}

	private validate(): undefined | string {
		const {
			category,
			vehicle,
			vehicleDisabled,
			pointDisabled,
			point,
			sourceDisabled,
			source,
			dest,
			destDisabled,
			carrier,
			mtl,
		} = this.commandState

		if (!vehicleDisabled && !vehicle)
			return this.t$.instant('messages.required', { field: 'Vehicle' })

		if (!pointDisabled && !point) {
			if (category == 'move') {
				if (!destDisabled && !dest)
					return this.t$.instant('messages.required', { field: 'Point' })
			} else return this.t$.instant('messages.required', { field: 'Point' })
		}

		if (!sourceDisabled && !source)
			return this.t$.instant('messages.required', { field: 'Source' })

		if (!destDisabled && !dest) {
			if (category == 'move') {
				if (!pointDisabled && !point)
					return this.t$.instant('messages.required', { field: 'Dest' })
			} else return this.t$.instant('messages.required', { field: 'Dest' })
		}

		if (category === 'fromTo' || category === 'from' || category === 'to') {
			const isCarrierEmpty = carrier == null || carrier.trim().length === 0
			if (isCarrierEmpty)
				return this.t$.instant('messages.required', { field: 'Carrier' })
		}
		if (category === 'mtl' && !mtl) {
			return this.t$.instant('messages.required', { field: 'MTL' })
		}

		return
	}
}
