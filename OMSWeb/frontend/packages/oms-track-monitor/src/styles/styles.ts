import { reactive, readonly } from 'vue'
import { deepCopy } from '../utils/deepCopy'
import { ColorProperty } from './types/ColorProperty'
import { ScaleProperty } from './types/ScaleProperty'
import { VisibleProperty } from './types/VisibleProperty'

const ScaleDefault: Record<ScaleProperty, number> = {
	vehicleSize: 10, // applied in OmsTrackMonitor.ce.vue
	segmentDirection: 6, // applied in SegmentLayer.ce.vue
	segmentWidth: 3, // applied in OmsTrackMonitor.ce.vue
	stationMargin: 300, // applied in OmsTrackMonitor.ce.vue
	bufferMargin: 300, // applied in OmsTrackMonitor.ce.vue
}
const scaleStyles = reactive(deepCopy(ScaleDefault))
const scaleStylesInfo = readonly(scaleStyles)

function updateScaleStyle(key: ScaleProperty, value: number) {
	scaleStyles[key] = value
}

const VisibleDefault: Record<VisibleProperty, boolean> = {
	vehicleLine: true, // applied in OmsTrackMonitor.ce.vue
	segmentDirection: true, // applied in OmsTrackMonitor.ce.vue
	pointLabel: true, // applied in OmsTrackMonitor.ce.vue
	pointHome: true, // applied in OmsTrackMonitor.ce.vue
	station: true, // applied in OmsTrackMonitor.ce.vue
	buffer: true, // applied in OmsTrackMonitor.ce.vue
	zcu: true, // applied in OmsTrackMonitor.ce.vue
	group: true, // applied in OmsTrackMonitor.ce.vue
	cluster: true, // applied in OmsTrackMonitor.ce.vue
	fireshutter: true, // applied in OmsTrackMonitor.ce.vue
	mtl: true, // applied in OmsTrackMonitor.ce.vue
	minimap: true, // applied in OmsTrackMonitor.ce.vue
}

// All color configurations are applied in OmsTrackMonitor.ce.vue
const ColorDefault: Record<ColorProperty, string> = {
	background: 'white',
	station: 'black',
	stationDisabled: '#f06767',
	buffer: 'black',
	bufferDisabled: '#ff9494',
	point: 'black',
	home: '#00000060',
	normalSegment: 'grey',
	disabledSegment: 'purple',
	segmentDirection: 'grey',
	autoModeVehicle: 'grey',
	manualModeVehicle: 'green',
	noneModeVehicle: 'transparent',
	cargoLoading: 'rgb(0, 0, 205)',
	cargoFull: 'rgb(50,50,50)',
	cargoUnloading: 'blue',
	fireshutterOpened: 'rgb(50, 145, 236)',
	fireshutterClosed: '#F04907',
	mtlUnuse: '#f98080',
	mtlUse: 'grey',
}

export {
	ScaleDefault,
	scaleStylesInfo,
	updateScaleStyle,
	VisibleDefault,
	ColorDefault,
}
