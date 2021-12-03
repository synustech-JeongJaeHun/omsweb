import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';
import { ControlsComponent } from './controls.component';
import { ServerControlComponent } from './server/server-control.component';
import { VehicleControlComponent } from './vehicles/vehicle-control.component';

const routes: Routes = [
  {
    path: '',
    component: ControlsComponent,
    children: [
      {
        path: 'vehicles',
        component: VehicleControlComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'server',
        component: ServerControlComponent,
        canActivate: [AuthGuard],
      },
      { path: '', redirectTo: '/controls/vehicles', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ControlsRoutingModule { }
