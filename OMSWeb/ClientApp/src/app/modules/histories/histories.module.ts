import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HistoriesRoutingModule } from './histories-routing.module';
import { HistoriesComponent } from './histories.component';
import { OrderHistoryComponent } from './orders/order-history.component';
import { VehicleHistoryComponent } from './vehicles/vehicle-history.component';
import { AlarmHistoryComponent } from './alarms/alarm-history.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [HistoriesComponent, OrderHistoryComponent, VehicleHistoryComponent, AlarmHistoryComponent],
  imports: [
    CommonModule,
    HistoriesRoutingModule,
    SharedModule,
  ]
})
export class HistoriesModule { }
