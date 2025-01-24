import { EventEmitter, Injectable, Output } from '@angular/core'
import { SettingsService } from './settings.service'

type ChangedEvent =
	| VisibilityChangedEvent
	| ColorChangedEvent
	| ScaleChangedEvent
	| RotationChangedEvent
	| CameraPositionChangedEvent
	| CameraViewBoxWidthChangedEvent

type VisibilityChangedEvent = {
	key:
		| 'isMinimapVisible'
		| 'isVehicleNextLineVisible'
		| 'isVehicleFromOrderLineVisible'
		| 'isVehicleToOrderLineVisible'
		| 'isVehicleMoveOrderLineVisible'
		| 'isVehicleHomeivrLineVisible'
		| 'isSegmentDirectionVisible'
		| 'isPointLabelVisible'
		| 'isPointHomeVisible'
		| 'isStationVisible'
		| 'isBufferVisible'
		| 'isZcuVisible'
		| 'isGroupVisible'
		| 'isClusterVisible'
		| 'isCpsVisible'
		| 'isFireshutterVisible'
		| 'isMtlVisible'
		| 'isOverlappingObjectsVisible'
    | 'isVHLArrowVisible'
    | 'isVhlStatusVisible'
    | 'isBackdropVisible'
		| 'isAutoScale'
	value: boolean
}
type ColorChangedEvent = {
	key:
		| 'homeBackgroundColor'
		| 'playbackBackgroundColor'
		| 'stationColor'
		| 'stationDisabledColor'
		| 'bufferColor'
		| 'bufferDisabledColor'
		| 'bufferTypeColor'
		| 'pointColor'
		| 'normalSegmentColor'
		| 'disabledSegmentColor'
		| 'disabledByVehicleSegmentColor'
    | 'disabledByMTLSegmentColor'
		| 'segmentDirectionColor'
		| 'disconnectModeVehicleColor'
		| 'errorModeVehicleColor'
		| 'maintenanceModeVehicleColor'
		| 'manualModeVehicleColor'
		| 'idleModeVehicleColor'
		| 'homeIvrModeVehicleColor'
		| 'runningModeVehicleColor'
		| 'zcuBlockedVehicleColor'
		| 'sensorStoppedVehicleColor'
		| 'cargoLoadingColor'
		| 'cargoFullColor'
		| 'cargoUnloadingColor'
		| 'fireshutterOpenedColor'
		| 'fireshutterClosedColor'
		| 'mtlUnuseColor'
		| 'mtlUseColor'
    | 'passedTimeColor'
    | 'carrierInstalledColor'
    | 'carrierUnknownColor'
    | 'carrierEmptyColor'
    | 'carrierFullColor'
    | 'carrierErrorColor'

	value: string
}

type ClustersColorChangedEvent = {
  key: number
  value: string
}

type ScaleChangedEvent = {
	key: 'vehicleSize' | 'vehicleTextSize' | 'vehiclePropSize' | 'stationSize' | 'stationTextSize' |
		'bufferSize' | 'bufferTextSize' | 'zcuSize' | 'segmentWidth' | 'segmentDirectionSize' | 'lineWidth'
	value: number
}
type RotationChangedEvent = {
	key: 'rotation'
	value: number
}

type CameraPositionChangedEvent = {
	key: 'position'
	value?: { x: number; y: number }
}
type CameraViewBoxWidthChangedEvent = {
	key: 'viewBoxWidth'
	value?: number
}

export type TrackMonitorSetting = Record<
	ColorChangedEvent['key'],
	ColorChangedEvent['value']
> &
	Record<ScaleChangedEvent['key'], ScaleChangedEvent['value']> &
	Record<VisibilityChangedEvent['key'], VisibilityChangedEvent['value']> &
	Record<RotationChangedEvent['key'], RotationChangedEvent['value']> &
	Record<
		CameraPositionChangedEvent['key'],
		CameraPositionChangedEvent['value']
	> &
	Record<
		CameraViewBoxWidthChangedEvent['key'],
		CameraViewBoxWidthChangedEvent['value']
	> &
  {
		vehicleSecondaryContent: 'order' | 'carrier'

		colorSettingVersion?: string
	}
  &
  {
    clusterColors?: string[]
  }

