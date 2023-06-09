import { NgModule } from '@angular/core'
import { Routes, RouterModule, RouteReuseStrategy } from '@angular/router'
import { HistoriesRouterStrategy } from '../histories/histories-router-strategy'
import { MobileFrameComponent } from '../mobile-frame/mobile-frame.component'
import { MonitorModule } from '../monitor/monitor.module'
import { StartupComponent } from './startup.component'
import { MobileGuard } from '../../guards/mobile.guard'

const routes: Routes = [
	{
		path: '',
    canActivate: [MobileGuard],
		component: StartupComponent,
	},
	{
		path: 'mobile',
		component: MobileFrameComponent,
    loadChildren: () =>
      import('../mobile-frame/mobile-frame.module').then((m) => m.MobileFrameModule),
	},
	{
		path: 'monitor',
		loadChildren: () =>
			import('../monitor/monitor.module').then((m) => m.MonitorModule),
	},
	{
		path: 'controls',
		loadChildren: () =>
			import('../controls/controls.module').then((m) => m.ControlsModule),
	},
	{
		path: 'playback',
		loadChildren: () =>
			import('../playback/playback.module').then((m) => m.PlaybackModule),
	},
	{
		path: 'reports',
		loadChildren: () =>
			import('../reports/reports.module').then((m) => m.ReportsModule),
	},
	{
		path: 'histories',
		loadChildren: () =>
			import('../histories/histories.module').then((m) => m.HistoriesModule),
	},
	{
		path: 'logs',
		loadChildren: () => import('../logs/logs.module').then((m) => m.LogsModule),
	},
	{
		path: 'settings',
		loadChildren: () =>
			import('../settings/settings.module').then((m) => m.SettingsModule),
	},
	// {
	//   path: '',
	//   redirectTo: 'monitor',
	//   pathMatch: 'full',
	// },
]

@NgModule({
	imports: [RouterModule.forRoot(routes), MonitorModule],
	exports: [RouterModule],
	providers: [
		{ provide: RouteReuseStrategy, useClass: HistoriesRouterStrategy },
	],
})
export class AppRoutingModule {}
