import { Component, OnDestroy } from '@angular/core'
import { VehicleService } from '@oms/root/services/vehicle.service'
import {
	IVehicleDioCategory,
	IVehicleDioHistory,
} from '@oms/root/models/vehicle-status.model'
import { PlaybackPlayService } from '@oms/root/services/playback-play.service'
import {
	ClockChangedEvent,
	CurrentVehicle,
} from '@oms/root/models/playback.model'
import {
	convertPatternToColor,
	convertSignedIntegerToBitString,
	parsePIO,
} from '../../shared/utils/dio.util'
import * as DateFns from 'date-fns'
import { isHostOrder } from '../../playback/utils/playback-parse.util'
import { takeUntil } from 'rxjs/operators'
import { Subject } from 'rxjs'

type DioHistory = Omit<IVehicleDioHistory, 'historyChangeTime'> & {
	historyChangeTime: Date
	dis: ('0' | '1')[]
	dos: ('0' | '1')[]
	trend: {
		po_valid: number
		po_cs_0: number
		po_cs_1: number
		po_tr_req: number
		po_busy: number
		po_compt: number
		po_cont: number
		pi_l_req: number
		pi_u_req: number
		pi_ready: number
		pi_ho_avbl: number
		pi_es: number
		pattern: string
	}
}

@Component({
	selector: 'oms-playback-vehicle-status-dialog',
	templateUrl: './playback-vehicle-status-dialog.component.html',
	styleUrls: ['./playback-vehicle-status-dialog.component.scss'],
})
export class PlaybackVehicleStatusDialogComponent implements OnDestroy {
	private destroy$ = new Subject<void>()

	visiblePIOTrend = false

	get vehicles() {
		return this.playService.currentVehicles
	}
	currentVehicle: CurrentVehicle | undefined
	histories: DioHistory[] = []

	get currentVehicleIsHostOrder() {
		return isHostOrder(this.currentVehicle.orderOrigin)
	}

	pioIndice = [64, 65, 66, 67, 68, 69, 70, 71] as const
	categories: {
		name: string
		dis: { label: string; index: number }[]
		dos: { label: string; index: number }[]
		show: boolean
	}[] = []
	dioInfos: IVehicleDioCategory[] = []
	dis: ('0' | '1')[] = []
	dos: ('0' | '1')[] = []

	dioHistoriesIn30Seconds: {
		historyChangeTimeFrom30SecondsBefore: number
		po_valid: number
		po_cs_0: number
		po_cs_1: number
		po_tr_req: number
		po_busy: number
		po_compt: number
		po_cont: number
		pi_l_req: number
		pi_u_req: number
		pi_ready: number
		pi_ho_avbl: number
		pi_es: number
		pattern: string
	}[] = []

	valueFieldName(inout: 'pi' | 'po', index: number) {
		return `${inout}${index}`
	}

	parseInt = parseInt
	patternColor = convertPatternToColor

	constructor(
		private vehicleService: VehicleService,
		private playService: PlaybackPlayService,
	) {
		this.vehicleService.getVehicleDioCategories().subscribe((dios) => {
			this.dioInfos = dios

			const diCategoryMap = new Map<
				string,
				{ label: string; index: number }[]
			>()
			const doCategoryMap = new Map<
				string,
				{ label: string; index: number }[]
			>()
			const categorySet = new Set<string>()
			dios.forEach((dio) => {
				if (dio?.inCategory?.length > 0) {
					const values = diCategoryMap.get(dio.inCategory) ?? []
					diCategoryMap.set(dio.inCategory, [
						...values,
						{ label: dio.inName, index: dio.id },
					])
					categorySet.add(dio.inCategory)
				}
				if (dio?.outCategory?.length > 0) {
					const values = doCategoryMap.get(dio.outCategory) ?? []
					doCategoryMap.set(dio.outCategory, [
						...values,
						{ label: dio.outName, index: dio.id },
					])
					categorySet.add(dio.outCategory)
				}
			})

			this.categories = [...categorySet.values()].map((category) => {
				return {
					name: category,
					show: true,
					dis: diCategoryMap.get(category) ?? [],
					dos: doCategoryMap.get(category) ?? [],
				}
			})
		})

		if (this.vehicles.length > 0)
			this.onVehicleSelect({ selectedItem: this.vehicles[0] })
		else this.currentVehicle = undefined

		this.playService.clockChanged
			.pipe(takeUntil(this.destroy$))
			.subscribe(this.consumeEvent)
	}

	ngOnDestroy(): void {
		this.destroy$.next()
		this.destroy$.complete()
	}

	private consumeEvent = async (event: ClockChangedEvent) => {
		if (this.currentVehicle == null) return

		if (event.type === 'SnapshotChanged') {
			this.currentVehicle = this.playService.currentVehicles.find(
				(cv) => cv.id === this.currentVehicle.id,
			)

			await this.loadDatum(
				this.currentVehicle.id,
				this.playService.currentSnapshot?.timestamp,
				this.playService.nextSnapshot?.timestamp,
			)
		}

		this.update(event.clock)
	}

