import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'oms-alarm-setting',
  templateUrl: './alarm-setting.component.html',
  styleUrls: ['./alarm-setting.component.scss'],
})
export class AlarmSettingComponent implements OnInit {
  dataSource: Observable<any[]>;
  constructor() {
    this.dataSource = of([]);
  }

  ngOnInit(): void {}
}
