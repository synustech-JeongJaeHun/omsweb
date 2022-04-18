import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'

const hub = new HubConnectionBuilder()
  .withUrl('/hubs/oms')
  .withAutomaticReconnect([0, 0, 0, 500, 1000, 2000, 5000, 10000, 30000])
  .configureLogging(LogLevel.Debug)
  .build()

hub.onclose((err) => {
  console.log('# Hub connection closed.')
})

hub.onreconnecting((err) => {
  console.log('# Hub re-connecting...')
})

hub.onreconnected(() => {
  console.info('## Hub re-connected. ##')
})

hub.start().then(() => console.info('## Hub connected. ##'))

export function useHub(handlers: {
  vehicleChanged: Function
  segmentDisabledChanged: Function
  zcuMapChanged: Function
}) {
  hub.on('vehicleChanged', (meta, body) => {
    handlers.vehicleChanged({ ...meta, data: body })
  })
  hub.on('segmentDisabledChanged', (meta, body) => {
    handlers.segmentDisabledChanged({ ...meta, data: body })
  })
  hub.on('zcuMapChanged', (meta, body) => {
    handlers.zcuMapChanged({ ...meta, data: body })
  })
}

// vehiclePath:
// stationChanged:
// pointChanged:
// segmentChanged:
// clusterChanged:
// bufferChanged:
// mtlChanged:
// vehicleTableChanged:
// vehicleDioChanged:
// orderTableChanged:
// groupChanged:
// zcuStatusTableChanged:
// clusterStatusTableChanged:
// hub.on('pointChanged', (meta, body) => {})
// hub.on('segmentChanged', (meta, body) => {})
// hub.on('stationChanged', (meta, body) => {})
// hub.on('bufferChanged', (meta, body) => {})
// hub.on('mtlChanged', (meta, body) => {})
// hub.on('vehicleTableChanged', (meta, body) => {})
// hub.on('vehicleDioChanged', (meta, body) => {})
// hub.on('orderTableChanged', (meta, body) => {})
// hub.on('vehiclePath', (meta, body) => {})
// hub.on('clusterChanged', (meta, body) => {})
// hub.on('groupChanged', (meta, body) => {})
// hub.on('alarm', (meta, body) => {})
// hub.on('alert', (meta, body) => {})
// hub.on('serverStatus', (meta, body) => {})
// hub.on('modeState', (meta, body) => {})
// hub.on('zcuStatusTableChanged', (meta, body) => {})
// hub.on('clusterStatusTableChanged', (meta, body) => {})
