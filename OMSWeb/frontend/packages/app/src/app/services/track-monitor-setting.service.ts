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
		| 'isVehicleLineVisible'
		| 'isSegmentDirectionVisible'
		| 'isPointLabelVisible'
		| 'isPointHomeVisible'
		| 'isStationVisible'
		| 'isBufferVisible'
		| 'isZcuVisible'
		| 'isGroupVisible'
		| 'isClusterVisible'
		| 'isFireshutterVisible'
		| 'isMtlVisible'
		| 'isOverlappingObjectsVisible'
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
		| 'pointColor'
		| 'normalSegmentColor'
		| 'disabledSegmentColor'
		| 'segmentDirectionColor'
		| 'autoModeVehicleColor'
		| 'manualModeVehicleColor'
		| 'noneModeVehicleColor'
		| 'cargoLoadingColor'
		| 'cargoFullColor'
		| 'cargoUnloadingColor'
		| 'fireshutterOpenedColor'
		| 'fireshutterClosedColor'
		| 'mtlUnuseColor'
		| 'mtlUseColor'
	value: string
}
type ScaleChangedEvent = {
	key: 'vehicleSize' | 'segmentWidth' | 'segmentDirectionSize'
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

type TrackMonitorSetting = Record<
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
	> & {
    vehicleSecondaryContent: "order" | "carrier"

    colorSettingVersion?: string
  }

const DefaultTrackMonitorSetting: TrackMonitorSetting = {
	// scale
	vehicleSize: 10,
	segmentWidth: 5,
	segmentDirectionSize: 10,

	// camera
	viewBoxWidth: undefined,
	position: undefined,

	// rotation
	rotation: 0,

	// visibility
	isMinimapVisible: true,
	isVehicleLineVisible: true,
	isSegmentDirectionVisible: true,
	isPointLabelVisible: true,
	isPointHomeVisible: true,
	isStationVisible: true,
	isBufferVisible: true,
	isZcuVisible: true,
	isGroupVisible: true,
	isClusterVisible: true,
	isFireshutterVisible: true,
	isMtlVisible: true,
	isOverlappingObjectsVisible: true,

	// color
	homeBackgroundColor: 'rgba(255, 255, 255, 1)',
	playbackBackgroundColor: 'rgba(214, 64, 109, 0.1)',
	stationColor: 'rgba(0, 0, 0, 1)',
	stationDisabledColor: '#f06767',
	bufferColor: 'rgba(100, 100, 100, 1)',
	bufferDisabledColor: '#ff9494',
	pointColor: 'rgba(80, 80, 80, 1)',
	normalSegmentColor: 'rgba(200, 200, 200, 1)',
	disabledSegmentColor: 'rgba(165, 127, 184, 1)',
	segmentDirectionColor: 'rgba(110, 110, 110, 1)',
	autoModeVehicleColor: 'rgba(95, 95, 95, 1)',
	manualModeVehicleColor: 'rgba(40, 180, 115, 1)',
	noneModeVehicleColor: 'rgba(255, 255, 255, 1)',
	cargoLoadingColor: 'rgba(0, 0, 205, 1)',
	cargoFullColor: 'rgba(50, 50, 50, 1)',
	cargoUnloadingColor: 'rgba(128, 0, 128, 1)',
	fireshutterClosedColor: '#F04907',
	fireshutterOpenedColor: 'rgb(50, 145, 236)',
	mtlUnuseColor: '#f98080',
	mtlUseColor: 'grey',

  // vehicle contents
  vehicleSecondaryContent: 'order'
}

@Injectable({
	providedIn: 'root',
})
// use arrow function for prevent dynamic context changing
export class TrackMonitorSettingService {
	@Output() rotationChanged = new EventEmitter<number>()

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
      const currentVersion = (defaultColors as any).colorSettingVersion as (string | undefined);
			if (this.trackSetting.colorSettingVersion !== currentVersion){
        const beforeVersion = this.trackSetting.colorSettingVersion
        Object.assign(this.trackSetting, defaultColors)
        console.log(`INFO: Color Default Setting Changed from ${beforeVersion} to ${currentVersion}`)
      }

			Object.assign(DefaultTrackMonitorSetting, defaultColors)

			writeTrackSettingOnLocalStorage(this.trackSetting)
		})

		this.settingsService
			.loadVehicleOrderIdContents()
			.subscribe((response) => {
        const isCarrierIdTrue = response?.carrierId === true
        const isOrderIdTrue = response?.orderId === true
        
        if(isCarrierIdTrue && isOrderIdTrue)
          this.trackSetting.vehicleSecondaryContent = 'order'
        else if(isCarrierIdTrue)
          this.trackSetting.vehicleSecondaryContent = 'carrier'
        else if(isOrderIdTrue)
          this.trackSetting.vehicleSecondaryContent = 'order'
        else
          this.trackSetting.vehicleSecondaryContent = 'order'
      })
	}

	update = (event: ChangedEvent) => {
		// @ts-ignore
		this.trackSetting[event.key] = event.value
		writeTrackSettingOnLocalStorage(this.trackSetting)
	}
	reset = (key: keyof TrackMonitorSetting) => {
		// @ts-ignore
		this.update({ key, value: DefaultTrackMonitorSetting[key] })
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