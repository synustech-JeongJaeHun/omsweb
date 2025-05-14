import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ReportService, BufferResponse } from "@oms/services/report.service";
import { takeUntil } from "rxjs/operators";
import { interval, Subject } from "rxjs";
import { CdkDragEnd } from "@angular/cdk/drag-drop";
import { SettingsService } from "@oms/services/settings.service";
import { TrackMonitorSettingService } from "@oms/services/track-monitor-setting.service"

@Component({
  selector: 'oms-buffer-status',
  templateUrl: './buffer-status.component.html',
  styleUrls: ['./buffer-status.component.scss'],
})
export class BufferStatusComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  public buffers: BufferResponse

  dragPosition = { x: 0, y: 0 }

  dragEnded($event: CdkDragEnd) {
    const { offsetLeft, offsetTop } = $event.source.element.nativeElement;
    const { x, y } = $event.distance;
    this.dragPosition.x = offsetLeft + x;
    this.dragPosition.y = offsetTop + y;
  }
  constructor(
    private reportService: ReportService,
    private settingSvc: SettingsService,
    private trackMonitorSettingService: TrackMonitorSettingService
  ) {
    this.loadBuffers()
  }

  loadBuffers() {
    this.reportService.loadBufferStatus().subscribe(res => {
      if (res) {
        this.buffers = res;
      }
    })
  }



  ngOnInit(): void {
    this.trackMonitorSettingService.bufferStatusChanged.subscribe((checked) => {
      this.loadBuffers();
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