const DefaultTrackMonitorSetting: TrackMonitorSetting = {
	// scale
	vehicleSize: 10,
  vehicleTextSize: 12,
  vehiclePropSize: 12,
	stationSize: 10,
	stationTextSize: 10,
	bufferSize: 10,
	bufferTextSize: 10,
    zcuSize: 7,
	segmentWidth: 5,
  lineWidth: 1,
	segmentDirectionSize: 10,

	// camera
	viewBoxWidth: undefined,
	position: undefined,

	// rotation
	rotation: 0,

	// visibility
	isMinimapVisible: true,
	isVehicleNextLineVisible: true,
	isVehicleFromOrderLineVisible: true,
	isVehicleToOrderLineVisible: true,
	isVehicleMoveOrderLineVisible: true,
	isVehicleHomeivrLineVisible: true,
	isSegmentDirectionVisible: true,
	isPointLabelVisible: true,
	isPointHomeVisible: true,
	isStationVisible: true,
	isBufferVisible: true,
	isZcuVisible: true,
	isGroupVisible: true,
	isClusterVisible: true,
  isCpsVisible: true,
	isFireshutterVisible: true,
	isMtlVisible: true,
	isOverlappingObjectsVisible: true,
  isVHLArrowVisible: false,
  isVhlStatusVisible: false,
  isBackdropVisible: false,
	isAutoScale: true,

	// color
	homeBackgroundColor: 'rgba(255, 255, 255, 1)',
	playbackBackgroundColor: 'rgba(214, 64, 109, 0.1)',
	stationColor: 'rgba(0, 0, 0, 1)',
	stationDisabledColor: '#f06767',
	bufferColor: 'rgba(100, 100, 100, 1)',
	bufferDisabledColor: '#ff9494',
	bufferTypeColor: 'rgba(50, 50, 50, 1)',
	pointColor: 'rgba(80, 80, 80, 1)',
	normalSegmentColor: 'rgba(200, 200, 200, 1)',
	disabledSegmentColor: 'rgba(165, 127, 184, 1)',
	disabledByVehicleSegmentColor: '#ffa500',
	disabledByMTLSegmentColor: 'rgba(112,168,113,0.56)',

	// chjs visual start
	segmentDirectionColor: 'rgba(110, 110, 110, 1)',
	disconnectModeVehicleColor: '#E1D7C5',
	errorModeVehicleColor: '#FF3838',
	maintenanceModeVehicleColor: '#5C666D',
	manualModeVehicleColor: '#5C666D',
	idleModeVehicleColor: '#FCE83A',
	homeIvrModeVehicleColor: '#FFB302',
	runningModeVehicleColor: '#51E400',
	zcuBlockedVehicleColor: '#2DCCFF',
	// chjs visual end

	sensorStoppedVehicleColor: '#2DCCFF',
	cargoLoadingColor: 'rgba(0, 0, 205, 1)',
	cargoFullColor: 'rgba(50, 50, 50, 1)',
	cargoUnloadingColor: 'rgba(128, 0, 128, 1)',
	fireshutterClosedColor: '#F04907',
	fireshutterOpenedColor: 'rgb(128,128,128, 1)',
	mtlUnuseColor: '#f98080',
  mtlUseColor: 'grey',

  carrierUnknownColor: '#000000',
  carrierEmptyColor: '#FF7F27',
  carrierFullColor: '#0000FF',
  carrierErrorColor: '#FF0000',
  passedTimeColor: '#FF0000',
  carrierInstalledColor: '#000000',


	// vehicle contents
	vehicleSecondaryContent: 'order',

  clusterColors: [
    "rgba(54, 56, 46,0.45)",
    "rgba(115, 95, 61, 0.45)",
    "rgba(150, 2, 0, 0.45)",
    "rgba(255, 0, 0, 0.45)",
    "rgba(239, 111, 108, 0.45)",
    "rgba(255, 165, 165, 0.45)",
    "rgba(246, 202, 131, 0.45)",
    "rgba(255, 208, 70, 0.45)",
    "rgba(255, 136, 0, 0.45)",
    "rgba(198, 161, 91, 0.45)",
    "rgba(148, 157, 106, 0.45)",
    "rgba(173, 255, 187, 0.45)",
    "rgba(128, 181, 167, 0.45)",
    "rgba(145, 220, 247, 0.45)",
    "rgba(87, 184, 255, 0.45)",
    "rgba(0, 153, 255, 0.45)",
    "rgba(255, 63, 165, 0.45)",
    "rgba(79, 53, 155, 0.45)",
    "rgba(36, 30, 78, 0.45)",
    "rgba(140, 33, 85, 0.45)",
    "rgba(255, 0, 106, 0.45)",
    "rgba(211, 76, 211, 0.45)",
    "rgba(226, 161, 220, 0.45)",
    "rgba(92, 26, 27, 0.45)"
  ]
}

