import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'oms-controls',
  templateUrl: './controls.component.html',
  styles: [
    `
      :host {
        display: flex;
        height: 100%;
      }
    `,
  ],
})
export class ControlsComponent implements OnInit {
  pageLoaded: boolean = false;
  constructor() { }

  ngOnInit(): void {
    this.pageLoaded = true;
  }
}
