import { EventEmitter, Injectable, Output } from '@angular/core'
import { PlaybackService } from './playback.service'
import * as DateFns from 'date-fns'
import {
	ClockChangedEvent,
	CurrentOrder,
	CurrentSegmentBlocking,
	CurrentVehicle,
	PlaybackSnapshot,
	PlaybackSpeed,
	PlaybackTrack,
	TimelineEvent,
} from '../models/playback.model'
import {
	convertOrderHistoryEventToCurrentOrder,
	convertSegmentBlockingHistoryEventToCurrentSegmentBlocking,
	convertSnapshotOrderToCurrentOrder,
	convertSnapshotSegmentBlockingToCurrentSegmentBlocking,
	convertSnapshotVehicleToCurrentVehicle,
	convertVehicleHistoryEventToCurrentVehicle,
} from '../modules/playback/utils/playback-convert.util'
import { addOrderInfoToCurrenVehicle } from '../modules/playback/utils/playback-join.util'

@Injectable({
	providedIn: 'root',
})
export class PlaybackPlayService {
	@Output() clockChanged = new EventEmitter<ClockChangedEvent>()

	public firstSnapshotTime: Date
	public lastTimelineEventTime: Date

	public trackTimes: Date[]
	#track: PlaybackTrack
	public set track(track: PlaybackTrack) {
		this.#track = track

		let minX = 0
		let minY = 0
		let maxX = 0
		let maxY = 0
		// find the extends of map data using the coordinates of points
		for (const point of this.track.data.points) {
			if (point.x < minX) minX = point.x
			if (point.y < minY) minY = point.y
			if (point.x > maxX) maxX = point.x
			if (point.y > maxY) maxY = point.y
		}

		this.#size = { minX, minY, maxX, maxY }
	}
	public get track() {
		return this.#track
	}

	#size: { minX: number; minY: number; maxX: number; maxY: number }
	public get size() {
		return this.#size
	}

	public window: { start: Date; end: Date }

	public currentSnapshot: PlaybackSnapshot
	public nextSnapshot: PlaybackSnapshot

	public currentVehicles: CurrentVehicle[] = []
	public currentSegmentBlockings: CurrentSegmentBlocking[] = []
	public currentOrders: CurrentOrder[] = []

	public timelineEvents: TimelineEvent[]

	public clock: Date
	public isPlaying = false

	public playSpeed: PlaybackSpeed = 1
	public readonly playSpeeds = [0.1, 0.5, 1, 2, 5, 10]

	constructor(private playbackService: PlaybackService) {
		this.clockChanged.subscribe((event) => this.reduceCurrentState(event))
	}

	public getRecentTrackTimeBy(date: Date) {
		return this.trackTimes.find((time) => time.getTime() <= date.getTime())
	}

	private async fetchTrack(date: Date) {
		this.track = await this.playbackService.getRecentTrack(date).toPromise()
	}
	private async fetchSnapshot(date: Date) {
		const beforeNextSnapshots = await this.playbackService
			.getBeforeNextSnapshots(date)
			.toPromise()

		this.currentSnapshot = beforeNextSnapshots.before
		this.nextSnapshot = beforeNextSnapshots.next
	}
	private async fetchEvents(from: Date, to: Date = new Date(9999, 1, 1)) {
		this.timelineEvents = await this.playbackService
			.getTimelineEvents(from, to)
			.toPromise()
	}

	public setPlaySpeed(playSpeed: PlaybackSpeed) {
		this.playSpeed = playSpeed
	}

	public setWindowStart(start: Date) {
		const end = (() => {
			const diff = DateFns.differenceInMinutes(this.window.end, start)
			if (diff < 0 || diff > 30) {
				const after30Mins = DateFns.add(start, { minutes: 30 })
				if (after30Mins.getTime() > this.lastTimelineEventTime.getTime())
					return this.lastTimelineEventTime
				else return after30Mins
			} else {
				return this.window.end
			}
		})()

		this.setWindow(start, end)
	}
	public setWindowEnd(end: Date) {
		const start = (() => {
			const diff = DateFns.differenceInMinutes(end, this.window.start)
			if (diff < 0 || diff > 30) {
				const before30Mins = DateFns.sub(end, { minutes: 30 })
				if (before30Mins.getTime() < this.firstSnapshotTime.getTime())
					return this.firstSnapshotTime
				else return before30Mins
			} else {
				return this.window.start
			}
		})()

		this.setWindow(start, end)
	}

	public setWindow(start: Date, end: Date) {
		this.window = { start, end }
		this.setClockByDate(start)
	}

