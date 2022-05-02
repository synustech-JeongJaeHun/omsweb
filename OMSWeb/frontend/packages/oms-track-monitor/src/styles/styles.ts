import { reactive, readonly } from 'vue'
import { deepCopy } from '../utils/deepCopy'
import { ColorProperty } from './types/ColorProperty'
import { ScaleProperty } from './types/ScaleProperty'
import { VisibleProperty } from './types/VisibleProperty'

const ScaleDefault: Record<ScaleProperty, number> = {
	vehicleSize: 10, // applied in OmsTrackMonitor.ce.vue
	segmentDirection: 6, // applied in SegmentLayer.ce.vue
	segmentWidth: 3, // applied in OmsTrackMonitor.ce.vue
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
	station: true, // applied in OmsTrackMonitor.ce.vue
	buffer: true, // applied in OmsTrackMonitor.ce.vue
	group: true, // applied in OmsTrackMonitor.ce.vue
	cluster: true, // applied in OmsTrackMonitor.ce.vue
	minimap: true, // applied in OmsTrackMonitor.ce.vue
}
const visibleStyles = reactive(deepCopy(VisibleDefault))
const visibleStylesInfo = readonly(visibleStyles)

function updateVisibleStyle(key: VisibleProperty, value: boolean) {
	visibleStyles[key] = value
}

// All color configurations are applied in OmsTrackMonitor.ce.vue
const ColorDefault: Record<ColorProperty, string> = {
	background: 'white',
	station: 'black',
	stationDisabled: '#bfbfbf',
	buffer: 'black',
	point: 'black',
	normalSegment: 'grey',
	disabledSegment: 'purple',
	segmentDirection: 'grey',
	autoModeVehicle: 'grey',
	manualModeVehicle: 'green',
	noneModeVehicle: 'transparent',
	cargoLoading: 'rgb(0, 0, 205)',
	cargoFull: 'rgb(50,50,50)',
	cargoUnloading: 'blue',
}

export {
	ScaleDefault,
	ColorDefault,
	scaleStylesInfo,
	visibleStylesInfo,
	updateScaleStyle,
	updateVisibleStyle,
}
