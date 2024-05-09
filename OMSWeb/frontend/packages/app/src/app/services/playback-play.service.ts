import { EventEmitter, Injectable } from '@angular/core'
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
	HistoryEvent,
	RemainedAlarm,
	AlarmChange,
	CurrentBuffer,
	CurrentStation,
	CurrentZcu,
	CurrentModeState
} from '../models/playback.model'
import {
	convertBufferHistoryEventToCurrentBuffer,
	convertOrderHistoryEventToCurrentOrder,
	convertSegmentBlockingHistoryEventToCurrentSegmentBlocking,
	convertSnapshotBufferToCurrentBuffer,
	convertSnapshotOrderToCurrentOrder,
	convertSnapshotSegmentBlockingToCurrentSegmentBlocking,
	convertSnapshotStationToCurrentStation,
	convertSnapshotVehicleToCurrentVehicle,
	convertSnapshotZcuToCurrentZcu,
	convertStationHistoryEventToCurrentStation,
	convertVehicleHistoryEventToCurrentVehicle,
	convertZcuHistoryEventToCurrentZcu,
} from '../modules/playback/utils/playback-convert.util'
import { addOrderInfoToCurrenVehicle } from '../modules/playback/utils/playback-join.util'
import { getTimeRangeChunks } from '../modules/playback/utils/date.util'

@Injectable({
	providedIn: 'root',
})
export class PlaybackPlayService {
	clockChanged = new EventEmitter<ClockChangedEvent>()

	public firstSnapshotTime: Date
	public lastHistoryTime: Date

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
	public nextSnapshot: Pick<PlaybackSnapshot, 'timestamp'>

	public currentRemainedAlarms: RemainedAlarm[] = []
	public alarmChanges: AlarmChange[] = []

	public currentAlarms: RemainedAlarm[] = []
	public currentVehicles: CurrentVehicle[] = []
	public currentSegmentBlockings: CurrentSegmentBlocking[] = []
	public currentOrders: CurrentOrder[] = []
	public currentBuffers: CurrentBuffer[] = []
	public currentStations: CurrentStation[] = []
	public currentZcus: CurrentZcu[] = []
	public currentModeState?: CurrentModeState = null

	public historyEvents: HistoryEvent[]

	public clock: Date
	public isPlaying = false

	public loaded: { from: Date; to: Date }

	public playSpeed: PlaybackSpeed = 1
	public readonly playSpeeds = [0.1, 0.5, 1, 2, 5]

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

  private tomorrow = function (date) {
    date.setDate(date.getDate() + 1);
    return date;
  }(new Date)

	private async fetchVehicleAlarms(
		from: Date,
		to: Date = this.tomorrow
	) {
		const alarms = await this.playbackService
			.getVehicleAlarms(from, to)
			.toPromise()

		this.currentRemainedAlarms = alarms.remainedAlarms
		this.alarmChanges = alarms.alarmChanges
		this.currentAlarms = [...alarms.remainedAlarms]
	}

	private async fetchEvents(from: Date, to?: Date) {
		this.setLoaded({ from: from, to: from })
		if (to == null) {
			this.historyEvents = await this.playbackService
				.getHistoryEvents(from, this.tomorrow)
				.toPromise()

			this.setLoaded({ from: from, to: this.lastHistoryTime })
		} else {
			const timeRanges = getTimeRangeChunks(from, to, 15)
			const [firstRange, ...ranges] = timeRanges.slice(-20)

			const getSlicedHistoryEvents = async (
				timeRanges: [Date, Date][],
				snapshotTimestmap: Date,
			) => {
				if (timeRanges.length === 0) return

				const [firstRange, ...ranges] = timeRanges.slice(-20)
				const events = await this.playbackService
					.getHistoryEvents(firstRange[0], firstRange[1])
					.toPromise()

				if (this.currentSnapshot.timestamp !== snapshotTimestmap) {
					return console.log('loading events conflict occured')
				}

				events.forEach((event) => this.historyEvents.push(event))

				this.setLoaded({ to: firstRange[1] })
				getSlicedHistoryEvents(ranges, snapshotTimestmap)
			}

			this.historyEvents = await this.playbackService
				.getHistoryEvents(firstRange[0], firstRange[1])
				.toPromise()
			this.setLoaded({ from: firstRange[0], to: firstRange[1] })

			getSlicedHistoryEvents(ranges, this.currentSnapshot.timestamp)
		}
	}

