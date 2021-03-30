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
    segmentWidth: 3,
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public buttonState: ToggleOptionsType,
    private stateSvc: MapStatesService
  ) {}

  ngOnInit(): void {
    const pref = this.stateSvc.preferences;
    this.slideValues.vehicleScale = pref.map.vehicleScale;
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
