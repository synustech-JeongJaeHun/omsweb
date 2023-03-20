import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LogsRoutingModule } from './logs-routing.module';
import { SharedModule } from '../shared/shared.module';
import { LogsComponent } from './logs.component';
import {DevExtremeModule, DxLoadPanelModule} from "devextreme-angular";


@NgModule({
  declarations: [LogsComponent],
  imports: [
    CommonModule,
    SharedModule,
    LogsRoutingModule,
    DxLoadPanelModule,
    DevExtremeModule
  ]
})
export class LogsModule { }
