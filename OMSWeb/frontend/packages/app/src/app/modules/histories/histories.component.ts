import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'oms-histories',
  templateUrl: './histories.component.html',
  styles: [
  ]
})
export class HistoriesComponent implements OnInit {
  pageLoaded: boolean = false;
  constructor() { }

  ngOnInit(): void {
    this.pageLoaded = true;
  }

}