	public async setClockByDate(date: Date) {
		const isBeforeCurrentSnapshot = this.currentSnapshot
			? this.currentSnapshot.timestamp.getTime() > date.getTime()
			: false

		const isAfterCurrentSnapshot = this.nextSnapshot
			? this.nextSnapshot.timestamp.getTime() <= date.getTime()
			: false

		if (isBeforeCurrentSnapshot || isAfterCurrentSnapshot) {
			const isTrackDifference =
				isAlmostSameDate(
					this.track.timestamp,
					this.getRecentTrackTimeBy(date),
				) === false

			if (isTrackDifference) await this.fetchTrack(date)
			await this.fetchSnapshot(date)

			// if other snapshot, goto very first time of snapshot
			this.clock = this.currentSnapshot.timestamp
			this.remainedFirstEventIndex = 0

			// 🎉 event
			this.clockChanged.emit({
				type: 'SnapshotChanged',
				clock: this.clock,
				snapshot: this.currentSnapshot.data,
			})

			if (this.currentSnapshot?.timestamp)
				await this.fetchEvents(
					this.currentSnapshot.timestamp,
					this.nextSnapshot?.timestamp,
				)
		} else {
			const time = date.getTime()
			const index = findIndexDefault(
				this.timelineEvents.findIndex(
					(event) => new Date(event.eventTime).getTime() > time,
				),
				this.timelineEvents.length,
			)

			this.clock = date
			this.remainedFirstEventIndex = index

			this.clockChanged.emit({
				type: 'EventsChanged',
				clock: this.clock,
				events: this.timelineEvents.slice(0, index),
			})

			// if current snapshot, goto date in arts
		}
	}

	// browse by eventid is always inside current snapshot times
	public setClockByEventId(id: TimelineEvent['id']) {
		const index = this.timelineEvents.findIndex((event) => event.eventId === id)
		this.clock = new Date(this.timelineEvents[index].eventTime)
		this.remainedFirstEventIndex = index + 1
		// 🎉 event
		this.clockChanged.emit({
			type: 'EventsChanged',
			clock: this.clock,
			events: this.timelineEvents.slice(0, index + 1),
		})
	}

	private reduceCurrentState(event: ClockChangedEvent) {
		if (event.type === 'SnapshotChanged' || event.type === 'EventsChanged') {
			this.currentOrders = (this.currentSnapshot.data.orders ?? [])
				.filter((event) => event.time_completed?.length > 0 === false)
				.map(convertSnapshotOrderToCurrentOrder)
			this.currentSegmentBlockings = (
				this.currentSnapshot.data.segment_blocking ?? []
			).map(convertSnapshotSegmentBlockingToCurrentSegmentBlocking)

			this.currentVehicles = (this.currentSnapshot.data.vehicles ?? [])
				.map(convertSnapshotVehicleToCurrentVehicle)
				.map((cv) => addOrderInfoToCurrenVehicle(cv, this.currentOrders))
				.sort((a, b) => a.id - b.id)
		}

		if (event.type === 'EventsChanged' || event.type === 'NextFrameEvent') {
			event.events.forEach((event) => {
				if (event.tableName === 'vehicle_history') {
					const vehicle = this.currentVehicles.find(
						(cv) => cv.id === event.historySourceId,
					)
					if (vehicle && event.historyChangeType === 'UPDATE')
						Object.assign(
							vehicle,
							addOrderInfoToCurrenVehicle(
								convertVehicleHistoryEventToCurrentVehicle(event),
								this.currentOrders,
							),
						)
				} else if (event.tableName === 'segment_blocking_history') {
					if (event.historyChangeType === 'INSERT') {
						this.currentSegmentBlockings.push(
							convertSegmentBlockingHistoryEventToCurrentSegmentBlocking(event),
						)
					} else if (event.historyChangeType === 'DELETE') {
						const index = this.currentSegmentBlockings.findIndex(
							(sb) => sb.id === event.historySourceId,
						)
						if (index > -1) this.currentSegmentBlockings.splice(index, 1)
					}
				} else if (event.tableName === 'order_history') {
					if (event.historyChangeType === 'INSERT') {
						this.currentOrders.push(
							convertOrderHistoryEventToCurrentOrder(event),
						)
					} else if (
						event.historyChangeType === 'UPDATE' &&
						event.timeCompleted == null &&
						event.timeAborted == null &&
						event.timeFailed == null
					) {
						const order = this.currentOrders.find(
							(o) => o.id === event.historySourceId,
						)
						if (order)
							Object.assign(
								order,
								convertOrderHistoryEventToCurrentOrder(event),
							)
					} else if (
						event.historyChangeType === 'DELETE' ||
						event.timeCompleted != null ||
						event.timeAborted != null ||
						event.timeFailed != null
					) {
						const index = this.currentOrders.findIndex(
							(o) => o.id === event.historySourceId,
						)
						this.currentOrders.splice(index, 1)
					}
				}
			})
		}
	}

