import { EventEmitter, Injectable, Output } from '@angular/core';

type ChangedEvent =
  | VisibilityChangedEvent
  | ColorChangedEvent
  | ScaleChangedEvent
  | RotationChangedEvent

type VisibilityChangedEvent = {
  group: "Visiblity"
  key:
  | "VehicleLine"
  | "SegmentDirection"
  | "PointLabel"
  | "Station"
  | "Buffer"
  | "Group"
  | "Cluster"
  | "OverlappingObjects"
  value: boolean
}
type ColorChangedEvent = {
  group: "Color"
  key:
  | 'backgroundColor'
  | 'stationColor'
  | 'bufferColor'
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
  value: string
}
type ScaleChangedEvent = {
  group: "Scale"
  key:
  | "Vehicle"
  | "SegmentWidth"
  | "SegmentDirection"
  value: number
}
type RotationChangedEvent = {
  group: "Rotation"
  value: number
}

@Injectable({
  providedIn: 'root'
})
export class TrackSettingService {
  @Output() settingChanged = new EventEmitter<ChangedEvent>()
  constructor() {

  }
}

