import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  defaultToggleOptions,
  ToggleOptionsType,
} from '@oms/models/settings.model';
import {
  CommandKeyType,
  ToggleOptionKeyType,
} from '../../../models/enums';

import { MapStatesService } from '../map-states.service';
import { MessagesService } from '@oms/services/messages.service';
import { DialogService } from '@oms/services/dialog.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'oms-map-toolbar',
  templateUrl: './map-toolbar.component.html',
  styleUrls: ['map-toolbar.component.scss'],
})
export class MapToolbarComponent implements OnInit {
  @Input()
  buttonState: ToggleOptionsType = defaultToggleOptions;

  @Output()
  search = new EventEmitter();

  visibilityOpen = false;

  constructor(
    private stateSvc: MapStatesService,
    private messageSvc: MessagesService,
    private dialogSvc: DialogService,
    private $t: TranslateService
  ) {}

  ngOnInit(): void {}

  onSearch() {
    this.search.emit();
  }

  onToggleTool(action: ToggleOptionKeyType) {
    const value = !this.buttonState[action];
    this.buttonState[action] = value;
    this.stateSvc.changeToolbarState(action, value);
  }

  onCommandTool(action: CommandKeyType) {
    this.stateSvc.commandToolbar(action);
  }

  onPing() {
    this.messageSvc.sendPing().subscribe();
  }
  onVehicleReset() {
    this.dialogSvc
      .confirm({ body: this.$t.instant('messages.confirmResetAllVehicles') })
      .subscribe((confirm) => {
        if (confirm) {
          this.messageSvc.sendVehicleReset().subscribe();
        }
      });
  }
  onSetAuto() {
    this.dialogSvc
      .confirm({ body: this.$t.instant('messages.confirmSetAutoAll') })
      .subscribe((confirm) => {
        if (confirm) {
          this.messageSvc.sendSetAuto().subscribe();
        }
      });
  }
  onEStop() {
    this.dialogSvc
      .confirm({ body: this.$t.instant('messages.confirmEstopAll') })
      .subscribe((confirm) => {
        if (confirm) {
          this.messageSvc.sendEStop().subscribe();
        }
      });
  }
}
