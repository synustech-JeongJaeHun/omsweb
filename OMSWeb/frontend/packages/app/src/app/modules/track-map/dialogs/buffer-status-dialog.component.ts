import { Component, OnDestroy } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { Dto } from '@oms/root/models/dto/track.model'
import { DialogService } from '@oms/root/services/dialog.service'
import { HubService } from '@oms/root/services/hub.service'
import { MessagesService } from '@oms/root/services/messages.service'
import { TrackStatusService } from '@oms/root/services/track-status.service'
import { TracksService } from '@oms/root/services/tracks.service'
import { TransfersService } from '@oms/root/services/transfers.service'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { ILookupUnit } from '../../../models/map.interface'
import { BufferStatusDialogService } from '../../../services/buffer-status-dialog.service'

@Component({
	selector: 'oms-buffer-status-dialog',
	templateUrl: './buffer-status-dialog.component.html',
	styleUrls: ['./buffer-status-dialog.component.scss'],
})
export class BufferStatusDialogComponent implements OnDestroy {
	selectedUnit: Dto.IBuffer
	currentBuffer: Dto.IBuffer

	private destroy$: Subject<void> = new Subject<void>()
	constructor(
		private trackStatusService: TrackStatusService,
		private dialogSvc: DialogService,
		private messageSvc: MessagesService,
		private tracksService: TracksService,
		private transferSvc: TransfersService,
		private t$: TranslateService,
		private bufferStatusDialogService: BufferStatusDialogService,
		hubSvc: HubService,
	) {
		if (this.bufferStatusDialogService.selectedBuffer)
			this.onBufferChange(this.bufferStatusDialogService.selectedBuffer)

		hubSvc.bufferChanged$
			.pipe(takeUntil(this.destroy$))
			.subscribe((res) => this.handleBufferChangedEvent(res.id))

		this.bufferStatusDialogService.selectedBufferChanged$.subscribe(
			(buffer: Dto.IBuffer) => {
				this.onBufferChange(buffer)
			},
		)
	}

	ngOnDestroy(): void {
		this.destroy$.next()
		this.destroy$.complete()
	}

	onBufferChange(data: ILookupUnit) {
		if (data) {
			this.currentBuffer = this.trackStatusService.trackData.buffers.find(
				(b) => b.id === data.id,
			)
			this.refreshBuffer()
		}
	}

	onBufferChangedBySelector(data: ILookupUnit) {
		if (data) {
			const buffer = this.trackStatusService.trackData.buffers.find(
				(b) => b.id === data.id,
			)
			this.bufferStatusDialogService.setSelectedBuffer(buffer)
		}
	}

	handleBufferChangedEvent(changedBufferId: number) {
		if (changedBufferId !== this.currentBuffer.id) return

		this.refreshBuffer()
	}

	refreshBuffer() {
		this.tracksService
			.loadBufferById(this.currentBuffer.id)
			.subscribe((res) => {
				Object.assign(this.currentBuffer, res)
			})
	}

	onRemoveCarrier(carrierId: string) {
      this.transferSvc.checkCarrierChange("remove", this.currentBuffer.logicalId, "buffer", carrierId, "none")
			.subscribe((res) => {
          console.log(res);

				if (res.hcack === 0 || res.hcack === 4) {
            this.messageSvc.sendCarrierCommand({
							action: 'remove_carrier',
							carrierLabel: carrierId,
              logicalId: this.currentBuffer.logicalId
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
      this.transferSvc.checkCarrierChange("install", this.currentBuffer.logicalId, "buffer", carrierId, "none")
			.subscribe((res) => {
          console.log(res);

				if (res.hcack === 0 || res.hcack === 4) {
            this.messageSvc.sendCarrierCommand({
							action: 'install_carrier',
							carrierLabel: carrierId,
              logicalId: this.currentBuffer.logicalId
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
}
