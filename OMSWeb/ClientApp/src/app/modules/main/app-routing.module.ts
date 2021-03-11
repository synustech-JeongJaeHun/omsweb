import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MonitorModule } from '../monitor/monitor.module';

const routes: Routes = [
  {
    path: 'monitor',
    loadChildren: () =>
      import('../monitor/monitor.module').then((m) => m.MonitorModule),
  },
  {
    path: 'playback',
    loadChildren: () =>
      import('../playback/playback.module').then((m) => m.PlaybackModule),
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
  {
    path: '',
    redirectTo: 'monitor',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes), MonitorModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
