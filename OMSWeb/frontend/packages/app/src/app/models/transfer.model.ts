export interface ITransferHCACK {
	hcack: number
	cpname: string
	cpack: number
}

export interface Transfer {
	id: number
	logicalId: string
	origin: string
	vehicleId: string
	state: null
	locationPickup: string
	locationDropoff: string
	locationMove: string
	priority: number
	assignmentDetails: string
	assignmentType: string
	carrierLabel: string
	timeCreated: string
	timeAssigned?: string
	timeCompleted?: string
	timeAborted?: string
	timeFailed?: string

	distancePickup: number
	distanceDropoff: number
	distanceMove: number
}
