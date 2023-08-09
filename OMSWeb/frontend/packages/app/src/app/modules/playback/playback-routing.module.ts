import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlaybackComponent } from './playback.component';
import {PageUnloadGuard} from "../../guards/page-unload.guard";

const routes: Routes = [
  {
    path: '',
    canDeactivate: [PageUnloadGuard],
    component: PlaybackComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlaybackRoutingModule { }
