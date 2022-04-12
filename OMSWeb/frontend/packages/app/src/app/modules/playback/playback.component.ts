import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlaybackService } from '@oms/root/services/playback.service';
import { PlaybackPlayService } from '@oms/root/services/playback-play.service';
import * as DateFns from 'date-fns';
import { SettingsService } from '@oms/root/services/settings.service';

@Component({
  selector: 'oms-playback',
  templateUrl: './playback.component.html',
  styleUrls: ['playback.component.scss'],
})
export class PlaybackComponent implements OnInit, OnDestroy {
  mapPreference = this.settingSvc.globalPreferences;

  isFirstTrackReady = false;
  isFirstSnapshotLoaded = false;
  isLoadFail = false;

  get loading() {
    if (this.isLoadFail) return 'fail';
    if (this.isFirstTrackReady && this.isFirstSnapshotLoaded) return 'done';
    return 'loading';
  }

  get showControlTable() {
    return this.mapPreference.toggles.controlTable;
  }

  constructor(
    private settingSvc: SettingsService,
    private playbackService: PlaybackService,
    private playbackPlayService: PlaybackPlayService
  ) {}

  ngOnInit() {
    try {
      this.playbackService.getPlaybackInfo().subscribe((res) => {
        this.playbackPlayService.firstSnapshotTime = res.firstSnapshotTime;
        this.playbackPlayService.lastTimelineEventTime =
          res.lastTimelineEventTime;

        this.playbackPlayService.setPlaySpeed(1);

        this.playbackService.getTrackTimes().subscribe((res) => {
          this.playbackPlayService.trackTimes = res;

          const start = (() => {
            const before30Minute = DateFns.sub(
              this.playbackPlayService.lastTimelineEventTime,
              { minutes: 30 }
            );
            return this.playbackPlayService.firstSnapshotTime.getTime() >
              before30Minute.getTime()
              ? this.playbackPlayService.firstSnapshotTime
              : before30Minute;
          })();
          this.playbackPlayService.window = {
            start,
            end: this.playbackPlayService.lastTimelineEventTime,
          };
          this.playbackPlayService.clock = start;

          const trackTime = this.playbackPlayService.getRecentTrackTimeBy(
            this.playbackPlayService.clock
          );

          if (trackTime === undefined) {
            throw new Error('NO_TRACK_EXIST');
          }

          this.playbackService.getRecentTrack(trackTime).subscribe((res) => {
            this.playbackPlayService.track = res;
            this.isFirstTrackReady = true;
          });

          this.playbackService
            .getBeforeNextSnapshots(this.playbackPlayService.clock)
            .subscribe((res) => {
              this.playbackPlayService.currentSnapshot = res.before;
              this.playbackPlayService.nextSnapshot = res.next;

              if (this.playbackPlayService.currentSnapshot)
                this.playbackPlayService.clockChanged.emit({
                  type: 'TrackChanged',
                  track: this.playbackPlayService.track.data,
                  snapshot: this.playbackPlayService.currentSnapshot.data,
                });

              if (this.playbackPlayService.currentSnapshot?.timestamp)
                this.playbackService
                  .getTimelineEvents(
                    this.playbackPlayService.currentSnapshot.timestamp,
                    this.playbackPlayService.nextSnapshot?.timestamp ??
                      new Date(9999, 1, 1)
                  )
                  .subscribe((res) => {
                    this.playbackPlayService.timelineEvents = res;
                    this.playbackPlayService.goToStartOfCurrentSnapshot();
                    this.isFirstSnapshotLoaded = true;
                  });
            });
        });
      });
    } catch (e) {
      this.isLoadFail = true;
    }
  }

  ngOnDestroy(): void {
    this.playbackPlayService.stop();
  }
}
