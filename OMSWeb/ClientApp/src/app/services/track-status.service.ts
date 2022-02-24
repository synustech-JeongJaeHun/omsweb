import { EventEmitter, Injectable, Output } from '@angular/core';
import { StatusService } from './status.service'
import { HubService } from './hub.service'
import { AuthService } from './auth.service'
import { Dto } from '../models/dto/track.model';
import { IDataChangeEvent } from '../models/notification.model';

/**
 * # What we need
 *
 * ## realtime data
 *
 * - point
 * - segment
 * - station
 * - buffer
 * - mtl
 * - vhl
 *
 */

@Injectable({
  providedIn: 'root'
})
export class TrackStatusService {

  @Output() isTrackReadyChanged = new EventEmitter<boolean>()

  public isTrackReady = false
  public trackData?: Dto.ITrackData = undefined

  constructor(
    private statusService: StatusService,
    private hubService: HubService,
    private authService: AuthService,
  ) {
    this.fetchTrack().then(() => this.attachHubEvents())
  }

  private async fetchTrack() {
    const trackData = await this.statusService.getTrack().toPromise()

    this.trackData = trackData
    this.isTrackReady = true
    this.isTrackReadyChanged.emit(this.isTrackReady)
  }

  private attachHubEvents() {
    this.hubService.connectionChanged$
      .subscribe((conn) => {
        this.statusService.getVehicles().subscribe((res) => {
          console.log("connection update", conn, res)
          if (conn && res?.vehicles) {
            // TODO
          }
        })
      });
    this.hubService.vehicleChanged$
      .subscribe((e: IDataChangeEvent) => {
        // TODO
      });
    // this.hubService.segmentChanged$
    //   .subscribe((e: IDataChangeEvent) => {
    //     // what happened on event?
    //     console.log("segment update", e)
    //   });
    this.hubService.segmentDisabledChanged$
      .subscribe((e: IDataChangeEvent) => {
        // TODO
        // this.viewer.updateSegmentDisabled(e.operation, {
        //   id: e.id,
        //   operation: e.operation,
        //   data: e.data
        // })
      });
    // this.hubService.clusterChanged$
    //   .subscribe((e: IDataChangeEvent) => {
    //     // TODO what happened on event?
    //     console.log("cluster update", e)
    //   });

    this.hubService.zcuMapChanged$
      .subscribe((e) => {
        // TODO
        // this.viewer.updateZcu(e.operation, e.data)
      });

    if (this.authService.isAuthenticated) {
      // this.hubService.vehiclePathChanged$
      //   .subscribe((e: IDataChangeEvent) => {
      //     // TODO what happened on event?
      //     console.log("vehicle path update", e)
      //   });

      this.hubService.stationChanged$
        .subscribe((e) => {
          // TODO what happened on event?
          console.log("station update", e)
        })

      // this.hubService.groupChanged$
      //   .subscribe((e) => {
      //     // TODO what happened on event?
      //     console.log("group update", e)
      //   });

      this.hubService.bufferChanged$
        .subscribe((e) => {
          // TODO what happened on event?
          console.log("buffer update", e)
        });

      this.hubService.mtlChanged$
        .subscribe((e) => {
          // TODO what happened on event?
          console.log("mtl update", e)
        });

      // this.hubService.groupChanged$
      //   .subscribe((e) => {
      //     console.log("group update", e)
      //   });
    }
  }
}
