import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { AuthGuard } from '../../guards/auth.guard'
import { ControlsComponent } from './controls.component'
import { TokenHistoryControlComponent } from './token-history/token-history-control.component'
import {MapComponent} from "./map/map.component";
import {VersionComponent} from "./version/version.component";
import {ServerControlComponent} from "./version/server/server-control.component";
import {VehicleComponent} from "./version/vehicle/vehicle.component";
import {CdmComponent} from "./version/cdm/cdm.component";

const routes: Routes = [
	{
		path: '',
		component: ControlsComponent,
		children: [
			{
				path: 'version',
				component: VersionComponent,
				canActivate: [AuthGuard],
        children: [
          {
            path: 'server',
            component: ServerControlComponent
          },
          {
            path: 'vehicle',
            component: VehicleComponent
          },
          {
            path: 'cdm',
            component: CdmComponent
          },
          {
            path: '',
            redirectTo: 'server', pathMatch: 'full'
          },
        ]
			},
      {
        path: 'map',
        component: MapComponent,
        canActivate: [AuthGuard],
      },
			{
				path: 'token-history',
				component: TokenHistoryControlComponent,
				canActivate: [AuthGuard],
			},
			// { path: '', redirectTo: '/controls/vehicles', pathMatch: 'full' },
			{ path: '', redirectTo: 'version', pathMatch: 'full' },
		],
	},
]

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ControlsRoutingModule {}
