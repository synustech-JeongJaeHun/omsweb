import { ICoordinate } from './drawing.model'
import { Group } from './group.model'
import { Point } from './point.model'
import { Segment } from './segment.model'
import { Vehicle } from './vehicle.model'
import { Station } from './station.model'
import { MTL } from './mtl.model'
import { Cluster } from './cluster.model'
import { Buffer } from './buffer.model'
import { Zcu } from './zcu.model'

export interface IViewerData {
	groups?: Group[]
	points?: Point[]
	segments?: Segment[]
	segmentsDisabled?: any[]
	stations?: Station[]
	buffers?: Buffer[]
	mtls?: MTL[]
	clusters?: Cluster[]
	vehicles?: Vehicle[]
	zcus?: Zcu[]
}
export interface ICoordinateInfo {
	coord: ICoordinate
	invertedCoord?: ICoordinate
	isError?: boolean
}
export interface ISegmentSummary {
	type: string
	location: string
	direction: string
}
export interface ISegmentPart {
	id?: number
	radius?: number
	type?: string
	direction?: string
	location?: string
	coordFrom: ICoordinateInfo
	coordTo: ICoordinateInfo
	path?: string
}

export interface ISegmentPath {
	id: number
	path: string
	pointFrom: IPoint
	pointTo: IPoint
	type: string
}
export interface ISegment extends ISegmentPath {
	logicalId: string
	physicalId: string
	location: string
	direction: string

	segmentParts: ISegmentPart[]
	dirCoord: any
	dirAngle: any
	bezierPoints: any[]

	length: number
	speed?: number
	travelTime?: number

	disableState?: any

	candidates?: any[]
	isValidate?: boolean
	validateText?: string
	updateState?: string
}

export interface IPoint {
	id?: number
	coord: ICoordinate
	invertedCoord: ICoordinate
}

export type VehicleDestinationType = 'go' | 'load' | 'unload'

export type MapEventType =
	| 'click'
	| 'contextmenu'
	| 'mouseenter'
	| 'mouseout'
	| 'backdrop'
	| 'selectUnit'
export interface IMapMouseEvent {
	type: MapEventType
	targetId?: number
	targetType?: string
	targetData?: any
	mapMode?: string
	groupType?: string //'OVERLAP' | 'OVERLAP_MODULE' | 'UNASSIGNED_MODULE' | 'LAYOUT';
	position?: ICoordinate
}

export type TransferCommandCategoryType =
	| 'fromTo'
	| 'from'
	| 'to'
	| 'move'
  | 'scan'
	| 'mtl'

export class TransferCommandState {
	active: boolean = false
	category: TransferCommandCategoryType = 'fromTo'
	#selectVehicle: boolean = false
	#vehicle?: ILookupUnit
	point?: ILookupUnit
	#source?: ILookupUnit
	dest?: ILookupUnit
	mtl?: ILookupUnit
	carrier?: string
	priority?: string
	mtlInOut: boolean = true
  buffers?: ILookupUnit[] = []

	get autoDisabled(): boolean {
		return !this.active || ['fromTo', 'from', 'scan'].includes(this.category)
	}
	get vehicleDisabled(): boolean {
		return (
			!this.active ||
			(!this.selectVehicle && ['fromTo', 'from', 'scan'].includes(this.category))
		)
	}
	get pointDisabled(): boolean {
		return (
			!this.active || ['fromTo', 'from', 'to', 'mtl'].includes(this.category)
		)
	}
	get sourceDisabled(): boolean {
		return !this.active || ['to', 'move', 'mtl'].includes(this.category)
	}
	get destDisabled(): boolean {
		return !this.active || ['from', 'mtl'].includes(this.category)
	}
	get carrierDisabled(): boolean {
		return !this.active || !this.pointDisabled
	}

	get selectVehicle() {
		return this.#selectVehicle
	}

	set selectVehicle(value: boolean) {
		if (value === false) this.vehicle = undefined
		this.#selectVehicle = value
	}

	// for loading carrier default value
	get vehicle() {
		return this.#vehicle
	}

	set vehicle(v: ILookupUnit) {
		if (v == null) {
			this.#vehicle = v
			return
		}

		switch (this.category) {
			case 'fromTo':
			case 'from':
      case 'scan':
				{
					if (v?.logicalId) {
						getCarrierId(v.logicalId)
							.then((carrierId) => {
								if (!carrierId) {
									this.#vehicle = v
								}
							})
							.catch(() => {})
					}
				}
				break
			case 'to':
				{
					if (v?.logicalId) {
						getCarrierId(v.logicalId)
							.then((carrierId) => {
								if (carrierId) {
									this.carrier = carrierId
									this.#vehicle = v
								}
							})
							.catch(() => {})
					}
				}
				break
			case 'move':
			case 'mtl':
				this.#vehicle = v
				break

			default:
				break
		}
	}

	get source() {
		return this.#source
	}

	set source(s: ILookupUnit) {
		if (s == null) {
			this.#source = s
			return
		}

		if (s.objectType.toLowerCase() === 'buffer' && s?.logicalId)
			switch (this.category) {
				case 'fromTo':
				case 'from':
					getCarrierId(s.logicalId)
						.then((carrierId) => {
							if (carrierId) {
								this.carrier = carrierId
								this.#source = s
							}
						})
						.catch(() => {})
					break

				default:
					this.#source = s
					break
			}

		if (s.objectType.toLowerCase() === 'station')
			switch (this.category) {
				case 'fromTo':
				case 'from':
					this.#source = s
					break

				default:
					this.#source = s
					break
			}
	}
}

async function getCarrierId(logicalId: string) {
	const response = await fetch(`/api/tracks/carriers/${logicalId}`)
	const result = await response.text()

	return result
}

export interface ILookupUnit {
	id?: number
	objectType?: string
	logicalId?: string
	physicalId?: string
}

export type TrackIdMapType = { [key: string]: ILookupUnit }

export class VehicleTrackingState {
	status: boolean = false
	id?: number
}
