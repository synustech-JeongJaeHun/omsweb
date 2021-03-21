import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'oms-gnb-actions',
  templateUrl: './gnb-actions.component.html',
  styles: [
    `
      .ai {
        background-color: var(--theme-text-color);
        color: #fff;
        padding: 0;
        min-width: 28px;
        height: 28px;
        line-height: 22px;
        margin-right: 20px;
      }
      .ai .rect {
        width: 22px;
        height: 22px;
        border: 1px solid white;
        line-height: 22px;
      }

      .ai.active {
        background-color: var(--theme-color-active);
      }
    `,
  ],
})
export class GnbActionsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
