import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSliderChange } from '@angular/material/slider';
import { ToggleOptionKeyType } from '../../../models/enums';
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

  ngOnInit(): void {}

  onChangedToggle(action: ToggleOptionKeyType) {
    const value = this.buttonState[action];
    this.stateSvc.changeToolbarState(action, value);
  }
  onSlideChange(name: string) {
    const value = this.slideValues[name];
    console.info('### changed value >>', value);
  }

  rotationValueLabel(value: number) {
    return `${value}°`;
  }
  scaleValueLabel(value: number) {
    return `${value}px`;
  }
}
