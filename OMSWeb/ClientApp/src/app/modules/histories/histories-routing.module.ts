import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HistoriesComponent } from './histories.component';
import { OrderHistoryComponent } from './orders/order-history.component';
import { VehicleHistoryComponent } from './vehicles/vehicle-history.component';
import { AlarmHistoryComponent } from './alarms/alarm-history.component';

const routes: Routes = [
  {
    path: '',
    component: HistoriesComponent,
    children: [
      { path: 'orders', component: OrderHistoryComponent },
      { path: 'vehicles', component: VehicleHistoryComponent },
      { path: 'alarms', component: AlarmHistoryComponent },
      { path: '', redirectTo: 'orders', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HistoriesRoutingModule {}
