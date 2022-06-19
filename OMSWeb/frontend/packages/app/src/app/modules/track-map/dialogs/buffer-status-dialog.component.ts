import { Component } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { Dto } from '@oms/root/models/dto/track.model'
import { DialogService } from '@oms/root/services/dialog.service'
import { MessagesService } from '@oms/root/services/messages.service'
import { TrackStatusService } from '@oms/root/services/track-status.service'
import { ILookupUnit } from '../../../models/map.interface'

@Component({
	selector: 'oms-buffer-status-dialog',
	templateUrl: './buffer-status-dialog.component.html',
	styleUrls: ['./buffer-status-dialog.component.scss'],
})
export class BufferStatusDialogComponent {
	selectedUnit: Dto.IBuffer
	currentBuffer: Dto.IBuffer

	constructor(
		private trackStatusService: TrackStatusService,
		private dialogSvc: DialogService,
		private $t: TranslateService,
		private messageSvc: MessagesService,
	) {
		if (this.trackStatusService.trackData.buffers.length > 0) {
			this.currentBuffer = this.trackStatusService.trackData.buffers[0]
			this.selectedUnit = this.currentBuffer
		}
	}

	onBufferChange(data: ILookupUnit) {
		if (data)
			this.currentBuffer = this.trackStatusService.trackData.buffers.find(
				(b) => b.id === data.id,
			)
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
