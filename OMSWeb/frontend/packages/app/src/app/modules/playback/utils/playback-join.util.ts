import { CurrentVehicle, CurrentOrder } from '../../../models/playback.model'

function addOrderInfoToCurrenVehicle(
	vehicle: CurrentVehicle,
	orders: CurrentOrder[],
) {
	const order = orders.find((o) => o.id === vehicle.orderId)
	if (order) {
		vehicle.locationPickup = order.locationPickup
		vehicle.locationDropoff = order.locationDropoff
    vehicle.locationMove = order.locationMove
	}
	return vehicle
}

export { addOrderInfoToCurrenVehicle }