@Injectable({
	providedIn: 'root',
})
// use arrow function for prevent dynamic context changing
export class TrackMonitorSettingService {
	@Output() rotationChanged = new EventEmitter<number>()
  @Output() vhlStatusChanged = new EventEmitter<boolean>()
	@Output() zcuStatusChanged = new EventEmitter<boolean>()
	
	public trackSetting: TrackMonitorSetting = deepCopy(
		DefaultTrackMonitorSetting,
	)

	constructor(private settingsService: SettingsService) {
		this.loadSetting()
	}

	loadSetting = () => {
		Object.assign(this.trackSetting, readTrackSettingFromLocalStorage())
		writeTrackSettingOnLocalStorage(this.trackSetting)

		this.settingsService.loadDefaultColors().subscribe((defaultColors) => {
			const currentVersion = (defaultColors as any).colorSettingVersion as
				| string
				| undefined
			if (this.trackSetting.colorSettingVersion !== currentVersion) {
				const beforeVersion = this.trackSetting.colorSettingVersion
				Object.assign(this.trackSetting, defaultColors)
				console.log(
					`INFO: Color Default Setting Changed from ${beforeVersion} to ${currentVersion}`,
				)
			}

			Object.assign(DefaultTrackMonitorSetting, defaultColors)

			writeTrackSettingOnLocalStorage(this.trackSetting)
		})

		this.settingsService.loadVehicleOrderIdContents().subscribe((response) => {
			const isCarrierIdTrue = response?.carrierId === true
			const isOrderIdTrue = response?.orderId === true

			if (isCarrierIdTrue && isOrderIdTrue)
				this.trackSetting.vehicleSecondaryContent = 'order'
			else if (isCarrierIdTrue)
				this.trackSetting.vehicleSecondaryContent = 'carrier'
			else if (isOrderIdTrue)
				this.trackSetting.vehicleSecondaryContent = 'order'
			else this.trackSetting.vehicleSecondaryContent = 'order'
		})
	}

	update = (event: ChangedEvent) => {
		// @ts-ignore
		this.trackSetting[event.key] = event.value
		writeTrackSettingOnLocalStorage(this.trackSetting)
	}

  updateCustom(trackSetting:TrackMonitorSetting){
    writeTrackSettingOnLocalStorage(trackSetting)
  }
	reset = (key: keyof TrackMonitorSetting) => {
		// @ts-ignore
		this.update({ key, value: DefaultTrackMonitorSetting[key] })
	}

  updateCluster = (event: ClustersColorChangedEvent) => {
    this.trackSetting.clusterColors[event.key] = event.value
    writeTrackSettingOnLocalStorage(this.trackSetting)
  }
}

const TrackSettingLocalStorageKey = 'track-monitor-setting'

function readTrackSettingFromLocalStorage() {
	try {
		return JSON.parse(
			localStorage.getItem(TrackSettingLocalStorageKey),
		) as Partial<TrackMonitorSetting> | null
	} catch {
		return null
	}
}

function writeTrackSettingOnLocalStorage(update: TrackMonitorSetting) {
	localStorage.setItem(TrackSettingLocalStorageKey, JSON.stringify(update))
}

function deepCopy<T>(target: T) {
	return JSON.parse(JSON.stringify(target)) as T
}
