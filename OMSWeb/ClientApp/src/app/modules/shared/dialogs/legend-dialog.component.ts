import { Component, OnInit } from '@angular/core';
import { main_css } from '../utils/css-loader';

@Component({
  selector: 'oms-legend-dialog',
  templateUrl: './legend-dialog.component.html',
  styleUrls: ['./legend-dialog.component.scss']
})
export class LegendDialogComponent implements OnInit {

  main_css = main_css

  constructor() { }

  ngOnInit(): void {
  }

}
