import { ToggleOptionKeyType } from '../Enums'
import { main_css } from '../css-loader'
import { IZoom } from './drawing.model'

type ToggleOptionsType = {
  [key in ToggleOptionKeyType]: boolean
}

class MapConfig {
  vehicleScale?: number = main_css.vehicle.radius
  mapRotation?: number = 0
  segmentWidth?: number = 2
  segmentDirectionSize? = 5
}

type ThemeConfig = Record<string, any>

interface IPreferences {
  toggles: ToggleOptionsType
  map: MapConfig
  uiStates?: UiStates
  theme?: ThemeConfig
  controlTables?: ControlTable
}

class UiStates {
  controlTab?: number = 0
  zoom?: IZoom
}

class ControlTable {
  [key: string]: boolean
}

export { IPreferences, UiStates }
