import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { NodeDirectionNames } from '../../../models/enums';

@Component({
  selector: 'oms-node-setting',
  templateUrl: './node-setting.component.html',
  styleUrls: ['./node-setting.component.scss'],
})
export class NodeSettingComponent implements OnInit {
  dataSource$: Observable<any[]>;

  constructor() {
    this.dataSource$ = of([
      {
        id: 1,
        bcr: '12345',
        dir: 2,
        vertex: true,
      },
      {
        id: 3,
        bcr: '22345',
        dir: 3,
        vertex: false,
      },
    ])
  }

  ngOnInit(): void {}

  onUpdateRow(event) {}

  transformNodeDirection(data: any) {
    return NodeDirectionNames[data.value];
  }
}