	public async goToStartOfSnapshot(order: 'previous' | 'next') {
		this.stop()

		const date =
			order === 'previous'
				? DateFns.sub(this.currentSnapshot.timestamp, { seconds: 2 })
				: DateFns.add(this.nextSnapshot.timestamp, { seconds: 1 })

		// this must be other snapshot, so we dont need to call goToStartOfCurrentSnapshot
		await this.setClockByDate(date)
	}
	public goToStartOfCurrentSnapshot() {
		this.clock = this.currentSnapshot.timestamp
		this.remainedFirstEventIndex = 0
		// 🎉 event
		this.clockChanged.emit({
			type: 'EventsChanged',
			clock: this.clock,
			events: [],
		})
	}

	private intervalId = undefined
	public readonly timeStep = 1000 // in milliseconds
	private remainedFirstEventIndex = 0
	get currentEvent() {
		return this.remainedFirstEventIndex === 0
			? undefined
			: this.timelineEvents[this.remainedFirstEventIndex - 1]
	}

	public resume() {
		if (this.intervalId) clearInterval(this.intervalId)
		this.intervalId = setInterval(this.proceedPlaying.bind(this), this.timeStep)
		this.isPlaying = true
	}
	private async proceedPlaying() {
		const nextDate = DateFns.addMilliseconds(
			this.clock,
			this.timeStep * this.playSpeed,
		)

		// exit(1/2) => when clock over window end
		if (nextDate.getTime() >= this.window.end.getTime()) {
			this.stop()
			return
		}

		// exit(2/2) => when clock over next snapshot
		if (
			this.nextSnapshot?.timestamp &&
			nextDate.getTime() >= this.nextSnapshot.timestamp.getTime()
		) {
			clearInterval(this.intervalId)
			await this.fetchSnapshot(nextDate)

			await this.fetchEvents(
				this.currentSnapshot.timestamp,
				this.nextSnapshot.timestamp ?? new Date(9999, 1, 1),
			)

			this.clock = this.currentSnapshot.timestamp
			this.remainedFirstEventIndex = 0
			this.clockChanged.emit({
				type: 'SnapshotChanged',
				clock: this.clock,
				snapshot: this.currentSnapshot.data,
			})
			this.resume()
			return
		}

		const nextIndex = (() => {
			const index = this.timelineEvents
				.slice(this.remainedFirstEventIndex)
				.findIndex(
					(event) => new Date(event.eventTime).getTime() > nextDate.getTime(),
				)
			return index === -1
				? this.timelineEvents.length
				: this.remainedFirstEventIndex + index
		})()

		// 🎉 event
		this.clockChanged.emit({
			type: 'NextFrameEvent',
			clock: this.clock,
			events: this.timelineEvents.slice(
				this.remainedFirstEventIndex,
				nextIndex,
			),
		})

		// change state after event emit
		// because this state before and after are used for event emit
		this.clock = nextDate
		this.remainedFirstEventIndex = nextIndex
	}

	public stop() {
		if (this.intervalId) clearInterval(this.intervalId)
		this.isPlaying = false
	}

	// data discovering

	/**
	 * Sync implements with track-status.service
	 */
	public getOverlapObjectOnPoint(pointId: number) {
		const points =
			(this.track.data.points ?? [])
				.filter((p) => p.id === pointId)
				.map((p) => ({ ...p, objectType: 'point' })) ?? []
		const stations =
			(this.track.data.stations ?? [])
				.filter((s) => s.point === pointId)
				.map((s) => ({ ...s, objectType: 'station' })) ?? []
		const buffers =
			(this.track.data.buffers ?? [])
				.filter((b) => b.point === pointId)
				.map((b) => ({ ...b, objectType: 'buffer' })) ?? []
		const mtls =
			(this.track.data.mtls ?? [])
				.filter((m) => m.point === pointId)
				.map((m) => ({ ...m, objectType: 'mtl' })) ?? []
		const vehicles =
			(this.currentVehicles ?? [])
				.filter((v) => v.lastPoint === pointId)
				.map((v) => ({
					...v,
					objectType: 'vehicle',
					type: 'STANDARD',
				})) ?? []

		return [...points, ...stations, ...buffers, ...vehicles, ...mtls]
	}
}

function isAlmostSameDate(date1: Date, date2: Date) {
	return (
		DateFns.isSameDay(date1, date2) &&
		DateFns.isSameHour(date1, date2) &&
		DateFns.isSameMinute(date1, date2) &&
		DateFns.isSameSecond(date1, date2)
	)
}

function findIndexDefault(findIndexValue: number, defaultValue: number) {
	return findIndexValue === -1 ? defaultValue : findIndexValue
}
