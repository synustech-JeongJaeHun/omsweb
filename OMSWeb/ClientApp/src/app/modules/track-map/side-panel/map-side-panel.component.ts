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

  constructor(private dataSvc: MapDataService) {}

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { data } = changes;
    console.info('## changes >>', this.data);
    if (data.currentValue) {
      this.bindObject();
    }
  }

  private bindObject() {
    switch (this.data.objectType) {
      case 'Vehicle':
        this._bindVehicle();
        break;
      default:
        break;
    }
  }

  onChangeVehicleCalculatePath() {}

  private _bindVehicle() {
    this.isCalculatedPath = this.dataSvc.expectedPaths.some(
      (x) => x.id === this.data.id
    );
    // @TODO send message
    console.warn('## TODO : send calculate path message');
  }
}
