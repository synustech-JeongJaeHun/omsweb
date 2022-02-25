import { Component, EventEmitter, Input, Output } from '@angular/core';

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
export class ColorPickerComponent {
  @Input() name: string;
  @Input() value: string;
  @Output() changed = new EventEmitter<string>();
}
