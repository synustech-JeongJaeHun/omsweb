import { Component, OnInit } from '@angular/core';
import {MobileService} from "@oms/services/mobile.service";

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

  constructor(
    private mobileSvc: MobileService
  ) { }

  ngOnInit(): void {
    this.mobileSvc.isMobile =false
  }

}
