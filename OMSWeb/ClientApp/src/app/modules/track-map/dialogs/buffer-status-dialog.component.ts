import { Component, OnInit } from '@angular/core';
import { Buffer } from '../../../models/buffer.model';
import { ILookupUnit } from '../../../models/map.interface';
import { TracksService } from '../../../services/tracks.service';
import { MapDataService } from '../map-data.service';

@Component({
  selector: 'oms-buffer-status-dialog',
  templateUrl: './buffer-status-dialog.component.html',
  styleUrls: ['./buffer-status-dialog.component.scss'],
})
export class BufferStatusDialogComponent implements OnInit {
  selectedUnit: ILookupUnit;
  currentBuffer: Buffer;

  constructor(
    private dataSvc: MapDataService,
    private trackSvc: TracksService
  ) {}

  ngOnInit(): void {
    this.getFirstUnit();
  }

  onBufferChange(data: ILookupUnit) {
    if (data) {
      this.currentBuffer = this.dataSvc.data.buffers.find(
        (x) => x.id === data.id
      );
    }
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

  private getFirstUnit() {
    const { buffers } = this.dataSvc.data;
    if (buffers.length > 0) {
      this.currentBuffer = buffers[0];
      const { id, objectType } = this.currentBuffer;
      this.selectedUnit = {
        id,
        objectType,
      };
    }
  }
}
