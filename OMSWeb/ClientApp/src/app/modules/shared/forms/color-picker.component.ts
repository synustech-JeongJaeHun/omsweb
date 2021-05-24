import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ClientPreferences } from '../../../models/settings.model';
import { SettingsService } from '../../../services/settings.service';
import { getCss, setCssValue } from '../utils/css-loader';

@Component({
  selector: 'oms-color-picker',
  templateUrl: './color-picker.component.html',
  styles: [
    `
      :host {
        display: grid;
        grid-template-columns: 140px 1fr;
        font-size: 12px;
        row-gap: 4px;
        column-gap: 4px;
        align-items: center;
      }
      label.name {
        font-weight: bold;
        text-align: right;
        padding: 4px 8px;
      }
      .value {
        padding: 4px 8px;
      }
    `,
  ],
})
export class ColorPickerComponent implements OnInit {
  @Input() name: string;
  @Input() configName: string;
  @Output() onChange = new EventEmitter<any>();

  preference: ClientPreferences;


  constructor(private settingSvc: SettingsService) {
    this.preference = this.settingSvc.globalPreferences;
  }

  ngOnInit(): void {}

  onChanged(value: any) {
    setCssValue(this.configName, value);
    this.preference.theme[this.configName] = value;
    this.preference.save();
    this.onChange.emit(value);
  }

  getThemeValue() {
    return this.preference.theme[this.configName] || getCss(this.configName);
  }
}
