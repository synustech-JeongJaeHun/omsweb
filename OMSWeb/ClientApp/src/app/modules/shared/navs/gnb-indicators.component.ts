import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'oms-gnb-indicators',
  templateUrl: './gnb-indicators.component.html',
  styles: [
    `
    button {
      position: relative;
      color: var(--theme-text-color);
    }
      button.has-issue {
        color: #666;
      }
    `,
  ],
})
export class GnbIndicatorsComponent implements OnInit {
  warnCount = 0
  alarmCount = 10;

  get hasWarn(): boolean {
    return this.warnCount > 0;
  }
  get hasAlarm(): boolean {
    return this.alarmCount > 0;
  }

  constructor() {}

  ngOnInit(): void {}
}
