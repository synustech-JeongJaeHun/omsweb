import { Component, OnDestroy } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { Dto } from '@oms/root/models/dto/track.model'
import { DialogService } from '@oms/root/services/dialog.service'
import { HubService } from '@oms/root/services/hub.service'
import { MessagesService } from '@oms/root/services/messages.service'
import { TrackStatusService } from '@oms/root/services/track-status.service'
import { TracksService } from '@oms/root/services/tracks.service'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { ILookupUnit } from '../../../models/map.interface'

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
		private $t: TranslateService,
		private messageSvc: MessagesService,
		private tracksService: TracksService,
		hubSvc: HubService,
	) {
		if (this.trackStatusService.trackData.buffers.length > 0) {
			this.currentBuffer = this.trackStatusService.trackData.buffers[0]
			this.selectedUnit = this.currentBuffer

			this.refreshBuffer()
		}

		hubSvc.bufferChanged$
			.pipe(takeUntil(this.destroy$))
			.subscribe((res) => this.handleBufferChangedEvent(res.id))
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
		this.dialogSvc
			.confirm({ body: this.$t.instant('messages.confirmBufferChange') })
			.subscribe((confirm) => {
				if (confirm)
					this.messageSvc
						.sendCarrierCommand({
							action: 'remove_carrier',
							bufferId: this.currentBuffer.id,
							carrierLabel: carrierId,
						})
						.subscribe()
			})
	}
	onInstallCarrier(carrierId: string) {
		this.dialogSvc
			.confirm({ body: this.$t.instant('messages.confirmBufferChange') })
			.subscribe((confirm) => {
				if (confirm)
					this.messageSvc
						.sendCarrierCommand({
							action: 'install_carrier',
							bufferId: this.currentBuffer.id,
							carrierLabel: carrierId,
						})
						.subscribe()
			})
	}
}
