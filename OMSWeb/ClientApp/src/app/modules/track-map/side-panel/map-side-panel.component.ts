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

  constructor(private dataSvc: MapDataService) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    const { data } = changes;
    if (data.currentValue) {
      this.bindObject();
    }
  }

  private bindObject() {
    switch (this.data.objectType) {
      case 'Vehicle':
        this.bindVehicle();
        break;
      default:
        break;
    }
  }

  onChangeVehicleCalculatePath() {}

  private bindVehicle() {
    this.isCalculatedPath = this.dataSvc.expectedPaths.some(
      (x) => x.id === this.data.id
    );
    // @TODO send message
    console.warn('## TODO : send calculate path message');
  }
}
