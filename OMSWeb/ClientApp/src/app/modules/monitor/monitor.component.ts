import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'oms-monitor',
  templateUrl: './monitor.component.html',
  styles: [
    `
    :host {
      /* height: 100%; */
      /* display: flex; */
    }
    `
  ]
})
export class MonitorComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
