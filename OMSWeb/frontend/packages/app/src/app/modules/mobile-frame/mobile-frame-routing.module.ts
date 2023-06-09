import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MobileFrameComponent} from "./mobile-frame.component";
import {MonitorStatusComponent} from "../monitor/status/monitor-status.component";

const routes: Routes = [
  {
    path: '',
    component: MobileFrameComponent,
    children: [
      {
        path: 'public',
        component: MonitorStatusComponent,
      },
      {
        path: 'status',
        component: MonitorStatusComponent,
      },
      { path: '', redirectTo: 'public', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MobileFrameRoutingModule { }
