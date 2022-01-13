import { ViewModes } from './Enums'
import {
  IMapConfigChangeEvent,
  IMapToolbarCommandEvent,
  IMapToolbarToggleEvent,
} from './models/drawing.model'
import { Segment } from './models/segment.model'
import { IPreferences, UiStates } from './models/setting.model'
import { ITrackData, IVehicle } from './models/track.model'
import { MapDataService } from './serivces/MapData.service'
import { MapStatesService } from './serivces/MapStates.service'

interface IOmsTrackMonitor {
  construct: (
    mode: ViewModes, // NOTE default ViewModes.minimal
    track_svg_id: string,
    minimap_svg_id: string,
    dataSvc: MapDataService,
    stateSvc: MapStatesService
  ) => void
  adjust_floaters: () => void
  applyAfterSnapshotUpdated: (updatedPropList?: {
    [id: number]: any
  }) => void
  applyUpdatedExpectedPath: () => void
  create_track: (data: ITrackData) => void
  destroy: () => void
  get_selected_objects: (object_type?: string) => any[]
  getUiStates: () => UiStates
  hasShownLayoutObjects: (objectType: string, objectId: number) => boolean
  highlight: (
    object_type: any,
    object_id: any,
    object_css: any,
    group_type: string,
    highlight_type: string,
    operation_type?: string
  ) => void
  init_selection: (is_clear_sel_objects: boolean) => void
  onChangeConfig: (event: IMapConfigChangeEvent) => void
  onChangeVisibility: (event: IMapToolbarToggleEvent) => void
  onCommandAction: (event: IMapToolbarCommandEvent) => void
  setUiStates: (zoomInUiStates: UiStates) => void
  setup: (
    preferences: IPreferences,
    can_manage_orders?: boolean,
    can_manage_vehicles?: boolean,
    can_modify_display_settings?: boolean
  ) => void
  update_buffers: (
    update_list: any[],
    is_apply_history: boolean,
    is_apply_revert: boolean
  ) => void
  update_clusters: (
    update_list: any[],
    is_apply_history: boolean,
    is_apply_revert: boolean
  ) => void
  update_disable_segment: (
    data: any[],
    operation: string,
    disabled_segment_id: number,
    is_skip_rendering?: boolean // NOTE default false
  ) => void
  update_groups: (
    update_list: any[],
    is_apply_history: boolean,
    is_apply_revert: boolean
  ) => void
  update_mtls: (
    update_list: any[],
    is_apply_history: boolean,
    is_apply_revert: boolean
  ) => void
  update_segment_svg: (
    data: Segment[], // FIXME input1) Segment[]
    dom_css: any, // NOTE not using in function
    excluded_segments: null | any[] | any | boolean,
    is_path_change?: boolean
  ) => void
  update_segments: (
    update_list: any[],
    is_apply_history: boolean,
    is_apply_revert: boolean
  ) => void
  update_stations: (
    update_list: any[],
    is_apply_history: boolean,
    is_apply_revert: boolean
  ) => void
  update_vehicles: (
    raw_data: IVehicle[],
    operation: "INSERT" | "UPDATE" | "DELETE",
    vehicleId: number,
    is_skip_rendering: boolean
  ) => { [id: number]: any }
}

export { IOmsTrackMonitor }
