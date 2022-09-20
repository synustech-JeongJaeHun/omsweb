import { Injectable, EventEmitter } from '@angular/core'
import { Dto } from '../models/dto/track.model'
import { TrackStatusService } from './track-status.service'

@Injectable({
	providedIn: 'root',
})
export class BufferStatusDialogService {
	constructor(trackStatusService: TrackStatusService) {
		this.setSelectedBuffer(trackStatusService.trackData?.buffers?.[0])
	}

	public selectedBuffer?: Dto.IBuffer
	public selectedBufferChanged$ = new EventEmitter<Dto.IBuffer>()

	setSelectedBuffer = (buffer?: Dto.IBuffer) => {
		this.selectedBuffer = buffer
			? JSON.parse(JSON.stringify(buffer))
			: undefined
		this.selectedBufferChanged$.emit(this.selectedBuffer)
	}
}
