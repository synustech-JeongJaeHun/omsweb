import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { defaultMapVisibilityOptions, MapVisibilityOptionsType } from '../../../models/drawing.model';
import { MapToolbarCommandKeys, MapToolbarStatusKeys } from '../../../models/enums';

import { MapStatesService } from '../map-states.service';

@Component({
  selector: 'oms-map-toolbar',
  templateUrl: './map-toolbar.component.html',
  styleUrls: ['map-toolbar.component.scss'],
})
export class MapToolbarComponent implements OnInit {
  @Input()
  buttonState: MapVisibilityOptionsType = defaultMapVisibilityOptions;

  @Output()
  search = new EventEmitter();

  visibilityOpen = false;

  constructor(private stateSvc: MapStatesService) {}

  ngOnInit(): void {}

  onSearch() {
    this.search.emit();
  }

  onToggleTool(action: MapToolbarStatusKeys) {
    const value = !this.buttonState[action];
    this.buttonState[action] = value;
    this.stateSvc.changeToolbarState(action, value);
  }

  onCommandTool(action: MapToolbarCommandKeys) {
    this.stateSvc.commandToolbar(action);
  }
}
