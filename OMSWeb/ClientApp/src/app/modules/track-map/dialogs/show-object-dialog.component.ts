import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSliderChange } from '@angular/material/slider';
import { MapConfigType, ToggleOptionKeyType } from '../../../models/enums';
import { ToggleOptionsType } from '../../../models/settings.model';
import { MapStatesService } from '../map-states.service';

@Component({
  selector: 'oms-show-object-dialog',
  templateUrl: './show-object-dialog.component.html',
  styleUrls: ['./show-object-dialog.component.scss'],
})
export class ShowObjectDialogComponent implements OnInit {
  slideValues = {
    vehicleScale: 3,
    mapRotation: 0,
    segmentWidth: 2,
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public buttonState: ToggleOptionsType,
    private stateSvc: MapStatesService
  ) {}

  ngOnInit(): void {
    const {
      map: { mapRotation, vehicleScale, segmentWidth },
    } = this.stateSvc.preferences;
    this.slideValues = {
      vehicleScale,
      mapRotation,
      segmentWidth,
    };
  }

  onChangedToggle(action: ToggleOptionKeyType) {
    const value = this.buttonState[action];
    this.stateSvc.changeToolbarState(action, value);
  }
  onSlideChange(type: MapConfigType) {
    const value = this.slideValues[type];
    this.stateSvc.changeConfig({ type, value });
  }

  rotationValueLabel(value: number) {
    return `${value}°`;
  }
  scaleValueLabel(value: number) {
    return `${value}px`;
  }
}