	async onVehicleSelect({ selectedItem: value }) {
		if (value && value.id !== this.currentVehicle?.id) {
			this.currentVehicle = value

			await this.loadDatum(
				this.currentVehicle.id,
				this.playService.currentSnapshot?.timestamp,
				this.playService.nextSnapshot?.timestamp,
			)
			this.update(this.playService.clock)
		}
	}

	private async loadDatum(
		vehicleId: number,
		from: Date,
		to: Date = new Date(9999, 1, 1),
	): Promise<void> {
		const twoMinutesBeforefrom = DateFns.subSeconds(from, 40)

		try {
			const firstHistory = await this.vehicleService
				.getRecentVehicleDioBefore(vehicleId, twoMinutesBeforefrom)
				.toPromise()
			const historiesBetweenFromAndTo = await this.vehicleService
				.getVehicleDioHistories(vehicleId, twoMinutesBeforefrom, to)
				.toPromise()
			const histories = (
				firstHistory
					? [firstHistory, ...historiesBetweenFromAndTo]
					: historiesBetweenFromAndTo
			).map((history) => {
				const di1 = convertSignedIntegerToBitString(history.di1, 32)
				const di2 = convertSignedIntegerToBitString(history.di2, 32)
				const di3 = convertSignedIntegerToBitString(history.di3, 32)
				const do1 = convertSignedIntegerToBitString(history.do1, 32)
				const do2 = convertSignedIntegerToBitString(history.do2, 32)
				const do3 = convertSignedIntegerToBitString(history.do3, 32)
				const trend = {
					po_valid: parseInt(do3[8]),
					po_cs_0: parseInt(do3[9]),
					po_cs_1: parseInt(do3[10]),
					po_tr_req: parseInt(do3[12]),
					po_busy: parseInt(do3[13]),
					po_compt: parseInt(do3[14]),
					po_cont: parseInt(do3[16]),
					pi_l_req: parseInt(di3[0]),
					pi_u_req: parseInt(di3[1]),
					pi_ready: parseInt(di3[3]),
					pi_ho_avbl: parseInt(di3[6]),
					pi_es: parseInt(di3[7]),
					pattern: parsePIO(
						{
							L_REQ: di3[0] as '0' | '1',
							U_REQ: di3[1] as '0' | '1',
							READY: di3[3] as '0' | '1',
							HO_AVBL: di3[6] as '0' | '1',
							ES: di3[7] as '0' | '1',
						},
						{
							VALID: do3[8] as '0' | '1',
							CS_0: do3[9] as '0' | '1',
							CS_1: do3[10] as '0' | '1',
							TR_REQ: do3[12] as '0' | '1',
							BUSY: do3[13] as '0' | '1',
							COMPT: do3[14] as '0' | '1',
						},
					),
				}

				return {
					...history,
					historyChangeTime: new Date(history.historyChangeTime),
					dis: (di1 + di2 + di3).split('') as ('0' | '1')[],
					dos: (do1 + do2 + do3).split('') as ('0' | '1')[],
					trend,
				}
			})
			this.histories = histories
		} catch {
			this.histories = []
		}
	}

	private update(playbackClock: Date) {
		const baseTime = playbackClock

		// (1/2) set this.dis & this.dos
		{
			const currentTimeHistoryIndex =
				this.histories.findIndex((h) =>
					DateFns.isAfter(h.historyChangeTime, baseTime),
				) - 1
			const currentTimeHistory = this.histories[currentTimeHistoryIndex]

			this.dis = currentTimeHistoryIndex >= 0 ? currentTimeHistory.dis : []
			this.dos = currentTimeHistoryIndex >= 0 ? currentTimeHistory.dos : []
		}

		// (2/2) set diohistoriesin30seconds
		{
			const startTime = DateFns.subSeconds(baseTime, 30)
			const endTime = baseTime

			const startIndex = this.histories.findIndex((h) =>
				DateFns.isAfter(h.historyChangeTime, startTime),
			)
			const endIndex = this.histories.findIndex((h) =>
				DateFns.isAfter(h.historyChangeTime, endTime),
			)

			const time0Correction =
				startIndex <= 0 ? this.histories[0] : this.histories[startIndex - 1]
			const time30Correction =
				endIndex >= this.histories.length - 1 || endIndex < 0
					? this.histories[this.histories.length - 1]
					: this.histories[endIndex]

			const historiesIn30Seconds = this.histories.slice(startIndex, endIndex)
			this.dioHistoriesIn30Seconds = [
				{
					...time0Correction?.trend,
					historyChangeTimeFrom30SecondsBefore: 0,
				},
				...historiesIn30Seconds.map((h) => ({
					...h.trend,
					historyChangeTimeFrom30SecondsBefore:
						(new Date(h.historyChangeTime).getTime() -
							(baseTime.getTime() - 30000)) /
						1000,
				})),
				{
					...time30Correction?.trend,
					historyChangeTimeFrom30SecondsBefore: 30,
				},
			]
		}
	}

	onToggleVehicleStatusNPIOTrend() {
		this.visiblePIOTrend = !this.visiblePIOTrend
	}
}
