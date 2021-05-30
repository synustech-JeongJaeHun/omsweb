import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';
import { ControlsComponent } from './controls.component';
import { ServerUpdateComponent } from './server/server-update.component';
import { MapUpdateComponent } from './vehicles/map-update.component';

const routes: Routes = [
  {
    path: '',
    component: ControlsComponent,
    children: [
      {
        path: 'vehicles',
        component: MapUpdateComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'server',
        component: ServerUpdateComponent,
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
export class ControlsRoutingModule {}
