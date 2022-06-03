import { CurrentVehicle } from '@oms/root/models/playback.model'

function getPortVehicleCommand(command = '') {
	const portPattern = /[s|b]\d+/
	const port = portPattern.exec(command)
	return port == null ? undefined : port[0]
}

function isConnected(connection: number) {
	return connection === 1 || connection === 2
}

function isHostOrder(orderOrigin: CurrentVehicle['orderOrigin'] = '') {
	return orderOrigin?.includes('MCS') || orderOrigin?.includes('*')
}

export { getPortVehicleCommand, isConnected, isHostOrder }
