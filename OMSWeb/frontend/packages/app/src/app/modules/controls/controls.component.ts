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
  constructor() { }

  ngOnInit(): void { }
}
