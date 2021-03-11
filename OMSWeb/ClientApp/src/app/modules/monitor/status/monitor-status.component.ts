import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'oms-monitor-status',
  templateUrl: './monitor-status.component.html',
  styles: [
    `
      :host {
        display: grid;
        grid-template-columns: 56px 1fr;
        column-gap: 20px;
        position: relative;
        height: 100%;
      }
      .snb {
        align-self: start;
      }
    `,
  ],
})
export class MonitorStatusComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
