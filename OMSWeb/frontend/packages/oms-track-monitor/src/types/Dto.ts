namespace UpdateDto {
	export type Operation = 'INSERT' | 'UPDATE' | 'DELETE'
	export type Vehicle = {
		id: number
		logicalId: string
		physicalId: string

		canBePushed: boolean
		cargoState:
			| 'L' // Loading
			| 'F' // Full
			| 'U' // Unload
			| 'E' // Empty
		curPoint: number
		nextPoint: number
		errorList: string
		isBlocked: boolean
		isSensorStopped: boolean
		isMaint: boolean
		isConnected: boolean
		lastContact: string
		mapDb: string
		mode: 'A' | 'M'
		movingState: 'M' | 'S'
		distancePoint: number
		hostOrder: boolean
		orderOrigin: string | string[]

		// nullable
		cargoTransferResult?: string
		commandPoint?: any
		locationDropoff?: string
		locationMove?: string
		locationPickup?: string
		orderId?: number
		orderLogicalId?: string
		priority?: any
		type?: string
		group?: number
		historyChangeTime?: any
	}

	export type Segment = {}

	export type SegmentDisabled = {
		operation: Operation
		id: number
	} & (
		| {
				operation: 'INSERT'
				data: {
					id: number
					segmentId: number
					disabledBy: string
					disabledReason: string
				}
		  }
		| { operation: 'DELETE' }
	)
	export type Zcu = {
		id: number

		x?: number
		y?: number
		usingType?: number
		error?: boolean
		zcuType?: number
	}

	export type Station = {
		id: number
		unuse?: boolean
	}
}

export { UpdateDto }