	public setPlaySpeed(playSpeed: PlaybackSpeed) {
		this.playSpeed = playSpeed
	}

	public async setWindowStart(start: Date) {
		const end = (() => {
			const diff = DateFns.differenceInMinutes(this.window.end, start)
			if (diff < 0 || diff > 30) {
				const after30Mins = DateFns.add(start, { minutes: 30 })
				if (after30Mins.getTime() > this.lastHistoryTime.getTime())
					return this.lastHistoryTime
				else return after30Mins
			} else {
				return this.window.end
			}
		})()

		await this.setWindow(start, end)
	}
	public async setWindowEnd(end: Date) {
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

		await this.setWindow(start, end)
	}

	public async setWindow(start: Date, end: Date) {
		this.window = { start, end }
		await this.setClockByDate(start)
	}

	public setLoaded(loaded?: { from?: Date; to?: Date }) {
		if (this.loaded == null) this.loaded = { from: undefined, to: undefined }
		for (const field in loaded) this.loaded[field] = loaded[field]
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
			await this.fetchVehicleAlarms(
				this.currentSnapshot.timestamp,
				this.nextSnapshot?.timestamp,
			)

			// if other snapshot, goto very first time of snapshot
			this.clock = this.currentSnapshot.timestamp
			this.remainedFirstAlarmIndex = 0
			this.remainedFirstEventIndex = 0

			// 🎉 event
			this.clockChanged.emit({
				type: 'SnapshotChanged',
				clock: this.clock,
				snapshot: this.currentSnapshot.data,
			})

			if (this.currentSnapshot?.timestamp) {
				await this.fetchEvents(
					this.currentSnapshot.timestamp,
					this.nextSnapshot?.timestamp,
				)
			}
		} else {
			const time = date.getTime()
			const remainedFirstEventIndex = findIndexDefault(
				this.historyEvents.findIndex(
					(event) => new Date(event.historyChangeTime).getTime() > time,
				),
				this.historyEvents.length,
			)
			const remainedFirstAlarmIndex = findIndexDefault(
				this.alarmChanges.findIndex(
					(event) => new Date(event.historyChangeTime).getTime() > time,
				),
				this.alarmChanges.length,
			)

			this.clock = date
			this.remainedFirstAlarmIndex = remainedFirstAlarmIndex
			this.remainedFirstEventIndex = remainedFirstEventIndex
			
			this.clockChanged.emit({
				type: 'EventsChanged',
				clock: this.clock,
				events: this.historyEvents.slice(0, remainedFirstEventIndex),
				alarms: this.alarmChanges.slice(0, remainedFirstAlarmIndex),
			})

			// if current snapshot, goto date in arts
		}
	}

	private transformAlias= ({ value }: { value: string | undefined | null }) => {
		if (value == null) return ''

		const locationType = value[0]
		const id = parseInt(value.substring(1))

		const list : any[] =
			locationType === 's'
				? this.currentStations ?? []
				: locationType === 'b'
					? this.currentBuffers
					: []

		const location : CurrentStation | CurrentBuffer = list.find((e) => e.id === id)

		return location?.cAlias ?? ''
	}

	private reduceCurrentState(event: ClockChangedEvent) {
		if (event.type === 'SnapshotChanged' || event.type === 'EventsChanged') {
			this.currentAlarms = [...this.currentRemainedAlarms] ?? []

			this.currentBuffers = (this.currentSnapshot.data.buffers ?? []).map(
				convertSnapshotBufferToCurrentBuffer,
			)
			this.currentStations = (this.currentSnapshot.data.stations ?? []).map(
				convertSnapshotStationToCurrentStation,
			)
			
			this.currentOrders = (this.currentSnapshot.data.orders ?? [])
				.filter((event) => event.time_completed?.length > 0 === false)
				.map(convertSnapshotOrderToCurrentOrder)
				.map(o=>{
					return { ...o,
						locationDropoffAlias : this.transformAlias({value: o.locationDropoff}),
						locationPickupAlias : this.transformAlias({value: o.locationPickup})
					}
				})
			this.currentSegmentBlockings = (
				this.currentSnapshot.data.segment_blocking ?? []
			).map(convertSnapshotSegmentBlockingToCurrentSegmentBlocking)
			this.currentVehicles = (this.currentSnapshot.data.vehicles ?? [])
				.map(convertSnapshotVehicleToCurrentVehicle)
				.map((cv) => addOrderInfoToCurrenVehicle(cv, this.currentOrders))
				.sort((a, b) => a.id - b.id)
			
			this.currentZcus = (this.currentSnapshot.data.zcus ?? []).map(
				convertSnapshotZcuToCurrentZcu,
			)
			this.currentModeState = this.currentSnapshot.data.state ?? null
		}

		if (event.type === 'EventsChanged' || event.type === 'NextFrameEvent') {
			event.alarms.forEach((alarm) => {
				if (alarm.historyChangeType === 'INSERT') {
					this.currentAlarms.unshift(alarm)
				} else if (alarm.historyChangeType === 'UPDATE') {
					const targetIndex = this.currentAlarms.findIndex(
						(ca) => ca.id === alarm.id,
					)
					if (targetIndex != null) this.currentAlarms.splice(targetIndex, 1)
				}
			})

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
				} else if (event.tableName === 'buffer_history') {
					const buffer = this.currentBuffers.find(
						(cb) => cb.id === event.historySourceId,
					)
					if (buffer)
						Object.assign(
							buffer,
							convertBufferHistoryEventToCurrentBuffer(buffer, event),
						)
				} else if (event.tableName === 'station_history') {
					const station = this.currentStations.find(
						(cs) => cs.id === event.historySourceId,
					)
					if (station)
						Object.assign(
							station,
							convertStationHistoryEventToCurrentStation(station, event),
						)
				} else if (event.tableName === 'zcu_history') {
					const zcu = this.currentZcus.find(
						(cz) => cz.id === event.historySourceId,
					)
					if (zcu) Object.assign(zcu, convertZcuHistoryEventToCurrentZcu(event))
				} else if (event.tableName === 'mode_state_history') {
					this.currentModeState = {
						ai_mode: event.ai_mode,
						comm_state: event.comm_state,
						control_state: event.control_state,
						pm_state: event.pm_state,
						tsc_state: event.tsc_state,
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
		this.remainedFirstAlarmIndex = 0
		this.remainedFirstEventIndex = 0
		// 🎉 event
		this.clockChanged.emit({
			type: 'EventsChanged',
			clock: this.clock,
			events: [],
			alarms: [],
		})
	}

	private intervalId = undefined
	public readonly DefaultTimeStep = 250 // in milliseconds
	get timeStep() {
		return this.DefaultTimeStep / this.playSpeed
	}
	private remainedFirstAlarmIndex = 0
	private remainedFirstEventIndex = 0

	public resume() {
		if (this.intervalId) clearInterval(this.intervalId)
		this.intervalId = setInterval(this.proceedPlaying.bind(this), this.timeStep)
		this.isPlaying = true
	}
	private async proceedPlaying() {
		const nextDate = DateFns.addMilliseconds(this.clock, this.DefaultTimeStep)

		// exit(1/4) => when clock over window end
		if (
			nextDate.getTime() >= this.window.end.getTime() &&
			(this.nextSnapshot
				? nextDate.getTime() >= this.nextSnapshot.timestamp.getTime()
				: true)
		) {
			this.stop()
			return
		}

		// exit(2/4) => when clock over next snapshot
		if (
			this.nextSnapshot?.timestamp &&
			nextDate.getTime() >= this.nextSnapshot.timestamp.getTime()
		) {
			clearInterval(this.intervalId)

			const isTrackDifference =
				isAlmostSameDate(
					this.track.timestamp,
					this.getRecentTrackTimeBy(nextDate),
				) === false
			if (isTrackDifference) {
				await this.fetchTrack(nextDate)
			}

			await this.fetchSnapshot(nextDate)

			await this.fetchVehicleAlarms(
				this.currentSnapshot.timestamp,
				this.nextSnapshot?.timestamp ?? this.tomorrow,
			)

			await this.fetchEvents(
				this.currentSnapshot.timestamp,
				this.nextSnapshot?.timestamp ?? this.tomorrow,
			)

			this.clock = this.currentSnapshot.timestamp
			this.remainedFirstAlarmIndex = 0
			this.remainedFirstEventIndex = 0
			this.clockChanged.emit({
				type: 'SnapshotChanged',
				clock: this.clock,
				snapshot: this.currentSnapshot.data,
			})
			this.resume()
			return
		}

		// exit(3/4) => when clock over current loaded last event
		// condition check order is important
		if (this.loaded.to.getTime() < nextDate.getTime()) {
			return
		}

		// exit(4/4) => when history events are not ready
		// it occurs when current snapshot move to future not past
		const lastHistoryEvent = this.historyEvents[this.historyEvents.length - 1]
		const isHistoryNotReady =
			lastHistoryEvent &&
			new Date(lastHistoryEvent.historyChangeTime).getTime() <=
				nextDate.getTime() &&
			new Date(lastHistoryEvent.historyChangeTime).getTime() <
				this.currentSnapshot.timestamp.getTime()
		if (isHistoryNotReady) {
			return
		}

		const nextRemainedFirstEventIndex = (() => {
			const index = this.historyEvents
				.slice(this.remainedFirstEventIndex)
				.findIndex(
					(event) =>
						new Date(event.historyChangeTime).getTime() > nextDate.getTime(),
				)
			return index === -1
				? this.historyEvents.length
				: this.remainedFirstEventIndex + index
		})()
		const nextRemainedFirstAlarmIndex = (() => {
			const index = this.alarmChanges
				.slice(this.remainedFirstAlarmIndex)
				.findIndex(
					(event) =>
						new Date(event.historyChangeTime).getTime() > nextDate.getTime(),
				)
			return index === -1
				? this.alarmChanges.length
				: this.remainedFirstAlarmIndex + index
		})()

    const evt : ClockChangedEvent = {
      type: 'NextFrameEvent',
      clock: this.clock,
      events: this.historyEvents.slice(
        this.remainedFirstEventIndex,
        nextRemainedFirstEventIndex,
      ),
      alarms: this.alarmChanges.slice(
        this.remainedFirstAlarmIndex,
        nextRemainedFirstAlarmIndex,
      ),
    }
		
		// 🎉 event
		this.clockChanged.emit(evt)

		// change state after event emit
		// because this state before and after are used for event emit
		this.clock = nextDate
		this.remainedFirstAlarmIndex = nextRemainedFirstAlarmIndex
		this.remainedFirstEventIndex = nextRemainedFirstEventIndex
	}



	public stop() {
		if (this.intervalId) clearInterval(this.intervalId)
		this.isPlaying = false
	}

	public changePlaySpeed(playSpeed: PlaybackSpeed) {
		if (this.intervalId) clearInterval(this.intervalId)
		this.playSpeed = playSpeed
		if (this.isPlaying) this.resume()
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

function removeDuplicates(arr: any[], prop: string) {
  const uniqueMap = new Map();
  return arr.filter(obj => !uniqueMap.has(obj[prop]) && uniqueMap.set(obj[prop], 1));
}
