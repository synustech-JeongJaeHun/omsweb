import { Component } from '@angular/core'
import { PlaybackPlayService } from '@oms/root/services/playback-play.service'
import * as DateFns from 'date-fns'
@Component({
	selector: 'oms-playback-control-dialog',
	templateUrl: './playback-control-dialog.component.html',
	styleUrls: ['./playback-control-dialog.component.scss'],
})
export class PlaybackControlDialogComponent {
	constructor(private playbackPlayService: PlaybackPlayService) {}

	public isLoading = false

	get playService() {
		return this.playbackPlayService
	}

	get timeRangeMax() {
		return (
			DateFns.differenceInSeconds(
				this.playService.window.end,
				this.playService.window.start,
			) / DateFns.secondsInMinute
		)
	}

	get timeRangeStart() {
		if (this.playService.currentSnapshot) {
			const result =
				DateFns.differenceInSeconds(
					this.playService.currentSnapshot.timestamp,
					this.playService.window.start,
				) / DateFns.secondsInMinute
			return result
		} else {
			return 0
		}
	}
	get timeRangeEnd() {
		if (this.playService.nextSnapshot) {
			const result =
				DateFns.differenceInSeconds(
					this.playService.nextSnapshot.timestamp,
					this.playService.window.start,
				) / DateFns.secondsInMinute
			return result
		} else {
			return this.timeRangeMax
		}
	}

	get timeRangeLabel() {
		return {
			visible: true,
			format: (value) => {
				const date = this.getDateFromTimeRange(value)
				return DateFns.format(date, 'HH:mm:ss')
			},
			position: 'top',
		}
	}

	timeRangeTooltip = {
		enabled: true,
		format: (value) => {
			const date = this.getDateFromTimeRange(value)
			return DateFns.format(date, 'HH:mm:ss')
		},
		showMode: 'onHover',
		position: 'top',
	}

	getDateFromTimeRange(value: number) {
		return DateFns.add(this.playService.window.start, {
			seconds: value * DateFns.secondsInMinute,
		})
	}

	isAvailableSnapshotSliderChange = true
	onSnapshotRangeSliderChanged(event: {
		event: unknown
		start: number
		end: number
	}) {
		if (
			event.event === undefined ||
			this.isAvailableSnapshotSliderChange === false
		)
			return

		if (this.timeRangeEnd < event.end) {
			this.isLoading = true
			this.playService
				.setClockByDate(this.getDateFromTimeRange(event.end))
				.finally(() => (this.isLoading = false))
		} else if (event.start < this.timeRangeStart) {
			this.isLoading = true
			this.playService
				.setClockByDate(this.getDateFromTimeRange(event.start))
				.finally(() => (this.isLoading = false))
		}

		this.disableTimeRangeSliderForMoment()
	}

	get isAvailableToBeforeSnapshot() {
		return (
			this.playService.currentSnapshot.timestamp.getTime() >
			this.playService.window.start.getTime()
		)
	}

	onBeforeSnapshot() {
		if (this.isAvailableSnapshotSliderChange === false) return

		if (this.isAvailableToBeforeSnapshot) {
			this.disableTimeRangeSliderForMoment()
			this.playService.goToStartOfSnapshot('previous')
		}
	}

	get isAvailableToNextSnapshot() {
		return (
			this.playService.nextSnapshot?.timestamp !== undefined &&
			this.playService.nextSnapshot.timestamp.getTime() <
				this.playService.window.end.getTime()
		)
	}

	onNextSnapshot() {
		if (this.isAvailableSnapshotSliderChange === false) return

		if (this.isAvailableToNextSnapshot) {
			this.disableTimeRangeSliderForMoment()
			this.playService.goToStartOfSnapshot('next')
		}
	}

	disableTimeRangeSliderForMoment() {
		this.isAvailableSnapshotSliderChange = false
		setTimeout(() => {
			this.isAvailableSnapshotSliderChange = true
		}, 100)
	}

	get timeSliderLabelFormat() {
		return (value: number) => {
			const baseTime = this.playService.currentSnapshot.timestamp
			const time = DateFns.add(baseTime, { seconds: value })
			return DateFns.format(time, 'HH:mm:ss')
		}
	}

	get timeSliderMax() {
		const end =
			this.playService.nextSnapshot?.timestamp ?? this.playService.window.end
		const start = this.playService.currentSnapshot.timestamp
		return DateFns.differenceInSeconds(end, start)
	}

	get timeSliderValue() {
		return DateFns.differenceInSeconds(
			this.playService.clock,
			this.playService.currentSnapshot.timestamp,
		)
	}

	onTimeSliderChanged(event: { event: unknown; value: number }) {
		if (
			event.event === undefined ||
			this.isAvailableSnapshotSliderChange === false
		)
			return

		const date = DateFns.add(this.playService.currentSnapshot.timestamp, {
			seconds: event.value,
		})
		this.playService.setClockByDate(date)
	}

	changeTimeByEvent(event: number) {
		this.playService.setClockByEventId(event)
	}
}
