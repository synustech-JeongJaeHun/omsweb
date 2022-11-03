import { Component, OnDestroy, OnInit } from '@angular/core'
import { PlaybackService } from '@oms/root/services/playback.service'
import { PlaybackPlayService } from '@oms/root/services/playback-play.service'
import * as DateFns from 'date-fns'
import { getTimeRangeChunks } from './utils/date.util'
import { SettingsService } from '@oms/root/services/settings.service'

@Component({
	selector: 'oms-playback',
	templateUrl: './playback.component.html',
	styleUrls: ['playback.component.scss'],
})
export class PlaybackComponent implements OnInit, OnDestroy {
	mapPreference = this.settingSvc.globalPreferences

	isFirstTrackReady = false
	isFirstSnapshotLoaded = false
	isLoadFail = false

	get loading() {
		if (this.isLoadFail) return 'fail'
		if (this.isFirstTrackReady && this.isFirstSnapshotLoaded) return 'done'
		return 'loading'
	}

	get showControlTable() {
		return this.mapPreference.toggles.controlTable
	}

	constructor(
		private settingSvc: SettingsService,
		private playbackService: PlaybackService,
		private playbackPlayService: PlaybackPlayService,
	) {}

	ngOnInit() {
		try {
			this.playbackService.getPlaybackInfo().subscribe((res) => {
				this.playbackPlayService.firstSnapshotTime = res.firstSnapshotTime
				this.playbackPlayService.lastHistoryTime = res.lastHistoryTime

				this.playbackPlayService.setPlaySpeed(1)

				this.playbackService.getTrackTimes().subscribe((res) => {
					this.playbackPlayService.trackTimes = res

					const start = (() => {
						const before30Minute = DateFns.sub(
							this.playbackPlayService.lastHistoryTime,
							{ minutes: 30 },
						)
						return this.playbackPlayService.firstSnapshotTime.getTime() >
							before30Minute.getTime()
							? this.playbackPlayService.firstSnapshotTime
							: before30Minute
					})()
					this.playbackPlayService.window = {
						start,
						end: this.playbackPlayService.lastHistoryTime,
					}
					this.playbackPlayService.clock = start

					const trackTime = this.playbackPlayService.getRecentTrackTimeBy(
						this.playbackPlayService.clock,
					)

					if (trackTime === undefined) {
						throw new Error('NO_TRACK_EXIST')
					}

					this.playbackService.getRecentTrack(trackTime).subscribe((res) => {
						this.playbackPlayService.track = res
						this.isFirstTrackReady = true
					})

					this.playbackService
						.getBeforeNextSnapshots(this.playbackPlayService.clock)
						.subscribe(async (res) => {
							this.playbackPlayService.currentSnapshot = res.before
							this.playbackPlayService.nextSnapshot = res.next

							this.playbackPlayService.clockChanged.emit({
								type: 'SnapshotChanged',
								clock: this.playbackPlayService.clock,
								snapshot: this.playbackPlayService.currentSnapshot.data,
							})

							this.playbackPlayService.setLoaded({
								from: this.playbackPlayService.currentSnapshot?.timestamp,
								to: this.playbackPlayService.currentSnapshot?.timestamp,
							})
							// 1. when current snaphot is last snapshot
							//    request with last time at once
							if (this.playbackPlayService.nextSnapshot?.timestamp == null) {
								const eventsPromise = this.playbackService
									.getHistoryEvents(
										this.playbackPlayService.currentSnapshot.timestamp,
										new Date(9999, 1, 1),
									)
									.toPromise()
								const alarmsPromise = this.playbackService
									.getVehicleAlarms(
										this.playbackPlayService.currentSnapshot.timestamp,
										new Date(9999, 1, 1),
									)
									.toPromise()

								const [events, alarms] = await Promise.all([
									eventsPromise,
									alarmsPromise,
								])

								this.playbackPlayService.currentRemainedAlarms =
									alarms.remainedAlarms
								this.playbackPlayService.alarmChanges = alarms.alarmChanges
								this.playbackPlayService.currentAlarms = [
									...alarms.remainedAlarms,
								]

								this.playbackPlayService.historyEvents = events
								this.playbackPlayService.goToStartOfCurrentSnapshot()
								this.playbackPlayService.setLoaded({
									from: this.playbackPlayService.currentSnapshot.timestamp,
									to: this.playbackPlayService.lastHistoryTime,
								})

								this.isFirstSnapshotLoaded = true
							} else {
								// 2. when current snaphot is not last snapshot
								//    split request by 15 seconds
								const timeRanges = getTimeRangeChunks(
									this.playbackPlayService.currentSnapshot.timestamp,
									this.playbackPlayService.nextSnapshot.timestamp,
									15,
								)
								const [firstRange, ...ranges] = timeRanges

								const getSlicedHistoryEvents = async (
									timeRanges: [Date, Date][],
									snapshotTimestmap: Date,
								) => {
									if (timeRanges.length === 0) return

									const [firstRange, ...ranges] = timeRanges
									const events = await this.playbackService
										.getHistoryEvents(firstRange[0], firstRange[1])
										.toPromise()

									if (
										this.playbackPlayService.currentSnapshot.timestamp !==
										snapshotTimestmap
									) {
										return console.log('loading events conflict occured')
									}

									events.forEach((event) =>
										this.playbackPlayService.historyEvents.push(event),
									)

									this.playbackPlayService.setLoaded({ to: firstRange[1] })
									getSlicedHistoryEvents(ranges, snapshotTimestmap)
								}

								const eventsPromise = this.playbackService
									.getHistoryEvents(firstRange[0], firstRange[1])
									.toPromise()

								const alarmsPromise = this.playbackService
									.getVehicleAlarms(
										this.playbackPlayService.currentSnapshot.timestamp,
										this.playbackPlayService.nextSnapshot.timestamp,
									)
									.toPromise()

								const [events, alarms] = await Promise.all([
									eventsPromise,
									alarmsPromise,
								])

								this.playbackPlayService.currentRemainedAlarms =
									alarms.remainedAlarms
								this.playbackPlayService.alarmChanges = alarms.alarmChanges
								this.playbackPlayService.currentAlarms = [
									...alarms.remainedAlarms,
								]

								this.playbackPlayService.historyEvents = events
								this.playbackPlayService.goToStartOfCurrentSnapshot()
								this.playbackPlayService.setLoaded({
									from: firstRange[0],
									to: firstRange[1],
								})
								this.isFirstSnapshotLoaded = true
								getSlicedHistoryEvents(
									ranges,
									this.playbackPlayService.currentSnapshot.timestamp,
								)
							}
						})
				})
			})
		} catch (e) {
			this.isLoadFail = true
		}
	}

	ngOnDestroy(): void {
		this.playbackPlayService.stop()
	}
}
