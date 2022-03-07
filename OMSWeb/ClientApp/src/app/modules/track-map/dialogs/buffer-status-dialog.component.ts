import { Component } from '@angular/core';
import { Dto } from '@oms/root/models/dto/track.model';
import { TrackStatusService } from '@oms/root/services/track-status.service';
import { ILookupUnit } from '../../../models/map.interface';
import { TracksService } from '../../../services/tracks.service';

@Component({
  selector: 'oms-buffer-status-dialog',
  templateUrl: './buffer-status-dialog.component.html',
  styleUrls: ['./buffer-status-dialog.component.scss'],
})
export class BufferStatusDialogComponent {
  selectedUnit: Dto.IBuffer;
  currentBuffer: Dto.IBuffer;

  constructor(
    private trackSvc: TracksService,
    private trackStatusService: TrackStatusService,
  ) {
    if (this.trackStatusService.trackData.buffers.length > 0) {
      this.currentBuffer = this.trackStatusService.trackData.buffers[0];
      this.selectedUnit = this.currentBuffer;
    }
  }

  onBufferChange(data: ILookupUnit) {
    if (data)
      this.currentBuffer = this.trackStatusService.trackData.buffers.find(b => b.id === data.id)
  }

  onRemoveCarrier() {
    this.trackSvc.removeBufferCarrier(this.currentBuffer.id).subscribe();
  }

  onInstallCarrier(carrierId: number) {
    this.trackSvc
      .installBufferCarrier(this.currentBuffer.id, carrierId)
      .subscribe();
  }

  onUpdateNote(note: string) {
    this.trackSvc.updateBuffer(this.currentBuffer.id, { note }).subscribe();
  }
}
