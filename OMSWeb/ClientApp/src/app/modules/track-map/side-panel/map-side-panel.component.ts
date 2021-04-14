import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MapDataService } from '../map-data.service';

@Component({
  selector: 'oms-map-side-panel',
  templateUrl: './map-side-panel.component.html',
  styleUrls: ['./map-side-panel.component.scss'],
})
export class MapSidePanelComponent implements OnInit, OnChanges {
  @Input('selectedObject') data: any;

  isCalculatedPath = false;
  hasOverlap = true;

  // segment
  segmentDisabledInfo = {
    disabled: false,
    authors: [],
    reasons: [],
  };

  get segmentDisableAuthors(): string {
    return this.segmentDisabledInfo.authors.join(', ');
  }
  get segmentDisabledReasons(): string {
    return this.segmentDisabledInfo.reasons.join('\n');
  }

  constructor(private dataSvc: MapDataService) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    const { data } = changes;
    if (data.currentValue) {
      this.bindObject();
    }
  }

  private bindObject() {
    this.hasOverlap = true;
    switch (this.data.objectType) {
      case 'Vehicle':
        this.bindVehicle();
        break;
      case 'Segment':
        this.bindSegment();
        break;
      default:
        break;
    }
  }

  onChangeVehicleCalculatePath() {}
  changeSegmentDisabled() {
    // @TODO 이벤트 구현 changeSegmentDisabled()
    console.warn('TODO : 이벤트 구현');
  }

  private bindVehicle() {
    this.isCalculatedPath = this.dataSvc.expectedPaths.some(
      (x) => x.id === this.data.id
    );
    // @TODO send message
    console.warn('TODO : send calculate path message');
  }

  private bindSegment() {
    this.hasOverlap = false;

    const { disableState } = this.data;
    if (disableState) {
      this.segmentDisabledInfo.disabled = true;
      const { vehicle = [], segment = [], user = [] } = disableState;
      vehicle.forEach((v) => {
        this.segmentDisabledInfo.authors.push(v.sourceId);
        v.reason && this.segmentDisabledInfo.reasons.push(`- ${v.reason}`);
      });
      segment.forEach((s) => {
        this.segmentDisabledInfo.authors.push(s.sourceId);
        s.reason && this.segmentDisabledInfo.reasons.push(`- ${s.reason}`);
      });
      user.forEach((u) => {
        this.segmentDisabledInfo.authors.push(u.sourceId);
        u.reason && this.segmentDisabledInfo.reasons.push(`- ${u.reason}`);
      });
    }
  }
}
