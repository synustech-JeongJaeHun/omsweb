import { Component, OnInit } from '@angular/core';
import {MobileService} from "../../services/mobile.service";

@Component({
  selector: 'oms-mobile-frame',
  templateUrl: './mobile-frame.component.html',
  styles: [
  ]
})
export class MobileFrameComponent implements OnInit {

  constructor(
    private mobileSvc: MobileService
  ) { }

  ngOnInit(): void {
    this.mobileSvc.isMobile = true
  }

}
