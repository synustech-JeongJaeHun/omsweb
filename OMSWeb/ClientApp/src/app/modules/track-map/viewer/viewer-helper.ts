import * as d3 from 'd3';
import * as _ from 'lodash';
import * as $ from 'jquery';

import { LayoutUtil } from '@oms/shared/utils/layout.util';
import { ColorPalette } from '@oms/shared/utils/color-palette';
import { CommonUtil } from '@oms/shared/utils/common.util';
import { getCss, main_css, setCssValue } from '@oms/shared/utils/css-loader';
import { setting } from '../../../../settings';

import { Dto } from '@oms/models/dto/track.model';
import {
  ICoordinate,
  IMapGeometry,
  IMapSize,
  IMapToolbarCommandEvent,
  IMapToolbarToggleEvent,
  IZoom,
  IZoomInfos,
} from '../../../models/drawing.model';
import {
  ToggleOptionKeyType,
  MapTypes,
  ViewModes,
} from '../../../models/enums';
import { rgb } from 'd3';
import { MapParser } from './map-parser';
import { IViewerData } from '../../../models/map.interface';
import { Segment } from '../../../models/segment.model';
import { Vehicle } from '../../../models/vehicle.model';
import { Station } from '../../../models/station.model';
import { Buffer } from '../../../models/buffer.model';
import { MTL } from '../../../models/mtl.model';
import { Point } from '../../../models/point.model';
import { MapStatesService } from '../map-states.service';
import { MapDataService } from '../map-data.service';
import { IPreferences } from '../../../models/settings.model';
export class ViewController {
  //#region properties
  private svg: any; // d3.Selection<d3.ContainerElement, unknown, HTMLElement, any>;
  private d3_track: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;
  private parser: MapParser;
  private $track_container = null;
  private preferences: IPreferences;

  // modifier key codes
  private KEY_SHIFT = 16;
  private KEY_ALT = 18;

  // logical mapping of modifier keys
  private KEY_NO_S2G = this.KEY_SHIFT; // no snap-to-grid
  private KEY_OVERLAP = this.KEY_ALT; // show overlapping items
  private KEY_EXTSEL = this.KEY_SHIFT; // extend selection

  // constant bounds for various parameters
  private DIRECTION_ARROW_SCALE_MIN = 2;
  private DIRECTION_ARROW_SCALE_MAX = 13;
  private LOCATION_SCALE_MIN = 10;
  private LOCATION_SCALE_MAX = 75;
  private VEHICLE_SCALE_MIN = 3;
  private VEHICLE_SCALE_MAX = 20;
  private ROTATION_MIN = 0;
  private ROTATION_MAX = 360;
  private STALE_MIN = 10;
  private STALE_MAX = 6000;
  private MINIMUM_SEGMENT_LENGTH_MIN = 100; // mm
  private MINIMUM_SEGMENT_LENGTH_MAX = 1000; // mm
  private CANVAS_MIN_X = 0;
  private CANVAS_MIN_Y = 0;
  private CANVAS_MAX_X = 100000;
  private CANVAS_MAX_Y = 100000;
  private DIMENSION_MIN = 1000; // minimum width/height
  private DIMENSION_MAX = 100000; // maximum width/height

  private MIN_ANIMATE_DISTANCE = 5;

  // layout options, default values specified in the default.js settings file
  private option: any = {
    max_zoom: 1,
    zoom_levels: {
      // units defined in millimeters
      lvl1: 10000,
      lvl2: 800,
      lvl3: 500,
    },
    selective_lvl_display: {
      direction: 2,
      point_circle: 2,
      point_label: 3,
      segment_path: 1,
      station_min: 1,
      station_sim: 2,
      station_det: 3,
      buffer_min: 1,
      buffer_sim: 2,
      buffer_det: 3,
      mtl_min: 1,
      mtl_sim: 2,
      mtl_det: 3,
      vehicle: 1,
    },
  };
  private DEFAULTS: any;
  private is_permitted: any = {};
  private disallowed_toolbar_buttons = [];
  //
  // private show_point_labels = false;
  // private show_direction_arrows = true;
  // private show_stations = true;
  // private show_buffers = true;
  // private show_mtls = true;
  // private show_groups = true;
  // private show_clusters = true;
  // private show_vehicles = true;
  // private show_vehicle_lines = false;
  // private show_expected_path = false;
  // private show_minimap = false;
  // private show_tables = false;
  private direction_arrow_scale = {
    min: this.DIRECTION_ARROW_SCALE_MIN,
    max: this.DIRECTION_ARROW_SCALE_MAX,
    scale: 1,
    value: 5,
  };
  private location_scale = {
    min: this.LOCATION_SCALE_MIN,
    max: this.LOCATION_SCALE_MAX,
    scale: 1,
    value: 30,
  };
  private vehicle_scale = {
    min: this.VEHICLE_SCALE_MIN,
    max: this.VEHICLE_SCALE_MAX,
    scale: 1,
    value: 8,
  };
  private map_rotation = 0;
  private snap_to_grid_distance = 500;
  private minimum_segment_length = 500;
  private minimap_size_limit = 150;
  private num_ticks = 20;
  private vehicle_stale = 600;
  private speed_straight = 3600;
  private speed_curve = 800;
  private scale_offset_x = 50;
  private scale_offset_y = 50;
  private hover_tag_offset_x = 20;
  private hover_tag_offset_y = 40;

  private SEGMENT_SPEEDS = {
    straight: this.speed_straight,
    curve: this.speed_curve,
  };

  // DOM identifiers
  private DEFAULT_TRACK_CONTAINER_PARENT_ID = 'page_content';
  private DEFAULT_TRACK_CONTAINER_ID = 'track-container';
  private minimap_rect_id = 'minimap-rect';
  private minimap_parent_id = 'minimap-container';
  private track_container_id = 'track-container';

  // the state prefix is prepended to any UI state labels
  private state_prefix;

  // true when there are modifications to the map
  private map_has_changes = false;

  // Layout related data
  // private vehicles = [];
  // private layout_data: IViewerData = {};
  private minimap_data: any = {};
  // private stale_vehicles = []; // array of id  @TODO move to data service

  // Size
  private geometry: IMapGeometry = {};

  // Zoom, dimension
  private zoom_step: any = {};
  private d3_main: any; //d3.ZoomBehavior<Element, unknown>;
  private d3_minimap;
  private d3_detail_panel: any = {};
  private d3_floating_module: any = {};
  private zoom: IZoomInfos = {};
  private viewbox: any = {};
  private rotated_viewbox = [];

  // Tracker Variable =============================//
  private vehicle_tracking = {
    status: false,
    id: 0,
  };

  // Interaction
  private selected_objects = [];
  private currently_hovering_object: any = {};
  private search_candidate_objects = [];
  private copied_objects = [];

  // MINIMAL
  // POINT, SEGMENT, STATION, BUFFER, SELECT, COPY, PASTE, MOVE, DELETE
  private tool_type: any = null;
  private editing: any = null;

  private is_sticky_mode: boolean = false;
  private modifier_key: any = null;
  private drag_move: any = {};
  private drag_coord: any = {};
  private history_stack = [];
  private history_buffer = [];

  // SVG Variables ==============================//
  private grid_x;
  private grid_y;
  private d3_x;
  private d3_y;
  private d3_axis_x;
  private d3_axis_y;
  private canvas_group;
  private center_group;
  private center_svg_x;
  private center_svg_y;
  private center_svg_text;
  private scale_svg_group;
  private scale_svg;
  private scale_tick;
  private scale_value;
  private geometric_container;
  private semantic_container;
  private minimap_svg;
  private minimap_rect;
  private minimap_path_svg;
  private clusters_svg;
  private points_svg;
  private segments_svg;
  private directions_svg;
  private stations_svg;
  private stations_path;
  private buffers_svg;
  private buffers_path;
  private mtls_svg;
  private mtls_path;
  private vehicle_svg;
  private expected_path_svg;

  // Editing
  private selection_svg;
  private selection_box_svg;
  private segment_draw_svg;

  // Overlap - close up
  private overlap_display_svg;
  private overlap_display_panel_svg;

  // Detail - overlap
  private overlap_module_panel_svg;
  private overlap_module_svg;
  private overlap_module_scroll_bar;

  // Uninitialized Vehicles - overlap
  private unassigned_module_panel_svg;
  private unassigned_module_svg;
  private unassigned_module_scroll_bar;

  // Expected Path Variables ======================//
  private expected_paths = [];

  // Overlap Display Variables ======================//
  private overlap_display_objects = [];

  // Overlap Module Variables ======================//
  private overlap_module_objects = [];
  private unassigned_module_objects = [];

  // Window Resize Variable ===================//
  private resize_time_out_id;

  private drag: d3.DragBehavior<Element, unknown, unknown>;

  playback_last_event_time: any;
  //#endregion

  get layoutData(): IViewerData {
    return this.layout_data;
  }

  get searchDataSource(): IViewerData {
    return { ...this.layout_data, vehicles: this.vehicles };
  }

  private get vehicles(): Vehicle[] {
    return this.layout_data.vehicles;
  }

  private get layout_data(): IViewerData {
    return this.dataSvc.data;
  }

  constructor(
    private mode: ViewModes = ViewModes.minimal,
    private track_id: string,
    private minimap_svg_id: string,
    private dataSvc: MapDataService,
    private statesSvc: MapStatesService
  ) {
    this.DEFAULTS = this.get_defaults();
    this.parser = new MapParser(this.layout_data);
    this.$track_container = $(`#${this.track_container_id}`);
    this.initialize();
  }
  private initialize() {
    // @NOTE initSvg()에서 수행
    // this.svg = d3
    //   .select(`#${this.track_id}`)
    //   .attr('width', '100%')
    //   .attr('height', '100%');

    //#region  drag
    this.drag = d3
      .drag()
      .on('drag', () => {
        // move objects move()
        if (this.tool_type === 'MOVE' && this.selected_objects.length > 0) {
          let current_zoom = this.getZoom(MapTypes.MAIN);
          let actual_delta: any = {};

          this.selection_filter(['STATION', 'BUFFER', 'MTL', 'SEGMENT'], null);

          if (
            this.get_selected_objects('SEGMENT').length > 0 &&
            this.get_dom('SEGMENT').select('#temp_segment').node() === null
          ) {
            // Copy the selected segments and add clone to dom for move op
            this.add_temporary_segment_move_dom();

            // Remove selected segment from current segment svg element
            this.update_segment_svg(
              this.get_layout_objects('SEGMENT'),
              main_css.general,
              this.selected_objects
            );
          }

          // Store current mouse coord
          this.drag_move.mouse_current = d3.mouse(this.svg.node());

          actual_delta.x = Math.trunc(
            (this.drag_move.mouse_current[0] - this.drag_move.mouse_start[0]) /
              current_zoom.k
          );
          actual_delta.y = Math.trunc(
            (this.drag_move.mouse_current[1] - this.drag_move.mouse_start[1]) /
              current_zoom.k
          );

          // Move screen coords
          let segments_to_move = [];
          for (let i = 0; i < this.selected_objects.length; i++) {
            if (
              this.selected_objects[i].constructor.name.toUpperCase() ===
              'SEGMENT'
            ) {
              segments_to_move.push(this.selected_objects[i]);
              this.move_dom(
                'SEGMENT_DIRECTION',
                [this.selected_objects[i]],
                actual_delta
              );
            } else {
              this.move_dom(
                this.selected_objects[i].constructor.name.toUpperCase(),
                [this.selected_objects[i]],
                actual_delta
              );
            }
          }

          if (segments_to_move.length > 0) {
            this.move_dom('SEGMENT', segments_to_move, actual_delta);
          }

          if (
            this.selection_box_svg &&
            this.selection_box_svg.initial_bounding_box
          ) {
            let current_bounding_box = {
              min: {
                x:
                  this.selection_box_svg.initial_bounding_box.min.x +
                  actual_delta.x,
                y:
                  this.selection_box_svg.initial_bounding_box.min.y +
                  actual_delta.y,
              },
              max: {
                x:
                  this.selection_box_svg.initial_bounding_box.max.x +
                  actual_delta.x,
                y:
                  this.selection_box_svg.initial_bounding_box.max.y +
                  actual_delta.y,
              },
            };
            this.update_selection_box(current_bounding_box);
          }

          if (this.modifier_key === this.KEY_NO_S2G) {
            let mouse_coord = {
              x: this.drag_move.mouse_current[0],
              y: this.drag_move.mouse_current[1],
            };

            let current_coord = this.calc_original_coord_with_screen(
              this.drag_move.mouse_current,
              this.geometry.invert_factor_y
            );

            let custom_text = `${parseInt(current_coord.x)}, ${parseInt(
              current_coord.y
            )}`;
            this.show_hover_tag(null, null, custom_text, mouse_coord);
          } else {
            this.hide_hover_tag();
          }
        }
      })
      .on('start', () => {
        // Start move by pressing on mouse key
        if (this.tool_type === 'MOVE' && this.selected_objects.length > 0) {
          // Store initial coord
          this.drag_move.mouse_start = d3.mouse(this.svg.node());
        }
      })
      .on('end', () => {
        // End move by letting go of mouse key
        if (this.tool_type === 'MOVE' && this.selected_objects.length > 0) {
          let original_delta: any = {};

          // Store final coord
          this.drag_move.mouse_end = d3.mouse(this.svg.node());

          // Only update if the start and end coordinated are different
          if (
            this.drag_move.mouse_end[0] !== this.drag_move.mouse_start[0] ||
            this.drag_move.mouse_end[1] !== this.drag_move.mouse_start[1]
          ) {
            // Get original coord that applied snap
            let original_coord_start = this.calc_original_coord_with_screen(
              this.drag_move.mouse_start,
              this.geometry.invert_factor_y,
              false
            );
            let original_coord_end = this.calc_original_coord_with_screen(
              this.drag_move.mouse_end,
              this.geometry.invert_factor_y,
              false
            );

            original_delta.x = original_coord_end.x - original_coord_start.x;
            original_delta.y = original_coord_end.y - original_coord_start.y;

            let bounding_box = LayoutUtil.find_max_and_min_of_objects(
              this.selected_objects,
              'ORIGINAL'
            );

            let offset;
            if (this.modifier_key === this.KEY_NO_S2G) {
              offset = {
                x: Math.round(original_delta.x),
                y: Math.round(original_delta.y),
              };
            } else {
              offset = this.find_snap(
                bounding_box.min,
                bounding_box.max,
                original_delta
              );
            }

            let updated_objects = this.make_move_update_list(offset);

            // Apply Update
            if (updated_objects.length > 0) {
              this.update_layout_object(updated_objects, true, false);
            }

            // Adjust fab size if fab size changed
            if (this.mode === 'EDITOR') {
              this.adjust_fab_size(
                LayoutUtil.find_max_and_min_of_objects(
                  this.layout_data.points.concat(
                    this.layout_data.segments as any[]
                  ),
                  'INVERTED'
                )
              );
            }

            // Replace selected objects with updated one
            for (let i = updated_objects.length - 1; i > -1; i--) {
              let updated_object = updated_objects[i];
              let is_found = false;
              this.selected_objects.forEach((cur_selected_object) => {
                if (
                  updated_object.id === cur_selected_object.id &&
                  updated_object.constructor.name ===
                    cur_selected_object.constructor.name
                ) {
                  is_found = true;
                }
              });
              if (!is_found) {
                updated_objects.splice(i, 1);
              }
            }

            this.selected_objects = updated_objects;

            if (
              this.selection_box_svg &&
              this.selection_box_svg.initial_bounding_box
            ) {
              let bounding_box = LayoutUtil.find_max_and_min_of_objects(
                this.selected_objects,
                'INVERTED'
              );
              this.selection_box_svg.initial_bounding_box = bounding_box;
              this.update_selection_box(bounding_box);
            }

            // set drag to empty object since move is over
            this.drag_move = {};
          } else {
            // Remove selected segment from current segment svg element
            this.update_segment_svg(
              this.get_layout_objects('SEGMENT'),
              main_css.general,
              []
            );
          }

          // Remove temporary segment move dom
          if (this.d3_track.select('#temp_segment').node() !== null) {
            let dom = this.get_dom('SEGMENT', null, 'LAYOUT');
            dom.select('#temp_segment').remove();
            dom.selectAll('.hover, .select').attr('transform', '');
          }
        }
      });
    //#endregion
  }
  setup(
    preferences: IPreferences,
    can_manage_orders?,
    can_manage_vehicles?,
    can_modify_display_settings?
  ) {
    // @TODO prefix 설정 : 현재는 고정값 'public.largemap', 설정값을 외부에서 넘겨 받기로 하면 필요 없을 수 있음
    this.state_prefix = 'public.largemap';

    if (can_manage_orders) this.is_permitted.manage_orders = true;
    if (can_manage_vehicles) this.is_permitted.manage_vehicles = true;
    if (can_modify_display_settings)
      this.is_permitted.modify_display_settings = true;

    this.preferences = preferences;

    this.d3_track = d3.select(`#${this.track_container_id}`);

    this.initVariables();
    this.initStates();
  }
  destroy() {}
  create_track(data: Dto.ITrackData) {
    if (!data) data = {};
    if (!data.map_type) data.map_type = MapTypes.DB;

    if (
      !data.size ||
      !('min_x' in data) ||
      !('max_x' in data) ||
      !('min_y' in data) ||
      !('max_y' in data)
    ) {
      if (data.points && data.points.length > 0) {
        data.size = this.calculate_size_from_extents(data);
      } else {
        data.size = this.get_default_size(data.width, data.height);
      }
    }

    // must have a minimum segment length when editing a map
    if (!data.minimum_segment_length) {
      data.minimum_segment_length = this.DEFAULTS.minimum_segment_length;
    }

    this.initSvg(this.track_id, data.size);
    this.dataSvc.setData(data, this.geometry);
    this.drawMap('layout');

    this.initMinimap();
    this.convertMinimapObjects();
    this.drawMap('minimap');
    this.centerZoom('INSTANT');
  }
  update_vehicles(raw_data, operation, vehicle_id, is_skip_rendering) {
    // let is_dom_update = false;
    let target_index;
    // let update: any = {};
    // let updated_vehicles = [];

    // get target index
    if (operation == 'DELETE' || operation == 'UPDATE') {
      target_index = this.vehicles.findIndex((d) => d.id == vehicle_id);
    }

    const {
      update,
      isDomUpdated,
      updatedVehicles,
    } = this.dataSvc.applyVehicleData(
      raw_data,
      operation,
      vehicle_id,
      this.vehicle_stale,
      this.playback_last_event_time
    );
    // @TODO moved to data service

    // // apply update
    // if (operation == 'DELETE') {
    //   if (target_index > -1) {
    //     this.layout_data.vehicles.splice(target_index, 1);
    //     is_dom_update = true;
    //   }
    // } else {
    //   // convert raw data to object
    //   updated_vehicles = this.convert_vehicle_object(raw_data);

    //   if (operation == 'INSERT') {
    //     this.layout_data.vehicles = updated_vehicles;
    //     // for (let i = 0; i < updated_vehicles.length; i++) {
    //     //   this.layout_data.vehicles.push(updated_vehicles[i]);
    //     // }

    //     is_dom_update = true;
    //   } else if (operation == 'UPDATE') {
    //     if (target_index > -1) {
    //       updated_vehicles = this.set_last_point(
    //         this.layout_data.vehicles,
    //         updated_vehicles
    //       );

    //       let old_vehicle = this.vehicles[target_index];
    //       let updated_props = {};
    //       for (let prop in updated_vehicles[0]) {
    //         if (
    //           JSON.stringify(old_vehicle[prop]) !=
    //           JSON.stringify(updated_vehicles[0][prop])
    //         ) {
    //           updated_props[prop] = true;
    //         }
    //       }

    //       // Put the update properties in to updat object with vehicle id at the key
    //       update[parseInt(updated_vehicles[0].id)] = updated_props;

    //       this.layout_data.vehicles[target_index] = updated_vehicles[0];
    //       is_dom_update = true;
    //     }
    //   }
    // }

    // update dom
    if (isDomUpdated && !is_skip_rendering) {
      let view_box = this.get_viewbox();
      let vehicles_display = this.append_showing_vehicles(view_box);

      this.update_vehicle_dom(
        vehicles_display,
        main_css.vehicle,
        null,
        'LAYOUT',
        false,
        update
      );

      // Update the selected object data if the selected is this updated vehicle
      if (this.selected_objects.length === 1) {
        if (
          this.selected_objects[0].constructor.name.toUpperCase() ===
            'VEHICLE' &&
          this.selected_objects[0].id == this.vehicles[target_index].id
        ) {
          this.selected_objects[0] = this.vehicles[target_index];
        }
      }
      this.update_changed_vehicles(updatedVehicles);
    }

    // Reorder so that the scale is above all elements.
    this.reorder_svg();

    return update;
  }
  centerZoom(transition_type: string) {
    let viewport = this.geometry.screen_size,
      size = this.geometry.track_size;

    let ratio = {
      w: viewport.width / size.width,
      h: viewport.height / size.height,
    };

    let k = ratio.w < ratio.h ? ratio.w : ratio.h; // Smaller ratio is closer to sides
    k *= 0.9;
    let translate_x = ((viewport.width / k - size.width) / 2) * k;
    let translate_y = ((viewport.height / k - size.height) / 2) * k;

    // Auto adjust min values if the map has negative coordinates
    if (size.min_x < 0) {
      // If min x value is negative
      translate_x = -size.min_x * k + translate_x;
    } else {
      translate_x = -size.min_x * k + translate_x;
    }
    if (size.min_y < 0) {
      // If min y value is negative
      translate_y = size.min_y * k + translate_y;
    } else {
      // translate_y = size.min_y * k + translate_y
    }

    this.set_transform(translate_x, translate_y, k, true, transition_type);
  }

  //#region toolbar actions
  onChangeVisibility(event: IMapToolbarToggleEvent) {
    const { type: objectType, value: visibility } = event;
    const transform = this.getZoom(MapTypes.MAIN);
    const zoomLevel = this.calculate_zoom_level();
    if (objectType in this.preferences.toggles) {
      this.preferences.toggles[objectType] = visibility;
    }
    switch (objectType) {
      case 'buffers':
        const { buffers } = this.layout_data;
        if (buffers && buffers.length) {
          this.buffer_adaptive_rendering(
            zoomLevel,
            transform,
            main_css.buffer,
            this.get_viewbox(),
            true
          );
        }
        break;
      case 'clusters':
        const { clusters } = this.layout_data;
        if (clusters && clusters.length) {
          this.cluster_adaptive_rendering(
            zoomLevel,
            transform,
            main_css.cluster,
            this.get_viewbox(),
            true
          );
        }
        break;
      case 'expectedPaths':
        this.update_expected_path_dom(
          this.get_combined_path(this.get_expected_path_segments())
        );
        break;
      case 'groups':
        this.display_group(visibility, true);
        break;
      case 'mtls':
        break;
      case 'overlaps':
        break;
      case 'pointLabels':
        const { points } = this.layout_data;
        if (points && points.length) {
          this.point_adaptive_rendering(
            zoomLevel,
            transform,
            main_css.point,
            this.get_viewbox()
          );
        }
        break;
      case 'segmentDirections':
        const { segments } = this.layout_data;
        if (segments && segments.length > 0) {
          this.directions_adaptive_rendering(
            zoomLevel,
            transform,
            main_css.segment,
            this.get_viewbox(),
            true
          );
        }
        break;
      case 'stations':
        const { stations } = this.layout_data;
        if (stations && stations.length > 0) {
          this.station_adaptive_rendering(
            zoomLevel,
            transform,
            main_css.station,
            this.get_viewbox(),
            true
          );
        }
        break;
      case 'vehicleLines':
        const { vehicles } = this;
        if (vehicles && vehicles.length) {
          this.vehicle_svg.each((d) => {
            let d3_this = d3.select(`#id_${d.id}.vehicle`);
            let selected_vehicle = this.get_selected_objects('VEHICLE')[0];
            let is_show_vehicle_line =
              (selected_vehicle && selected_vehicle.id === d.id) ||
              this.get_show_vehicle_lines()
                ? true
                : false;
            this.render_vehicle_line(d3_this, d, is_show_vehicle_line);
          });
        }
        break;
      case 'vehicles':
        break;
      default:
        break;
    }
  }
  onCommandAction(event: IMapToolbarCommandEvent) {
    switch (event.type) {
      case 'centerZoom':
        this.centerZoom('SMOOTH');
        break;
      case 'search':
        const { type, value } = event.value;
        this.search(type, value);
        break;
      case 'trackVehicle':
        const id = event.value;
        this.trackVehicle(id);
        break;
      default:
        break;
    }
  }
  //#endregion

  get_defaults() {
    // start with known sane values for all of the options we use
    let defaults = {
      show_tables: false,
      show_minimap: false,
      show_point_labels: false,
      show_direction_arrows: true,
      show_segments: true,
      show_stations: true,
      show_buffers: true,
      show_mtls: true,
      show_groups: true,
      show_clusters: true,
      show_vehicles: true,
      show_vehicle_lines: false,
      show_expected_path: false,
      vehicle_scale: 8,
      location_scale: 30,
      direction_arrow_scale: 5,
      map_rotation: 0,
      snap_to_grid_distance: 500, // mm
      minimum_segment_length: 500, // mm
      minimap_size_limit: 150,
      num_ticks: 20,
      vehicle_stale: 600, // sec
      speed_straight: 3600, // m/s
      speed_curve: 800, // m/s
      scale_offset_x: 50,
      scale_offset_y: 50,
      hover_tag_offset_x: 20,
      hover_tag_offset_y: 20,
      canvas_width: 100000,
      canvas_height: 100000,
    };
    // override with anything specified in the site defaults file
    if (setting && setting.map) {
      for (let label in defaults) {
        if (label in setting.map) {
          defaults[label] = setting.map[label];
        }
      }
    }
    return defaults;
  }

  private initVariables() {
    this.map_has_changes = false;
    // this.vehicles = [];
    this.expected_paths = [];
    // this.layout_data = {};
    this.minimap_data = {};
    this.geometry = {};
    this.zoom_step = {};
    this.d3_main = null;
    this.d3_minimap = null;
    this.d3_detail_panel = {};
    this.d3_floating_module = {};
    this.zoom = {};
    this.selected_objects = [];
    this.currently_hovering_object = {};
    this.search_candidate_objects = [];
    this.copied_objects = [];
    this.vehicle_tracking = {
      status: false,
      id: 0,
    };

    this.tool_type = null;
    this.editing = null;
    this.is_sticky_mode = false;
    this.modifier_key = null;
    this.drag_move = {};
    this.drag_coord = {};
    this.history_stack = [];
    this.history_buffer = [];

    this.overlap_display_objects = [];
    this.overlap_module_objects = [];
    this.unassigned_module_objects = [];
  }

  private initStates() {
    // @TODO initStates 구현 (v1 : get_ui_states)
  }

  private initSvg(target_id: string, mapSize: IMapSize) {
    target_id && (this.track_id = target_id);

    // get the size of the DOM element into which this is going
    // @NOTE : jquery 사용하여 size 설정
    let $elem = this.$track_container.find(`#${target_id}`).parent().get(0);
    let screen_size = {
      width: $elem.clientWidth,
      height: $elem.clientHeight,
    };

    this.setGeometry(mapSize, screen_size);

    // init svg groups
    this.init_svg_groups();

    /** set_param + set_initial_zoom */
    this.setInitialZoom(MapTypes.MAIN);

    let length: ICoordinate, lower_limit: ICoordinate, upper_limit: ICoordinate;

    const { width, height } = this.geometry.screen_size;

    if (this.mode === ViewModes.editor) {
      length = { x: width, y: height };
      lower_limit = { x: 0, y: 0 };
      upper_limit = { x: width, y: height };
    } else {
      const _len = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
      length = { x: _len, y: _len };

      lower_limit = {
        x: (width - length.x) / 2,
        y: (height - length.y) / 2,
      };
      upper_limit = {
        x: width - lower_limit.x,
        y: height - lower_limit.y,
      };
    }
    // init d3
    this.d3_main = d3
      .zoom()
      .scaleExtent([0, this.zoom.max])
      .on('zoom', this.zoomed.bind(this));
    // .on('zoom', this.zoomed);

    this.d3_x = d3
      .scaleLinear()
      .domain([lower_limit.x, upper_limit.x])
      .range([lower_limit.x, upper_limit.x]);
    this.d3_y = d3
      .scaleLinear()
      .domain([lower_limit.y, upper_limit.y])
      .range([lower_limit.y, upper_limit.y]);

    this.d3_axis_x = d3
      .axisBottom(this.d3_x)
      .ticks((upper_limit.x / upper_limit.y) * this.num_ticks)
      .tickSize(length.y)
      .tickPadding(8 - height);
    this.d3_axis_y = d3
      .axisRight(this.d3_y)
      .ticks(this.num_ticks)
      .tickSize(length.x)
      .tickPadding(-20);

    // Initialize svg: view-box element
    // @NOTE svg 초기화
    this.svg = this.d3_track.select(`#${target_id}`);
    this.svg
      .attr('width', this.geometry.screen_size.width)
      .attr('height', this.geometry.screen_size.height);

    this.svg.call(this.d3_main);

    if (!this.geometric_container) {
      this.geometric_container = this.svg
        .append('g')
        .attr('id', 'geometric_zoom');
      this.geometric_container.append('g').attr('class', 'grid_group');
      this.geometric_container
        .append('g')
        .attr('class', 'cluster_group')
        .attr('group_type', 'cluster');
      this.geometric_container
        .append('g')
        .attr('class', 'segment_group')
        .attr('group_type', 'segment');

      if (this.mode === ViewModes.editor) {
        this.geometric_container.append('g').attr('class', 'selected_group');
        this.geometric_container.append('g').attr('class', 'selection_group');
        this.geometric_container
          .append('g')
          .attr('class', 'segment_draw_group');
      }
    }

    if (this.mode === ViewModes.editor) {
      // @TODO draw_editor_attributes()
      // draw_editor_attributes()
      // css_root.css('--grid-text-color', main_css.grid.text_color_show)
      // css_root.css('--grid-domain-display', 'display')
      setCssValue('--grid-text-color', main_css.grid.text_color_show);
      setCssValue('--grid-domain-display', 'display');
    } else {
      // css_root.css('--grid-text-color', main_css.grid.text_color_hide);
      // css_root.css('--grid-domain-display', 'none');
      // @TODO 아래 코드 검증 (update root style variable)
      setCssValue('--grid-text-color', main_css.grid.text_color_hide);
      setCssValue('--grid-domain-display', 'none');
    }

    if (!this.semantic_container) {
      this.semantic_container = this.svg
        .append('g')
        .attr('id', 'semantic_zoom');
      this.semantic_container
        .append('g')
        .attr('class', 'direction_group')
        .attr('group_type', 'direction');
      this.semantic_container
        .append('g')
        .attr('class', 'point_group')
        .attr('group_type', 'point');
      this.semantic_container
        .append('g')
        .attr('class', 'station_group')
        .attr('group_type', 'station');
      this.semantic_container
        .append('g')
        .attr('class', 'buffer_group')
        .attr('group_type', 'buffer');
      this.semantic_container
        .append('g')
        .attr('class', 'mtl_group')
        .attr('group_type', 'mtl');
      this.semantic_container
        .append('g')
        .attr('class', 'vehicle_group')
        .attr('group_type', 'vehicle');
      this.semantic_container.append('g').attr('class', 'scale_group');
    }

    this.d3_main.zoomIdentity = d3.zoomIdentity;

    this.init_hover_tag(target_id);
    this.initEvents();
  }

  private drawMap(track_type: 'layout' | 'minimap') {
    if (track_type == 'layout') {
      // Draw all the layout components
      // Initialize track_size
      this.calc_and_set_track_size();

      // Initialize all svg containers for hierarchy
      // initialize grid svg
      this.grid_draw();

      // initialize scale svg
      this.scale_draw();

      // Draw non adaptive rendering
      let current_zoom = this.getZoom(MapTypes.MAIN);

      if (this.layout_data.segments.length > 0) {
        // Define segment direction
        main_css.segment.direction_path = this.layout_data.segments[0].get_arrow_path(
          main_css.segment.direction_width,
          main_css.segment.direction_length
        );
        this.update_segment_svg(
          this.layout_data.segments,
          main_css.segment,
          null,
          true
        );
      }

      // Display adaptive rendering through zoom
      this.set_transform(
        current_zoom.x,
        current_zoom.y,
        current_zoom.k,
        true,
        'INSTANT'
      );

      // Gets rid of calculation error grid diagonal lines
      this.grid_x.selectAll('.tick line').attr('x2', 0);
      this.grid_y.selectAll('.tick line').attr('y2', 0);

      // Attach Window resize handler
      this.init_resize_event();
    }

    if (track_type === 'minimap') {
      // Initialize minimap
      this.minimap_draw();
    }
  }

  private search(type: string, id: string) {
    type = type.toUpperCase();
    const objId = parseInt(id);
    const target = this.find_layout_object(type, objId);
    if (!target) return;

    this.init_selection(true);
    this.zoom_to_objects(target);
    this.set_selected_objects([target], false, true);
    this.highlight(type, objId, main_css[type.toLowerCase()], null, 'SELECT');
  }
  private trackVehicle(vehicleId: number) {
    console.info('### start tracking... >>', vehicleId);
    const vehicle = this.vehicles.find((x) => x.id === vehicleId);
    if (!vehicle) return;

    this.unhighlight(null, null);
    this.set_selected_objects(vehicle, false, true);

    // @TODO side panel 관련 동작 구현
    // if ($('#side_panel').length > 0) {
    //   dlg_track.display_side_panel_popup('VEHICLE', vehicle);
    // }
    this.highlight('VEHICLE', vehicle.id, main_css.vehicle, null, 'SELECT');
    let coord = [
      vehicle.cur_point.inverted_coord.x,
      vehicle.cur_point.inverted_coord.y,
    ];
    this.zoom_to(coord, 'track', null);
    this.set_track_vehicle(vehicle.id);
    this.start_tracking();
  }
  set_track_vehicle(id: number) {
    this.vehicle_tracking.id = id;
  }
  private zoom_to_objects(objects: any, padding_percentage?: number) {
    // Calculate the initial zoom location for tracking
    let coord,
      zoom_k = null;

    let bounding_box = LayoutUtil.find_max_and_min_of_objects(
      objects,
      'INVERTED'
    );
    let parameters = this.calculate_zoom_to_fit_parameters(
      bounding_box,
      padding_percentage
    );
    coord = parameters.coord;
    zoom_k = parameters.zoom_k;

    // Call zoom_to from Layout Module with 'track' type to track vehicle
    this.zoom_to(coord, null, zoom_k);
  }
  calculate_zoom_to_fit_parameters(
    bounding_box: { max: { x: any; y: any }; min: { x: any; y: any } },
    padding_percentage: number
  ) {
    // Calculate the dimensional values
    let coord,
      from = bounding_box.min,
      to = bounding_box.max;

    let larger_x = from.x > to.x ? from.x : to.x,
      small_x = from.x < to.x ? from.x : to.x,
      larger_y = from.y > to.y ? from.y : to.y,
      small_y = from.y < to.y ? from.y : to.y,
      bounding_box_dimensions = {
        width: Math.abs(from.x - to.x),
        height: Math.abs(from.y - to.y),
      },
      screen = {
        width: this.geometry.screen_size.width,
        height: this.geometry.screen_size.height,
      },
      width_ratio = screen.width / bounding_box_dimensions.width,
      height_ratio = screen.height / bounding_box_dimensions.height,
      scale = width_ratio < height_ratio ? width_ratio : height_ratio,
      zoom_limit = this.getZoom(MapTypes.MIN_MAX).max;

    // Set values for transform
    coord = [(larger_x + small_x) / 2, (larger_y + small_y) / 2];
    let zoom_k = padding_percentage ? scale * padding_percentage : scale * 0.9;
    zoom_k = zoom_limit > zoom_k ? zoom_k : zoom_limit;
    return {
      coord,
      zoom_k,
    };
  }

  reorder_svg() {
    this.d3_track.select('.scale_group').raise();
  }
  update_changed_vehicles(update_list: any[]) {
    update_list.forEach((updated_vehicle) => {
      // Animate the updated vehicles

      if (this.overlap_display_objects.length > 1) {
        // is enabled
        this.update_overlap_display_objects(
          updated_vehicle,
          this.overlap_display_objects,
          'OVERLAP'
        );
      } else if (this.overlap_display_objects.length === 1) {
        // if hovering over an overlap elligible object
        this.check_overlap_and_display(
          this.overlap_display_objects[0].constructor.name.toUpperCase(),
          this.overlap_display_objects[0].id,
          this.overlap_display_objects,
          'OVERLAP'
        );
      }

      // Unassigned Module ===================+==================//
      let unassigned_module_showing = this.$track_container.find(
        '#unassigned_module_panel_svg'
      ).length;

      if (
        unassigned_module_showing &&
        this.unassigned_module_objects.length >= 0
      ) {
        // is enabled
        this.update_overlap_display_objects(
          updated_vehicle,
          this.unassigned_module_objects,
          'UNASSIGNED_MODULE'
        );
      }

      // Collocate Module =====================================//
      let collocate_module_showing =
        this.$track_container.find('#overlap_module_panel_svg').length > 0 &&
        this.$track_container.find('#collocate_header').hasClass('active')
          ? true
          : false;

      if (collocate_module_showing && this.overlap_module_objects.length >= 1) {
        // is enabled
        let selected_obj = this.selected_objects[0];
        if (
          (updated_vehicle.is_moved &&
            selected_obj &&
            updated_vehicle.cur_point &&
            (updated_vehicle.cur_point.point ===
              (selected_obj.cur_point
                ? selected_obj.cur_point.point
                : selected_obj.point_id
                ? selected_obj.point_id
                : selected_obj.id) ||
              (updated_vehicle.last_point &&
                updated_vehicle.last_point.point ===
                  (selected_obj.cur_point
                    ? selected_obj.cur_point.point
                    : selected_obj.point_id
                    ? selected_obj.point_id
                    : selected_obj.id)))) ||
          updated_vehicle.cur_point == null ||
          updated_vehicle.last_point == undefined
        ) {
          this.update_overlap_display_objects(
            updated_vehicle,
            this.overlap_module_objects,
            'OVERLAP_MODULE'
          );
        }
      } else if (
        this.overlap_module_objects.length >= 0 &&
        collocate_module_showing
      ) {
        // if clicked on an overlap elligible object
        if (
          this.selected_objects.length > 0 &&
          this.selected_objects[0].constructor.name.toUpperCase() ===
            'VEHICLE' &&
          updated_vehicle.id === this.selected_objects[0].id
        ) {
          this.selected_objects[0] = updated_vehicle;
          this.check_overlap_and_display(
            this.selected_objects[0].constructor.name.toUpperCase(),
            this.selected_objects[0].id,
            this.overlap_module_objects,
            'OVERLAP_MODULE'
          );
        }
      }
    });
  }
  update_overlap_display_objects(
    vehicle: any,
    overlap_list: any[],
    overlap_type: string
  ) {
    let is_operation_for_selected_vehicle =
        this.selected_objects.length > 0 &&
        this.selected_objects[0].constructor.name.toUpperCase() === 'VEHICLE' &&
        this.selected_objects[0].id === vehicle.id &&
        overlap_type === 'OVERLAP_MODULE'
          ? true
          : false,
      point_of_interest = overlap_list[0] ? overlap_list[0] : undefined,
      type_at_point = point_of_interest
        ? point_of_interest.constructor.name.toUpperCase()
        : undefined;

    // Remove exiting overlap ===========================================//

    // Check if the updating vehicle is a selected vehicle
    if (is_operation_for_selected_vehicle) {
      for (let i = overlap_list.length - 1; i > -1; i--) {
        if (
          overlap_list[i].constructor.name.toUpperCase() === 'VEHICLE' &&
          overlap_list[i].id === vehicle.id
        ) {
          overlap_list[i] = vehicle;
          this.update_overlap_module_panel(
            'DELETE',
            'VEHICLE',
            overlap_list[i],
            overlap_type
          );
          continue;
        } else {
          this.update_overlap_module_panel(
            'DELETE',
            overlap_list[i].constructor.name.toUpperCase(),
            overlap_list[i],
            overlap_type
          );
          overlap_list.splice(i, 1);
        }
      }
    } else {
      // Check if already in overlap_display_objects
      for (let i = 0; i < overlap_list.length; i++) {
        // Check current vehicle exists
        if (
          overlap_list[i].constructor.name.toUpperCase() === 'VEHICLE' &&
          overlap_list[i].id === vehicle.id
        ) {
          // is same object

          // Check to make sure the vehicle left the point
          if (
            (vehicle.cur_point &&
              (vehicle.last_point === undefined ||
                vehicle.last_point == null ||
                (vehicle.cur_point &&
                  overlap_list[i].cur_point &&
                  overlap_list[i].cur_point.point ===
                    vehicle.last_point.point))) ||
            (vehicle.last_point &&
              (vehicle.cur_point === undefined || vehicle.cur_point == null))
          ) {
            // Remove object from overlap_list
            overlap_list.splice(i, 1);

            // Remove from dom
            if (overlap_type === 'OVERLAP') {
              this.update_overlap_display_panel(
                'DELETE',
                'VEHICLE',
                vehicle
                // overlap_type
              );
            } else if (
              overlap_type === 'OVERLAP_MODULE' ||
              overlap_type === 'UNASSIGNED_MODULE'
            ) {
              this.update_overlap_module_panel(
                'DELETE',
                'VEHICLE',
                vehicle,
                overlap_type
              );
            }
            // logger.log(
            //   `vehicle ${vehicle.id} left point ${
            //     vehicle.last_point ? vehicle.last_point.point : null
            //   }`
            // );
            break;
          }
        }
      }
    }

    // ADD incomming overlap ============================================//

    // Check if overlapping with other vehicles
    if (is_operation_for_selected_vehicle) {
      this.check_overlap_and_display(
        vehicle.constructor.name.toUpperCase(),
        vehicle.id,
        this.overlap_module_objects,
        'OVERLAP_MODULE'
      );
    } else {
      // Find point id of selected point for any overlap
      if (overlap_type === 'UNASSIGNED_MODULE') {
        point_of_interest = null;
      } else {
        if (type_at_point === 'VEHICLE') {
          if (point_of_interest.cur_point) {
            point_of_interest = point_of_interest.cur_point.point;
          } else {
            point_of_interest = null;
          }
        } else if (type_at_point === 'POINT') {
          point_of_interest = point_of_interest.id;
        } else if (
          type_at_point === 'STATION' ||
          type_at_point === 'BUFFER' ||
          type_at_point === 'MTL'
        ) {
          point_of_interest = point_of_interest.point_id;
        }
      }

      if (vehicle.cur_point && vehicle.cur_point.point === point_of_interest) {
        // Exist

        // Add overlapping vehicles
        if (!this.check_exist_overlap_list(vehicle, overlap_list)) {
          this.add_to_overlap_objects(vehicle, overlap_list, overlap_type);
          this.put_selected_on_top(overlap_list);

          if (overlap_type === 'OVERLAP') {
            this.update_overlap_display_panel('ADD', 'VEHICLE', vehicle);
          } else if (
            overlap_type === 'OVERLAP_MODULE' ||
            overlap_type === 'UNASSIGNED_MODULE'
          ) {
            this.update_overlap_module_panel(
              'ADD',
              'VEHICLE',
              vehicle,
              overlap_type
            );
          }

          // logger.log(
          //   `vehicle ${vehicle.id} entered point ${vehicle.cur_point.point}`
          // );
        }
      } else if (
        (vehicle.cur_point == null ||
          vehicle.cur_point == undefined ||
          vehicle.cur_point === 0) &&
        (point_of_interest == null || point_of_interest == undefined) &&
        overlap_type === 'UNASSIGNED_MODULE'
      ) {
        // UNASSIGNED box items exist, only execute when UNASSIGNED box is enabled

        if (!this.check_exist_overlap_list(vehicle, overlap_list)) {
          this.add_to_overlap_objects(vehicle, overlap_list, overlap_type);
          this.put_selected_on_top(overlap_list);
          this.update_overlap_module_panel(
            'ADD',
            'VEHICLE',
            vehicle,
            overlap_type
          );
        }
      }
    }

    // Turn off overlap if only one object is left
    if (
      this.overlap_display_objects.length === 1 &&
      overlap_type === 'OVERLAP'
    ) {
      this.hide_overlap_display('OVERLAP', this.overlap_display_objects);
    }

    // if (this.overlap_module_objects.length === 1 && overlap_type === 'OVERLAP_MODULE') {
    //     this.hide_overlap_display('OVERLAP_MODULE', this.overlap_module_objects)
    // }

    if (overlap_type === 'UNASSIGNED_MODULE') {
      this.display_no_unassigned_vehicles();
    }
  }
  display_no_unassigned_vehicles() {
    let unassigned_module = this.$track_container.find(
      '#floating_popup_message'
    )[0];
    if (this.$track_container.find('#unassigned_floating_module')[0]) {
      if (this.unassigned_module_objects.length < 1) {
        unassigned_module.classList.add('active');
      } else {
        unassigned_module.classList.remove('active');
      }
    }
  }
  // moved to data service
  // private inject_group_data(type: string, objects: any[]): any[] {
  //   let grouped_objects = [];
  //   this.layout_data.groups.forEach((group) => {
  //     grouped_objects.push({
  //       group_id: group.id,
  //       objects: group.objects[type] ? [...group.objects[type]] : [],
  //     });
  //     return;
  //   });

  //   if (objects) {
  //     for (let i = objects.length - 1; i > -1; i--) {
  //       let object = objects[i];
  //       for (let group of grouped_objects) {
  //         for (let j = group.objects.length - 1; j > -1; j--) {
  //           if (parseInt(object.id) === parseInt(group.objects[j])) {
  //             objects[i].group = group.group_id;
  //             group.objects.splice(j, 1);
  //             break; // @NOTE check : 성능을 높이기 위해서 break 했는데, group.objects에 동일한 아이디가 여러개 있는 데이터가 가능하다면 사용하면 안된다.
  //             // @NOTE optional : some, find, filter 등을 사용하는 방법도 고려(성능 우선)
  //           }
  //         }
  //       }
  //     }
  //   }

  //   return objects;
  // }

  make_move_update_list(original_delta: any) {
    // Update coord of objects by offset
    let updated_objects = [];
    let updated_points = [];
    let do_not_update_with_points = [];

    for (let i = 0; i < this.selected_objects.length; i++) {
      let object = this.selected_objects[i].copy();
      let object_type = object.constructor.name.toUpperCase();

      // Apply offset, REMEMBER : multiply -1 because delta is based on inverted coord
      object.apply_offset(original_delta, 0, this.geometry.invert_factor_y);

      if (object_type === 'POINT') {
        updated_points.push({
          id: object.id,
          status: 'UPDATE',
          object: object,
        });
      } else {
        updated_objects.push(object);
      }

      // Check if the segment object has both of its end points selected
      // This is because segments that are selected with both its points should not be updated. It is just being moved
      if (object_type === 'SEGMENT') {
        let has_point_from = false;
        let has_point_to = false;

        // Search for points
        this.selected_objects.forEach((check_object) => {
          let check_object_type = check_object.constructor.name.toUpperCase();
          if (check_object_type === 'POINT') {
            if (check_object.id === object.point_from.id) {
              has_point_from = true;
            }
            if (check_object.id === object.point_to.id) {
              has_point_to = true;
            }
          }
        });

        // if both are selected, do not update with this.update_points
        if (has_point_from && has_point_to) {
          do_not_update_with_points.push({
            id: object.id,
            object_type: object_type,
          });
        }
      }
    }

    // If there are updates due to points, overwrite them in the updated_objects
    if (updated_points.length > 0) {
      // Find all contiguous segments completed with both points
      let check_contiguous_points_list = updated_points.map((point) => {
        return point.id;
      });

      /* find all the segments that are connected to the points in case
            they were not selected but are between points that are selected
            and are selected on both from/to points of the segment*/
      let contiguous_segments = LayoutUtil.find_all_contigous_segments_from_points(
        check_contiguous_points_list,
        this.layout_data.segments
      );

      // Apply the delta coordinate difference to the contiguous segments
      contiguous_segments.forEach((contig_seg, index, original_arr) => {
        let copied_seg = contig_seg.copy(); // Copy the original to not effect the global variable for history stack

        // apply offset to found segments
        copied_seg.apply_offset(
          original_delta,
          this.snap_to_grid_distance,
          this.geometry.invert_factor_y
        );

        // set the original objects to the copy objects for proper reference
        original_arr[index] = copied_seg.copy();
      });

      // Add the segments that aren't going to be re-path-calculated to the update list because their coordinate data still needs to be updated
      contiguous_segments.forEach((con_seg) => {
        let is_found = false;
        updated_objects.forEach((cur_object) => {
          // Found
          if (
            con_seg.id === cur_object.id &&
            con_seg.constructor.name === cur_object.constructor.name
          ) {
            is_found = true;
          }
        });
        if (!is_found) {
          updated_objects.push(con_seg);
        }
      });

      // Check for duplicate in do_not_update_list and add if needed
      contiguous_segments.forEach((segment_to_check) => {
        let is_found = false;
        do_not_update_with_points.forEach((no_update_object) => {
          // Found
          if (
            no_update_object.id === segment_to_check.id &&
            no_update_object.object_type ===
              segment_to_check.constructor.name.toUpperCase()
          ) {
            is_found = true;
          }
        });
        if (!is_found) {
          do_not_update_with_points.push({
            id: segment_to_check.id,
            object_type: segment_to_check.constructor.name.toUpperCase(),
          });
        }
      });

      // Update point data and the related data connected to points
      updated_points = this.update_points(
        updated_points,
        do_not_update_with_points,
        true
      );

      // Overwrite if same objects exist
      updated_points.forEach((updated_by_point_object) => {
        let is_found = false;
        updated_objects.forEach(
          (updated_object, index, original_updated_objects_arr) => {
            if (
              updated_by_point_object.id === updated_object.id &&
              updated_by_point_object.constructor.name ===
                updated_object.constructor.name
            ) {
              is_found = true;
              // original_updated_objects_arr[index] = updated_by_point_object
            }
          }
        );
        if (!is_found) {
          updated_objects.push(updated_by_point_object);
        }
      });
    }

    return updated_objects;
  }
  update_points(
    update_list: any[],
    do_not_update_with_points_list: any[],
    is_return_update: boolean
  ): any[] {
    // List array : [{id, status, object}]
    // Find updated point

    let points_update_list = [],
      segments_update_list = [],
      stations_update_list = [],
      buffers_update_list = [],
      mtls_update_list = [];
    for (let i = 0; i < update_list.length; i++) {
      if (update_list[i].status === 'UPDATE') {
        let updated_point = update_list[i].object;

        if (updated_point !== null) {
          // Update point ----------------------
          // ReCalculate adjustmented coord
          let coords = LayoutUtil.create_coord_objects(
            updated_point.coord.x,
            updated_point.coord.y,
            this.geometry.invert_factor_y
          );
          updated_point.inverted_coord = coords.inverted_coord;

          // Add point to update list
          points_update_list.push(updated_point);

          // Update related Segment --------------

          // Find connected segments
          let connected_segments = LayoutUtil.find_connected_segment(
            updated_point,
            this.layout_data.segments,
            null
          );

          // Remove any connected segments that are in the do_not_update list
          for (let j = connected_segments.length - 1; j > -1; j--) {
            let con_seg = connected_segments[j];
            if (do_not_update_with_points_list.length > 0) {
              do_not_update_with_points_list.forEach((remove_object) => {
                if (
                  con_seg.id === remove_object.id &&
                  con_seg.constructor.name.toUpperCase() ===
                    remove_object.object_type
                ) {
                  connected_segments.splice(j, 1);
                }
              });
            }
          }

          // Update the neccessary segments
          for (let i = 0; i < connected_segments.length; i++) {
            let segment = connected_segments[i].copy();

            let all_connected_segments = LayoutUtil.find_connected_segments(
              segment.point_from.id,
              segment.point_to.id,
              this.layout_data.segments,
              'ARRAY',
              true
            ) as any[];

            // Check if the segment is already in segments_update_list
            let segment_in_list = segments_update_list.find((list_segment) => {
              return list_segment.id === segment.id;
            });

            // if segment already exists, edit the existing segment
            if (segment_in_list) {
              segment = segment_in_list;
            }

            // Find matched ends of the segment and update it with the latest one
            if (segment.point_from.id === updated_point.id) {
              segment.point_from = updated_point;
            }
            if (segment.point_to.id === updated_point.id) {
              segment.point_to = updated_point;
            }

            let found_segs = [];
            all_connected_segments.forEach((seg) => {
              let segs = LayoutUtil.find_connected_segments(
                seg.point_from.id,
                seg.point_to.id,
                this.layout_data.segments,
                'ARRAY',
                true
              );
              found_segs = found_segs.concat(segs);
            });

            found_segs.forEach((seg) => {
              let is_add = true;
              for (let k = 0; k < all_connected_segments.length; k++) {
                let search_seg = all_connected_segments[k];
                if (search_seg.id === seg.id) {
                  is_add = false;
                  break;
                }
              }
              if (is_add) {
                all_connected_segments.push(seg);
              }
            });

            all_connected_segments.forEach((con_seg, index, original_arr) => {
              if (con_seg.id === segment.id) {
                original_arr[index] = segment;
              }
              segments_update_list.forEach((updated_seg) => {
                if (con_seg.id === updated_seg.id) {
                  original_arr[index] = updated_seg;
                }
              });
            });

            // Set length
            let calculated_length = segment.calculate_length();
            segment.set_length(calculated_length);

            // Set speed
            segment.set_speed(
              LayoutUtil.get_segment_speed(segment.type, this.SEGMENT_SPEEDS)
            );

            // Set travel time
            segment.set_travel_time();

            // Recalculate path
            segment.set_candidates(null);
            segment.recalculate_path(
              this.geometry.invert_factor_y,
              all_connected_segments,
              this.get_layout_objects('SEGMENT')
            );

            // Add segment to update list
            if (!segment_in_list) {
              segments_update_list.push(segment);
            }
          }

          // Update related station --------------
          // Find connected station
          let connected_stations = LayoutUtil.find_connected_station(
            updated_point,
            this.layout_data.stations
          );
          for (let i = 0; i < connected_stations.length; i++) {
            let station = connected_stations[i].copy();

            station.coord = {
              ...updated_point.coord,
            };
            station.inverted_coord = {
              ...updated_point.inverted_coord,
            };

            // Add station to update list
            stations_update_list.push(station);
          }

          // Update related buffer --------------
          // Find connected buffer
          let connected_buffers = LayoutUtil.find_connected_buffer(
            updated_point,
            this.layout_data.buffers
          );
          for (let i = 0; i < connected_buffers.length; i++) {
            let buffer = connected_buffers[i].copy();

            buffer.coord = {
              ...updated_point.coord,
            };
            buffer.inverted_coord = {
              ...updated_point.inverted_coord,
            };

            // Add buffer to update list
            buffers_update_list.push(buffer);
          }

          // Update related buffer --------------
          // Find connected buffer
          let connected_mtls = LayoutUtil.find_connected_mtl(
            updated_point,
            this.layout_data.mtls
          );
          for (let i = 0; i < connected_mtls.length; i++) {
            let mtl = connected_mtls[i].copy();

            mtl.coord = {
              ...updated_point.coord,
            };
            mtl.inverted_coord = {
              ...updated_point.inverted_coord,
            };

            // Add mtl to update list
            mtls_update_list.push(mtl);
          }
        }
      }
    }

    let connected_objects_update_list = points_update_list.concat(
      segments_update_list,
      stations_update_list,
      buffers_update_list,
      mtls_update_list
    );

    //Update all objects
    if (connected_objects_update_list.length > 0) {
      if (is_return_update) {
        return connected_objects_update_list;
      } else {
        this.update_layout_object(connected_objects_update_list, true, true);

        if (this.mode === 'EDITOR') {
          // Adjust fab size if fab size changed
          this.adjust_fab_size(
            LayoutUtil.find_max_and_min_of_objects(
              this.layout_data.points.concat(
                this.layout_data.segments as any[]
              ),
              'INVERTED'
            )
          );
        }
      }
    }
  }
  update_layout_object(
    updated_objects: any[],
    is_apply_history: boolean,
    is_apply_revert: boolean
  ) {
    let update_category = this.update_object_data(
      updated_objects,
      is_apply_history,
      is_apply_revert
    );
    this.update_layout_object_dom_elements(update_category);

    // Refresh the detail panel if active
    // @TODO popup 관련 - 검토 필요
    // try {
    //   if (popup.side_panel) {
    //     if (
    //       this.selected_objects.length === 1 &&
    //       !is_apply_history &&
    //       !is_apply_revert
    //     ) {
    //       let updated_selected_item = updated_objects.find((updated_object) => {
    //         return (
    //           updated_object.constructor.name.toUpperCase() ===
    //             this.selected_objects[0].constructor.name.toUpperCase() &&
    //           updated_object.id === this.selected_objects[0].id
    //         );
    //       });
    //       if (updated_selected_item) {
    //         popup.side_panel.update_data(updated_selected_item);
    //       }
    //     } else if (this.selected_objects.length > 1) {
    //       this.display_side_panel_popup('SELECT', null);
    //     } else if (this.selected_objects.length === 0) {
    //       this.display_side_panel_popup(null, null);
    //     }

    //     // If there is Co-located objects display, refresh
    //     this.refresh_overlap_module();
    //   }
    // } catch (error) {
    //   console.warn(error);
    // }
  }
  refresh_overlap_module() {
    if (this.$track_container.find('#overlap_module_panel_svg').length > 0) {
      let object = this.selected_objects[0];
      this.overlap_module_objects = [];
      if (this.overlap_module_svg !== undefined) {
        this.overlap_module_svg.selectAll('g').remove();
      }
      if (object) {
        this.check_overlap_and_display(
          object.constructor.name.toUpperCase(),
          object.id,
          this.overlap_module_objects,
          'OVERLAP_MODULE'
        );
      }
    }
  }
  check_overlap_and_display(
    object_type: any,
    object_id: any,
    overlap_list: any[],
    overlap_type: string
  ) {
    if (
      this.tool_type === null ||
      this.tool_type === 'POINTER' ||
      this.tool_type === 'MOVE'
    ) {
      // Find the object the mouse currently is hovering over
      let current_object = this.find_layout_object(object_type, object_id);

      let base_point_id;

      // Get base point id
      if (object_type === 'POINT') {
        base_point_id = current_object.id;
      } else if (
        object_type === 'STATION' ||
        object_type === 'BUFFER' ||
        object_type === 'MTL'
      ) {
        base_point_id = current_object.point_id;
      } else if (object_type === 'VEHICLE') {
        let cur_point = current_object.cur_point;
        if (cur_point) {
          base_point_id = current_object.cur_point.point;
        } else {
          // logger.log('UNASSIGNED_MODULE VEHICLE, exiting overlap check.');
          return;
        }
      }

      // Find the overlapping elements
      this.populate_overlap_data(base_point_id, overlap_list, overlap_type);
      this.populate_overlap_data_for_vehicles(
        base_point_id,
        overlap_list,
        overlap_type
      );
      this.put_selected_on_top(overlap_list);

      // Does overlap exists?
      if (
        overlap_type === 'OVERLAP' &&
        this.overlap_display_objects.length > 1
      ) {
        // There is overlap

        this.init_overlap_display_panel();
      }

      // Does detail overlap exist?
      if (
        overlap_type === 'OVERLAP_MODULE' &&
        this.overlap_module_objects.length > 0
      ) {
        // There is detail overlap

        this.init_overlap_module_panel('OVERLAP_MODULE');
      }
    }
  }
  init_overlap_module_panel(type: string) {
    let overlap_list =
      type === 'OVERLAP_MODULE'
        ? this.overlap_module_objects
        : this.unassigned_module_objects;
    // If the container has not been initialized
    try {
      this.put_selected_on_top(overlap_list);
      if (type === 'OVERLAP_MODULE') {
        this.overlap_module_svg = this.overlap_module_panel_svg.select(
          '#overlap_module_panel_group'
        );
        this.overlap_module_scroll_bar = this.d3_track.select(
          `#overlap_module_scroll_bar`
        );
      } else if (type === 'UNASSIGNED_MODULE') {
        this.unassigned_module_svg = this.unassigned_module_panel_svg.select(
          '#unassigned_module_panel_group'
        );
        this.unassigned_module_scroll_bar = this.d3_track.select(
          `#unassigned_module_scroll_bar`
        );
      }

      for (let i = 0; i < overlap_list.length; i++) {
        this.update_overlap_module_panel(
          'ADD',
          overlap_list[i].constructor.name.toUpperCase(),
          overlap_list[i],
          type
        );
      }
    } catch (err) {
      console.warn('Error while making overlap_module: ' + err);
    }
  }
  update_overlap_module_panel(
    operation: string,
    object_type: any,
    object: any,
    overlap_type: string
  ) {
    /*
        This function is called from either of below:
           1. init_overlap_module_panel()
           2. update_vehicles()
        */

    let length,
      svg_height,
      padding,
      selector_str =
        overlap_type === 'OVERLAP_MODULE' ? 'overlap' : 'unassigned',
      module_svg =
        overlap_type === 'OVERLAP_MODULE'
          ? this.overlap_module_svg
          : this.unassigned_module_svg;
    const module_objects_list =
      overlap_type === 'OVERLAP_MODULE'
        ? this.overlap_module_objects
        : this.unassigned_module_objects;

    // Sizing rect element of the panel to fit stations and buffers
    length = main_css.station.width * 2;
    svg_height = length * module_objects_list.length;
    padding = length / 2;

    // Add or remove elements
    if (operation === 'ADD') {
      if (object_type === 'VEHICLE') {
        this.update_vehicle_dom(
          object,
          main_css.vehicle,
          3,
          overlap_type,
          false
        );
      } else {
        this.update_dom(
          object_type,
          object,
          main_css[object_type.toLowerCase()],
          3,
          overlap_type,
          false
        );
      }
    } else if (operation === 'DELETE') {
      module_svg
        .select(
          `.${object_type.toLowerCase()}_panel_${selector_str}#id_${object.id}`
        )
        .remove();
    } else if (operation === 'UPDATE') {
      // no op
    }

    // Create or refresh the actual svg component
    this.update_overlap_module_svg(overlap_type, svg_height);

    // Highlight or unhighlight depending on vehicle arrival and departure from the point
    if (
      object &&
      this.selected_objects.length > 0 &&
      this.selected_objects[0].constructor.name === object.constructor.name &&
      this.selected_objects[0].id === object.id
    ) {
      let type = object.constructor.name.toUpperCase();

      // If adding an elligible object is a previously selected object, highlight
      if (operation === 'ADD') {
        // highlight the overlap group object that just arrived
        this.highlight(
          type,
          object.id,
          main_css[object.constructor.name.toLowerCase()],
          overlap_type,
          'SELECT'
        );
      }
    }

    // Select and rearrange the overlap objects' positions to not overlap
    let module_objects = module_svg.selectAll(
      `.vehicle_panel_${selector_str}, .point_panel_${selector_str}, .station_panel_${selector_str}, .buffer_panel_${selector_str}, .mtl_panel_${selector_str}`
    );
    for (let i = 0; i < module_objects.nodes().length; i++) {
      module_objects
        .nodes()
        [i].setAttribute(
          'transform',
          `translate(${padding}, ${length * i + padding})`
        );
    }

    // Adjust the masking row block layer to be in the right position and raise it to be the highest object.
    let parent_dom =
      overlap_type === 'OVERLAP_MODULE'
        ? this.$track_container.find('#side_panel')[0]
        : this.$track_container.find('#unassigned_floating_module')[0];
    let parent_width = parent_dom.clientWidth;
    module_objects
      .selectAll(
        '.vehicle_mask, .point_mask, .station_mask, .buffer_mask, .mtl_mask'
      )
      .attr('x', -length / 2)
      .attr('y', -length / 2)
      .attr('width', parent_width)
      .attr('height', length)
      .raise();
  }
  update_overlap_module_svg(overlap_type: string, svg_height: any) {
    let type_str = overlap_type.toLowerCase();
    let module_layout_svg =
        overlap_type === 'OVERLAP_MODULE'
          ? this.overlap_module_panel_svg
          : this.unassigned_module_panel_svg,
      module_svg =
        overlap_type === 'OVERLAP_MODULE'
          ? this.overlap_module_svg
          : this.unassigned_module_svg,
      scroll_bar_svg =
        overlap_type === 'OVERLAP_MODULE'
          ? this.overlap_module_scroll_bar
          : this.unassigned_module_scroll_bar,
      module_body =
        overlap_type === 'OVERLAP_MODULE'
          ? '#collocate_body'
          : '#floating_body';
    // Error handling
    if (!this.$track_container.find(`#${type_str}_panel_svg`)[0]) {
      // exit if svg panel is not in DOM
      return;
    }
    // Caculate Dimensional properties for panel
    let parent_dom =
      overlap_type === 'OVERLAP_MODULE'
        ? this.$track_container.find('#side_panel')[0]
        : this.$track_container.find('#unassigned_floating_module')[0];
    let parent_dimension = {
        width:
          overlap_type === 'OVERLAP_MODULE'
            ? parent_dom.clientWidth
            : parseInt(getCss('--unassigned-svg-width')), //in case of floating module (unassigned)
        height:
          overlap_type === 'OVERLAP_MODULE'
            ? parent_dom.clientHeight
            : parseInt(getCss('--unassigned-svg-height')), //in case of floating module (unassigned)
      },
      panel_top_dom =
        overlap_type === 'OVERLAP_MODULE'
          ? this.$track_container.find('#collocate_header')[0]
          : this.$track_container.find('#unassigned_floating_module_header')[0];
    const panel_header_top =
        panel_top_dom.offsetTop + panel_top_dom.offsetHeight,
      panel_height =
        overlap_type === 'OVERLAP_MODULE'
          ? parent_dimension.height - panel_header_top
          : parent_dimension.height /*in case of floating module (unassigned)*/,
      scrollerable_distance =
        svg_height - panel_height > 0 ? svg_height - panel_height : 0,
      panel_to_svg_ratio =
        panel_height / svg_height === Infinity ? 1 : panel_height / svg_height,
      scroll_bar_height =
        panel_height * panel_to_svg_ratio < panel_height
          ? panel_height * panel_to_svg_ratio
          : panel_height,
      scroll_bar_offset_x =
        (overlap_type === 'OVERLAP_MODULE'
          ? this.$track_container.find('#collocate_body')[0].clientWidth
          : parent_dimension.width) -
        main_css.general.overlap_scroll_bar_width -
        1;
    // Set panel height
    this.$track_container
      .find(`${module_body}`)
      .css('max-height', Math.abs(panel_height));
    this.$track_container
      .find(`#${type_str}_panel_svg`)
      .css('height', Math.abs(panel_height))
      .css('width', parent_dimension.width);
    this.$track_container
      .find(`#${type_str}_scroll_bar`)
      .attr('height', Math.abs(scroll_bar_height))
      .attr('x', scroll_bar_offset_x)
      .attr('width', main_css.general.overlap_scroll_bar_width);
    // Initialize panel scroll object
    let d3_module_reference =
      overlap_type === 'OVERLAP_MODULE'
        ? this.d3_detail_panel
        : this.d3_floating_module;
    d3_module_reference.is_mouse_down = false;
    d3_module_reference.scroll_value = 0;
    d3_module_reference.scroll_extent = {
      from: -scrollerable_distance,
      to: 0,
    };
    d3_module_reference.ratio = panel_to_svg_ratio;
    // Events for detail_panel
    module_layout_svg.on('mousedown', function () {
      d3_module_reference.is_mouse_down = true;
    });
    module_layout_svg.on('mouseup', function () {
      d3_module_reference.is_mouse_down = false;
    });
    module_layout_svg.on('mousemove', () => {
      if (d3_module_reference.is_mouse_down === true) {
        this.update_detail_scroll_value(
          'mousemove',
          d3.event,
          'PANEL',
          module_svg,
          scroll_bar_svg,
          d3_module_reference
        );
      }
    });
    module_layout_svg.on('wheel', () => {
      this.update_detail_scroll_value(
        'wheel',
        d3.event,
        'PANEL',
        module_svg,
        scroll_bar_svg,
        d3_module_reference
      );
    });
    $(window).on('mouseup', function () {
      // Check this
      d3_module_reference.is_mouse_down = false;
    });
    // Events for scroll bar
    scroll_bar_svg.call(
      d3
        .drag()
        .on('start', this.scroll_drag_started.bind(this))
        .on('drag', () => {
          this.scroll_dragged(module_svg, scroll_bar_svg, d3_module_reference);
        })
        .on('end', this.scroll_drag_ended.bind(this))
    );
  }
  scroll_drag_ended(): any {
    // @TODO select(this) 에서 type check 오류가나서 임시로 `#${this.track_container_id}` 지정함
    this.d3_track
      .select(`#${this.track_container_id}`)
      .classed('active', false);

    console.warn(
      'select(this) 체크 : this -> this.track_container_id >>',
      this.d3_track.select(`#${this.track_container_id}`)
    );
  }
  scroll_dragged(
    module_svg: any,
    scroll_bar_svg: any,
    d3_module_reference: any
  ) {
    this.update_detail_scroll_value(
      'mousemove',
      d3.event,
      'SCROLL_BAR',
      module_svg,
      scroll_bar_svg,
      d3_module_reference
    );
  }
  update_detail_scroll_value(
    type: string,
    event: any,
    panel_or_scroll_bar: string,
    module_svg: any,
    scroll_bar_svg: any,
    d3_module_reference: any
  ) {
    // check type and get right value from event
    if (type === 'mousemove') {
      if (panel_or_scroll_bar === 'PANEL') {
        d3_module_reference.scroll_value += event.movementY;
      } else if (panel_or_scroll_bar === 'SCROLL_BAR') {
        d3_module_reference.scroll_value += -(
          event.dy / d3_module_reference.ratio
        );
      }
    } else if (type === 'wheel') {
      d3_module_reference.scroll_value += -event.deltaY;
    }

    // Check if event value is within scroll extent
    if (
      d3_module_reference.scroll_value < d3_module_reference.scroll_extent.from
    ) {
      d3_module_reference.scroll_value = d3_module_reference.scroll_extent.from;
    } else if (
      d3_module_reference.scroll_value > d3_module_reference.scroll_extent.to
    ) {
      d3_module_reference.scroll_value = d3_module_reference.scroll_extent.to;
    }

    // Tranlate
    module_svg.attr(
      'transform',
      `translate(0, ${d3_module_reference.scroll_value})`
    );
    scroll_bar_svg.attr(
      'transform',
      `translate(0, ${
        -d3_module_reference.scroll_value * d3_module_reference.ratio
      })`
    );
  }
  scroll_drag_started() {
    // @TODO select(this) 에서 type check 오류가나서 임시로 '.' 지정함
    console.warn(
      'select(this) 체크 : this -> this.track_container_id >>',
      this.d3_track.select(`#${this.track_container_id}`)
    );

    this.d3_track
      .select(`#${this.track_container_id}`)
      .raise()
      .classed('active', true);
  }
  init_overlap_display_panel() {
    // If the container has not been initialized
    if (this.overlap_display_svg === undefined) {
      this.semantic_container.append('g').attr('class', 'overlap_group');
    }

    // Get the coordinate for the panel: If the first object in the overlap_display_objects array is a vehicle, use vehicle cur_point coordinate else, use station/buffer coordinates
    let x =
        this.overlap_display_objects[0].constructor.name.toUpperCase() ===
        'VEHICLE'
          ? this.overlap_display_objects[0].cur_point.inverted_coord.x
          : this.overlap_display_objects[0].inverted_coord.x,
      y =
        this.overlap_display_objects[0].constructor.name.toUpperCase() ===
        'VEHICLE'
          ? this.overlap_display_objects[0].cur_point.inverted_coord.y
          : this.overlap_display_objects[0].inverted_coord.y;

    // Closing event for overlap panel
    this.overlap_display_svg = this.get_svg_class('OVERLAP_DISPLAY').on(
      'mouseleave',
      () => {
        this.hide_overlap_display('OVERLAP', this.overlap_display_objects);
      }
    );

    // Add the g container for rect display panel
    this.overlap_display_panel_svg = this.overlap_display_svg
      .append('g')
      .attr('id', 'overlap_display_panel')
      .attr('x', x)
      .attr('y', y)
      .attr(
        'transform',
        `translate(${this.getZoom(MapTypes.MAIN).apply([x, y])})rotate(${-this
          .map_rotation})`
      );

    // Add the rect display panel
    this.overlap_display_panel_svg
      .append('rect')
      .attr('class', 'overlap_display_panel')
      .attr('rx', 5)
      .attr('ry', 5);

    // Add all overlapping objects to dom
    for (let i = 0; i < this.overlap_display_objects.length; i++) {
      this.update_overlap_display_panel(
        'ADD',
        this.overlap_display_objects[i].constructor.name.toUpperCase(),
        this.overlap_display_objects[i]
      );
    }
  }
  hide_overlap_display(type: string, overlap_objects_list: any[]) {
    let panel_svg, class_str;
    if (type === 'OVERLAP') {
      panel_svg = this.overlap_display_panel_svg;
      class_str = 'overlap';
    } else if (type === 'OVERLAP_MODULE') {
      panel_svg = this.overlap_module_svg;
      class_str = 'panel_overlap';
    }

    // Check if there are any selected overlap object before close
    if (this.selected_objects.length > 0) {
      let selected_object = this.selected_objects[0];

      let selected_exists_in_overlap = this.check_exist_overlap_list(
        selected_object,
        overlap_objects_list
      );

      // Empty overlap list
      if (type === 'OVERLAP') {
        this.overlap_display_objects = [];
      } else if (type === 'OVERLAP_MODULE') {
        this.overlap_module_objects = this.selected_objects;
      }

      if (selected_exists_in_overlap) {
        // If there is a selected overlap object

        // Find the css for the selected object
        let object_css;
        if (selected_object.constructor.name.toUpperCase() === 'POINT') {
          object_css = main_css.point;
        } else if (
          selected_object.constructor.name.toUpperCase() === 'STATION'
        ) {
          object_css = main_css.station;
        } else if (
          selected_object.constructor.name.toUpperCase() === 'BUFFER'
        ) {
          object_css = main_css.buffer;
        } else if (
          selected_object.constructor.name.toUpperCase() === 'VEHICLE'
        ) {
          object_css = main_css.vehicle;
        }

        // highlight non-overlap object before close
        this.highlight(
          selected_object.constructor.name.toUpperCase(),
          selected_object.id,
          object_css,
          'LAYOUT',
          'SELECT'
        );
      }
    } else {
      // Empty overlap list
      if (type === 'OVERLAP') {
        this.overlap_display_objects = [];
      } else if (type === 'OVERLAP_MODULE') {
        this.overlap_module_objects = this.selected_objects;
      }
    }

    if (panel_svg) {
      // Select overlap elements to remove
      let overlap_objects = panel_svg.selectAll(
        `.vehicle_${class_str}, .point_${class_str}, .station_${class_str}, .buffer_${class_str}`
      );

      if (type === 'OVERLAP') {
        const that = this;
        // Animate then remove elements
        overlap_objects
          .transition()
          .duration(100)
          .attr('transform', 'translate(0,0)')
          .on('end', function () {
            that.$track_container.find(this).remove();
          });

        // Animate then remove overlap_display_panel
        this.overlap_display_panel_svg
          .select('rect')
          .transition()
          .duration(100)
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', 0)
          .attr('height', 0)
          .on('end', function () {
            that.$track_container.find(this).parent().remove();
          });
      } else if (type === 'OVERLAP_MODULE') {
        overlap_objects.remove();
      }
    }
  }
  update_overlap_display_panel(operation: string, type: any, object: any) {
    /*
        This function is called from either of below:
           1. init_overlap_display_panel()
           2. update_vehicles()
        */

    let radius, length, width, height, padding;

    // Find if stations of buffers are a part of the overlap
    let has_station_or_buffer = this.overlap_display_objects.find((object) => {
      let type = object.constructor.name.toUpperCase();
      return type === 'STATION' || type === 'BUFFER' || type === 'MTL';
    });

    // Sizing rect element of the panel to fit stations and buffers
    radius = main_css.buffer.radius + main_css.vehicle.line_weight + 7;
    length = radius * 3;
    width = length * 2.5;
    height = length * this.overlap_display_objects.length;
    padding = length / 2;

    // Show the overlap display rect panel
    this.overlap_display_panel_svg
      .select('rect')
      .attr('x', -length / 2)
      .attr('y', -length / 2)
      .attr('width', length)
      .attr('height', length)
      .transition()
      .duration(200)
      .attr('width', width)
      .attr('height', height)
      .attr('x', (-width * 2) / 8)
      .attr('y', function () {
        if (has_station_or_buffer) {
          return -height * 0.47;
        } else {
          return -height / 2;
        }
      });

    // Add or remove elements
    if (operation === 'ADD') {
      if (type === 'VEHICLE') {
        this.update_vehicle_dom(object, main_css.vehicle, 3, 'OVERLAP', false);
      } else if (type === 'POINT') {
        this.update_dom('POINT', object, main_css.point, 3, 'OVERLAP', false);
      } else if (type === 'STATION') {
        this.update_dom(
          'STATION',
          object,
          main_css.station,
          3,
          'OVERLAP',
          false
        );
      } else if (type === 'BUFFER') {
        this.update_dom('BUFFER', object, main_css.buffer, 3, 'OVERLAP', false);
      } else if (type === 'MTL') {
        this.update_dom('MTL', object, main_css.mtl, 3, 'OVERLAP', false);
      }
    } else if (operation === 'DELETE') {
      this.overlap_display_panel_svg.select(`#id_${object.id}`).remove();
    }

    // Highlight or unhighlight depending on vehicle arrival and departure from the point
    if (
      this.selected_objects.length > 0 &&
      this.selected_objects[0].constructor.name === object.constructor.name &&
      this.selected_objects[0].id === object.id
    ) {
      let type = object.constructor.name.toUpperCase();

      // If adding overlap_object is a previously selected object, highlight
      if (operation === 'ADD') {
        // highlight the overlap group object that just arrived
        this.unhighlight(type, object.id, 'LAYOUT');
        this.highlight(
          type,
          object.id,
          main_css[object.constructor.name.toLowerCase()],
          'OVERLAP',
          'SELECT'
        );
      } else if (operation === 'DELETE') {
        // If deleting object was highlight, highlight the dom object leaving the point.
        // Highlight the layout object that left the point
        this.highlight(
          type,
          object.id,
          main_css[object.constructor.name.toLowerCase()],
          'LAYOUT',
          'SELECT'
        );
      }
    }

    // Select and rearrange the overlap objects' positions to not overlap
    let overlap_objects = this.overlap_display_panel_svg.selectAll(
      '.vehicle_overlap, .station_overlap, .buffer_overlap, .mtl_overlap'
    );
    for (let i = 0; i < overlap_objects.nodes().length; i++) {
      d3.select(overlap_objects.nodes()[i])
        .transition()
        .duration(200)
        .attr(
          'transform',
          `translate(0, ${length * i - height / 2 + padding})`
        );
    }

    // Adjust the masking row block layer to be in the right position and raise it to be the highest object.
    overlap_objects
      .selectAll(
        '.vehicle_mask, .point_mask, .station_mask, .buffer_mask, .mtl_mask'
      )
      .attr('x', -length / 2)
      .attr('y', -length / 2)
      .attr('width', width)
      .attr('height', length)
      .raise();
  }
  put_selected_on_top(overlap_list: any[]) {
    // Parse list, then place the selected object in the list at the front of the list.
    if (this.selected_objects.length > 0) {
      for (let i = overlap_list.length - 1; i > -1; i--) {
        let obj = overlap_list[i];
        if (
          obj.id === this.selected_objects[0].id &&
          obj.constructor === this.selected_objects[0].constructor
        ) {
          obj = overlap_list.splice(i, 1)[0];
          overlap_list.unshift(obj);
          return;
        }
      }
    }
  }
  populate_overlap_data_for_vehicles(
    point_id: any,
    adding_overlap_list: any[],
    overlap_type: string
  ) {
    // Look for overlaping vehicles and populate the array
    for (let i = 0; i < this.vehicles.length; i++) {
      let exist_in_overlap = this.check_exist_overlap_list(
        this.vehicles[i],
        adding_overlap_list
      );
      if (
        this.vehicles[i].cur_point &&
        this.vehicles[i].cur_point.point === point_id &&
        !exist_in_overlap
      ) {
        this.add_to_overlap_objects(
          this.vehicles[i],
          adding_overlap_list,
          overlap_type
        );
      }
    }
  }
  add_to_overlap_objects(
    object: any,
    adding_overlap_list: any[],
    overlap_type: string
  ) {
    // Unhighlight the arriving layout element
    if (overlap_type === 'OVERLAP') {
      this.unhighlight(
        object.constructor.name.toUpperCase(),
        object.id,
        'LAYOUT'
      );
    }
    adding_overlap_list.push(object);
  }
  check_exist_overlap_list(target_object: any, adding_overlap_list: any[]) {
    let is_exist = false;

    if (!target_object) return is_exist;

    for (let i = 0; i < adding_overlap_list.length; i++) {
      if (
        adding_overlap_list[i] &&
        target_object.constructor === adding_overlap_list[i].constructor &&
        target_object.id === adding_overlap_list[i].id
      ) {
        is_exist = true;

        break;
      }
    }
    return is_exist;
  }
  populate_overlap_data(
    point_id: any,
    adding_overlap_list: any[],
    overlap_type: string
  ) {
    // this is for points, stations, buffers, or mtls
    let layout_objects;

    if (overlap_type === 'OVERLAP_MODULE') {
      layout_objects = this.get_layout_objects('POINT');

      // Check for points
      for (let i = 0; i < layout_objects.length; i++) {
        let exist_in_overlap = this.check_exist_overlap_list(
          layout_objects[i],
          adding_overlap_list
        );
        if (
          layout_objects[i] &&
          layout_objects[i].id === point_id &&
          !exist_in_overlap
        ) {
          this.add_to_overlap_objects(
            layout_objects[i],
            adding_overlap_list,
            overlap_type
          );
        }
      }
    }

    layout_objects = this.get_layout_objects('STATION');

    // Check for station
    for (let i = 0; i < layout_objects.length; i++) {
      let exist_in_overlap = this.check_exist_overlap_list(
        layout_objects[i],
        adding_overlap_list
      );
      if (
        layout_objects[i] &&
        layout_objects[i].point_id === point_id &&
        !exist_in_overlap
      ) {
        this.add_to_overlap_objects(
          layout_objects[i],
          adding_overlap_list,
          overlap_type
        );
      }
    }

    layout_objects = this.get_layout_objects('BUFFER') || [];

    // Check for buffer
    for (let i = 0; i < layout_objects.length; i++) {
      // Find matches
      let exist_in_overlap = this.check_exist_overlap_list(
        layout_objects[i],
        adding_overlap_list
      );
      if (
        layout_objects[i] &&
        layout_objects[i].point_id === point_id &&
        !exist_in_overlap
      ) {
        this.add_to_overlap_objects(
          layout_objects[i],
          adding_overlap_list,
          overlap_type
        );
      }
    }

    layout_objects = this.get_layout_objects('MTL') || [];

    // Check for mtl
    for (let i = 0; i < layout_objects.length; i++) {
      // Find matches
      let exist_in_overlap = this.check_exist_overlap_list(
        layout_objects[i],
        adding_overlap_list
      );
      if (
        layout_objects[i] &&
        layout_objects[i].point_id === point_id &&
        !exist_in_overlap
      ) {
        this.add_to_overlap_objects(
          layout_objects[i],
          adding_overlap_list,
          overlap_type
        );
      }
    }
  }
  display_side_panel_popup(object_type: string, layout_object: any) {
    if (this.mode !== 'MINIMAL') {
      if (object_type === 'CLUSTER') {
        object_type = null;
        layout_object = null;
      }

      // Get the most current data of the object that is selected
      if (layout_object) {
        layout_object = this.find_layout_object(object_type, layout_object.id);
      }

      // remove existing popup
      this.reset_side_panel_data_models();

      if (layout_object !== null && layout_object !== undefined) {
        // Prepare segment candidate if not exists
        let option = null; // FIXME: just set null, no 'option' needed
        if (this.mode === 'EDITOR') {
          // Check if there is no candidates for seg
          if (
            object_type === 'SEGMENT' &&
            layout_object.candidates.length === 0
          ) {
            // Add candidates
            let candidates = LayoutUtil.find_segment_candidate(
              layout_object.id,
              layout_object.point_from,
              layout_object.point_to,
              this.layout_data.segments
            );
            layout_object.candidates = candidates;
          }
        }

        // display popup
        // @TODO Popup
        // popup.side_panel = this.create_new_popup(
        //   track_container_id,
        //   object_type,
        //   this.mode == 'EDITOR' ? true : false,
        //   layout_object.copy(),
        //   option,
        //   this.mode == 'VIEWER' ? true : false,
        //   this_instance,
        //   is_permitted
        // );
        this.overlap_module_panel_svg = this.d3_track.select(
          '#overlap_module_panel_svg'
        );
        this.overlap_module_scroll_bar = this.d3_track.select(
          '#overlap_module_scroll_bar'
        );

        this.check_overlap_and_display(
          object_type,
          layout_object.id,
          this.overlap_module_objects,
          'OVERLAP_MODULE'
        );
        // @TODO popup
        // popup.side_panel.init_accordian(
        //   false,
        //   this.update_overlap_module_panel
        // );
      } else {
        // @TODO Popup
        // popup.side_panel = this.create_new_popup(
        //   track_container_id,
        //   object_type,
        //   this.mode == 'EDITOR' ? true : false,
        //   null,
        //   null,
        //   this.mode == 'VIEWER' ? true : false,
        //   this_instance
        // );
        // logger.log(`display popup : Non-selected`);
      }

      // Set the side panel button to active
      this.$track_container.find('#btn_side_panel').addClass('active');

      // Push any floating module out of side_panel's way
      this.push_floating_modules_when_side_panel_opens();
    }
  }
  push_floating_modules_when_side_panel_opens() {
    let floating_modules = this.$track_container.find('.floating_module');
    let $side_panel = this.$track_container.find('#side_panel');
    if (floating_modules.length > 0 && $side_panel.length > 0) {
      Array.from(floating_modules).forEach((module) => {
        let $module = this.$track_container.find(module),
          $side_panel_width = $side_panel[0].clientWidth;
        if (parseInt($module.css('right')) < $side_panel_width) {
          $module.css('right', $side_panel_width);
        }
      });
    }
  }
  reset_side_panel_data_models() {
    // @TODO popup 관련
    // this.popup.side_panel = undefined
    this.overlap_module_panel_svg = undefined;
    this.overlap_module_svg = undefined;
    this.overlap_module_objects = [];
    this.$track_container.find('#side_panel').remove();
    this.$track_container.find('#btn_side_panel').removeClass('active');
  }
  update_layout_object_dom_elements(update_category: any[]) {
    let is_point_update = false;
    let is_segment_update = false;
    let is_station_update = false;
    let is_buffer_update = false;
    let is_mtl_update = false;
    let is_cluster_update = false;
    let is_vehicle_update = false;

    for (let i = 0; i < update_category.length; i++) {
      if (update_category[i] === 'POINT') {
        is_point_update = true;
      } else if (update_category[i] === 'SEGMENT') {
        is_segment_update = true;
      } else if (update_category[i] === 'STATION') {
        is_station_update = true;
      } else if (update_category[i] === 'BUFFER') {
        is_buffer_update = true;
      } else if (update_category[i] === 'MTL') {
        is_mtl_update = true;
      } else if (update_category[i] === 'CLUSTER') {
        is_cluster_update = true;
      } else if (update_category[i] === 'GROUP') {
        is_station_update = true;
        is_buffer_update = true;
        is_mtl_update = true;
        is_vehicle_update = true;
      }
    }

    // Get current zoom level
    let zoom_level = this.calculate_zoom_level();

    // Calculate viewing area
    let view_box = this.get_viewbox();

    // Update DOM in bulk

    let points = this.append_showing_objects('POINT', view_box); //append showing points
    if (
      // this.show_point_labels &&
      this.preferences.toggles.pointLabels &&
      is_point_update &&
      points &&
      points.length > 0
    ) {
      this.update_dom(
        'POINT',
        points,
        main_css.point,
        zoom_level,
        'LAYOUT',
        false
      );
    }

    let segments = this.append_showing_polygons('SEGMENT', view_box);
    if (is_segment_update && segments && segments.length > 0) {
      this.update_segment_svg(segments, main_css.segment, true);
      this.update_dom(
        'SEGMENT_DIRECTION',
        segments,
        main_css.segment,
        zoom_level,
        'LAYOUT',
        false
      );
    }

    let stations = this.append_showing_objects('STATION', view_box); //append showing stations
    if (
      // this.show_stations &&
      this.preferences.toggles.stations &&
      is_station_update &&
      stations &&
      stations.length > 0
    ) {
      this.update_dom(
        'STATION',
        stations,
        main_css.station,
        zoom_level,
        'LAYOUT',
        false
      );
    }

    let buffers = this.append_showing_objects('BUFFER', view_box); //append showing buffers
    if (
      // this.show_buffers &&
      this.preferences.toggles.buffers &&
      is_buffer_update &&
      buffers &&
      buffers.length > 0
    ) {
      this.update_dom(
        'BUFFER',
        buffers,
        main_css.buffer,
        zoom_level,
        'LAYOUT',
        false
      );
    }

    let mtls = this.append_showing_objects('MTL', view_box); //append showing mtls
    // if (this.show_mtls && is_mtl_update && mtls && mtls.length > 0) {
    if (
      this.preferences.toggles.mtls &&
      is_mtl_update &&
      mtls &&
      mtls.length > 0
    ) {
      this.update_dom('MTL', mtls, main_css.mtl, zoom_level, 'LAYOUT', false);
    }

    let clusters = this.append_showing_polygons('CLUSTER', view_box); //append showing clusters
    if (
      // this.show_clusters &&
      this.preferences.toggles.clusters &&
      is_cluster_update &&
      clusters &&
      clusters.length > 0
    ) {
      this.update_dom(
        'CLUSTER',
        clusters,
        main_css.cluster,
        zoom_level,
        'LAYOUT',
        false
      );
    }

    let vehicles = this.append_showing_vehicles(view_box);
    if (
      // this.show_vehicles &&
      this.preferences.toggles.vehicles &&
      is_vehicle_update &&
      this.mode !== 'MINIMAL' &&
      this.mode !== 'EDITOR' &&
      vehicles &&
      vehicles.length > 0
    ) {
      this.update_vehicle_dom(
        vehicles,
        main_css.vehicle,
        zoom_level,
        'LAYOUT',
        false
      );
    }
  }
  update_object_data(
    updated_objects: any[],
    is_apply_history: boolean,
    is_apply_revert: boolean
  ) {
    // Convert object to array
    if (!Array.isArray(updated_objects)) {
      updated_objects = [updated_objects];
    }

    let original_objects = [];
    let update_category = [];

    for (let i = 0; i < updated_objects.length; i++) {
      let updated_object = updated_objects[i];
      let object_type = updated_object.constructor.name.toUpperCase();

      // let original_object
      let original_object_idx;

      let target_objects;

      // Find original objects
      // original_object = this.find_layout_object(object_type, updated_object.id).copy()

      // Get object list
      target_objects = this.get_layout_objects(object_type);

      // Find original object index to replace
      original_object_idx = target_objects.findIndex(
        (object) => object.id === updated_object.id
      );

      if (original_object_idx >= 0) {
        // Update original objects
        let original_object = target_objects.splice(
          original_object_idx,
          1,
          updated_object
        )[0];

        // Store original object to array for history
        original_objects.push(original_object);

        let object_type = original_object.constructor.name.toUpperCase();

        if (object_type === 'POINT' || object_type === 'SEGMENT') {
          this.update_related_clusters(original_object);

          let is_type_exists = update_category.find((type) => {
            return type === 'CLUSTER';
          });

          if (!is_type_exists) {
            update_category.push('CLUSTER');
          }

          this.update_related_location_objects(updated_object);

          let is_station_exists = update_category.find((type) => {
            return type === 'STATION';
          });

          let is_buffer_exists = update_category.find((type) => {
            return type === 'BUFFER';
          });

          if (!is_station_exists) {
            update_category.push('STATION');
          }

          if (!is_buffer_exists) {
            update_category.push('BUFFER');
          }
        }

        if (object_type === 'BUFFER' || object_type === 'STATION') {
          updated_object.set_direction_attr(this.get_layout_objects('SEGMENT'));
        }

        if (object_type === 'GROUP') {
          this.update_related_grouped_objects(updated_object, original_object);
        }

        let is_type_exists = update_category.find((type) => {
          return type === object_type;
        });
        if (!is_type_exists) {
          update_category.push(original_object.constructor.name.toUpperCase());
        }
      }

      // Find original object index in selected objects to replace with updated data
      let selected_object_idx = this.selected_objects.findIndex((object) => {
        if (
          object.id === updated_object.id &&
          object.constructor.name.toUpperCase() ===
            updated_object.constructor.name.toUpperCase()
        )
          return true;
        else return false;
      });

      if (selected_object_idx > -1) {
        this.selected_objects.splice(
          selected_object_idx,
          1,
          this.find_layout_object(
            updated_object.constructor.name.toUpperCase(),
            updated_object.id
          )
        );
      }
    }

    if (is_apply_history) {
      // Save original data to history stack
      let history_index = this.manage_history(
        'PUSH',
        'UPDATE',
        original_objects
      );

      // @TODO popup 확인
      // if (is_apply_revert && popup.side_panel) {
      //   popup.side_panel.set_revert_stack(history_index);
      // }
    }
    return update_category;
  }
  update_related_grouped_objects(
    updated_group: any,
    original_group: any,
    track?,
    vehicles_data?
  ) {
    let is_return_value = false;

    if (track && vehicles_data) {
      is_return_value = true;
    } else {
      track = this.layout_data;
      vehicles_data = this.vehicles;
    }

    // Find the changes between new and old data
    let add_to_group = {};
    let remove_to_group = {};

    if (!updated_group) updated_group = {};
    if (!original_group) original_group = {};

    for (let type in updated_group.objects) {
      let updated_type_arr = [];
      let original_type_arr = [];
      if (updated_group.objects) {
        updated_type_arr = [...updated_group.objects[type]];
      }
      if (original_group.objects) {
        original_type_arr = [...original_group.objects[type]];
      }

      for (let i = updated_type_arr.length - 1; i > -1; i--) {
        let is_found = false;
        let updated_object_id = updated_type_arr[i];
        for (let j = original_type_arr.length - 1; j > -1; j--) {
          let original_object_id = original_type_arr[j];
          if (updated_object_id === original_object_id) {
            is_found = true;
            original_type_arr.splice(j, 1);
            break;
          }
        }
        if (is_found) {
          updated_type_arr.splice(i, 1);
        }
      }
      add_to_group[type] = updated_type_arr;
      remove_to_group[type] = original_type_arr;
    }

    // Set apply the differences to original data
    for (let type in add_to_group) {
      let objects_arr = [];
      if (type.toUpperCase() === 'VEHICLE') {
        objects_arr = vehicles_data;
      } else {
        objects_arr = track[`${type}s`];
      }
      for (let add_group_id of add_to_group[type]) {
        for (let object of objects_arr) {
          if (object.id === add_group_id) {
            if (updated_group.id != object.group) {
              object.group = updated_group.id;
            }
          }
        }
      }
    }

    for (let type in remove_to_group) {
      let objects_arr = [];
      if (type.toUpperCase() === 'VEHICLE') {
        objects_arr = vehicles_data;
      } else {
        objects_arr = track[`${type}s`];
      }
      for (let remove_group_id of remove_to_group[type]) {
        for (let object of objects_arr) {
          if (object.id === remove_group_id) {
            if (updated_group.id == object.group) {
              object.group = null;
            }
          }
        }
      }
    }

    if (is_return_value) {
      return { track: track, vehicles: vehicles_data };
    }
  }
  manage_history(
    stack_operator: string,
    operation_type: string,
    layout_objects: any[]
  ) {
    // Check if save operation for leaving page without save warning
    this.map_has_changes = operation_type === 'SAVE' ? false : true;

    if (stack_operator === 'INIT') {
      this.history_stack = [];

      return null;
    } else if (stack_operator === 'PUSH') {
      let history: any = {};

      history.type = operation_type;

      history.objects = [];
      // Copy original objects if not null
      if (layout_objects && layout_objects.length > 0) {
        for (let i = 0; i < layout_objects.length; i++) {
          let object = layout_objects[i].copy();
          history.objects.push(object);
        }
      }

      this.history_stack.push(history);

      return this.history_stack.length - 1;
    } else if (stack_operator === 'POP') {
      let history;

      // check pop condition
      if (layout_objects === null) {
        // pop the latest history
        history = this.history_stack.pop();

        // Check if history operation is a save, if true, get the before operation
        if (history && history.type === 'SAVE') {
          if (this.history_stack.length === 0) {
            this.map_has_changes = false;
          }
          history = this.history_stack.pop();
        }
      } else {
        // pop specific history
        let pop_index = layout_objects[0];

        // check array index
        if (pop_index < this.history_stack.length) {
          history = this.history_stack.splice(pop_index, 1)[0];
        }
      }

      if (history === undefined) {
        history = null;
      }

      // Check if last history type is 'SAVE' for page leave warning
      if (
        this.history_stack.length === 0 ||
        (this.history_stack.length > 0 &&
          this.history_stack[this.history_stack.length - 1].type === 'SAVE')
      ) {
        this.map_has_changes = false;
      }

      return history;
    }
  }
  update_related_location_objects(updated_object: any) {
    let updated_object_type = updated_object.constructor.name.toUpperCase();
    let target_points = [];
    let updated_stations = 0;
    let updated_buffers = 0;

    if (updated_object_type === 'POINT') {
      target_points.push(updated_object.id);
    } else if (updated_object_type === 'SEGMENT') {
      target_points.push(updated_object.point_from.id);
      target_points.push(updated_object.point_to.id);
    }

    for (let point_id of target_points) {
      for (let station of this.layout_data.stations) {
        if (station.point_id === point_id) {
          station.set_direction_attr(this.get_layout_objects('SEGMENT'));
          updated_stations++;
        }
      }
      for (let buffer of this.layout_data.buffers) {
        if (buffer.point_id === point_id) {
          buffer.set_direction_attr(this.get_layout_objects('SEGMENT'));
          updated_buffers++;
        }
      }
    }
  }
  update_related_clusters(original_object: any) {
    let connected_clusters = [];
    let object_type = original_object.constructor.name.toUpperCase();
    if (object_type === 'POINT') {
      connected_clusters = LayoutUtil.find_connected_cluster(
        original_object,
        this.layout_data.clusters
      );
    } else if (object_type === 'SEGMENT') {
      connected_clusters = LayoutUtil.find_connected_cluster_using_segment(
        original_object,
        this.layout_data.clusters
      );
    }

    // Update cluster
    connected_clusters.forEach((cluster) => {
      let cluster_segments = LayoutUtil.find_all_contigous_segments_from_points(
        cluster.point_id_list,
        this.layout_data.segments
      );
      cluster.set_path(cluster_segments, main_css.cluster.border_offset);
    });
  }
  find_snap(
    left_top: { x: any; y: any },
    right_bottom: { x: any; y: any },
    delta: any
  ): any {
    let snap_offset: any = {};

    let new_left_top = {
      x: left_top.x + delta.x,
      y: left_top.y + delta.y,
    };
    let new_right_bottom = {
      x: right_bottom.x + delta.x,
      y: right_bottom.y + delta.y,
    };

    let snap_left_top = LayoutUtil.calc_snap_coord(
      new_left_top,
      this.snap_to_grid_distance
    );
    let snap_right_bottom = LayoutUtil.calc_snap_coord(
      new_right_bottom,
      this.snap_to_grid_distance
    );

    let x1 = new_left_top.x;
    let y1 = new_left_top.y;
    let x2 = new_right_bottom.x;
    let y2 = new_right_bottom.y;

    let x1_snap = snap_left_top.x;
    let y1_snap = snap_left_top.y;
    let x2_snap = snap_right_bottom.x;
    let y2_snap = snap_right_bottom.y;

    if (Math.abs(x1_snap - x1) < Math.abs(x2_snap - x2)) {
      snap_offset.x = x1_snap - left_top.x;
    } else {
      snap_offset.x = x2_snap - right_bottom.x;
    }

    if (Math.abs(y1_snap - y1) < Math.abs(y2_snap - y2)) {
      snap_offset.y = y1_snap - left_top.y;
    } else {
      snap_offset.y = y2_snap - right_bottom.y;
    }

    snap_offset.x = Math.round(snap_offset.x);
    snap_offset.y = Math.round(snap_offset.y);

    return snap_offset;
  }
  hide_hover_tag() {
    // hide the object and delete all of its text
    let hover_tag = this.$track_container.find('#hover_tag');
    hover_tag.css('display', 'none');
    hover_tag.text('');
  }
  show_hover_tag(
    object_type: any,
    object_id: any,
    custom_text: string,
    mouse_coord: { x: any; y: any }
  ) {
    // Show a tag with information when cursor moves over an object
    let hover_tag = this.$track_container.find('#hover_tag');

    // Make the label text
    let label_text = '';

    if (mouse_coord) {
      label_text = custom_text;
    } else {
      let in_overlap_object = this.overlap_display_objects.findIndex(
        (object) => {
          return (
            object.constructor.name.toUpperCase() === object_type &&
            object.id === object_id
          );
        }
      );

      let overlap_module = this.overlap_module_objects.findIndex((object) => {
        return (
          object.constructor.name.toUpperCase() === object_type &&
          object.id === object_id
        );
      });

      // if tag is already visible then bail out
      if (
        (in_overlap_object > -1 && this.overlap_display_objects.length > 1) ||
        (overlap_module > -1 && this.overlap_module_objects.length > 1)
      ) {
        return;
      }

      // Get object's latest data
      let layout_object = this.find_layout_object(object_type, object_id);

      // initialize variables
      let id, logical_id, physical_id, length, point, max_cap, order_logical_id;

      // populate variables by availability
      if (object_type === 'CLUSTER') {
        id = layout_object.id ? layout_object.id : null;
        logical_id = layout_object.logical_id ? layout_object.logical_id : null;
        max_cap = layout_object.max_vehicles
          ? layout_object.max_vehicles
          : null;
      } else {
        id = layout_object.id ? layout_object.id : null;
        logical_id = layout_object.logical_id ? layout_object.logical_id : null;
        physical_id = layout_object.physical_id
          ? layout_object.physical_id
          : null;

        // Set attributes distinctly by variables
        if (object_type === 'SEGMENT') {
          length = layout_object.length ? layout_object.length : null;
          point =
            layout_object.point_from.id && layout_object.point_to.id
              ? `${layout_object.point_from.id} . ${layout_object.point_to.id}`
              : null;
        } else if (object_type === 'POINT') {
          point = layout_object.id ? layout_object.id : null;
        } else if (object_type === 'VEHICLE') {
          point = layout_object.cur_point
            ? layout_object.cur_point.point
            : null;
          order_logical_id = layout_object.order_logical_id
            ? layout_object.order_logical_id
            : layout_object.order_id
            ? layout_object.order_id
            : null;
        } else {
          point = layout_object.point_id ? layout_object.point_id : null;
        }
      }

      if (object_type !== 'MTL') {
        object_type =
          object_type.charAt(0) +
          object_type.slice(1, object_type.length).toLowerCase();
      }

      // @TODO i18n 처리
      if (object_type) label_text += `${object_type}\n`;
      if (id) label_text += `${'ID'}: ${id}\n`;
      if (logical_id) label_text += `${'Logical ID'}: ${logical_id}\n`;
      if (physical_id) label_text += `${'Physical ID'}: ${physical_id}\n`;
      if (length) label_text += `${'length'}: ${length}\n`;
      if (point) label_text += `${'Point'}: ${point}\n`;
      if (max_cap) label_text += `${'Maximum vehicles'}: ${max_cap}\n`;
      if (order_logical_id)
        label_text += `${'Order ID'}: ${order_logical_id}\n`;

      // if (object_type) label_text += `${$.i18n(object_type)}\n`;
      // if (id) label_text += `${$.i18n('ID')}: ${id}\n`;
      // if (logical_id) label_text += `${$.i18n('Logical ID')}: ${logical_id}\n`;
      // if (physical_id)
      //   label_text += `${$.i18n('Physical ID')}: ${physical_id}\n`;
      // if (length) label_text += `${$.i18n('length')}: ${length}\n`;
      // if (point) label_text += `${$.i18n('Point')}: ${point}\n`;
      // if (max_cap) label_text += `${$.i18n('Maximum vehicles')}: ${max_cap}\n`;
      // if (order_logical_id)
      //   label_text += `${$.i18n('Order ID')}: ${order_logical_id}\n`;
    }

    // Move text
    if (mouse_coord) {
      hover_tag
        .css('left', mouse_coord.x + this.hover_tag_offset_x)
        .css('top', mouse_coord.y - this.hover_tag_offset_y);
    } else {
      hover_tag
        .css('left', d3.event.x + this.hover_tag_offset_x)
        .css('top', d3.event.y - this.hover_tag_offset_y);
    }
    // Display text

    hover_tag.text(label_text);

    // Make visible
    hover_tag.css('display', 'block');
  }
  calc_original_coord_with_screen(
    screen_coord: any,
    invert_factor_y: any,
    is_apply_snap?: boolean
  ) {
    let current_zoom = this.getZoom(MapTypes.MAIN);
    let coord: any = {};

    (coord.x = (screen_coord[0] - current_zoom.x) / current_zoom.k),
      (coord.y = (screen_coord[1] - current_zoom.y) / current_zoom.k);

    coord.y = invert_factor_y - coord.y;

    // Apply snap
    if (is_apply_snap) {
      coord = LayoutUtil.calc_snap_coord(coord, this.snap_to_grid_distance);
    }

    return coord;
  }
  update_selection_box(bounding_box: {
    min: { x: any; y: any };
    max: { x: any; y: any };
  }) {
    this.selection_box_svg.current_bounding_box = bounding_box;
    let parameters = this.get_box_coordinates(
      bounding_box.min,
      bounding_box.max
    );
    let current_zoom = this.getZoom(MapTypes.MAIN);
    this.selection_box_svg
      .attr('x', parameters.x)
      .attr('y', parameters.y)
      .attr('width', parameters.width)
      .attr('height', parameters.height)
      .attr(
        'transform',
        `translate(${current_zoom.x}, ${current_zoom.y})scale(${current_zoom.k})`
      );
  }
  get_box_coordinates(coord1: { x: any; y: any }, coord2: { x: any; y: any }) {
    return {
      x: coord1.x,
      y: coord1.y,
      width: coord2.x - coord1.x,
      height: coord2.y - coord1.y,
    };
  }
  move_dom(object_type: string, layout_object: any[], coord_delta: any) {
    // Get target DOM
    let dom = this.get_dom(object_type, layout_object[0].id, 'LAYOUT');

    let current_zoom = this.getZoom(MapTypes.MAIN) as any;

    // Check layout_object type
    if (
      object_type === 'POINT' ||
      object_type === 'STATION' ||
      object_type === 'BUFFER' ||
      object_type === 'MTL'
    ) {
      dom.attr(
        'transform',
        `translate(${current_zoom.apply([
          layout_object[0].inverted_coord.x + coord_delta.x,
          layout_object[0].inverted_coord.y + coord_delta.y,
        ])})`
      );
      dom.attr('x', layout_object[0].inverted_coord.x + coord_delta.x);
      dom.attr('y', layout_object[0].inverted_coord.y + coord_delta.y);
    } else if (object_type === 'SEGMENT') {
      let temp_move_seg = dom.select('#temp_segment');
      temp_move_seg.attr(
        'transform',
        `translate(${coord_delta.x}, ${coord_delta.y})`
      );
      dom
        .selectAll('.hover, .select')
        .attr('transform', `translate(${coord_delta.x}, ${coord_delta.y})`);
    } else if (object_type === 'SEGMENT_DIRECTION') {
      dom
        .attr('x', layout_object[0].dir_coord.x + coord_delta.x)
        .attr('y', layout_object[0].dir_coord.y + coord_delta.y)
        .attr(
          'transform',
          `translate(${current_zoom.apply([
            layout_object[0].dir_coord.x + coord_delta.x,
            layout_object[0].dir_coord.y + coord_delta.y,
          ])})`
        );
      dom
        .select('.dir_triangle')
        .attr(
          'transform',
          `rotate(${CommonUtil.degrees(layout_object[0].dir_angle)},0,0)`
        );
    }
  }
  add_temporary_segment_move_dom() {
    let d3_segment_g = this.get_dom('SEGMENT', null, 'LAYOUT');
    let selected_segments = this.get_selected_objects('SEGMENT');

    let path = this.get_combined_path(selected_segments);

    d3_segment_g
      .append('path')
      .attr('id', 'temp_segment')
      .attr('class', 'segment_path')
      .attr('d', path)
      .attr('stroke-width', `${main_css.segment.line_weight}px`);
  }
  selection_filter(validation_opt: string[], remove_opt: any[]) {
    let objects_list;
    if (this.tool_type === 'MOVE' || this.tool_type === 'CLUSTER') {
      objects_list = this.selected_objects;
    } else if (this.tool_type === 'PASTE') {
      objects_list = this.copied_objects;
    }

    // Remove all opt out options
    if (remove_opt && remove_opt.length > 0) {
      for (let i = objects_list.length - 1; i > -1; i--) {
        let object = objects_list[i];
        let object_type = object.constructor.name.toUpperCase();
        let is_remove = remove_opt.find((type) => {
          return type === object_type;
        });
        if (is_remove) {
          this.unhighlight(object_type, object.id, 'LAYOUT');
          objects_list.splice(i, 1);
        }
      }
    }

    // Check and remove invalid objects
    if (validation_opt && validation_opt.length > 0) {
      let check_segment = false;
      let check_station = false;
      let check_buffer = false;
      let check_mtl = false;

      validation_opt.forEach((type) => {
        if (type === 'SEGMENT') {
          check_segment = true;
        } else if (type === 'STATION') {
          check_station = true;
        } else if (type === 'BUFFER') {
          check_buffer = true;
        } else if (type === 'MTL') {
          check_mtl = true;
        }
      });

      // Validate
      for (let i = objects_list.length - 1; i > -1; i--) {
        let target_object = objects_list[i];
        let object_type = target_object.constructor.name.toUpperCase();

        // If the target object we are trying to validate is a point, skip it
        if (object_type === 'POINT') {
          continue;
        }

        let is_valid = false;

        if (object_type === 'SEGMENT' && check_segment) {
          let has_point_from, has_point_to;
          for (let j = 0; j < objects_list.length; j++) {
            let search_object = objects_list[j];
            if (search_object.constructor.name.toUpperCase() === 'POINT') {
              let point_id = search_object.id;
              if (target_object.point_from.id === point_id) {
                has_point_from = true;
              } else if (target_object.point_to.id === point_id) {
                has_point_to = true;
              }
              if (has_point_from === true && has_point_to === true) {
                is_valid = true;
                break;
              }
            }
          }
        } else if (
          (object_type === 'STATION' && check_station) ||
          (object_type === 'BUFFER' && check_buffer) ||
          (object_type === 'MTL' && check_mtl)
        ) {
          for (let j = 0; j < objects_list.length; j++) {
            let search_object = objects_list[j];

            // Only check target object with point objects
            if (search_object.constructor.name.toUpperCase() === 'POINT') {
              let point_id = search_object.id;
              if (target_object.point_id === point_id) {
                is_valid = true;
                break;
              }
            } else {
              continue;
            }
          }
        }

        if (!is_valid) {
          this.unhighlight(object_type, target_object.id, 'LAYOUT');
          objects_list.splice(i, 1);
        }
      }
    }
  }

  get_default_size(width: any, height: any): IMapSize {
    return {
      min_x: 0,
      min_y: 0,
      max_x: width ? width : this.DEFAULTS.canvas_width,
      max_y: height ? height : this.DEFAULTS.canvas_height,
      width: width ? width : this.DEFAULTS.canvas_width,
      height: height ? height : this.DEFAULTS.canvas_height,
    };
  }
  calculate_size_from_extents(data: Dto.ITrackData): IMapSize {
    let min_x = 0;
    let min_y = 0;
    let max_x = 0;
    let max_y = 0;

    // find the extends of map data using the coordinates of points
    if (data.points && data.points.length > 0) {
      min_x = data.points[0].x;
      min_y = data.points[0].y;
      for (let i = 0; i < data.points.length; i++) {
        if (data.points[i].x < min_x) min_x = data.points[i].x;
        if (data.points[i].y < min_y) min_y = data.points[i].y;
        if (data.points[i].x > max_x) max_x = data.points[i].x;
        if (data.points[i].y > max_y) max_y = data.points[i].y;
      }
    }

    return {
      min_x: min_x,
      min_y: min_y,
      max_x: max_x,
      max_y: max_y,
      width: Math.abs(max_x - min_x),
      height: Math.abs(max_y - min_y),
    };
  }
  // @TODO move to data service
  // private convertExpectedPath(
  //   vehicle_paths: any[],
  //   segments: Segment[]
  // ): any[] {
  //   let paths = [];

  //   for (let expected_path of vehicle_paths) {
  //     let path: any = {};
  //     path.point_list = expected_path.path.split(',');
  //     path.path_segments = LayoutUtil.find_segment_within_points(
  //       path.point_list,
  //       segments
  //     );
  //     path.id = expected_path.id;
  //     paths.push(path);
  //   }
  //   return paths;
  // }

  init_hover_tag(target_id: any) {
    let hover_tag_dom = '<label id="hover_tag"></label>';
    this.$track_container.find(`#${target_id}`).parent().append(hover_tag_dom);
  }
  init_svg_groups() {
    if (this.geometric_container != undefined) {
      this.geometric_container.remove();
      this.geometric_container = undefined;
    }

    if (this.center_group != undefined) {
      this.center_group.remove();
      this.center_svg_x.remove();
      this.center_svg_y.remove();
      this.center_svg_text.remove();
      this.center_group = undefined;
      this.center_svg_x = undefined;
      this.center_svg_y = undefined;
      this.center_svg_text = undefined;
    }

    if (this.canvas_group != undefined) {
      this.canvas_group.remove();
      this.canvas_group = undefined;
    }

    if (this.grid_x != undefined) {
      this.grid_x.remove();
    }

    if (this.grid_y != undefined) {
      this.grid_y.remove();
    }

    if (this.scale_svg != undefined) {
      this.scale_svg.remove();
    }

    if (this.center_group != undefined) {
      this.center_group.remove();
    }

    if (this.overlap_display_svg != undefined) {
      this.overlap_display_svg.remove();
      this.overlap_display_svg = undefined;
    }
    if (this.overlap_display_panel_svg != undefined) {
      this.overlap_display_panel_svg.remove();
      this.overlap_display_panel_svg = undefined;
    }

    if (this.overlap_module_panel_svg != undefined) {
      this.overlap_module_panel_svg.remove();
      this.overlap_module_panel_svg = undefined;
    }

    if (this.overlap_module_svg != undefined) {
      this.overlap_module_svg.remove();
      this.overlap_module_svg = undefined;
    }

    if (this.directions_svg != undefined) {
      this.directions_svg.remove();
      this.directions_svg = undefined;
    }

    if (this.segments_svg != undefined) {
      this.segments_svg.remove();
      this.segments_svg = undefined;
    }

    if (this.semantic_container != undefined) {
      this.semantic_container.remove();
      this.semantic_container = undefined;
    }

    if (this.points_svg != undefined) {
      this.points_svg.remove();
      this.points_svg = undefined;
      // this.points_txt = undefined
    }

    if (this.stations_svg != undefined) {
      this.stations_svg.remove();
      this.stations_svg = undefined;
      this.stations_path = undefined;
      // this.stations_details = undefined
    }

    if (this.buffers_svg != undefined) {
      this.buffers_svg.remove();
      this.buffers_svg = undefined;
      this.buffers_path = undefined;
      // this.buffers_details = undefined
    }

    if (this.mtls_svg != undefined) {
      this.mtls_svg.remove();
      this.mtls_svg = undefined;
      this.mtls_path = undefined;
      // this.mtls_details = undefined
    }

    if (this.clusters_svg != undefined) {
      this.clusters_svg.remove();
      this.clusters_svg = undefined;
    }

    if (this.vehicle_svg != undefined) {
      this.vehicle_svg.remove();
      this.vehicle_svg = undefined;
    }

    if (this.selection_svg != undefined) {
      this.remove_selection_tool();
    }

    if (this.segment_draw_svg != undefined) {
      this.segment_draw_svg.remove();
      this.segment_draw_svg = undefined;
    }
  }
  // d3 events

  private initEvents() {
    // Refactor mouse event decision logic, 190329
    this.svg.on('click', () => {
      const doc = document as any;

      // Remove any HTML text selection when clicked on #layout_canvas
      if (window.getSelection) {
        window.getSelection().removeAllRanges();
      } else if (doc.selection) {
        doc.selection.empty();
      }

      // Get current mouse coord in respec to the this.svg rect not the full top layer this.svg
      let coord_array = d3.mouse(this.svg.node());

      if (
        this.mode !== 'EDITOR' ||
        (this.mode === 'EDITOR' && this.tool_type === 'POINTER')
      ) {
        if (d3.event.target.id === this.track_id) {
          this.init_selection(true);
        }
      } else if (this.mode === 'EDITOR') {
        // Get inverted coord
        let snap = this.modifier_key === this.KEY_NO_S2G ? false : true;
        let coord = this.calc_inverted_coord_with_screen(coord_array, snap);

        if (
          this.check_coord_in_viewport(coord.x, coord.y) ||
          d3.event.target.classList.contains('point_mask')
        ) {
          if (this.tool_type == 'POINT') {
            // POINT mode
            // Create point
            // Normally we go from data to pixels, but here we're doing pixels to data
            let point;

            // Get original coord
            let original_coord = this.calc_original_coord_from_inverted(
              coord,
              this.geometry.invert_factor_y
            );

            // Coornidate duplication check before create
            if (
              !LayoutUtil.check_duplicated_coord(
                this.layout_data.points,
                original_coord
              )
            ) {
              // Make point object
              point = new Point(
                {
                  id: LayoutUtil.create_new_id(this.layout_data.points),
                  logical_id: null,
                  physical_id: null,
                },
                LayoutUtil.create_coordinate(
                  { x: original_coord.x, y: original_coord.y },
                  this.geometry.invert_factor_y
                ),
                true,
                'N'
              );

              this.add_layout_object(point, null, true);

              // logger.log('create object : POINT')

              this.init_selection(true);
              // switch button status to cursor mode
              this.change_default_button(true);

              this.selected_objects.push(point);

              // Check if popup is open already
              // @TODO popup.side_panel
              // if (popup.side_panel) {
              //     // update popup
              //     display_side_panel_popup('POINT', point)
              // }
              // highilight new created object
              this.unhighlight(null, null, null);
              this.highlight(
                'POINT',
                point.id,
                main_css.point,
                'LAYOUT',
                'SELECT'
              );
            }
          } else if (this.tool_type === 'SEGMENT') {
            // SEGMENT mode
            // Create segment
            // Initiate segment start point

            // Check already started event
            if (!this.drag_coord.start) {
              // First click

              // Check if the user selected existing point
              if (d3.event.target.classList.contains('point_mask')) {
                // clicked on a point

                let point_id = parseInt(
                  d3.event.target.parentElement.id.match(/[0-9]/g).join('')
                );
                let point_coord = this.find_layout_object('POINT', point_id)
                  .inverted_coord;
                this.drag_coord.start = point_coord;
              } else {
                // Was not clicked on a point

                // Use snap to grid coordinate for creating new point
                this.drag_coord.start = coord;

                let original_coord = this.calc_original_coord_from_inverted(
                  this.drag_coord.start,
                  this.geometry.invert_factor_y
                );

                // Create point
                let point = new Point(
                  {
                    id: LayoutUtil.create_new_id(this.layout_data.points),
                    logical_id: null,
                    physical_id: null,
                  },
                  LayoutUtil.create_coordinate(
                    { x: original_coord.x, y: original_coord.y },
                    this.geometry.invert_factor_y
                  ),
                  true,
                  'N'
                );

                // add object
                this.add_layout_object(point, null, false);

                // add history to buffer
                this.manage_history_buffer(point, null);

                this.selected_objects.push(point);
              }

              // log_event.log('Segment create start')

              // Add SEGMENT Line DOM
              if (this.segment_draw_svg === undefined) {
                this.update_dom(
                  'SEGMENT_DRAW',
                  this.drag_coord.start,
                  null,
                  null,
                  'LAYOUT',
                  false
                );
              }
            } else {
              // Second click

              if (!d3.event.target.classList.contains('point_mask')) {
                let original_coord = this.calc_original_coord_from_inverted(
                  coord,
                  this.geometry.invert_factor_y
                );

                // Create point
                let point = new Point(
                  {
                    id: LayoutUtil.create_new_id(this.layout_data.points),
                    logical_id: null,
                    physical_id: null,
                  },
                  LayoutUtil.create_coordinate(
                    { x: original_coord.x, y: original_coord.y },
                    this.geometry.invert_factor_y
                  ),
                  true,
                  'N'
                );

                // add object
                this.add_layout_object(point, null, false);

                // add history to buffer
                this.manage_history_buffer(point, null);

                this.selected_objects.push(point);
              }

              // Check if the segment has both start and end point
              if (this.selected_objects.length === 2) {
                // Check if the second point is same as the first point
                let start_point = this.selected_objects[0];
                let end_point = this.selected_objects[1];

                if (
                  start_point.id !== end_point.id ||
                  start_point.constructor !== end_point.constructor
                ) {
                  this.drag_coord.end = coord;

                  // Create segment
                  let segment_id = LayoutUtil.create_new_id(
                    this.layout_data.segments
                  );
                  let candidates = LayoutUtil.find_segment_candidate(
                    segment_id,
                    start_point,
                    end_point,
                    this.layout_data.segments
                  );
                  let speed = LayoutUtil.get_segment_speed(
                    candidates[0].type,
                    this.SEGMENT_SPEEDS
                  );

                  const {
                    type,
                    location,
                    direction,
                    is_validate,
                  } = candidates[0];
                  const segment = new Segment(
                    {
                      id: segment_id,
                      physical_id: null,
                      logical_id: null,
                      type,
                      location,
                      direction,
                      candidates,
                      speed,
                      length: null,
                      travel_time: null,
                      is_validate,
                    },
                    'N', // updateState
                    start_point, // fromPoint
                    end_point // toPoint
                  );
                  segment.postCreation();
                  segment.create_segparts(this.geometry.invert_factor_y);
                  segment.set_path();

                  // logger.log(`segment #${segment.id} created : ${segment.segment_parts.map(d=>`${d.type}${d.location ? d.location:''} ${d.direction} `).toString()}`)

                  this.add_layout_object(segment, null, false);

                  // add history to buffer
                  this.manage_history_buffer(segment, 'ADD');

                  // Backup end poit to auto create next segment
                  let last_point = this.selected_objects[1];

                  this.init_selection(true);

                  // switch button status to cursor mode
                  this.change_default_button(false);

                  if (this.is_sticky_mode) {
                    // Restore last point
                    this.selected_objects.push(last_point);
                    this.update_dom(
                      'SEGMENT_DRAW',
                      last_point.inverted_coord,
                      null,
                      null,
                      'LAYOUT',
                      false
                    );
                    this.drag_coord.start = {
                      ...last_point.inverted_coord,
                    };
                  } else {
                    // set selected object to last created segment
                    this.selected_objects.push(segment);
                  }

                  // Find connected segments
                  let connected_segments_from = LayoutUtil.find_connected_segment(
                    segment.point_from,
                    this.layout_data.segments,
                    null
                  );
                  // Delete candidates
                  for (let i = 0; i < connected_segments_from.length; i++) {
                    let connected_segment = connected_segments_from[i];
                    if (connected_segment.id !== segment.id) {
                      connected_segment.candidates = [];
                    }
                  }
                  let connected_segments_to = LayoutUtil.find_connected_segment(
                    segment.point_to,
                    this.layout_data.segments,
                    null
                  );
                  // Delete candidates
                  for (let i = 0; i < connected_segments_to.length; i++) {
                    let connected_segment = connected_segments_to[i];
                    if (connected_segment.id !== segment.id) {
                      connected_segment.candidates = [];
                    }
                  }

                  // Check if popup is open already
                  // @TODO popup.side_panel
                  // if (popup.side_panel) {
                  //     // update popup
                  //     display_side_panel_popup('SEGMENT', segment)
                  // }
                  // highilight new created object
                  this.unhighlight(null, null, null);
                  this.highlight_segment(
                    segment,
                    main_css.general,
                    'SELECT',
                    'SMOOTH'
                  );
                }
              }

              this.hide_hover_tag();
            }
          } else if (this.tool_type === 'SELECT') {
            // SELECT mode
            // Create select area
            // Check already started event
            // logger.log('this.drag_coord.start: '+ this.drag_coord.start)
            if (!this.drag_coord.start) {
              // First click

              // if the modifier for extending selection is not
              // pressed, then start a new selection
              if (this.modifier_key !== this.KEY_EXTSEL) {
                this.init_selection(true);
              }
              // logger.log(`modifier=${this.modifier_key} objects=${this.selected_objects.length}`)

              // Reset side panel if not editing clusters
              // @TODO popup.side_panel
              // if (popup.side_panel) {
              //     display_side_panel_popup(null, null)
              // }

              this.drag_coord.start = coord;

              // Add selection DOM
              if (this.selection_svg === undefined) {
                this.update_dom(
                  'SELECT',
                  this.drag_coord.start,
                  null,
                  null,
                  'LAYOUT',
                  false
                );
              } else {
                // remove duplicated point
                this.selected_objects.splice(1, 1);
              }

              // log_event.log('Select start')
            } else {
              // Second click
              // let te0, te1
              // te0 = performance.now()

              if (this.drag_coord.start === 'SHIFT_CLICK') {
                this.drag_coord.start = coord;
              }

              this.drag_coord.end = coord;

              let extend_selection =
                this.modifier_key === this.KEY_EXTSEL ? true : false;

              // Unhighlight all objects
              if (extend_selection) {
                this.unhighlight(null, null, null, 'SELECT', 'INSTANT');
              }

              // Find objects
              if (this.drag_coord.start !== this.drag_coord.end) {
                let selected_points = [];
                let selected_stations = [];
                let selected_buffers = [];
                let selected_mtls = [];

                if (this.editing !== 'CLUSTER') {
                  selected_points = LayoutUtil.find_object_by_coord(
                    this.drag_coord.start,
                    this.drag_coord.end,
                    this.layout_data.points
                  );
                  selected_stations = LayoutUtil.find_object_by_coord(
                    this.drag_coord.start,
                    this.drag_coord.end,
                    this.layout_data.stations
                  );
                  selected_buffers = LayoutUtil.find_object_by_coord(
                    this.drag_coord.start,
                    this.drag_coord.end,
                    this.layout_data.buffers
                  );
                  selected_mtls = LayoutUtil.find_object_by_coord(
                    this.drag_coord.start,
                    this.drag_coord.end,
                    this.layout_data.mtls
                  );
                }

                let selected_segments = LayoutUtil.find_segment_by_coord(
                  this.drag_coord.start,
                  this.drag_coord.end,
                  this.layout_data.segments
                );

                // Add found objects to selected object
                this.set_selected_objects(
                  selected_points.concat(
                    selected_stations,
                    selected_buffers,
                    selected_mtls,
                    selected_segments
                  ),
                  extend_selection,
                  false
                );

                // Remove unconnected segment
                if (extend_selection && this.editing !== 'CLUSTER') {
                  this.selected_objects = LayoutUtil.remove_unconnected_segment(
                    this.selected_objects
                  );
                }

                // log_event.log(`Select finish, point : ${selected_points.length}ea, segment : ${selected_segments.length}ea, station : ${selected_stations.length}ea, buffer : ${selected_buffers.length}ea`)
              } else if (
                this.drag_coord.start === this.drag_coord.end &&
                extend_selection
              ) {
                let $element = $(event.target).parents('[g_type=main]');
                let group_type = $element[0].classList;

                let selected_object = null;
                if (group_type.contains('segment')) {
                  selected_object = this.find_segment_at_coord(
                    this.drag_coord.start
                  );
                } else {
                  if (this.editing !== 'CLUSTER') {
                    selected_object = this.find_layout_object(
                      group_type.value.toUpperCase(),
                      $element[0].id.match(/[0-9.-]/g).join('')
                    );
                  }
                }

                if (selected_object)
                  this.set_selected_objects(
                    selected_object,
                    extend_selection,
                    false
                  );

                // log_event.log('Selected Objects: ', this.selected_objects)
              }

              this.highlight_objects(
                this.selected_objects,
                'LAYOUT',
                'SELECT',
                'SMOOTH'
              );

              // te1 = performance.now()
              // log_performance.log('Select object time : ' + (te1 - te0) + ' ms')

              this.drag_coord = {};

              this.init_selection(false);

              // switch button status to cursor mode
              // change_default_button(false)
              // }

              // If multiple objects are selected, update the popup to show null
              // @TODO popup.side_panel
              // if (this.selected_objects.length > 1 && popup.side_panel) {
              //     this.display_side_panel_popup(this.tool_type, null)
              // }
            }
          }
        }
      }
    });

    $(window).on('keydown keyup', (event) => {
      if (event.type === 'keydown') {
        // @TODO event.keyCode 대체
        this.modifier_key = event.keyCode;
        if (event.keyCode === this.KEY_OVERLAP) {
          // open overlap display
          if (
            !this.$track_container
              .find('#btn_overlap_display')
              .hasClass('active')
          ) {
            // check if already toggled on
            this.$track_container
              .find('#btn_overlap_display')
              .addClass('active');
            if (this.overlap_display_objects.length < 2) {
              // Show the overlap for currently hovering object
              this.check_overlap_and_display(
                this.currently_hovering_object.constructor.name.toUpperCase(),
                this.currently_hovering_object.id,
                this.overlap_display_objects,
                'OVERLAP'
              );
            }
          }
        }
      }
      if (event.type === 'keyup') {
        this.modifier_key = null;
        if (event.keyCode === this.KEY_OVERLAP) {
          // close overlap display
          this.$track_container
            .find('#btn_overlap_display')
            .removeClass('active');
          this.hide_overlap_display('OVERLAP', this.overlap_display_objects);
        }
        if (event.keyCode === this.KEY_NO_S2G) {
          // no snap-to-grid, no need for coordinate hover tag
          this.hide_hover_tag();
        }
      }
    });

    // Mouse drag event
    this.svg.on('mousemove', () => {
      if (this.mode == 'EDITOR') {
        let snap_to_grid = this.modifier_key === this.KEY_NO_S2G ? false : true;
        // @TODO d3.mouse(this)
        let coord = this.calc_inverted_coord_with_screen(
          d3.mouse(this.svg.node()),
          snap_to_grid
        );
        this.drag_coord.current = coord;

        // Only update drawing tool if coord in viewport
        if (snap_to_grid && !this.check_coord_in_viewport(coord.x, coord.y)) {
          return;
        }

        // Update tool dom
        let show_coord = false;
        if (this.tool_type === 'POINT') {
          show_coord = true;
        } else if (this.tool_type === 'SEGMENT') {
          show_coord = true;
          if (this.drag_coord.start && !this.drag_coord.end) {
            // update if the coord is in viewport
            this.update_tool_dom(
              'SEGMENT_DRAW',
              this.segment_draw_svg,
              this.drag_coord
            );
          }
        } else if (this.tool_type === 'SELECT') {
          show_coord = true;
          if (this.drag_coord.start && !this.drag_coord.end) {
            let width = this.drag_coord.current.x - this.drag_coord.start.x;
            let height = this.drag_coord.current.y - this.drag_coord.start.y;

            let size: any = {};
            size.width = width;
            size.height = height;

            this.update_tool_dom('SELECT', this.selection_svg, {
              size,
            });
          }
        }

        if (!snap_to_grid && show_coord) {
          let mouse_coord = {
            x: d3.mouse(this.svg.node())[0],
            y: d3.mouse(this.svg.node())[1],
          };
          let current_coord = this.calc_original_coord_with_screen(
            d3.mouse(this.svg.node()),
            this.geometry.invert_factor_y
          );
          let custom_text = `${parseInt(current_coord.x)}, ${parseInt(
            current_coord.y
          )}`;
          this.show_hover_tag(null, null, custom_text, mouse_coord);
        } else {
          this.hide_hover_tag();
        }
      }
    });
  }
  manage_history_buffer(layout_objects: any, transfer_type: any) {
    if (layout_objects) {
      let input_objects;
      let result;

      // Convert object to array
      if (!Array.isArray(layout_objects)) {
        input_objects = [layout_objects];
      }

      result = this.history_buffer.concat(input_objects);
      this.history_buffer = result;

      // log_event.log(`group event added to history buffer : buffer size - ${this.history_buffer.length}`)
    }

    if (transfer_type) {
      // log_event.log(`history buffer transferred to history stack : type - ${transfer_type} size - ${this.history_buffer.length}`)

      // transfer buffer to stack
      this.manage_history('PUSH', transfer_type, this.history_buffer);

      this.history_buffer = [];
    }
  }
  calc_inverted_coord_with_screen(
    screen_coord: [number, number],
    is_apply_snap: boolean
  ) {
    let current_zoom = this.getZoom(MapTypes.MAIN);
    let coord: any = {};

    (coord.x = (screen_coord[0] - current_zoom.x) / current_zoom.k),
      (coord.y = (screen_coord[1] - current_zoom.y) / current_zoom.k);

    // Apply snap
    if (is_apply_snap) {
      coord = LayoutUtil.calc_snap_coord(coord, this.snap_to_grid_distance);
    }

    return coord;
  }
  private zoomed(): any {
    let x = d3.event.transform.x;
    let y = d3.event.transform.y;
    let k = d3.event.transform.k;

    // Store latest zoom value
    this.setZoom(MapTypes.MAIN, { x, y, k });

    // Get latest zoom value
    let current_transform = this.getZoom(MapTypes.MAIN) as any;

    // Calculate and set viewing area
    this.calculate_n_set_viewbox(current_transform);

    let view_box = this.get_viewbox();

    // Adaptive grid rendering
    if (current_transform) {
      this.grid_adaptive_rendering(current_transform);
    }

    // Get scale sizes
    let scale = this.find_scale_size();

    // Apply scale sizes
    this.scale_rendering(scale);

    // Calculate relative zoom level
    let zoom_level = this.calculate_zoom_level();

    if (this.mode === 'EDITOR' && this.center_group) {
      this.transform_center_axis(current_transform);
    }

    // Render objects ===================================================//
    // segments_svg.attr('transform', `translate(${current_transform.x}, ${current_transform.y})scale(${current_transform.k})`);

    if (
      this.overlap_display_objects.length > 1 &&
      this.overlap_display_panel_svg
    ) {
      this.overlap_display_panel_svg.attr(
        'transform',
        `translate(${current_transform.apply([
          this.overlap_display_panel_svg.attr('x'),
          this.overlap_display_panel_svg.attr('y'),
        ])})rotate(${-this.map_rotation})`
      );
    }
    if (
      this.layout_data.segments !== undefined &&
      this.layout_data.segments.length > 0
    ) {
      let segments = this.append_showing_polygons('SEGMENT', view_box);
      this.segments_adaptive_rendering(
        current_transform,
        main_css.general,
        view_box,
        false,
        segments
      );
      this.directions_adaptive_rendering(
        zoom_level,
        current_transform,
        main_css.segment,
        view_box,
        false,
        segments
      );
    }
    if (
      this.layout_data.points !== undefined &&
      this.layout_data.points.length > 0
    ) {
      this.point_adaptive_rendering(
        zoom_level,
        current_transform,
        main_css.point,
        view_box
      );
    }
    if (
      this.layout_data.stations !== undefined &&
      this.layout_data.stations.length > 0
    ) {
      this.station_adaptive_rendering(
        zoom_level,
        current_transform,
        main_css.station,
        view_box
      );
    }
    if (
      this.layout_data.buffers !== undefined &&
      this.layout_data.buffers.length > 0
    ) {
      this.buffer_adaptive_rendering(
        zoom_level,
        current_transform,
        main_css.buffer,
        view_box
      );
    }
    if (
      this.layout_data.mtls !== undefined &&
      this.layout_data.mtls.length > 0
    ) {
      this.mtl_adaptive_rendering(
        zoom_level,
        current_transform,
        main_css.mtl,
        view_box
      );
    }
    if (
      this.layout_data.clusters !== undefined &&
      this.layout_data.clusters.length > 0
    ) {
      this.cluster_adaptive_rendering(
        zoom_level,
        current_transform,
        main_css.cluster,
        view_box
      );
    }
    if (
      (this.mode === 'VIEWER' ||
        this.mode === 'PLAYBACK' ||
        this.mode === 'PUBLIC') &&
      this.vehicles !== undefined &&
      this.vehicles.length > 0
    ) {
      this.vehicle_adaptive_rendering(main_css.vehicle, view_box);
    }
    if (this.geometry.minimap_size !== undefined && this.minimap_svg) {
      this.mini_zoomed_handler({
        x: current_transform.x,
        y: current_transform.y,
        k: current_transform.k,
      });
    }
    if (this.mode === 'EDITOR' && this.segment_draw_svg) {
      this.segment_draw_svg_adaptive_rendering(current_transform);
    }
    if (this.mode === 'EDITOR' && this.selection_svg) {
      this.selection_svg_adaptive_rendering(current_transform);
    }
    if (this.mode === 'EDITOR' && this.selection_box_svg) {
      this.selection_box_svg.attr(
        'transform',
        `translate(${current_transform.x}, ${current_transform.y})scale(${current_transform.k})`
      );
    }

    if (this.currently_hovering_object.id) {
      this.highlight_objects(
        this.currently_hovering_object,
        'LAYOUT',
        'HOVER',
        'INSTANT'
      );
    }

    this.highlight_objects(
      this.selected_objects,
      'LAYOUT',
      'SELECT',
      'INSTANT'
    );

    if (this.mode === 'MINIMAL') {
      this.highlight_objects(
        this.get_candidate_objects(),
        'LAYOUT',
        'CANDIDATE',
        'INSTANT'
      );
    }
  }
  get_candidate_objects(): any {
    return this.search_candidate_objects;
  }
  highlight_objects(
    layout_objects: any,
    group_type: string,
    highlight_type: string,
    operation_type: string
  ) {
    // Convert object to array
    if (!Array.isArray(layout_objects)) {
      layout_objects = [layout_objects];
    }

    let segments_to_highlight = [];

    // Highlight objects
    for (let i = 0; i < layout_objects.length; i++) {
      let object = layout_objects[i];
      let object_type = object.constructor.name.toUpperCase();
      if (object_type === 'SEGMENT') {
        segments_to_highlight.push(layout_objects[i]);
      } else {
        this.highlight(
          object_type,
          object.id,
          main_css[object_type.toLowerCase()],
          group_type,
          highlight_type,
          operation_type
        );
        if (group_type === 'OVERLAP_MODULE') {
          this.highlight(
            object_type,
            object.id,
            main_css[object_type.toLowerCase()],
            'LAYOUT',
            highlight_type,
            operation_type
          );
        }
      }
    }

    if (segments_to_highlight.length > 0) {
      this.highlight_segment(
        segments_to_highlight,
        main_css.general,
        highlight_type,
        operation_type
      );
    }
  }
  highlight(
    object_type: any,
    object_id: any,
    object_css: any,
    group_type: string,
    highlight_type: string,
    operation_type?: string
  ) {
    // find layout object
    let stroke_width: string | number = '0px';
    let is_highlight_add = false;
    let layout_object = this.find_layout_object(object_type, object_id);

    if (layout_object) {
      // Get the current element's parent
      let target_dom = this.get_dom(object_type, object_id, group_type);

      let detail_highlight =
        group_type === 'OVERLAP' ||
        group_type === 'OVERLAP_MODULE' ||
        group_type === 'UNASSIGNED_MODULE'
          ? true
          : false;

      let zoom_level = this.calculate_zoom_level();

      let offset_transform;
      if (layout_object.direction_offset) {
        if (detail_highlight) {
          offset_transform = '';
        } else {
          let offset_multiplier = (1 / 3) * (zoom_level > 1 ? zoom_level : 0);
          let offset = {
            x: layout_object.direction_offset.x * offset_multiplier,
            y: layout_object.direction_offset.y * offset_multiplier,
          };
          offset_transform = `translate(${offset.x}, ${offset.y})rotate(${-this
            .map_rotation})scale(${this.location_scale.scale})`;
        }
      }

      let selective_level = this.option.selective_lvl_display;

      let css_class;
      let highlight_color;
      if (highlight_type === 'HOVER') {
        css_class = 'hover';
        highlight_color = main_css.general.highlight_hover;
        if (target_dom.selectAll('.hover').nodes().length === 0) {
          is_highlight_add = true;
        }
      } else if (highlight_type === 'SELECT') {
        css_class = 'select';
        highlight_color = main_css.general.highlight_select;
        if (target_dom.select('.select').node() === null) {
          target_dom.select('.hover').remove();
          is_highlight_add = true;
        }
      } else if (highlight_type === 'CANDIDATE') {
        css_class = 'candidate';
        highlight_color = main_css.general.highlight_select;
        if (target_dom.select('.candidate').node() === null) {
          is_highlight_add = true;
        }
      }

      // Check already highlighted
      if (is_highlight_add) {
        // Create highlight doms
        if (object_type === 'POINT') {
          target_dom
            .append('circle')
            .attr('class', css_class)
            .attr('r', object_css.radius)
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('fill', 'none')
            .attr('stroke', highlight_color)
            .attr('stroke-width', stroke_width)
            .lower();
        } else if (object_type === 'STATION') {
          if (detail_highlight) zoom_level = selective_level.station_det;
          if (zoom_level >= selective_level.station_sim) {
            if (zoom_level >= selective_level.station_det) {
              // LVL 3
              target_dom
                .append('path')
                .attr('class', css_class)
                .attr('fill', 'none')
                .attr('d', object_css.icon_level3)
                .attr('stroke', highlight_color)
                .attr('stroke-width', stroke_width)
                .attr('transform', offset_transform)
                .lower();
            } else {
              // LVL 2
              target_dom
                .append('path')
                .attr('class', css_class)
                .attr('d', object_css.icon_level2)
                .attr('fill', 'none')
                .attr('stroke', highlight_color)
                .attr('stroke-width', stroke_width)
                .attr('transform', offset_transform)
                .lower();
            }
          } else {
            // LVL 1
            target_dom
              .append('path')
              .attr('class', css_class)
              .attr('d', object_css.icon_level1)
              .attr('fill', 'none')
              .attr('stroke', highlight_color)
              .attr('stroke-width', stroke_width)
              .attr('transform', offset_transform)
              .lower();
          }
        } else if (object_type === 'BUFFER') {
          if (detail_highlight) zoom_level = selective_level.buffer_det;
          if (zoom_level >= selective_level.buffer_sim) {
            if (zoom_level >= selective_level.buffer_det) {
              // LVL 3
              target_dom
                .append('path')
                .attr('class', css_class)
                .attr('fill', 'none')
                .attr('d', object_css.icon_level3)
                .attr('stroke', highlight_color)
                .attr('stroke-width', stroke_width)
                .attr('transform', offset_transform)
                .lower();
            } else {
              // LVL 2
              target_dom
                .append('path')
                .attr('class', css_class)
                .attr('d', object_css.icon_level2)
                .attr('fill', 'none')
                .attr('stroke', highlight_color)
                .attr('stroke-width', stroke_width)
                .attr('transform', offset_transform)
                .lower();
            }
          } else {
            // LVL 1
            target_dom
              .append('path')
              .attr('class', css_class)
              .attr('d', object_css.icon_level1)
              .attr('fill', 'none')
              .attr('stroke', highlight_color)
              .attr('stroke-width', stroke_width)
              .attr('transform', offset_transform)
              .lower();
          }
        } else if (object_type === 'MTL') {
          if (detail_highlight) zoom_level = selective_level.mtl_det;
          if (zoom_level >= selective_level.mtl_sim) {
            if (zoom_level >= selective_level.mtl_det) {
              // LVL 3
              target_dom
                .append('path')
                .attr('class', css_class)
                .attr('fill', 'none')
                .attr('d', object_css.icon_level3)
                .attr('stroke', highlight_color)
                .attr('stroke-width', stroke_width)
                .lower();
            } else {
              // LVL 2
              target_dom
                .append('path')
                .attr('class', css_class)
                .attr('d', object_css.icon_level2)
                .attr('fill', 'none')
                .attr('stroke', highlight_color)
                .attr('stroke-width', stroke_width)
                .lower();
            }
          } else {
            // LVL 1
            target_dom
              .append('path')
              .attr('class', css_class)
              .attr('d', object_css.icon_level1)
              .attr('fill', 'none')
              .attr('stroke', highlight_color)
              .attr('stroke-width', stroke_width)
              .lower();
          }
        } else if (object_type === 'CLUSTER') {
          target_dom
            .append('path')
            .attr('class', css_class)
            .attr('d', function () {
              return layout_object.path;
            })
            .attr('stroke', highlight_color)
            .attr('stroke-width', stroke_width)
            .lower();
        } else if (object_type === 'VEHICLE') {
          if (layout_object.type === 'CLEANING') {
            target_dom
              .append('rect')
              .attr('class', css_class)
              .attr('width', object_css.radius * 2)
              .attr('height', object_css.radius * 2)
              .attr('x', -object_css.radius)
              .attr('y', -object_css.radius)
              .attr('fill', 'none')
              .attr('stroke', highlight_color)
              .attr('stroke-width', stroke_width)
              .attr('transform', 'rotate(45)')
              .lower();
          } else {
            target_dom
              .append('circle')
              .attr('class', css_class)
              .attr('r', object_css.radius + 3)
              .attr('cx', 0)
              .attr('cy', 0)
              .attr('fill', 'none')
              .attr('stroke', highlight_color)
              .attr('stroke-width', stroke_width)
              .lower();
          }
        }

        // Lower the group element if exist
        if (target_dom.select('.group_svg').nodes().length > 0) {
          target_dom.select('.group_svg').lower();
        }

        // Highlight dom
        if (
          (zoom_level === 3 && object_type === 'STATION') ||
          (object_type === 'VEHICLE' && layout_object.type === 'CLEANING')
        ) {
          // if vehicle, highlight with thicker weight
          stroke_width = main_css.general.highlight_weight_thick;
        } else if (zoom_level === 3 && object_type === 'MTL') {
          // MTL only on level 3
          stroke_width = main_css.general.highlight_weight_mid;
        } else if (object_type === 'CLUSTER') {
          // MTL only on level 3
          stroke_width = main_css.general.highlight_weight_mid;
        } else {
          // All other doms should be highlighed thinner thatn vehicle.
          stroke_width = main_css.general.highlight_weight_thin;
        }

        // Highlight animation
        if (operation_type === 'INSTANT') {
          target_dom.select(`.${css_class}`).attr('stroke-width', stroke_width);
        } else {
          target_dom
            .select(`.${css_class}`)
            .transition()
            .duration(200)
            .attr('stroke-width', stroke_width);
        }

        if (object_type === 'VEHICLE' && group_type === 'LAYOUT') {
          target_dom
            .select(`.${css_class}`)
            .attr(
              'transform',
              `rotate(${-this.map_rotation + 45})scale(${
                this.vehicle_scale.scale
              })`
            );
        }

        // Lower candidate at all times
        target_dom.select(`.candidate`).lower();
      } else {
        // Update highlight
        if (
          object_type === 'STATION' ||
          object_type === 'BUFFER' ||
          object_type === 'MTL'
        ) {
          let object_type_lowercase = object_type.toLowerCase();
          if (detail_highlight)
            zoom_level = selective_level[`${object_type_lowercase}_det`];
          let path_definition =
            zoom_level > selective_level[`${object_type_lowercase}_min`]
              ? zoom_level > selective_level[`${object_type_lowercase}_sim`]
                ? object_css.icon_level3
                : object_css.icon_level2
              : object_css.icon_level1;

          if (object_type === 'STATION') {
            let highlight_weight =
              zoom_level > selective_level[`${object_type_lowercase}_sim`]
                ? main_css.general.highlight_weight_thick
                : main_css.general.highlight_weight_thin;

            let highlighed_el = target_dom.select(`.${css_class}`);
            if (
              highlighed_el.node() &&
              highlighed_el.attr('d') !== path_definition
            ) {
              target_dom
                .select(`.${css_class}`)
                .attr('d', path_definition)
                .attr('stroke-width', highlight_weight)
                .lower();
            }

            // Apply transform to highlight for station direction offset
            target_dom
              .selectAll(`.${css_class}`)
              .attr('transform', offset_transform);
          } else if (object_type === 'BUFFER') {
            let highlight_weight = main_css.general.highlight_weight_thin;

            let highlighed_el = target_dom.select(`.${css_class}`);
            if (
              highlighed_el.node() &&
              highlighed_el.attr('d') !== path_definition
            ) {
              target_dom
                .select(`.${css_class}`)
                .attr('d', path_definition)
                .attr('stroke-width', highlight_weight)
                .lower();
            }

            // Apply transform to highlight for station direction offset
            target_dom
              .selectAll(`.${css_class}`)
              .attr('transform', offset_transform);
          } else if (object_type === 'MTL') {
            let highlight_weight =
              zoom_level > selective_level[`${object_type_lowercase}_sim`]
                ? main_css.general.highlight_weight_mid
                : main_css.general.highlight_weight_thin;

            let highlighed_el = target_dom.select(`.${css_class}`);
            if (
              highlighed_el.node() &&
              highlighed_el.attr('d') !== path_definition
            ) {
              target_dom
                .select(`.${css_class}`)
                .attr('d', path_definition)
                .attr('stroke-width', highlight_weight)
                .lower();
            }
          }
        }
      }
    }
  }
  get_dom(object_type: any, object_id?: any, group_type?: string) {
    let target_dom;

    // Select layout dom object
    if (
      group_type == null ||
      group_type == undefined ||
      group_type == 'LAYOUT'
    ) {
      if (object_type === 'SEGMENT') {
        target_dom = this.get_svg_class(object_type).select('.segment');
      } else {
        target_dom = this.get_svg_class(object_type).select(`#id_${object_id}`);
      }
    } else if (group_type === 'OVERLAP') {
      target_dom = this.get_svg_class('OVERLAP_DISPLAY').select(
        `.${object_type.toLowerCase()}_overlap#id_${object_id}`
      );
    } else if (group_type === 'OVERLAP_MODULE') {
      target_dom = this.get_svg_class(group_type).select(
        `.${object_type.toLowerCase()}_panel_overlap#id_${object_id}`
      );
    } else if (group_type === 'UNASSIGNED_MODULE') {
      target_dom = this.get_svg_class(group_type).select(
        `.${object_type.toLowerCase()}_panel_unassigned#id_${object_id}`
      );
    }

    return target_dom;
  }
  find_layout_object(
    object_type: any,
    object_id: any,
    track?: any,
    vehicle_data?: any
  ) {
    return this.dataSvc.find_layout_object(
      object_type,
      object_id,
      track,
      vehicle_data
    );
  }
  get_layout_objects(object_type: any) {
    return this.dataSvc.get_layout_objects(object_type);
  }

  unhighlight(
    object_type,
    object_id,
    group_type?,
    highlight_type?,
    operation_type?
  ) {
    let target_elements;

    let selector;

    if (highlight_type === 'HOVER') {
      selector = '.hover';
    } else if (highlight_type === 'CANDIDATE') {
      selector = '.candidate';
    } else if (highlight_type === 'SELECT') {
      selector = '.select';
    } else {
      selector = '.hover, .select';
    }

    if (object_type !== null && object_id !== null) {
      // Get the current element's parent
      let target_dom = this.get_dom(object_type, object_id, group_type);

      if (target_dom !== undefined) {
        target_elements = target_dom.selectAll(selector);
      }
    } else {
      target_elements = this.d3_track.selectAll(selector);
    }

    if (target_elements && target_elements.nodes().length > 0) {
      if (operation_type === 'INSTANT') {
        target_elements.remove();
      } else {
        const that = this;
        target_elements
          .transition()
          .duration(200)
          .attr('stroke-width', 0)
          .on('end', function (e) {
            that.$track_container.find(this).remove();
          });
      }
    }
  }

  highlight_segment(segments, css, highlight_type, operation_type) {
    if (!Array.isArray(segments)) {
      segments = [segments];
    }

    // find layout object
    let stroke_width = '0px';
    let is_highlight_add = false;

    // Get the current element's parent
    let target_dom = this.get_dom('SEGMENT', null, 'LAYOUT');

    let css_class;
    let highlight_color;
    if (highlight_type === 'HOVER') {
      css_class = 'hover';
      highlight_color = css.highlight_hover;
      if (target_dom.selectAll('.hover').nodes().length === 0) {
        is_highlight_add = true;
      }
    } else if (highlight_type === 'SELECT') {
      css_class = 'select';
      highlight_color = css.highlight_select;
      if (target_dom.select('.select').node() === null) {
        target_dom.select('.hover').remove();
        is_highlight_add = true;
      }
    } else if (highlight_type === 'CANDIDATE') {
      css_class = 'candidate';
      highlight_color = css.highlight_select;
      if (target_dom.select('.candidate').node() === null) {
        is_highlight_add = true;
      }
    }

    let path_definition = this.get_combined_path(segments);

    // Check already highlighted
    if (is_highlight_add) {
      // Create highlight doms
      target_dom
        .append('path')
        .attr('class', css_class)
        .attr('d', path_definition)
        .attr('stroke', highlight_color)
        .attr('stroke-width', stroke_width)
        .lower();

      // Highlight animation
      if (operation_type === 'INSTANT') {
        target_dom
          .select(`.${css_class}`)
          .attr('stroke-width', css.highlight_weight_thin);
      } else {
        target_dom
          .select(`.${css_class}`)
          .transition()
          .duration(200)
          .attr('stroke-width', css.highlight_weight_thin);
      }

      // Lower candidate at all times
      if (highlight_type === 'CANDIDATE')
        target_dom.select(`.candidate`).lower();
    } else {
      // Update highlight
      if (path_definition != target_dom.select(`.${css_class}`).attr('d')) {
        target_dom
          .select(`.${css_class}`)
          .attr('d', path_definition)
          .attr('stroke-width', css.highlight_weight_thin)
          .lower();
      }
    }
  }
  get_combined_path(segments: any) {
    if (!Array.isArray(segments)) {
      segments = [segments];
    }

    let path = '';
    if (segments.length > 0) {
      for (let [i, segment] of segments.entries()) {
        path += segment.path;
        if (i !== segments.length - 1) {
          path += ' ';
        }
      }
    }

    return path;
  }
  private selection_svg_adaptive_rendering(current_transform: any) {
    if (this.selection_svg && d3.event.sourceEvent) {
      let event = d3.event.sourceEvent;
      let coord = {
        x: +this.selection_svg.attr('x'),
        y: +this.selection_svg.attr('y'),
        width: +this.selection_svg.attr('width'),
        height: +this.selection_svg.attr('height'),
        fab_x: +this.selection_svg.attr('fab_x'),
        fab_y: +this.selection_svg.attr('fab_y'),
      };

      if (event.type === 'mousemove') {
        //Rendering from mouse move event
        this.selection_svg
          .attr('x', coord.x + event.movementX)
          .attr('y', coord.y + event.movementY);
      } else if (event.type === 'wheel') {
        //Rendering from wheel event
        let mouse_x =
            (event.layerX - current_transform.x) / current_transform.k,
          mouse_y = (event.layerY - current_transform.y) / current_transform.k,
          x,
          y,
          trans_x = 0,
          trans_y = 0,
          width,
          height;

        x = current_transform.x + coord.fab_x * current_transform.k;
        y = current_transform.y + coord.fab_y * current_transform.k;
        width = (coord.fab_x - mouse_x) * current_transform.k;
        height = (coord.fab_y - mouse_y) * current_transform.k;

        if (mouse_x < coord.fab_x) {
          // if the selection box is negative coordinates in x
          trans_x = -width;
        }
        if (mouse_y < coord.fab_y) {
          // if the selection box is negative coordinates in y
          trans_y = -height;
        }
        this.selection_svg
          .attr('x', x)
          .attr('y', y)
          .attr('width', Math.abs(width))
          .attr('height', Math.abs(height))
          .attr('transform', `translate(${trans_x}, ${trans_y})`);
      }
    }
  }
  segment_draw_svg_adaptive_rendering(current_transform: any) {
    if (this.segment_draw_svg && d3.event.sourceEvent) {
      if (
        this.drag_coord.current &&
        this.check_coord_in_viewport(
          this.drag_coord.current.x,
          this.drag_coord.current.y
        )
      ) {
        if (this.segment_draw_svg.style('display') != '') {
          this.segment_draw_svg.style('display', '');
        }
        this.update_tool_dom(
          'SEGMENT_DRAW',
          this.segment_draw_svg,
          this.drag_coord
        );
      } else {
        if (this.segment_draw_svg.style('display') != 'none') {
          this.segment_draw_svg.style('display', 'none');
        }
      }
    }
  }
  update_tool_dom(object_type: string, parent_dom: any, update_object: any) {
    if (!parent_dom) {
      return;
    }
    if (object_type === 'SELECT') {
      let current_zoom = this.getZoom(MapTypes.MAIN);
      if (update_object.hasOwnProperty('coord')) {
        parent_dom.attr(
          'x',
          update_object.coord.x * current_zoom.k + current_zoom.x
        );
        parent_dom.attr(
          'y',
          update_object.coord.y * current_zoom.k + current_zoom.y
        );
        parent_dom.attr('start_x', update_object.coord.x);
        parent_dom.attr('start_y', update_object.coord.y);
      }

      if (update_object.hasOwnProperty('size')) {
        parent_dom.attr(
          'width',
          Math.abs(update_object.size.width) * current_zoom.k
        );
        parent_dom.attr(
          'height',
          Math.abs(update_object.size.height) * current_zoom.k
        );

        if (update_object.size.width < 0 || update_object.size.height < 0) {
          let trans_x = 0;
          let trans_y = 0;

          if (update_object.size.width < 0) {
            trans_x = update_object.size.width;
          }
          if (update_object.size.height < 0) {
            trans_y = update_object.size.height;
          }

          parent_dom.attr(
            'transform',
            `translate(${trans_x * current_zoom.k},${trans_y * current_zoom.k})`
          );
        } else {
          parent_dom.attr('transform', null);
        }
      }
    } else if (object_type === 'SEGMENT_DRAW') {
      let current_zoom = this.getZoom(MapTypes.MAIN);
      if (update_object.hasOwnProperty('start')) {
        parent_dom.attr(
          'x1',
          update_object.start.x * current_zoom.k + current_zoom.x
        );
        parent_dom.attr(
          'y1',
          update_object.start.y * current_zoom.k + current_zoom.y
        );
      }
      if (update_object.hasOwnProperty('current')) {
        if (parent_dom.style('display') != '') {
          parent_dom.style('display', '');
        }
        parent_dom.attr(
          'x2',
          update_object.current.x * current_zoom.k + current_zoom.x
        );
        parent_dom.attr(
          'y2',
          update_object.current.y * current_zoom.k + current_zoom.y
        );
      }
    }
  }
  check_coord_in_viewport(x: number, y: number) {
    let is_in_area = false;

    if (this.map_rotation > 0) {
      is_in_area = this.is_in_polygon([x, y], this.get_rotated_viewbox());
    } else {
      let view_box = this.get_viewbox();

      if (
        x > view_box.x_from &&
        x < view_box.x_to &&
        y > view_box.y_from &&
        y < view_box.y_to
      ) {
        is_in_area = true;
      }
    }

    return is_in_area;
  }
  // Vehicle Zoom
  vehicle_adaptive_rendering(
    css_setting: any,
    view_box: any,
    is_update_render?: boolean,
    update_list?: any
  ) {
    let vehicles_display = this.append_showing_vehicles(
      view_box ? view_box : this.get_viewbox()
    );
    this.update_vehicle_dom(
      vehicles_display,
      css_setting,
      null,
      'LAYOUT',
      !is_update_render,
      update_list
    );
  }
  update_vehicle_dom(
    data: any,
    dom_css: any,
    zoom_level: number,
    group_type: string,
    is_zoom_only: boolean,
    updated?: any
  ) {
    let show_overlap = false;
    let current_zoom = this.getZoom(MapTypes.MAIN) as any;
    let overlap_element;
    let overlap_objects_list;
    let overlap_class_string;
    let group_colors;
    let object_type = 'VEHICLE';

    if (!zoom_level) {
      zoom_level = this.calculate_zoom_level();
    }

    if (group_type === 'OVERLAP') {
      show_overlap = true;
      overlap_element = this.overlap_display_panel_svg;
      overlap_objects_list = this.overlap_display_objects;
      overlap_class_string = 'overlap';
    } else if (group_type === 'OVERLAP_MODULE') {
      show_overlap = true;
      overlap_element = this.overlap_module_svg;
      overlap_objects_list = this.overlap_module_objects;
      overlap_class_string = 'panel_overlap';
    } else if (group_type === 'UNASSIGNED_MODULE') {
      show_overlap = true;
      overlap_element = this.unassigned_module_svg;
      overlap_objects_list = this.unassigned_module_objects;
      overlap_class_string = 'panel_unassigned';
    } else if (group_type === 'LAYOUT' || group_type === null) {
      overlap_objects_list = [];
    }

    // populate group color object if groups are on
    // if (this.show_groups) {
    if (this.preferences.toggles.groups) {
      group_colors = {}; // {group_id : color}
      for (let group of this.layout_data.groups) {
        group_colors[group.id] = ColorPalette.get_color(group.color);
      }
    }

    if (show_overlap) {
      // Add single object
      if (
        group_type === 'UNASSIGNED_MODULE' ||
        overlap_objects_list.length > 0
      ) {
        overlap_element = overlap_element
          .append('g')
          .attr('class', `vehicle_${overlap_class_string}`)
          .attr('id', `id_${data.id}`)
          .attr('x', 0)
          .attr('y', 0)
          .attr('transform', `translate(0, 0)`);

        this.append_dom_subpart(
          object_type,
          overlap_element,
          data,
          dom_css,
          zoom_level,
          group_type,
          group_colors
        );
      }
    } else {
      // load bulk objects
      this.vehicle_svg = this.get_svg_class(object_type)
        .selectAll('.vehicle')
        .data(data, function (d) {
          return d.id;
        });
      // Update ***************************************************//
      if (!is_zoom_only) {
        this.vehicle_svg.each((d) => {
          let is_update_all = true;
          let update: any = {};

          // If update does not exist, update everything
          if (updated && typeof updated === 'object') {
            update = updated[d.id];

            if (!update) return;
            // if the update for vehicle with id does not exist, move to next iteration
            else is_update_all = false; // only update the existing update properties
          }

          let d3_this = d3.select(`#id_${d.id}.vehicle`);

          // Update: if any
          if (
            // (is_update_all && this.show_groups) ||
            // (this.show_groups && update.group)
            (is_update_all && this.preferences.toggles.groups) ||
            (this.preferences.toggles.groups && update.group)
          ) {
            this.update_vehicle_group_svg(
              d3_this,
              d.group,
              main_css.group,
              group_colors
            );
          }
          if (is_update_all || update.id || update.logical_id) {
            this.update_vehicle_label_svg(
              d3_this,
              d.id,
              d.logical_id,
              dom_css,
              this.vehicle_scale
            );
          }
          if (is_update_all || update.order_id) {
            this.update_vehicle_order_label_svg(
              d3_this,
              d.order_id,
              d.hotlot,
              dom_css,
              this.vehicle_scale
            );
          }
          if (is_update_all || update.is_stale) {
            this.update_vehicle_stale_svg(d3_this, d.is_stale, dom_css);
          }
          if (is_update_all || update.cargo_state) {
            this.update_vehicle_foup_svg(d3_this, d.cargo_state);
          }
          if (is_update_all || update.hotlot) {
            this.update_vehicle_hotlot_svg(
              d3_this,
              d.hotlot,
              d.order_id,
              dom_css,
              this.vehicle_scale
            );
          }
          if (is_update_all || update.type || update.mode) {
            this.update_vehicle_type_n_mode_svg(
              d3_this,
              d.type,
              d.mode,
              dom_css
            );
          }
          if (is_update_all || update.error_list) {
            this.update_vehicle_error_svg(d3_this, d.error_list, dom_css);
          }
          if (is_update_all || update.is_blocked) {
            this.update_vehicle_blocked_svg(d3_this, d.is_blocked, dom_css);
          }
          if (is_update_all || update.cargo_transfer_result) {
            this.update_vehicle_fail_svg(
              d3_this,
              d.cargo_transfer_result,
              dom_css
            );
          }
          if (is_update_all || update.push) {
            this.update_vehicle_push_svg(
              d3_this,
              d.push,
              dom_css,
              this.vehicle_scale
            );
          }
          if (is_update_all || update.call) {
            this.update_vehicle_call_svg(
              d3_this,
              d.call,
              dom_css,
              this.vehicle_scale
            );
          }
          let selected_vehicle = this.get_selected_objects('VEHICLE')[0];
          let is_show_vehicle_line =
            (selected_vehicle && selected_vehicle.id === d.id) ||
            this.get_show_vehicle_lines()
              ? true
              : false;
          if (is_update_all || update.command_point || update.cargo_state) {
            let cur_x =
              d.cur_point && d.cur_point.inverted_coord.x
                ? d.cur_point.inverted_coord.x
                : 0;
            let cur_y =
              d.cur_point && d.cur_point.inverted_coord.y
                ? d.cur_point.inverted_coord.y
                : 0;
            let command_x =
              d.command_point && d.command_point.inverted_coord.x
                ? d.command_point.inverted_coord.x
                : cur_x;
            let command_y =
              d.command_point && d.command_point.inverted_coord.y
                ? d.command_point.inverted_coord.y
                : cur_y;
            this.update_vehicle_command_svg(
              d3_this,
              cur_x,
              cur_y,
              command_x,
              command_y,
              is_show_vehicle_line,
              d.cargo_state
            );
          }
          if (is_update_all || update.next_point) {
            let cur_x =
              d.cur_point && d.cur_point.inverted_coord.x
                ? d.cur_point.inverted_coord.x
                : 0;
            let cur_y =
              d.cur_point && d.cur_point.inverted_coord.y
                ? d.cur_point.inverted_coord.y
                : 0;
            let next_x =
              d.next_point && d.next_point.inverted_coord.x
                ? d.next_point.inverted_coord.x
                : cur_x;
            let next_y =
              d.next_point && d.next_point.inverted_coord.y
                ? d.next_point.inverted_coord.y
                : cur_y;
            this.update_vehicle_next_svg(
              d3_this,
              cur_x,
              cur_y,
              next_x,
              next_y,
              is_show_vehicle_line
            );
          }
          if (is_update_all || update.cur_point) {
            this.move_vehicle_svg(
              d3_this,
              d,
              this.MIN_ANIMATE_DISTANCE,
              current_zoom
            );
          }
        });
      } else {
        this.vehicle_svg.attr('transform', (d) => {
          if (this.vehicles[d.index]) {
            let x = this.vehicles[d.index].cur_point.inverted_coord.x;
            let y = this.vehicles[d.index].cur_point.inverted_coord.y;
            let trans_array = this.getZoom(MapTypes.MAIN).apply([x, y]);
            return (
              'translate(' +
              trans_array[0].toString() +
              ',' +
              trans_array[1].toString() +
              ')'
            );
          } else {
            return '';
          }
        });
        this.vehicle_svg
          .selectAll('.command, .next')
          .attr('transform', `scale(${this.getZoom(MapTypes.MAIN).k})`);
      }

      // Remove unnecessary vehicle svgs
      this.vehicle_svg.exit().remove();

      const that = this;

      this.vehicle_svg
        .enter()
        .append('g')
        .attr('class', 'vehicle')
        .attr('id', function (d) {
          return `id_${d.id}`;
        })
        .attr('g_type', 'main')
        .attr('x', function (d) {
          if (d.cur_point) {
            return d.cur_point.inverted_coord.x;
          } else {
            return null;
          }
        })
        .attr('y', function (d) {
          if (d.cur_point) {
            return d.cur_point.inverted_coord.y;
          } else {
            return null;
          }
        })
        .attr('transform', function (d) {
          if (d.cur_point) {
            let trans_array = current_zoom.apply([
              d.cur_point.inverted_coord.x,
              d.cur_point.inverted_coord.y,
            ]);
            trans_array[0] = parseInt(trans_array[0]);
            trans_array[1] = parseInt(trans_array[1]);
            return `translate(${trans_array[0]},${trans_array[1]})`;
          } else {
            return '';
          }
        })
        .each((d) => {
          // @NOTE #id_{d.id} 만으로 쿼리하면 다른 class가 선택될 수 있으므로 class까지 지정해야한다.
          let d3_this = d3.select(`#id_${d.id}.vehicle`);
          this.append_dom_subpart(
            object_type,
            d3_this,
            d,
            dom_css,
            zoom_level,
            group_type,
            group_colors
          );
          if (
            this.selected_objects[0] &&
            d.id === this.selected_objects[0].id &&
            d.constructor.name === this.selected_objects[0].constructor.name
          ) {
            this.highlight(
              d.constructor.name.toUpperCase(),
              d.id,
              dom_css,
              'LAYOUT',
              'SELECT'
            );
          }
        });
    }
    this.vehicle_svg = this.get_svg_class(object_type).selectAll('g.vehicle');
  }
  move_vehicle_svg(
    d3_this: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    vehicle_data: any,
    MIN_ANIMATE_DISTANCE: number,
    current_zoom: any
  ) {
    if (vehicle_data.is_moved) {
      let last_point = vehicle_data.last_point
        ? vehicle_data.last_point.point
        : null;
      let matched_segment = LayoutUtil.find_segment(
        last_point,
        vehicle_data.cur_point.point,
        this.layout_data.segments,
        false
      );
      if (
        matched_segment &&
        current_zoom.k * matched_segment.length > MIN_ANIMATE_DISTANCE
      ) {
        //Get the vehicle elements to move along selected path
        this.vehicle_transition(
          matched_segment.bezier_points,
          d3_this,
          vehicle_data
        );
      } else {
        d3_this.attr('transform', function () {
          let trans_array = current_zoom.apply([
            vehicle_data.cur_point.inverted_coord.x,
            vehicle_data.cur_point.inverted_coord.y,
          ]);
          trans_array[0] = parseInt(trans_array[0]);
          trans_array[1] = parseInt(trans_array[1]);
          return `translate(${trans_array[0]},${trans_array[1]})`;
        });
        let selected_vehicle = this.get_selected_objects('VEHICLE')[0];
        let is_show_vehicle_line =
          (selected_vehicle && selected_vehicle.id === vehicle_data.id) ||
          this.get_show_vehicle_lines()
            ? true
            : false;
        if (is_show_vehicle_line) {
          this.render_vehicle_line(d3_this, vehicle_data, is_show_vehicle_line);
        }
      }
    }
  }
  render_vehicle_line(
    vehicle_element: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    vehicle_data: any,
    is_show: boolean
  ) {
    let fallback = vehicle_data.cur_point.inverted_coord;

    let current_pt = vehicle_data.cur_point.inverted_coord;
    let next_pt =
      vehicle_data.next_point && vehicle_data.next_point.inverted_coord
        ? vehicle_data.next_point.inverted_coord
        : fallback;
    let command_pt =
      vehicle_data.command_point && vehicle_data.command_point.inverted_coord
        ? vehicle_data.command_point.inverted_coord
        : fallback;
    this.update_vehicle_command_svg(
      vehicle_element,
      current_pt.x,
      current_pt.y,
      command_pt.x,
      command_pt.y,
      is_show,
      vehicle_data.cargo_state
    );
    this.update_vehicle_next_svg(
      vehicle_element,
      current_pt.x,
      current_pt.y,
      next_pt.x,
      next_pt.y,
      is_show
    );
  }
  vehicle_transition(
    bezier_points: any,
    vehicle_element: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    vehicle_data: any
  ) {
    // Call the transition on the selected vehicle to animate
    // Retreive the coordinate at the end of chosen path
    let bezier_path = this.bezier(bezier_points);

    vehicle_element
      .transition()
      .duration(main_css.vehicle.animation_duration)
      .attrTween('anima', () => {
        return this.animate(bezier_path, vehicle_element, vehicle_data);
      });
  }
  animate(
    bezier_path: (t: any) => any,
    d3_veh: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    veh_data: any
  ): (this: d3.BaseType, t: number) => string {
    return (t) => {
      // Apply transform to vehicle
      let current_point = bezier_path(t);

      // Vehicle movement needs both coordinate change and transform change.
      if (this.getZoom(MapTypes.MAIN) == undefined) {
        //Move vehicle
        // Apply transform
        d3_veh.attr(
          'transform',
          'translate(' + current_point[0] + ',' + current_point[1] + ')'
        );
      } else {
        //Move vehicle
        // Apply transform
        d3_veh.attr(
          'transform',
          'translate(' +
            this.getZoom(MapTypes.MAIN).apply([
              current_point[0],
              current_point[1],
            ]) +
            ')'
        );
      }

      // Apply Coordinate change
      d3_veh.attr('x', current_point[0]).attr('y', current_point[1]);

      this.vehicles[veh_data.index].cur_point.inverted_coord.x =
        current_point[0];
      this.vehicles[veh_data.index].cur_point.inverted_coord.y =
        current_point[1];

      // zoom.current_mainto the location of vehicle if tracking is on
      if (
        this.vehicle_tracking.status == true &&
        this.vehicle_tracking.id == veh_data.id
      ) {
        this.track(current_point[0], current_point[1], veh_data);
      }
      let selected_vehicle = this.get_selected_objects('VEHICLE')[0];
      let is_show_vehicle_line =
        (selected_vehicle && selected_vehicle.id === veh_data.id) ||
        this.get_show_vehicle_lines()
          ? true
          : false;
      if (is_show_vehicle_line) {
        this.render_vehicle_line(d3_veh, veh_data, is_show_vehicle_line);
      }
      return null; // @NOTE check 빌드 오류를 해결하기 위해 넣은 라인
    };
  }
  track(x: any, y: any, vehicle: any) {
    // Find the next coordinate of the vehicle so you know where to move.
    let destination_pt;
    if (x && y) {
      destination_pt = [x, y];
    } else {
      destination_pt = [
        vehicle.cur_point.inverted_coord.x,
        vehicle.cur_point.inverted_coord.y,
      ];
    }

    // Set zoom scale value to level 2
    let current_zoom = this.getZoom(MapTypes.MAIN).k,
      // Translation value centering the screen on the vehicle destination coord
      translate = [
        this.geometry.screen_size.width / 2 - current_zoom * destination_pt[0],
        this.geometry.screen_size.height / 2 - current_zoom * destination_pt[1],
      ];

    // Translate
    this.set_transform(
      translate[0],
      translate[1],
      current_zoom,
      true,
      'INSTANT'
    );
  }
  bezier(pts: any) {
    return function (t: number) {
      // do..while loop in disguise
      for (var a = pts; a.length > 1; a = b)
        // cycle over control points
        for (var i = 0, b = [], j: number; i < a.length - 1; i++)
          // cycle over dimensions
          for (b[i] = [], j = 0; j < a[i].length; j++)
            b[i][j] = a[i][j] * (1 - t) + a[i + 1][j] * t; // interpolation
      return a[0];
    };
  }
  update_vehicle_next_svg(
    d3_this: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    x1: any,
    y1: any,
    x2: any,
    y2: any,
    is_show: boolean
  ) {
    // Next Point Indicator Line
    let next_line = d3_this.select('.next');

    if (
      is_show &&
      !CommonUtil.is_empty(x1) &&
      !CommonUtil.is_empty(y1) &&
      !CommonUtil.is_empty(x2) &&
      !CommonUtil.is_empty(y2)
    ) {
      if (next_line.node() === null) {
        next_line = d3_this
          .append('line')
          .attr('class', 'next')
          .attr('stroke', main_css.vehicle.next_color)
          .attr('stroke-width', main_css.vehicle.next_weight)
          .attr('x1', 0)
          .attr('y1', 0);
      }
      next_line
        .attr('x2', function () {
          return x2 - x1;
        })
        .attr('y2', function () {
          return y2 - y1;
        })
        .attr('transform', `scale(${this.getZoom(MapTypes.MAIN).k})`);
    } else {
      next_line.remove();
    }
  }
  update_vehicle_command_svg(
    d3_this: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    x1: any,
    y1: any,
    x2: any,
    y2: any,
    is_show: boolean,
    cargo_state: any
  ) {
    // Update lines
    let command_line = d3_this.select('.command');
    let command_stroke_css =
      cargo_state === 'E'
        ? main_css.vehicle.order_pickup_color
        : main_css.vehicle.order_dropoff_color;

    if (
      is_show &&
      !CommonUtil.is_empty(x1) &&
      !CommonUtil.is_empty(y1) &&
      !CommonUtil.is_empty(x2) &&
      !CommonUtil.is_empty(y2)
    ) {
      if (command_line.node() === null) {
        command_line = d3_this
          .append('line')
          .attr('class', 'command')
          .attr('stroke-width', main_css.vehicle.order_weight)
          .attr('x1', 0)
          .attr('y1', 0);
      }

      if (command_line.attr('stroke') != command_stroke_css) {
        command_line.attr('stroke', function () {
          return command_stroke_css;
        });
      }

      command_line
        .attr('x2', function () {
          return x2 - x1;
        })
        .attr('y2', function () {
          return y2 - y1;
        })
        .attr('transform', `scale(${this.getZoom(MapTypes.MAIN).k})`);
    } else {
      command_line.remove();
    }
  }
  update_vehicle_call_svg(
    d3_this: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    call: any,
    dom_css: any,
    vehicle_scale: { min: number; max: number; scale: number; value: number }
  ) {
    // Prevent call
    if (call.length === 0) {
      let call_svg = d3_this.select('.call');
      if (call_svg.nodes().length === 0) {
        // if the element does not exist
        let push_svg = d3_this.select('.push');
        let x_offset = (dom_css.radius * 4) / 3;
        if (push_svg.nodes().length > 0) {
          x_offset = dom_css.radius * 3;
        }
        call_svg = d3_this.append('g').attr('class', 'call');
        call_svg
          .transition()
          .duration(100)
          .attr(
            'transform',
            `rotate(${-this.map_rotation})translate(${
              x_offset * vehicle_scale.scale
            },${dom_css.radius * vehicle_scale.scale})scale(${
              vehicle_scale.scale
            })`
          );
        call_svg
          .append('path')
          .attr('d', dom_css.prevent_call_path)
          .attr('fill', dom_css.prevent_inner_color)
          .attr('transform', 'rotate(-90)translate(-4.5,1.5)scale(0.015)');
        call_svg
          .append('path')
          .attr('d', dom_css.prevent_path)
          .attr('fill', dom_css.prevent_outer_color)
          .attr('transform', 'rotate(90)translate(-6.5,-12.5)scale(0.015)');
      }
    } else {
      d3_this.select('.call').remove();
    }
  }
  update_vehicle_push_svg(
    d3_this: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    push: any,
    dom_css: any,
    vehicle_scale: { min: number; max: number; scale: number; value: number }
  ) {
    let call_svg = d3_this.select('.call');
    let x_offset = (dom_css.radius * 4) / 3;
    if (!push) {
      x_offset = dom_css.radius * 3;
      let push_svg = d3_this.select('.push');
      if (push_svg.nodes().length === 0) {
        // if the element does not exist
        let push_svg = d3_this.append('g').attr('class', 'push');
        push_svg
          .transition()
          .duration(100)
          .attr(
            'transform',
            `rotate(${-this.map_rotation})translate(${
              ((dom_css.radius * 4) / 3) * vehicle_scale.scale
            },${dom_css.radius * vehicle_scale.scale})scale(${
              vehicle_scale.scale
            })`
          );
        push_svg
          .append('path')
          .attr('d', dom_css.prevent_push_path)
          .attr('fill', dom_css.prevent_inner_color)
          .attr('transform', 'translate(2,-3.5)scale(0.015)');
        push_svg
          .append('path')
          .attr('d', dom_css.prevent_path)
          .attr('fill', dom_css.prevent_outer_color)
          .attr('transform', 'rotate(90)translate(-6.5,-12.5)scale(0.015)');
      }
    } else {
      d3_this.select('.push').remove();
    }
    call_svg
      .transition()
      .duration(100)
      .attr(
        'transform',
        `rotate(${-this.map_rotation})translate(${
          x_offset * vehicle_scale.scale
        },${dom_css.radius * vehicle_scale.scale})scale(${vehicle_scale.scale})`
      );
  }
  update_vehicle_fail_svg(
    d3_this: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    cargo_transfer_result: any,
    dom_css: any
  ) {
    // Unload/load fail
    if (cargo_transfer_result) {
      let fail_svg = d3_this.select('.fail');
      if (fail_svg.nodes().length === 0) {
        // if the element does not exist
        fail_svg = d3_this
          .append('g')
          .attr('class', 'fail')
          .attr('transform', `scale(${this.vehicle_scale.scale})`)
          .append('path')
          .attr('d', dom_css.fail_path)
          .attr('transform', 'translate(-3.8,-3.8)scale(0.015)')
          .raise();
      }
    } else {
      d3_this.select('.fail').remove();
    }
  }
  update_vehicle_blocked_svg(
    d3_this: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    is_blocked: any,
    dom_css: any
  ) {
    if (is_blocked) {
      if (d3_this.select('.corner').nodes().length === 0) {
        d3_this
          .append('circle')
          .attr('class', 'corner')
          .attr('r', dom_css.blocked_radius)
          .attr('cx', -(2 + dom_css.radius + dom_css.blocked_radius / 2))
          .attr('cy', -(2 + dom_css.radius + dom_css.blocked_radius / 2))
          .attr('fill', dom_css.color_blocked)
          .attr(
            'transform',
            `rotate(${-this.map_rotation})scale(${this.vehicle_scale.scale})`
          );
      }
    } else {
      d3_this.select('.corner').remove();
    }
  }
  update_vehicle_error_svg(
    d3_this: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    error_list: any,
    dom_css: any
  ) {
    if (error_list != 0) {
      if (d3_this.select('.error').nodes().length === 0) {
        d3_this
          .append('path')
          .attr('class', 'error')
          .attr('d', dom_css.icon_error)
          .attr('fill', function () {
            return dom_css.color_mode_error;
          })
          .attr('stroke', function () {
            return dom_css.color_mode_error_outline;
          })
          .attr('stroke-width', `${dom_css.line_weight / 3}px`)
          .attr(
            'transform',
            `rotate(${-this.map_rotation})scale(${this.vehicle_scale.scale})`
          );
      }
    } else {
      d3_this.select('.error').remove();
    }
  }
  update_vehicle_type_n_mode_svg(
    d3_this: any,
    type: any,
    mode: any,
    dom_css: any
  ) {
    if (type === 'STANDARD') {
      // remove clean element
      d3_this.selectAll('.vehicle_circle_clean').remove();

      let current_vehicle_outline;
      let current_vehicle_circle;

      if (d3_this.select('.vehicle_circle').nodes().length === 0) {
        let highlighted_el = d3_this.select('.hover, .select');
        if (highlighted_el.node() !== null) {
          let class_name = highlighted_el.node().className.baseVal,
            stroke = highlighted_el.attr('stroke');

          // Get rid of the old highlight
          highlighted_el.remove();

          // Append the new highlight with the proper shape
          d3_this
            .append('circle')
            .attr('class', class_name)
            .attr('r', dom_css.radius + 3)
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('fill', 'none')
            .attr('stroke', stroke)
            .attr('stroke-width', main_css.general.highlight_weight_thin)
            .attr('transform', `scale(${this.vehicle_scale.scale})`)
            .lower();
        }

        // Main Element SVG
        current_vehicle_circle = d3_this
          .append('circle')
          .attr('class', 'vehicle_circle')
          .attr('r', dom_css.radius)
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('fill', 'none')
          .attr('stroke', function () {
            let color;
            if (mode == 'M') {
              color = dom_css.color_mode_manual;
            } else if (mode == 'S') {
              color = dom_css.color_mode_sloppy_manual;
            } else if (mode == 'A') {
              color = dom_css.color_mode_auto;
            } else {
              color = dom_css.color_mode_none;
            }

            return color;
          })
          .attr('stroke-width', dom_css.line_weight)
          .attr('transform', `scale(${this.vehicle_scale.scale})`)
          .lower();
      } else {
        current_vehicle_circle = d3_this.select('.vehicle_circle');
      }

      if (d3_this.select('.outline').nodes().length === 0) {
        current_vehicle_outline = d3_this
          .append('circle')
          .attr('class', 'outline')
          .attr('r', dom_css.radius)
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('fill', 'none')
          .attr('stroke', function () {
            let color;

            if (mode == 'M') {
              color = dom_css.color_mode_manual_outline;
            } else if (mode == 'S') {
              color = dom_css.color_mode_sloppy_manual_outline;
            } else if (mode == 'A') {
              color = dom_css.color_mode_auto_outline;
            } else {
              color = dom_css.color_mode_none_outline;
            }
            return color;
          })
          .attr('stroke-width', dom_css.line_weight + 2)
          .attr('transform', `scale(${this.vehicle_scale.scale})`)
          .lower();
      } else {
        current_vehicle_outline = d3_this.select('.outline');
      }

      if (mode == 'M') {
        if (
          current_vehicle_circle.attr('stroke') != dom_css.color_mode_manual
        ) {
          current_vehicle_circle.attr('stroke', dom_css.color_mode_manual);
          current_vehicle_outline.attr(
            'stroke',
            dom_css.color_mode_manual_outline
          );
        }
      } else if (mode == 'A') {
        if (current_vehicle_circle.attr('stroke') != dom_css.color_mode_auto) {
          current_vehicle_circle.attr('stroke', dom_css.color_mode_auto);
          current_vehicle_outline.attr(
            'stroke',
            dom_css.color_mode_auto_outline
          );
        }
      } else if (mode == 'S') {
        if (
          current_vehicle_circle.attr('stroke') !=
          dom_css.color_mode_sloppy_manual
        ) {
          current_vehicle_circle.attr(
            'stroke',
            dom_css.color_mode_sloppy_manual
          );
          current_vehicle_outline.attr(
            'stroke',
            dom_css.color_mode_sloppy_manual_outline
          );
        }
      } else if (mode == null) {
        if (current_vehicle_circle.attr('stroke') != dom_css.color_mode_none) {
          current_vehicle_circle.attr('stroke', dom_css.color_mode_none);
          current_vehicle_outline.attr(
            'stroke',
            dom_css.color_mode_none_outline
          );
        }
      }
    } else if (type === 'CLEANING') {
      // Add clean dashed line
      let clean_vehicle = d3_this.select('.vehicle_circle_clean');
      if (clean_vehicle.nodes().length === 0) {
        let highlighted_el = d3_this.select('.hover, .select');
        if (highlighted_el.node() !== null) {
          let class_name = highlighted_el.node().className.baseVal,
            stroke = highlighted_el.attr('stroke');

          // Remove old highlight
          highlighted_el.remove();

          // Append the new highlight with the proper shape
          d3_this
            .append('rect')
            .attr('class', class_name)
            .attr('width', dom_css.radius * 2)
            .attr('height', dom_css.radius * 2)
            .attr('x', -dom_css.radius)
            .attr('y', -dom_css.radius)
            .attr('fill', 'none')
            .attr('stroke', stroke)
            .attr('stroke-width', main_css.general.highlight_weight_thick)
            .attr(
              'transform',
              `rotate(${-this.map_rotation + 45})scale(${
                this.vehicle_scale.scale
              })`
            );
        }

        // Remove all the circle vehicle elements other than error and stale
        d3_this.selectAll('.vehicle_circle, .outline').remove();

        // add the clean rect element
        clean_vehicle = d3_this
          .append('rect')
          .attr('class', 'vehicle_circle_clean')
          .attr('width', dom_css.radius * 2)
          .attr('height', dom_css.radius * 2)
          .attr('x', -dom_css.radius)
          .attr('y', -dom_css.radius)
          .attr('fill', function () {
            return dom_css.color_mode_auto;
          })
          .attr('stroke', function () {
            return dom_css.color_mode_auto_outline;
          })
          .attr('stroke-width', dom_css.clean_line_weight + 2)
          .attr(
            'transform',
            `rotate(${-this.map_rotation + 45})scale(${
              this.vehicle_scale.scale
            })`
          )
          .lower();
      }
      if (mode == 'M') {
        if (clean_vehicle.attr('fill') != dom_css.color_mode_manual) {
          clean_vehicle.attr('fill', dom_css.color_mode_manual);
          clean_vehicle.attr('stroke', dom_css.color_mode_manual_outline);
        }
      } else if (mode == 'A') {
        if (clean_vehicle.attr('fill') != dom_css.color_mode_auto) {
          clean_vehicle.attr('fill', dom_css.color_mode_auto);
          clean_vehicle.attr('stroke', dom_css.color_mode_auto_outline);
        }
      } else if (mode == 'S') {
        if (clean_vehicle.attr('fill') != dom_css.color_mode_sloppy_manual) {
          clean_vehicle.attr('fill', dom_css.color_mode_sloppy_manual);
          clean_vehicle.attr(
            'stroke',
            dom_css.color_mode_sloppy_manual_outline
          );
        }
      }
    }
  }
  update_vehicle_hotlot_svg(
    d3_this: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    hotlot: any,
    order_id: any,
    dom_css: any,
    vehicle_scale: { min: number; max: number; scale: number; value: number }
  ) {
    let current_order_label = d3_this.select('.label_order');
    if (hotlot) {
      if (
        d3_this.select('.hotlot').nodes().length === 0 &&
        vehicle_scale.scale >= 0.6
      ) {
        // add if it doesn't exist
        d3_this
          .append('rect')
          .attr('class', 'hotlot')
          .attr('fill', function () {
            return dom_css.color_hotlot;
          })
          .attr('x', function (d: any) {
            return (
              -((dom_css.text_offset * 3) / 4) * vehicle_scale.scale -
              d.order_id.toString().length * 6
            );
          })
          .attr('y', function (d) {
            return (
              (dom_css.radius * 2 - dom_css.radius / 2) * vehicle_scale.scale -
              10
            );
          })
          .attr('display', 'block')
          .attr('width', () => {
            return `${order_id.toString().length * 6}px`;
          })
          .attr('height', 13)
          .attr('rx', 5)
          .attr('ry', 5)
          .attr('transform', `rotate(${-this.map_rotation})`)
          .lower();
      } else {
        // already exists
        d3_this.select('.hotlot').attr('fill', function () {
          return dom_css.color_hotlot;
        });
      }
      if (current_order_label.attr('fill') != dom_css.label_hotlot_color) {
        current_order_label.attr('fill', dom_css.label_hotlot_color);
      }
    } else {
      d3_this.select('.hotlot').remove();
      if (current_order_label.attr('fill') != dom_css.label_color) {
        current_order_label.attr('fill', dom_css.label_color);
      }
    }
  }
  update_vehicle_foup_svg(
    d3_this: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    cargo_state: any
  ) {
    if (cargo_state == 'F' || cargo_state == 'L' || cargo_state == 'U') {
      let current_vehicle_foup = d3_this.select('.foup');
      if (current_vehicle_foup.nodes().length === 0) {
        // if the element does not exist
        d3_this
          .append('circle')
          .attr('class', function () {
            if (cargo_state == 'F') {
              return 'foup loaded';
            } else if (cargo_state == 'L') {
              return 'foup loading';
            } else {
              // when cargo_state == 'U'
              return 'foup unloading';
            }
          })
          .attr('display', 'block')
          .attr('transform', `scale(${this.vehicle_scale.scale})`)
          .lower();
      } else {
        // if element already exists
        let current_cargo_state = current_vehicle_foup.attr('class');
        if (cargo_state == 'F' && current_cargo_state != 'foup loaded') {
          current_vehicle_foup.attr('class', 'foup loaded');
        } else if (
          cargo_state == 'L' &&
          current_cargo_state != 'foup loading'
        ) {
          current_vehicle_foup.attr('class', 'foup loading');
        } else if (
          cargo_state == 'U' &&
          current_cargo_state != 'foup unloading'
        ) {
          current_vehicle_foup.attr('class', 'foup unloading');
        }
      }
    } else {
      d3_this.select('.foup').remove();
    }
  }
  update_vehicle_stale_svg(
    d3_this: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    is_stale: any,
    dom_css: any
  ) {
    if (is_stale) {
      let stale_svg = d3_this.select('.stale');
      if (stale_svg.nodes().length === 0) {
        // if the element does not exist
        stale_svg = d3_this
          .append('g')
          .attr('class', 'stale')
          .attr(
            'transform',
            `rotate(${-this.map_rotation})translate(${
              dom_css.radius * 2 * this.vehicle_scale.scale
            },-${dom_css.radius * this.vehicle_scale.scale})scale(${
              this.vehicle_scale.scale
            })`
          );
        stale_svg
          .append('circle')
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', 5.5)
          .attr('fill', 'white');
        stale_svg
          .append('path')
          .attr('d', dom_css.stale_path)
          .attr('fill', 'black')
          .attr('transform', 'translate(-6.5,-6.5)scale(0.013)');
      }
    } else {
      d3_this.select('.stale').remove();
    }
  }
  update_vehicle_order_label_svg(
    d3_this: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    order_id: any,
    hotlot: any,
    dom_css: any,
    vehicle_scale: { min: number; max: number; scale: number; value: number }
  ) {
    let current_order_label = d3_this.select('.label_order');
    if (
      current_order_label.nodes().length === 0 &&
      vehicle_scale.scale >= 0.6
    ) {
      d3_this
        .append('text')
        .attr('class', 'label_order')
        .attr('font-size', `${dom_css.font_size}px`)
        .attr('fill', hotlot ? dom_css.label_hotlot_color : dom_css.label_color)
        .attr('x', (-dom_css.text_offset * 3) / 4)
        .attr('y', dom_css.radius * 2 - dom_css.radius / 2)
        .html(function () {
          if (order_id) {
            return `${order_id}`;
          } else {
            return '';
          }
        })
        .attr('text-anchor', 'end')
        .attr('display', 'block')
        .attr('transform', `rotate(${-this.map_rotation})`);
    } else if (current_order_label.text() != order_id) {
      current_order_label.text(order_id);
    }
  }
  update_vehicle_label_svg(
    d3_this: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    id: any,
    logical_id: any,
    dom_css: any,
    vehicle_scale: { min: number; max: number; scale: number; value: number }
  ) {
    let current_vehicle_label = d3_this.select('.label');
    let label = logical_id ? logical_id : id;
    if (
      current_vehicle_label.nodes().length === 0 &&
      vehicle_scale.scale >= 0.6
    ) {
      d3_this
        .append('text')
        .attr('class', 'label')
        .attr('id', function () {
          return `id_${id}`;
        })
        .attr('font-size', `${dom_css.font_size}px`)
        .attr('x', (-dom_css.text_offset * 3) / 4)
        .attr('y', -dom_css.radius / 2)
        .html(function () {
          return label;
        })
        .attr('text-anchor', 'end')
        .attr('display', 'block')
        .attr('transform', `rotate(${-this.map_rotation})`);
    } else if (current_vehicle_label.text() != label) {
      current_vehicle_label.text(label);
    }
  }
  update_vehicle_group_svg(
    d3_this: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    group_id: any,
    dom_css: any,
    group_colors: any
  ) {
    let group_svg = d3_this.select('.group_svg');
    if (group_id) {
      let group_size = dom_css.vehicle_group_size;
      if (group_svg.nodes().length === 0) {
        group_svg = d3_this
          .append('rect')
          .attr('class', 'group_svg')
          .attr('x', -group_size * 2)
          .attr('y', -group_size * 2)
          .attr('rx', group_size)
          .attr('ry', group_size)
          .attr('width', group_size * 4)
          .attr('height', group_size * 4)
          .attr('fill', 'none')
          .attr('stroke', group_colors[group_id])
          .attr('stroke-width', '3px')
          .style('opacity', dom_css.opacity)
          .attr(
            'transform',
            `rotate(${-this.map_rotation})scale(${this.vehicle_scale.scale})`
          )
          .lower();
      } else if (group_svg.attr('stroke') != group_colors[group_id]) {
        group_svg.attr('stroke', group_colors[group_id]);
      }
    } else {
      group_svg.remove();
    }
  }
  append_showing_vehicles(view_box: any) {
    // if (!this.show_vehicles) {
    if (!this.preferences.toggles.vehicles) {
      return [];
    }

    let rotated_view_box;
    if (this.map_rotation > 0) {
      rotated_view_box = this.get_rotated_viewbox();
    }

    let display_objects = [];

    for (let i = 0; i < this.vehicles.length; i++) {
      let object = this.vehicles[i];
      let is_display = false;
      if (object.cur_point) {
        let pos_x = object.cur_point.inverted_coord.x,
          pos_y = object.cur_point.inverted_coord.y;

        // add if within the viewbox coordinates
        if (rotated_view_box) {
          is_display = this.is_in_polygon([pos_x, pos_y], rotated_view_box);
        } else if (
          pos_x > view_box.x_from &&
          pos_x < view_box.x_to &&
          pos_y > view_box.y_from &&
          pos_y < view_box.y_to
        ) {
          // Add vehicle objects list index for faster reference during animation
          is_display = true;
        }

        // If is tracked vehicle, add regardless
        if (object.id === this.vehicle_tracking.id) {
          // Add vehicle objects list index for faster reference during animation
          is_display = true;
        }
      }
      if (is_display) {
        object.index = i;
        display_objects.push(object);
      }
    }
    return display_objects;
  }
  cluster_adaptive_rendering(
    zoom_level: any,
    current_transform: any,
    css_setting: any,
    view_box: any,
    need_update?: boolean
  ) {
    // see if there are any clusters in the current viewport
    let cluster_display = this.append_showing_polygons('CLUSTER', view_box);

    // if (cluster_display.length > 0 && this.show_clusters) {
    if (cluster_display.length > 0 && this.preferences.toggles.clusters) {
      let update_svg = false;

      if (!need_update && this.clusters_svg) {
        // If there are already clusters in view
        let changed = this.check_data_difference(
          cluster_display,
          this.clusters_svg.nodes()
        );
        if (changed) {
          update_svg = true;
        }
      } else {
        // If there are none already existing
        update_svg = true;
      }

      if (update_svg || need_update) {
        this.update_dom(
          'CLUSTER',
          cluster_display,
          css_setting,
          zoom_level,
          'LAYOUT',
          true
        );
      }

      this.clusters_svg.attr('transform', this.transform(current_transform));
    } else {
      this.update_dom('CLUSTER', [], css_setting, zoom_level, 'LAYOUT', true);
    }
  }
  mtl_adaptive_rendering(
    zoom_level: any,
    current_transform: IZoom,
    css_setting: any,
    view_box: any,
    need_update?: boolean
  ) {
    let update_svg = false,
      selective_level = this.option.selective_lvl_display,
      mtl_display = [];

    // if (zoom_level >= 1 && this.show_mtls) {
    if (zoom_level >= 1 && this.preferences.toggles.mtls) {
      // find mtl
      mtl_display = this.append_showing_objects('MTL', view_box);

      // If there are elements to show
      if (mtl_display.length > 0) {
        if (!need_update && this.mtls_svg) {
          // If there are already mtls in view
          let changed = this.check_data_difference(
            mtl_display,
            this.mtls_svg.nodes()
          );

          // Check if updated_listed is different from already existing
          if (changed) {
            update_svg = true;
          }

          // Display According to zoom.current_main levels
          if (zoom_level >= selective_level.mtl_sim) {
            // LVL 2 check //
            if (zoom_level >= selective_level.mtl_det) {
              // LVL 3 //
              if (
                this.mtls_path.node() &&
                this.mtls_path.attr('level') !== 'level3'
              ) {
                update_svg = true;
              }
            } else {
              // LVL 2 =======================================//
              if (
                this.mtls_path.node() &&
                this.mtls_path.attr('level') !== 'level2'
              ) {
                update_svg = true;
              }
            }
          } else {
            // LVL 1 ===========================================//
            if (
              this.mtls_path.node() &&
              this.mtls_path.attr('level') !== 'level1'
            ) {
              update_svg = true;
            }
          }
        } else {
          // If there are none already existing
          update_svg = true;
        }

        // Update dom
        if (update_svg || need_update) {
          this.update_dom(
            'MTL',
            mtl_display,
            css_setting,
            zoom_level,
            'LAYOUT',
            false
          );
        }

        // Apply transform values to all mtl svg elements
        this.mtls_svg.attr('transform', this.transform(current_transform));
      } else {
        this.update_dom(
          'MTL',
          mtl_display,
          css_setting,
          zoom_level,
          'LAYOUT',
          false
        );
      }
    } else {
      if (this.mtls_svg && this.mtls_svg.nodes().length > 0) {
        this.update_dom('MTL', [], css_setting, zoom_level, 'LAYOUT', false);
      }
    }
  }
  // Buffer Zoom
  buffer_adaptive_rendering(
    zoom_level: number,
    current_transform: any,
    css_setting: any,
    view_box: any,
    need_update?: boolean
  ) {
    let update_svg = false,
      selective_level = this.option.selective_lvl_display,
      buffer_display = [];

    // if (zoom_level >= 1 && this.show_buffers) {
    if (zoom_level >= 1 && this.preferences.toggles.buffers) {
      // find buffer
      buffer_display = this.append_showing_objects('BUFFER', view_box);

      // If there are elements to show
      if (buffer_display.length > 0) {
        if (!need_update && this.buffers_svg) {
          // If there are already buffers in view
          let changed = this.check_data_difference(
            buffer_display,
            this.buffers_svg.nodes()
          );

          // Check if updated_listed is different from already existing
          if (changed) {
            update_svg = true;
          }

          // Display According to zoom.current_main levels
          if (zoom_level >= selective_level.buffer_sim) {
            // LVL 2 check //
            if (zoom_level >= selective_level.buffer_det) {
              // LVL 3 //
              if (
                this.buffers_path.node() &&
                this.buffers_path.attr('level') !== 'level3'
              ) {
                update_svg = true;
              }
            } else {
              // LVL 2 =======================================//
              if (
                this.buffers_path.node() &&
                this.buffers_path.attr('level') !== 'level2'
              ) {
                update_svg = true;
              }
            }
          } else {
            // LVL 1 ===========================================//
            if (
              this.buffers_path.node() &&
              this.buffers_path.attr('level') !== 'level1'
            ) {
              update_svg = true;
            }
          }
        } else {
          // If there are none already existing
          update_svg = true;
        }

        // Update dom
        if (update_svg || need_update) {
          this.update_dom(
            'BUFFER',
            buffer_display,
            css_setting,
            zoom_level,
            'LAYOUT',
            false
          );
        }

        // Apply transform values to all buffer svg elements
        this.buffers_svg.attr('transform', this.transform(current_transform));
      } else {
        this.update_dom(
          'BUFFER',
          buffer_display,
          css_setting,
          zoom_level,
          'LAYOUT',
          false
        );
      }
    } else {
      if (this.buffers_svg && this.buffers_svg.nodes().length > 0) {
        this.update_dom('BUFFER', [], css_setting, zoom_level, 'LAYOUT', false);
      }
    }
  }
  transform_center_axis(transform: IZoom) {
    this.canvas_group.attr(
      'transform',
      `translate(${transform.x},${
        transform.y + this.geometry.invert_factor_y * transform.k
      })scale(${transform.k})`
    );
    this.center_svg_x.attr(
      'transform',
      `translate(0, ${
        transform.y + this.geometry.invert_factor_y * transform.k
      })`
    );
    this.center_svg_y.attr('transform', `translate(${transform.x}, 0)`);
    this.center_svg_text.attr(
      'transform',
      `translate(${transform.x},${
        transform.y + this.geometry.invert_factor_y * transform.k
      })`
    );
  }
  scale_rendering(scale: {
    graphical_length: number;
    length_value: string;
    actual_length: number;
  }) {
    this.scale_svg.attr('x2', -scale.graphical_length);
    this.scale_tick
      .attr('x1', -scale.graphical_length)
      .attr('x2', -scale.graphical_length);
    this.scale_value.text(scale.length_value);
  }
  find_scale_size() {
    // Get scale sizes from grid ticks for unity
    let ticks = this.grid_x.selectAll('.tick').nodes();
    let tick1 = ticks[1].attributes.transform.value
      .match(/[0-9.,-]/g)
      .join('')
      .split(',')[0];
    let tick2 = ticks[2].attributes.transform.value
      .match(/[0-9.,-]/g)
      .join('')
      .split(',')[0];
    let length_val = Math.abs(
      ticks[2].children[1].__data__ - ticks[1].children[1].__data__
    );
    let tick_scale;
    let units;

    // Calculate unit value
    if (length_val / 1000000000 >= 1) {
      tick_scale = length_val / 1000000000;
      units = 'Mm';
    } else if (length_val / 1000000 >= 1) {
      tick_scale = length_val / 1000000;
      units = 'km';
    } else if (length_val / 1000 >= 1) {
      tick_scale = length_val / 1000;
      units = 'm';
    } else if (length_val / 100 >= 1) {
      tick_scale = length_val / 1000;
      units = 'm';
    } else if (length_val / 10 >= 1) {
      tick_scale = length_val / 10;
      units = 'cm';
    } else {
      tick_scale = length_val;
      units = 'mm';
    }

    // Simplify ticks using metric units
    if (this.mode === 'EDITOR') {
      let tick_nums = this.grid_x
        .selectAll('.tick text')
        .nodes()
        .concat(this.grid_y.selectAll('.tick text').nodes());

      // Change the values of the units
      for (let i = 0; i < tick_nums.length; i++) {
        let tick = tick_nums[i];
        let num = tick.__data__;
        switch (units) {
          case 'Mm':
            tick.textContent = num / 1000000000 + units;
            break;
          case 'km':
            tick.textContent = num / 1000000 + units;
            break;
          case 'm':
            tick.textContent = num / 1000 + units;
            break;
          case 'cm':
            tick.textContent = num / 10 + units;
            break;
          default:
            tick.textContent = num + units;
            break;
        }
      }
    }

    return {
      graphical_length: Math.abs(tick2 - tick1),
      length_value: `${tick_scale}${units}`,
      actual_length: length_val,
    };
  }
  station_adaptive_rendering(
    zoom_level: number,
    current_transform: any,
    css_setting: any,
    view_box: any,
    need_update?: boolean
  ) {
    let update_svg = false,
      selective_level = this.option.selective_lvl_display,
      station_display = [];

    // if (zoom_level >= 1 && this.show_stations) {
    if (zoom_level >= 1 && this.preferences.toggles.stations) {
      // find station
      station_display = this.append_showing_objects('STATION', view_box);

      // If there are elements to show
      if (station_display.length > 0) {
        if (!need_update && this.stations_svg) {
          // If there are already stations in view
          let changed = this.check_data_difference(
            station_display,
            this.stations_svg.nodes()
          );

          // Check if updated_listed is different from already existing
          if (changed) {
            update_svg = true;
          }

          // Display According to zoom.current_main levels
          if (zoom_level >= selective_level.station_sim) {
            // LVL 2 check //
            if (zoom_level >= selective_level.station_det) {
              // LVL 3 //
              if (
                this.stations_path.node() &&
                this.stations_path.attr('level') !== 'level3'
              ) {
                update_svg = true;
              }
            } else {
              // LVL 2 =======================================//
              if (
                this.stations_path.node() &&
                this.stations_path.attr('level') !== 'level2'
              ) {
                update_svg = true;
              }
            }
          } else {
            // LVL 1 ===========================================//
            if (
              this.stations_path.node() &&
              this.stations_path.attr('level') !== 'level1'
            ) {
              update_svg = true;
            }
          }
        } else {
          // If there are none already existing
          update_svg = true;
        }

        // Update dom
        if (update_svg || need_update) {
          this.update_dom(
            'STATION',
            station_display,
            css_setting,
            zoom_level,
            'LAYOUT',
            false
          );
        }

        // Apply transform values to all station svg elements
        this.stations_svg.attr('transform', this.transform(current_transform));
      } else {
        this.update_dom(
          'STATION',
          station_display,
          css_setting,
          zoom_level,
          'LAYOUT',
          false
        );
      }
    } else {
      if (this.stations_svg && this.stations_svg.nodes().length > 0) {
        this.update_dom(
          'STATION',
          [],
          css_setting,
          zoom_level,
          'LAYOUT',
          false
        );
      }
    }
  }
  grid_adaptive_rendering(current_transform: any) {
    // Adjust the tick translation to match the map by flipping and translating

    // Save the original transform for all other transformation, but the grid
    let original_y_zoom_value = current_transform.y;

    // Translate the ticks by the fab size
    current_transform.y =
      current_transform.y + this.geometry.invert_factor_y * current_transform.k;

    // Apply adjusted grid transform
    this.grid_x.call(
      this.d3_axis_x.scale(current_transform.rescaleX(this.d3_x))
    );
    this.grid_y.call(this.d3_axis_y.scale(this.rescaleY(this.d3_y)));

    // Set the zoom back to original for all others
    current_transform.y = original_y_zoom_value;
  }
  rescaleY(y: any): any {
    let current_transform = this.getZoom(MapTypes.MAIN);
    let range = y.range().map(current_transform.invertY, current_transform);
    let domain = range.map(y.invert, y);
    domain = domain.map((y) => {
      return -y;
    });
    return y.copy().domain(domain);
  }

  minimap_draw() {
    const zoom = this.getZoom(MapTypes.MINIMAP);
    if (!zoom) return;
    let current_transform_scale = zoom.k;

    // Calculate the proper dimensions of the track

    if (this.minimap_path_svg) {
      this.minimap_path_svg = this.minimap_svg.select('path');
    } else {
      this.minimap_path_svg = this.minimap_svg.append('path');
    }

    // if(geometry.track_size.min_x < 0){ // If min x value is negative
    //     translate_x = -geometry.track_size.min_x * current_transform_scale
    // } else{
    //     translate_x = -geometry.track_size.min_x * current_transform_scale
    // }
    // if(geometry.track_size.min_y < 0){ // If min y value is negative
    //     translate_y = geometry.track_size.min_y * current_transform_scale
    // }

    this.minimap_path_svg
      .attr('id', 'minimap_path')
      .attr('d', () => {
        return this.minimap_data.path;
      })
      .attr('transform', `scale(${current_transform_scale})`);

    this.adjust_floaters();

    this.init_minimap_event_listeners();

    // Set the proper fab_size since db fab size only accounts for points
    this.adjust_fab_size(this.geometry.track_size);
  }
  adjust_fab_size(boundaries: IMapSize) {
    try {
      let boundary_coord: any = {};
      let is_extend = false;

      if (
        boundaries.min_x !== undefined &&
        boundaries.min_y !== undefined &&
        boundaries.max_x !== undefined &&
        boundaries.max_y !== undefined
      ) {
        boundaries = {
          min: {
            x: boundaries.min_x,
            y: boundaries.min_y,
          },
          max: {
            x: boundaries.max_x,
            y: boundaries.max_y,
          },
        };

        boundaries.width = boundaries.max.x - boundaries.min.x;
        boundaries.height = boundaries.max.y - boundaries.min.y;
      }

      // sawp the y values in the objects before inverting with original coord
      boundary_coord.max = this.calc_original_coord_from_inverted(
        boundaries.max,
        this.geometry.invert_factor_y
      );
      boundary_coord.min = this.calc_original_coord_from_inverted(
        boundaries.min,
        this.geometry.invert_factor_y
      );
      let swap = boundary_coord.max.y;
      boundary_coord.max.y = boundary_coord.min.y;
      boundary_coord.min.y = swap;

      if (boundary_coord.min.x <= this.CANVAS_MIN_X) {
        // extend LEFT
        is_extend = true;
        // Calculate x translation amount depending on fab_size growth
        this.geometry.fab_size.min_x = boundary_coord.min.x; // returns negative value
      } else {
        if (boundary_coord.min.x >= this.CANVAS_MIN_X) is_extend = true;
        this.geometry.fab_size.min_x = this.CANVAS_MIN_X; // returns negative value
      }

      if (boundary_coord.max.x >= this.CANVAS_MAX_X) {
        // extend RIGHT
        is_extend = true;
        this.geometry.fab_size.max_x = boundary_coord.max.x;
      } else {
        if (boundary_coord.max.x <= this.CANVAS_MAX_X) is_extend = true;
        this.geometry.fab_size.max_x = this.CANVAS_MAX_X; // returns negative value
      }

      if (boundary_coord.min.y <= this.CANVAS_MIN_Y) {
        // extend DOWN
        is_extend = true;
        this.geometry.fab_size.min_y = boundary_coord.min.y; // returns negative value
      } else {
        if (boundary_coord.min.y >= this.CANVAS_MIN_Y) is_extend = true;
        this.geometry.fab_size.min_y = this.CANVAS_MIN_Y; // returns negative value
      }

      if (boundary_coord.max.y >= this.CANVAS_MAX_Y) {
        // extend UP
        is_extend = true;
        // Calculate y translation amount depending on fab_size growth
        this.geometry.fab_size.max_y = boundary_coord.max.y;
      } else {
        if (boundary_coord.max.y <= this.CANVAS_MAX_Y) is_extend = true;
        this.geometry.fab_size.max_y = this.CANVAS_MAX_Y; // returns negative value
      }

      if (is_extend) {
        // adjust track
        this.calc_and_set_track_size();

        // Calculate fab dimensions
        this.geometry.fab_size.width =
          this.geometry.fab_size.max_x - this.geometry.fab_size.min_x;
        this.geometry.fab_size.height =
          this.geometry.fab_size.max_y - this.geometry.fab_size.min_y;

        // let save_size = {
        //     min_x: this.geometry.fab_size.min_x,
        //     min_y: this.geometry.fab_size.min_y,
        //     max_x: this.geometry.fab_size.max_x,
        //     max_y: this.geometry.fab_size.max_y
        // }

        // update minimap
        if (
          this.geometry.track_size.width > 0 &&
          this.geometry.track_size.height > 0
        ) {
          this.update_minimap_with_new_dimensions(this.geometry.track_size);
        }
        this.svg_resize();
      }
    } catch (error) {
      console.warn(
        'Error while adjusting fab size: ',
        error,
        'From function "adjust_fab_size"'
      );
    }
  }
  svg_resize() {
    // Specify that layout has been initialized before
    let { k, x, y } = this.getZoom(MapTypes.MAIN);

    // Calculate last position center coord
    const { width: lastW, height: lastH } = this.geometry.screen_size;

    let zoom_ratio = k / d3.zoomIdentity.k;

    x = lastW / 2 - x;
    y = lastH / 2 - y;

    let current_pt = {
      x: x / k,
      y: y / k,
    };

    const {
      width: changeW,
      height: changeH,
    } = this.svg.node().getBoundingClientRect();

    // Set new screen size
    this.geometry.screen_size.width = changeW;
    this.geometry.screen_size.height = changeH;

    // Calculate the difference between the sizes then divide by 2 to get the center differences
    let screen_size_dif = {
      width: (changeW - lastW) / 2,
      height: (changeH - lastH) / 2,
    };

    // Set minimap size on data
    const {
      width: miniW,
      height: miniH,
    } = this.minimap_svg.node().getBoundingClientRect();
    this.geometry.minimap_size = {
      width: miniW,
      height: miniH,
    };

    // Adjust the coordinate data according to the padding value given
    // and the screen size

    // Set the new parameters to get proper transform proportions
    this.setInitialZoom(MapTypes.MAIN);

    // Initiate D3
    this.d3_main = d3
      .zoom()
      .scaleExtent([0, this.zoom.max])
      .on('zoom', this.zoomed.bind(this));

    // Initialize svg: view-box element
    this.svg
      .attr('width', this.geometry.screen_size.width)
      .attr('height', this.geometry.screen_size.height);
    this.svg.call(this.d3_main);

    let length: any = {},
      lower_limit: any = {},
      upper_limit: any = {};

    if (this.mode === ViewModes.editor) {
      length.x = this.geometry.screen_size.width;
      length.y = this.geometry.screen_size.height;
      lower_limit = {
        x: 0,
        y: 0,
      };
      upper_limit = {
        x: this.geometry.screen_size.width,
        y: this.geometry.screen_size.height,
      };
    } else {
      length.x = Math.sqrt(
        Math.pow(this.geometry.screen_size.width, 2) +
          Math.pow(this.geometry.screen_size.height, 2)
      );
      length.y = length.x;
      let lower_width = (this.geometry.screen_size.width - length.x) / 2;
      let lower_height = (this.geometry.screen_size.height - length.y) / 2;
      lower_limit = {
        x: lower_width,
        y: lower_height,
      };
      upper_limit = {
        x: this.geometry.screen_size.width - lower_width,
        y: this.geometry.screen_size.height - lower_height,
      };
    }

    // Set grid properties
    this.d3_x = d3
      .scaleLinear()
      .domain([lower_limit.x, upper_limit.x])
      .range([lower_limit.x, upper_limit.x]);

    this.d3_y = d3
      .scaleLinear()
      .domain([lower_limit.y, upper_limit.y])
      .range([lower_limit.y, upper_limit.y]);

    this.d3_axis_x = d3
      .axisBottom(this.d3_x)
      .ticks((upper_limit.x / upper_limit.y) * this.num_ticks)
      .tickSize(length.y)
      .tickPadding(8 - this.geometry.screen_size.height);

    this.d3_axis_y = d3
      .axisRight(this.d3_y)
      .ticks(this.num_ticks) // number of ticks
      .tickSize(length.x)
      .tickPadding(-20); // literally horizontal padding in pixels

    // Translate the oversized grid group
    if (
      this.mode === 'VIEWER' ||
      this.mode === 'PLAYBACK' ||
      this.mode === 'PUBLIC'
    ) {
      this.d3_track
        .select('.y_axis')
        .attr('transform', `translate(${lower_limit.x},0)`);
      this.d3_track
        .select('.x_axis')
        .attr('transform', `translate(0,${lower_limit.y})`);
    }

    // Mini Map SVG Elements ============================================//
    // Mini Map Zoom Constraints
    this.d3_minimap = d3
      .zoom()
      .scaleExtent([this.zoom.min, this.zoom.max])
      .on('zoom', this.mini_zoomed.bind(this));

    if (this.minimap_svg) {
      // Set the SVG element for minimap view-box
      this.minimap_svg.call(this.d3_minimap);

      // Set container svg for minimap segment svg elements
      this.minimap_rect
        .attr('width', this.geometry.minimap_size.width / zoom_ratio)
        .attr('height', this.geometry.minimap_size.height / zoom_ratio);
    }

    // Set zoom identity equal to new paramerized values and pan for the new offsets differences
    (d3.zoomIdentity as any).k = this.getZoom(MapTypes.MAIN).k;
    // k is readonly

    // Reposition the scale group
    this.scale_svg_group.attr(
      'transform',
      `translate(${this.geometry.screen_size.width - this.scale_offset_x}, ${
        this.geometry.screen_size.height - this.scale_offset_y
      })`
    );

    // New off set for positioning to last known anchor for consistency. Not center positioning.
    let cur_offset = {
      width: screen_size_dif.width / k,
      height: screen_size_dif.height / k,
    };

    // Adjust center line size to new screen size
    if (this.mode === 'EDITOR') {
      this.center_svg_x.attr('x2', this.geometry.screen_size.width);
      this.center_svg_y.attr('y2', this.geometry.screen_size.height);
    }

    // adjust this.geometry of toolbar, minimap, etc
    this.adjust_floaters();

    /*
      Set the transform to currently viewing area with out any re-zooming
      to make the center point of prior to resize be the new center of the
      zoom
      */

    this.set_transform(
      d3.zoomIdentity.x,
      d3.zoomIdentity.y,
      d3.zoomIdentity.k,
      true,
      'INSTANT'
    );
    this.zoom_to(
      [current_pt.x + cur_offset.width, current_pt.y + cur_offset.height],
      'RESIZE',
      k
    );

    if (
      this.mode === 'VIEWER' ||
      this.mode === 'PLAYBACK' ||
      this.mode === 'PUBLIC'
    ) {
      if (this.map_rotation) {
        this.update_map_rotate(this.map_rotation);
      }
    }
  }
  update_map_rotate(rotate_value: number, is_save_state?: boolean) {
    // Set the rotated value of the map
    this.set_map_rotate(rotate_value, is_save_state);

    // Apply transform to the map and minimap svg
    this.d3_track
      .select(`#${this.track_id}`)
      .attr('transform', `rotate(${this.map_rotation})`);
    this.d3_track
      .select('#minimap')
      .attr('transform', `rotate(${this.map_rotation})`);

    // Recalculate the dimensional properties of the minimap container
    this.update_minimap_with_rotated_dimensions(this.map_rotation);
    this.set_minimap_position();

    // Rotate scale in the opposite direction of the main rotation ot keep in it's place with rotation about the center of the screen
    let scale = this.d3_track.select('.scale') as any;

    // ATTENTION : mobile device does not support scale.nodes()[0].transform.baseVal
    // @TODO transform 속성이 없음. 확인 필요
    // if (scale.nodes()[0].transform.baseVal[0]) {
    //   let scale_x = scale.nodes()[0].transform.baseVal[0].matrix.e,
    //     scale_y = scale.nodes()[0].transform.baseVal[0].matrix.f,
    //     diff_x = scale_x / 2 - (this.geometry.screen_size.width - scale_x) / 2,
    //     diff_y = scale_y / 2 - (this.geometry.screen_size.height - scale_y) / 2;

    //   scale.attr(
    //     'transform',
    //     `translate(${scale_x}, ${scale_y})rotate(${-this
    //       .map_rotation}, ${-diff_x}, ${-diff_y})`
    //   );
    // }

    let current_transform = this.getZoom(MapTypes.MAIN);

    // Calculate viewing area
    this.calculate_n_set_viewbox(current_transform);

    let view_box = this.get_viewbox();

    // Calculate relative zoom level
    let zoom_level = this.calculate_zoom_level();

    // Render objects ===================================================//

    if (
      this.layout_data.points !== undefined &&
      this.layout_data.points.length > 0
    ) {
      this.point_adaptive_rendering(
        zoom_level,
        current_transform,
        main_css.point,
        view_box
      );
    }
    if (
      this.layout_data.segments !== undefined &&
      this.layout_data.segments.length > 0
    ) {
      let segments = this.append_showing_polygons('SEGMENT', view_box);
      this.segments_adaptive_rendering(
        current_transform,
        main_css.segment,
        view_box,
        true,
        segments
      );
      this.directions_adaptive_rendering(
        zoom_level,
        current_transform,
        main_css.segment,
        view_box,
        false,
        segments
      );
    }
    if (
      this.layout_data.stations !== undefined &&
      this.layout_data.stations.length > 0
    ) {
      this.station_adaptive_rendering(
        zoom_level,
        current_transform,
        main_css.station,
        view_box,
        true
      );
    }
    if (
      this.layout_data.buffers !== undefined &&
      this.layout_data.buffers.length > 0
    ) {
      this.buffer_adaptive_rendering(
        zoom_level,
        current_transform,
        main_css.buffer,
        view_box,
        true
      );
    }
    if (
      this.layout_data.mtls !== undefined &&
      this.layout_data.mtls.length > 0
    ) {
      this.mtl_adaptive_rendering(
        zoom_level,
        current_transform,
        main_css.mtl,
        view_box
      );
    }
    if (
      (this.mode === 'VIEWER' ||
        this.mode === 'PLAYBACK' ||
        this.mode === 'PUBLIC') &&
      this.vehicles !== undefined &&
      this.vehicles.length > 0
    ) {
      this.vehicle_adaptive_rendering(main_css.vehicle, view_box);
      // Apply rotation to visibly vehicles
      this.update_vehicle_scale_n_rotation_rendering();
    }
    if (this.geometry.minimap_size !== undefined && this.minimap_svg) {
      this.mini_zoomed_handler({
        x: parseInt(current_transform.x),
        y: parseInt(current_transform.y),
        k: parseInt(current_transform.k),
      });
    }
  }
  update_vehicle_scale_n_rotation_rendering() {
    let vehicle_css = main_css.vehicle;
    // Scale vehicle
    this.vehicle_svg
      .selectAll('.hover, .select')
      .attr(
        'transform',
        `rotate(${-this.map_rotation + 45})scale(${this.vehicle_scale.scale})`
      )
      .lower();
    this.vehicle_svg
      .selectAll('.vehicle_mask, .vehicle_circle, .outline, .fail')
      .attr('transform', `scale(${this.vehicle_scale.scale})`);
    this.vehicle_svg
      .selectAll('.corner, .error, .highlighted_el')
      .attr(
        'transform',
        `rotate(${-this.map_rotation})scale(${this.vehicle_scale.scale})`
      );
    this.vehicle_svg
      .selectAll('.stale')
      .attr(
        'transform',
        `rotate(${-this.map_rotation})translate(${
          vehicle_css.radius * 2 * this.vehicle_scale.scale
        },-${vehicle_css.radius * this.vehicle_scale.scale})scale(${
          this.vehicle_scale.scale
        })`
      );
    this.vehicle_svg
      .selectAll('.vehicle_circle_clean')
      .attr(
        'transform',
        `rotate(${-this.map_rotation + 45})scale(${this.vehicle_scale.scale})`
      );
    this.vehicle_svg
      .selectAll('.group_svg')
      .attr(
        'transform',
        `rotate(${-this.map_rotation})scale(${this.vehicle_scale.scale})`
      );
    this.vehicle_svg
      .selectAll('.push')
      .attr(
        'transform',
        `rotate(${-this.map_rotation})translate(${
          ((vehicle_css.radius * 4) / 3) * this.vehicle_scale.scale
        },${vehicle_css.radius * this.vehicle_scale.scale})scale(${
          this.vehicle_scale.scale
        })`
      );
    this.vehicle_svg.each((d) => {
      let d3_this = d3.select(`#id_${d.id}.vehicle`);
      let offset_x = (vehicle_css.radius * 4) / 3;
      if (d3_this.select('.push').nodes().length > 0) {
        offset_x = vehicle_css.radius * 3;
      }
      d3_this
        .select('.call')
        .attr(
          'transform',
          `rotate(${-this.map_rotation})translate(${
            offset_x * this.vehicle_scale.scale
          },${vehicle_css.radius * this.vehicle_scale.scale})scale(${
            this.vehicle_scale.scale
          })`
        );
    });
    if (this.vehicle_scale.scale >= 0.6) {
      this.vehicle_svg
        .selectAll('.label')
        .attr(
          'x',
          ((-vehicle_css.text_offset * 3) / 4) * this.vehicle_scale.scale
        )
        .attr('y', (-vehicle_css.radius / 2) * this.vehicle_scale.scale)
        .attr('display', 'block')
        .attr('transform', `rotate(${-this.map_rotation})`);
      this.vehicle_svg
        .selectAll('.label_order')
        .attr(
          'x',
          ((-vehicle_css.text_offset * 3) / 4) * this.vehicle_scale.scale
        )
        .attr(
          'y',
          (vehicle_css.radius * 2 - vehicle_css.radius / 2) *
            this.vehicle_scale.scale
        )
        .attr('display', 'block')
        .attr('transform', `rotate(${-this.map_rotation})`);
      this.vehicle_svg
        .selectAll('.foup')
        .attr('display', 'block')
        .attr('transform', `scale(${this.vehicle_scale.scale})`);
      this.vehicle_svg.selectAll('.hotlot').each((d) => {
        let d3_this = d3.select(`#id_${d.id}.vehicle`);
        d3_this
          .attr('x', () => {
            return (
              -((vehicle_css.text_offset * 3) / 4) * this.vehicle_scale.scale -
              d.order_id.toString().length * 6
            );
          })
          .attr('y', () => {
            return (
              (vehicle_css.radius * 2 - vehicle_css.radius / 2) *
                this.vehicle_scale.scale -
              10
            );
          })
          .attr('display', 'block')
          .attr('transform', `rotate(${-this.map_rotation})`);
      });
    } else {
      this.vehicle_svg
        .selectAll('.label, .label_order, .hotlot')
        .attr('display', 'none')
        .attr('transform', `rotate(${-this.map_rotation})`);
      this.vehicle_svg
        .selectAll('.foup')
        .attr('display', 'none')
        .attr(
          'transform',
          `rotate(${-this.map_rotation})scale(${this.vehicle_scale.scale})`
        );
    }
  }
  directions_adaptive_rendering(
    zoom_level: any,
    current_transform: IZoom,
    css_setting: any,
    view_box: any,
    need_update: boolean,
    segments?: any[]
  ) {
    let update_svg = false,
      selective_level = this.option.selective_lvl_display,
      direction_display = [];

    // if (zoom_level >= selective_level.direction || this.show_direction_arrows) {
    if (
      zoom_level >= selective_level.direction ||
      this.preferences.toggles.segmentDirections
    ) {
      // find segments
      if (!segments || segments.length === 0) {
        direction_display = this.append_showing_polygons('SEGMENT', view_box);
      } else {
        direction_display = segments;
      }

      if (
        zoom_level < selective_level.direction &&
        // this.show_direction_arrows
        this.preferences.toggles.segmentDirections
      ) {
        // Set zoom level to direction arrow display zoom level
        zoom_level = selective_level.direction;

        // Filter the array to carry only the every third element
        direction_display = direction_display.filter((dir_element) => {
          return dir_element.id % 3 === 0;
        });
      }

      // If there are elements to show
      if (direction_display.length > 0) {
        if (!need_update && this.directions_svg) {
          // If there are already points in view
          let changed = this.check_data_difference(
            direction_display,
            this.directions_svg.nodes()
          );

          // Check if updated_listed is different from already existing
          if (changed) {
            update_svg = true;
          }
        } else {
          // If there are none already existing
          update_svg = true;
        }

        // Update dom
        if (update_svg || need_update) {
          if (direction_display === []) {
            this.directions_svg.remove();
          } else {
            this.update_dom(
              'SEGMENT_DIRECTION',
              direction_display,
              css_setting,
              zoom_level,
              'LAYOUT',
              false
            );
          }
        }

        // Apply transform values to all point svg elements
        this.directions_svg.attr(
          'transform',
          this.transform(current_transform)
        );
      } else {
        // There is no direction to display in the view_box
        this.update_dom(
          'SEGMENT_DIRECTION',
          direction_display,
          css_setting,
          zoom_level,
          'LAYOUT',
          false
        );
      }
    } else {
      if (this.directions_svg && this.directions_svg.nodes().length > 0) {
        this.update_dom(
          'SEGMENT_DIRECTION',
          [],
          css_setting,
          zoom_level,
          'LAYOUT',
          false
        );
      }
    }
  }
  segments_adaptive_rendering(
    current_transform: IZoom,
    css_setting: any,
    view_box: {},
    need_update: boolean,
    segments: any[]
  ) {
    let update_svg = false,
      segments_display = [];

    // find segments
    if (!segments || segments.length === 0) {
      segments_display = this.append_showing_polygons('SEGMENT', view_box);
    } else {
      segments_display = segments;
    }

    // If there are elements to show
    if (segments_display.length > 0) {
      if (!need_update && this.segments_svg) {
        // If there are already points in view
        let changed = this.check_data_difference(
          segments_display,
          this.segments_svg.nodes()
        );

        // Check if updated_listed is different from already existing
        if (changed) {
          update_svg = true;
        }
      } else {
        // If there are none already existing
        update_svg = true;
      }

      // Update dom
      if (update_svg || need_update) {
        this.update_segment_svg(segments_display, css_setting, null, true);
      }

      // Apply transform values to all segments svg elements
      this.segments_svg.attr(
        'transform',
        `translate(${current_transform.x}, ${current_transform.y})scale(${current_transform.k})`
      );
    } else {
      // There is no direction to display in the view_box
      this.update_segment_svg(segments_display, css_setting, null, true);
    }
  }
  append_showing_polygons(type: string, view_box: any) {
    let objects_to_display = [];
    let rotated_view_box;
    if (this.map_rotation > 0) {
      rotated_view_box = this.get_rotated_viewbox();
    }
    for (
      let i = 0;
      i < this.layout_data[`${type.toLowerCase()}s`].length;
      i++
    ) {
      let object = this.layout_data[`${type.toLowerCase()}s`][i];

      let min_x = object.min_x,
        min_y = object.min_y,
        max_x = object.max_x,
        max_y = object.max_y;

      if (type === 'CLUSTER') {
        min_x = object.min_x;
        min_y = object.min_y;
        max_x = object.max_x;
        max_y = object.max_y;
      } else if (type === 'SEGMENT') {
        let extremities = LayoutUtil.find_max_and_min_of_objects(
          object,
          'INVERTED'
        );
        min_x = extremities.min.x;
        min_y = extremities.min.y;
        max_x = extremities.max.x;
        max_y = extremities.max.y;
      }

      if (rotated_view_box) {
        let rotated_view_bounds = {
          min: {
            x: Math.min(
              rotated_view_box[0][0],
              rotated_view_box[1][0],
              rotated_view_box[2][0],
              rotated_view_box[3][0]
            ),
            y: Math.min(
              rotated_view_box[0][1],
              rotated_view_box[1][1],
              rotated_view_box[2][1],
              rotated_view_box[3][1]
            ),
          },
          max: {
            x: Math.max(
              rotated_view_box[0][0],
              rotated_view_box[1][0],
              rotated_view_box[2][0],
              rotated_view_box[3][0]
            ),
            y: Math.max(
              rotated_view_box[0][1],
              rotated_view_box[1][1],
              rotated_view_box[2][1],
              rotated_view_box[3][1]
            ),
          },
        };
        if (
          (min_x > rotated_view_bounds.min.x &&
            min_x < rotated_view_bounds.max.x &&
            min_y > rotated_view_bounds.min.y &&
            min_y < rotated_view_bounds.max.y) || // Left top corner
          (max_x > rotated_view_bounds.min.x &&
            max_x < rotated_view_bounds.max.x &&
            max_y > rotated_view_bounds.min.y &&
            max_y < rotated_view_bounds.max.y) || // Right bottom corner
          (min_x > rotated_view_bounds.min.x &&
            min_x < rotated_view_bounds.max.x &&
            max_y > rotated_view_bounds.min.y &&
            max_y < rotated_view_bounds.max.y) || // Left bottom corner
          (max_x > rotated_view_bounds.min.x &&
            max_x < rotated_view_bounds.max.x &&
            min_y > rotated_view_bounds.min.y &&
            min_y < rotated_view_bounds.max.y) || // Right top corner
          (((min_y > rotated_view_bounds.min.y &&
            max_y < rotated_view_bounds.max.y) ||
            (min_y > rotated_view_bounds.min.y &&
              min_y < rotated_view_bounds.max.y) ||
            (max_y > rotated_view_bounds.min.y &&
              max_y < rotated_view_bounds.max.y)) &&
            min_x < rotated_view_bounds.min.x &&
            max_x > rotated_view_bounds.max.x) || // side corners are out, but parts of middle is in view
          (((min_x > rotated_view_bounds.min.x &&
            max_x < rotated_view_bounds.max.x) ||
            (min_x > rotated_view_bounds.min.x &&
              min_x < rotated_view_bounds.max.x) ||
            (max_x > rotated_view_bounds.min.x &&
              max_x < rotated_view_bounds.max.x)) &&
            min_y < rotated_view_bounds.min.y &&
            max_y > rotated_view_bounds.max.y) || // top/bottom corners are out, but parts of middle is in view
          (min_x < rotated_view_bounds.min.x &&
            max_x > rotated_view_bounds.max.x &&
            min_y < rotated_view_bounds.min.y &&
            max_y > rotated_view_bounds.max.y)
        ) {
          // When object is bigger than the screen

          objects_to_display.push(object);
        }
      } else {
        if (
          (min_x > view_box.x_from &&
            min_x < view_box.x_to &&
            min_y > view_box.y_from &&
            min_y < view_box.y_to) || // Left top corner
          (max_x > view_box.x_from &&
            max_x < view_box.x_to &&
            max_y > view_box.y_from &&
            max_y < view_box.y_to) || // Right bottom corner
          (min_x > view_box.x_from &&
            min_x < view_box.x_to &&
            max_y > view_box.y_from &&
            max_y < view_box.y_to) || // Left bottom corner
          (max_x > view_box.x_from &&
            max_x < view_box.x_to &&
            min_y > view_box.y_from &&
            min_y < view_box.y_to) || // Right top corner
          (((min_y > view_box.y_from && max_y < view_box.y_to) ||
            (min_y > view_box.y_from && min_y < view_box.y_to) ||
            (max_y > view_box.y_from && max_y < view_box.y_to)) &&
            min_x < view_box.x_from &&
            max_x > view_box.x_to) || // side corners are out, but parts of middle is in view
          (((min_x > view_box.x_from && max_x < view_box.x_to) ||
            (min_x > view_box.x_from && min_x < view_box.x_to) ||
            (max_x > view_box.x_from && max_x < view_box.x_to)) &&
            min_y < view_box.y_from &&
            max_y > view_box.y_to) || // top/bottom corners are out, but parts of middle is in view
          (min_x < view_box.x_from &&
            max_x > view_box.x_to &&
            min_y < view_box.y_from &&
            max_y > view_box.y_to)
        ) {
          // When object is bigger than the screen

          objects_to_display.push(object);
        }
      }
    }
    // logger.log("Objects showing: " + objects_to_display.length)
    return objects_to_display;
  }
  get_rotated_viewbox(): any {
    throw new Error('Method not implemented.');
  }
  point_adaptive_rendering(
    zoom_level: any,
    current_transform: IZoom,
    css_setting: any,
    view_box: {}
  ) {
    let update_svg = false,
      selective_level = this.option.selective_lvl_display,
      point_display = [];

    // Check point label display condition
    // if (this.show_point_labels) {
    if (this.preferences.toggles.pointLabels) {
      zoom_level = selective_level.point_label;
    }

    if (zoom_level >= selective_level.point_circle) {
      // find points
      point_display = this.append_showing_objects('POINT', view_box);

      // If there are elements to show
      if (point_display.length > 0) {
        if (this.points_svg) {
          // If there are already points in view
          let changed = this.check_data_difference(
            point_display,
            this.points_svg.nodes()
          );

          // Check if updated_listed is different from already existing
          if (changed) {
            update_svg = true;
          }

          // Display According to zoom.current_main levels
          if (zoom_level >= selective_level.point_label) {
            // LVL 3 //
            if (
              this.points_svg.node() &&
              this.points_svg.attr('level') !== 'level3'
            ) {
              update_svg = true;
            }
          } else {
            // LVL 2 =======================================//
            if (
              this.points_svg.node() &&
              this.points_svg.attr('level') !== 'level2'
            ) {
              update_svg = true;
            }
          }
        } else {
          // If there are none already existing
          update_svg = true;
        }

        // Update dom
        if (update_svg) {
          if (point_display === []) {
            this.update_dom(
              'POINT',
              point_display,
              css_setting,
              zoom_level,
              'LAYOUT',
              false
            );
          } else {
            this.update_dom(
              'POINT',
              point_display,
              css_setting,
              zoom_level,
              'LAYOUT',
              false
            );
          }
        }

        // Apply transform values to all point svg elements
        this.points_svg.attr('transform', this.transform(current_transform));
      } else {
        // There is no point to display in the view_box
        this.update_dom(
          'POINT',
          point_display,
          css_setting,
          zoom_level,
          'LAYOUT',
          false
        );
      }
    } else {
      if (this.points_svg && this.points_svg.nodes().length > 0) {
        this.update_dom('POINT', [], css_setting, zoom_level, 'LAYOUT', false);
      }
    }
  }
  transform(transform: any): any {
    return (d) => {
      let trans_array;
      let rotation = -this.map_rotation;

      let is_translate = false;
      let is_rotate = false;
      let is_scale = false;
      if (d.constructor.name.toUpperCase() === 'SEGMENT') {
        trans_array = transform.apply([d.dir_coord.x, d.dir_coord.y]);
        is_translate = true;
      } else if (
        d.constructor.name.toUpperCase() === 'STATION' ||
        d.constructor.name.toUpperCase() === 'BUFFER'
      ) {
        is_translate = true;
        trans_array = transform.apply([d.inverted_coord.x, d.inverted_coord.y]);
      } else if (d.constructor.name.toUpperCase() === 'CLUSTER') {
        trans_array = transform.apply([
          d.inverted_coord_from.x,
          d.inverted_coord_from.y,
        ]);
        is_scale = true;
      } else {
        is_translate = true;
        is_rotate = true;
        trans_array = transform.apply([d.inverted_coord.x, d.inverted_coord.y]);
      }

      trans_array[0] = parseInt(trans_array[0]);
      trans_array[1] = parseInt(trans_array[1]);

      let transform_str = '';
      if (is_translate) {
        transform_str += `translate(${trans_array})`;
      } else {
        transform_str += `translate(${transform.x}, ${transform.y})`;
      }

      if (is_scale) {
        transform_str += `scale(${transform.k})`;
      }

      if (is_rotate) {
        transform_str += `rotate(${rotation})`;
      }

      return transform_str;
    };
  }
  update_dom(
    object_type: string,
    data: any,
    dom_css: any,
    zoom_level: any,
    group_type: string,
    is_zoom_only: boolean
  ) {
    let show_overlap = false;
    let current_zoom = this.getZoom(MapTypes.MAIN) as any;
    let overlap_element;
    let overlap_objects_list;
    let overlap_class_string;
    let group_colors;
    let offset_multiplier = 1 / 3;

    if (!zoom_level) {
      zoom_level = this.calculate_zoom_level();
    }

    offset_multiplier *= zoom_level > 1 ? zoom_level : 0;

    if (group_type === 'OVERLAP') {
      show_overlap = true;
      overlap_element = this.overlap_display_panel_svg;
      overlap_objects_list = this.overlap_display_objects;
      overlap_class_string = 'overlap';
    } else if (group_type === 'OVERLAP_MODULE') {
      show_overlap = true;
      overlap_element = this.overlap_module_svg;
      overlap_objects_list = this.overlap_module_objects;
      overlap_class_string = 'panel_overlap';
    } else if (group_type === 'UNASSIGNED_MODULE') {
      show_overlap = true;
      overlap_element = this.unassigned_module_svg;
      overlap_objects_list = this.unassigned_module_objects;
      overlap_class_string = 'panel_unassigned';
    } else if (group_type === 'LAYOUT' || group_type === null) {
      overlap_objects_list = [];
    }

    // populate group color object if groups are on
    // if (this.show_groups) {
    if (this.preferences.toggles.groups) {
      group_colors = {}; // {group_id : color}
      for (let group of this.layout_data.groups) {
        group_colors[group.id] = ColorPalette.get_color(group.color);
      }
    }

    if (object_type === 'POINT') {
      // event_mask = '.point_mask'

      if (show_overlap) {
        // Add single object
        if (overlap_objects_list.length > 0) {
          overlap_element = overlap_element
            .append('g')
            .attr('class', `point_${overlap_class_string}`)
            .attr('id', `id_${data.id}`)
            .attr('x', data.inverted_coord.x)
            .attr('y', data.inverted_coord.y);
          if (zoom_level === 2) {
            this.append_dom_subpart(
              'POINT',
              overlap_element,
              data,
              dom_css,
              zoom_level,
              group_type,
              null
            );
          } else if (zoom_level === 3) {
            this.append_dom_subpart(
              'POINT',
              overlap_element,
              data,
              dom_css,
              zoom_level,
              group_type,
              null
            );
            this.append_dom_subpart(
              'POINT_LABEL',
              overlap_element,
              data,
              dom_css,
              zoom_level,
              group_type,
              null
            );
          }
        }
      } else {
        // load bulk objetcs
        this.points_svg = this.get_svg_class(object_type)
          .selectAll('.point')
          .data(data, function (d) {
            return d.id;
          });

        // Update points
        this.points_svg
          .attr('level', `level${zoom_level}`)
          .attr('x', function (d) {
            return d.inverted_coord.x;
          })
          .attr('y', function (d) {
            return d.inverted_coord.y;
          })
          .attr('transform', (d) => {
            return `translate(${current_zoom.apply([
              d.inverted_coord.x,
              d.inverted_coord.y,
            ])})rotate(${-this.map_rotation})`;
          })
          .each((d) => {
            let d3_this = d3.select(`#id_${d.id}.point`);
            if (zoom_level >= this.option.selective_lvl_display.point_label) {
              if (d3_this.select('text').node() === null) {
                this.append_dom_subpart(
                  'POINT_LABEL',
                  d3_this,
                  d,
                  dom_css,
                  zoom_level,
                  group_type,
                  null
                );
              }
            }
          });
        this.points_svg.selectAll('.label').text(function (d) {
          let id = d.logical_id ? d.logical_id : d.id;
          return `${id}`;
        });

        this.points_svg.exit().remove();
        this.points_svg
          .enter()
          .append('g')
          .attr('class', 'point')
          .attr('level', `level${zoom_level}`)
          .attr('id', function (d) {
            return `id_${d.id}`;
          })
          .attr('g_type', 'main')
          .attr('x', function (d) {
            return d.inverted_coord.x;
          })
          .attr('y', function (d) {
            return d.inverted_coord.y;
          })
          .attr('transform', (d) => {
            return `translate(${current_zoom.apply([
              d.inverted_coord.x,
              d.inverted_coord.y,
            ])})rotate(${-this.map_rotation})`;
          })
          .each((d) => {
            let d3_this = d3.select(`#id_${d.id}.point`);
            this.append_dom_subpart(
              object_type,
              d3_this,
              d,
              dom_css,
              zoom_level,
              group_type,
              null
            );
            // Add label
            if (zoom_level >= this.option.selective_lvl_display.point_label) {
              this.append_dom_subpart(
                'POINT_LABEL',
                d3_this,
                d,
                dom_css,
                zoom_level,
                group_type,
                null
              );
            }
          });
        if (zoom_level < this.option.selective_lvl_display.point_label) {
          this.points_svg.selectAll('text').remove();
        }
      }
      // d3 select svg elements for manipulation
      this.points_svg = this.get_svg_class(object_type).selectAll('g.point');
    } else if (object_type === 'SEGMENT_DIRECTION') {
      this.directions_svg = this.get_svg_class(object_type)
        .selectAll('.direction')
        .data(data, function (d) {
          return d.id;
        });
      // Update
      if (zoom_level > 1) {
        this.directions_svg
          .attr('x', function (d) {
            return d.dir_coord.x;
          })
          .attr('y', function (d) {
            return d.dir_coord.y;
          })
          .attr('transform', function (d) {
            return `translate(${current_zoom.apply([
              d.dir_coord.x,
              d.dir_coord.y,
            ])})`;
          })
          .each((d) => {
            let d3_this = d3
              .select(`#id_${d.id}.point`)
              .select('.dir_triangle');
            if (d3_this) {
              d3_this.attr(
                'transform',
                `rotate(${Math.trunc(
                  CommonUtil.degrees(d.dir_angle)
                )},0,0)scale(${this.direction_arrow_scale.scale})`
              );
            }
          });
      }

      this.directions_svg.exit().remove();

      if (zoom_level > 1) {
        this.directions_svg
          .enter()
          .append('g')
          .attr('class', 'direction')
          .attr('id', function (d) {
            return `id_${d.id}`;
          })
          .attr('g_type', 'main')
          .attr('x', function (d) {
            return d.dir_coord.x;
          })
          .attr('y', function (d) {
            return d.dir_coord.y;
          })
          .attr('transform', function (d) {
            return `translate(${current_zoom.apply([
              d.dir_coord.x,
              d.dir_coord.y,
            ])})`;
          })
          .each((d) => {
            this.append_dom_subpart(
              object_type,
              d3.select(`#id_${d.id}.direction`),
              d,
              dom_css,
              zoom_level,
              group_type,
              null
            );
          });
      }

      // d3 select svg elements for manipulation
      this.directions_svg = this.get_svg_class('SEGMENT_DIRECTION').selectAll(
        'g.direction'
      );
      if (group_type === 'LAYOUT') {
        this.directions_svg.selectAll('.dir_triangle').each((d) => {
          d3.select(`#id_${d.id}.direction`).attr(
            'transform',
            `rotate(${Math.trunc(CommonUtil.degrees(d.dir_angle))},0,0)scale(${
              this.direction_arrow_scale.scale
            })`
          );
        });
      }
    } else if (object_type === 'STATION') {
      // Offset for translating the stations to the side of track
      let group_offset_multiplier =
        offset_multiplier < 1 / 3 ? 1 / 3 : offset_multiplier;

      if (show_overlap) {
        // Add single object
        if (overlap_objects_list.length > 0) {
          overlap_element = overlap_element
            .append('g')
            .attr('class', `station_${overlap_class_string}`)
            .attr('id', `id_${data.id}`)
            .attr('x', 0)
            .attr('y', 0)
            .attr('transform', `translate(0, 0)`);

          this.append_dom_subpart(
            'STATION',
            overlap_element,
            data,
            dom_css,
            zoom_level,
            group_type,
            group_colors
          );
          overlap_element
            .select('.station_path')
            .attr('d', dom_css.icon_level3)
            .attr('level', 'level3');
          overlap_element
            .select('.station_mask')
            .attr('d', dom_css.icon_level3)
            .attr('level', 'level3');
          this.append_dom_subpart(
            'STATION_DETAIL',
            overlap_element,
            data,
            dom_css,
            zoom_level,
            group_type,
            group_colors
          );
        }
      } else {
        // load bulk objetcs
        this.stations_svg = this.get_svg_class(object_type)
          .selectAll('.station')
          .data(data, function (d) {
            return d.id;
          });

        // Update existing elements if any

        // Main element
        if (zoom_level === 1) {
          this.stations_svg
            .selectAll('path.station_path, path.station_mask')
            .remove();
          this.stations_svg.each((d) => {
            let d3_this = d3.select(`#id_${d.id}.station`);
            if (d3_this.select('rect.station_path').node() === null) {
              d3_this
                .append('rect')
                .attr('class', 'station_path')
                .attr('level', `level${zoom_level}`)
                .attr('transform', `rotate(${-this.map_rotation})`);

              d3_this
                .append('rect')
                .attr('class', 'station_mask')
                .attr('transform', `rotate(${-this.map_rotation})`);
              this.attach_event_handler(
                object_type,
                d3_this.select('.station_mask'),
                d,
                dom_css,
                group_type
              );
            }
          });

          this.stations_svg
            .selectAll('rect')
            .attr('level', `level${zoom_level}`);
        } else {
          if (this.stations_svg.selectAll('rect.station_path').node()) {
            this.stations_svg
              .selectAll('rect.station_path, rect.station_mask')
              .remove();
          }

          this.stations_svg.each((d) => {
            let d3_this = d3.select(`#id_${d.id}.station`);
            if (
              d3_this.select('.station_path, .station_mask').node() === null
            ) {
              d3_this
                .append('path')
                .attr('class', 'station_path')
                .attr('level', `level${zoom_level}`)
                .attr('d', main_css.station[`icon_level${zoom_level}`])
                .attr(
                  'transform',
                  `translate(${d.direction_offset.x * offset_multiplier}, ${
                    d.direction_offset.y * offset_multiplier
                  })`
                );

              d3_this
                .append('path')
                .attr('class', 'station_mask')
                .attr('d', main_css.station[`icon_level${zoom_level}`])
                .attr(
                  'transform',
                  `translate(${d.direction_offset.x * offset_multiplier}, ${
                    d.direction_offset.y * offset_multiplier
                  })`
                );
              this.attach_event_handler(
                object_type,
                d3_this.select('.station_mask'),
                d,
                dom_css,
                group_type
              );
            }
            // Add detail ===============================================//
            if (zoom_level >= this.option.selective_lvl_display.station_det) {
              if (d3_this.select('text').node() === null) {
                this.append_dom_subpart(
                  'STATION_DETAIL',
                  d3_this,
                  d,
                  main_css.station,
                  zoom_level,
                  group_type,
                  group_colors
                );
              }
            }
          });

          this.stations_svg.attr('transform', function (d) {
            return `translate(${current_zoom.apply([
              d.inverted_coord.x,
              d.inverted_coord.y,
            ])})`;
          });

          this.stations_svg
            .selectAll('.station_path, .station_mask')
            .attr('d', main_css.station[`icon_level${zoom_level}`])
            .attr('level', `level${zoom_level}`);
          this.stations_svg.selectAll('.label').text(function (d) {
            let id = d.logical_id ? d.logical_id : d.id;
            return id;
          });
        }

        this.stations_svg.each((d) => {
          d3.select(`#id_${d.id}.station`)
            .selectAll('.station_path, .station_mask, text, .select, .hover')
            .attr(
              'transform',
              `translate(${d.direction_offset.x * offset_multiplier}, ${
                d.direction_offset.y * offset_multiplier
              })rotate(${-this.map_rotation})`
            );
        });

        // if (this.show_groups) {
        if (this.preferences.toggles.groups) {
          this.stations_svg.each((d) => {
            let d3_this = d3.select(`#id_${d.id}.station`);
            let group_svg = d3_this.select('.group_svg');
            if (d.group) {
              let size = main_css.group.track_group_size[zoom_level];
              // Keep group svg to the side of track
              if (group_svg.nodes().length === 0) {
                d3_this
                  .append('rect')
                  .attr('class', 'group_svg')
                  .attr('zoom_level', `level_${zoom_level}`)
                  .attr('x', -size / 2)
                  .attr('y', -size / 2)
                  .attr('rx', size / 4)
                  .attr('ry', size / 4)
                  .attr('width', size)
                  .attr('height', size)
                  .attr('fill', group_colors[d.group])
                  .style('opacity', main_css.group.opacity)
                  .lower();
              } else if (
                group_svg.nodes().length > 0 &&
                (group_svg.attr('zoom_level') !== `level_${zoom_level}` ||
                  group_svg.attr('fill') != group_colors[d.group])
              ) {
                group_svg
                  .attr('zoom_level', `level_${zoom_level}`)
                  .attr('x', -size / 2)
                  .attr('y', -size / 2)
                  .attr('rx', size / 4)
                  .attr('ry', size / 4)
                  .attr('width', size)
                  .attr('height', size)
                  .attr('fill', group_colors[d.group])
                  .style('opacity', main_css.group.opacity);
              }
            } else {
              group_svg.remove();
            }
          });
        }

        this.stations_svg.exit().remove();
        this.stations_svg
          .enter()
          .append('g')
          .attr('class', 'station')
          .attr('id', function (d) {
            return `id_${d.id}`;
          })
          .attr('g_type', 'main')
          .attr('x', function (d) {
            return d.inverted_coord.x;
          })
          .attr('y', function (d) {
            return d.inverted_coord.y;
          })
          .attr('transform', function (d) {
            return `translate(${current_zoom.apply([
              d.inverted_coord.x,
              d.inverted_coord.y,
            ])})`;
          })
          .each((d) => {
            let d3_this = d3.select(`#id_${d.id}.station`);
            this.append_dom_subpart(
              object_type,
              d3_this,
              d,
              main_css.station,
              zoom_level,
              group_type,
              group_colors
            );
            // Add detail ===============================================//
            if (zoom_level >= this.option.selective_lvl_display.station_det) {
              this.append_dom_subpart(
                'STATION_DETAIL',
                d3_this,
                d,
                main_css.station,
                zoom_level,
                group_type,
                group_colors
              );
            }
          });

        // Add detail ===============================================//
        if (zoom_level < this.option.selective_lvl_display.station_det) {
          this.stations_svg
            .selectAll('.label, .port_foup, .port_foup_label')
            .remove();
        }
      }
      // d3 select svg elements for manipulation
      this.stations_svg = this.get_svg_class('STATION').selectAll('g.station');
      this.stations_path = this.stations_svg.selectAll('.station_path');
      // stations_mask = this.stations_svg.selectAll('.station_mask')
      if (group_type === 'LAYOUT') {
        this.stations_svg
          .selectAll(
            '.station_path, .station_mask, .group_svg, .hover, .select'
          )
          .each((d) => {
            d3.select(`#id_${d.id}.station`).attr(
              'transform',
              `translate(${d.direction_offset.x * group_offset_multiplier}, ${
                d.direction_offset.y * group_offset_multiplier
              })rotate(${-this.map_rotation})scale(${
                this.location_scale.scale
              })`
            );
          });
      }
    } else if (object_type === 'BUFFER') {
      // Offset for translating the stations to the side of track
      let group_offset_multiplier =
        offset_multiplier < 1 / 3 ? 1 / 3 : offset_multiplier;

      if (show_overlap) {
        // Add single object
        if (overlap_objects_list.length > 0) {
          overlap_element = overlap_element
            .append('g')
            .attr('class', `buffer_${overlap_class_string}`)
            .attr('id', `id_${data.id}`)
            .attr('x', 0)
            .attr('y', 0)
            .attr('transform', `translate(0, 0)`);

          this.append_dom_subpart(
            'BUFFER',
            overlap_element,
            data,
            dom_css,
            zoom_level,
            group_type,
            group_colors
          );
          overlap_element
            .select('.buffer_path')
            .attr('d', dom_css.icon_level3)
            .attr('level', 'level3');
          overlap_element
            .select('.buffer_mask')
            .attr('d', dom_css.icon_level3)
            .attr('level', 'level3');
          this.append_dom_subpart(
            'BUFFER_DETAIL',
            overlap_element,
            data,
            dom_css,
            zoom_level,
            group_type,
            group_colors
          );
        }
      } else {
        // load bulk objetcs
        this.buffers_svg = this.get_svg_class(object_type)
          .selectAll('.buffer')
          .data(data, function (d) {
            return d.id;
          });

        // Update existing elements if any
        if (zoom_level === 1) {
          this.buffers_svg.selectAll('path').remove();
          this.buffers_svg.each((d) => {
            // let d3_this = d3.select(this);
            let d3_this = d3.select(`#id_${d.id}.buffer`);
            if (d3_this.select('circle.buffer_path').node() === null) {
              d3_this
                .append('circle')
                .attr('class', 'buffer_path')
                .attr('level', `level${zoom_level}`)
                .attr('transform', `rotate(${-this.map_rotation})`);

              d3_this
                .append('circle')
                .attr('class', 'buffer_mask')
                .attr('transform', `rotate(${-this.map_rotation})`);

              this.attach_event_handler(
                object_type,
                d3_this.select('.buffer_mask'),
                d,
                dom_css,
                group_type
              );
            }
          });

          this.buffers_svg
            .selectAll('circle')
            .attr('level', `level${zoom_level}`);
        } else {
          if (this.buffers_svg.selectAll('circle.buffer_path').node()) {
            this.buffers_svg
              .selectAll('circle.buffer_path, circle.buffer_mask')
              .remove();
          }

          this.buffers_svg.each((d) => {
            let d3_this = d3.select(`#id_${d.id}.buffer`);
            if (d3_this.select('.buffer_path, .buffer_mask').node() === null) {
              d3_this
                .append('path')
                .attr('class', 'buffer_path')
                .attr('level', `level${zoom_level}`)
                .attr('d', main_css.buffer[`icon_level${zoom_level}`])
                .attr(
                  'transform',
                  `translate(${d.direction_offset.x * offset_multiplier}, ${
                    d.direction_offset.y * offset_multiplier
                  })`
                );

              d3_this
                .append('path')
                .attr('class', 'buffer_mask')
                .attr('d', main_css.buffer[`icon_level${zoom_level}`])
                .attr(
                  'transform',
                  `translate(${d.direction_offset.x * offset_multiplier}, ${
                    d.direction_offset.y * offset_multiplier
                  })`
                );

              this.attach_event_handler(
                object_type,
                d3_this.select('.buffer_mask'),
                d,
                dom_css,
                group_type
              );
            }
            // Add detail ===============================================//
            if (zoom_level >= this.option.selective_lvl_display.buffer_det) {
              if (d3_this.select('text').node() === null) {
                this.append_dom_subpart(
                  'BUFFER_DETAIL',
                  d3_this,
                  d,
                  dom_css,
                  zoom_level,
                  group_type,
                  group_colors
                );
              }
            }
          });

          this.buffers_svg.attr('transform', function (d) {
            return `translate(${current_zoom.apply([
              d.inverted_coord.x,
              d.inverted_coord.y,
            ])})`;
          });

          this.buffers_svg
            .selectAll('.buffer_path, .buffer_mask')
            .attr('d', main_css.buffer[`icon_level${zoom_level}`])
            .attr('level', `level${zoom_level}`);
          this.buffers_svg.selectAll('.label').text(function (d) {
            let id = d.logical_id ? d.logical_id : d.id;
            return id;
          });
        }

        this.buffers_svg.each((d) => {
          // d3.select(this)
          d3.select(`#id_${d.id}.buffer`)
            .selectAll('.buffer_path, .buffer_mask, text, .select, .hover')
            .attr(
              'transform',
              `translate(${d.direction_offset.x * offset_multiplier}, ${
                d.direction_offset.y * offset_multiplier
              })rotate(${-this.map_rotation})`
            );
        });

        // if (this.show_groups) {
        if (this.preferences.toggles.groups) {
          this.buffers_svg.each((d) => {
            // let d3_this = d3.select(this);
            let d3_this = d3.select(`#id_${d.id}.buffer`);
            let group_svg = d3_this.select('.group_svg');
            if (d.group) {
              let size = main_css.group.track_group_size[zoom_level];
              // Keep group svg to the side of track
              if (group_svg.nodes().length === 0) {
                d3_this
                  .append('rect')
                  .attr('class', 'group_svg')
                  .attr('zoom_level', `level_${zoom_level}`)
                  .attr('x', -size / 2)
                  .attr('y', -size / 2)
                  .attr('rx', size / 4)
                  .attr('ry', size / 4)
                  .attr('width', size)
                  .attr('height', size)
                  .attr('fill', group_colors[d.group])
                  .style('opacity', main_css.group.opacity)
                  .lower();
              } else if (
                group_svg.nodes().length > 0 &&
                (group_svg.attr('zoom_level') !== `level_${zoom_level}` ||
                  group_svg.attr('fill') != group_colors[d.group])
              ) {
                group_svg
                  .attr('zoom_level', `level_${zoom_level}`)
                  .attr('x', -size / 2)
                  .attr('y', -size / 2)
                  .attr('rx', size / 4)
                  .attr('ry', size / 4)
                  .attr('width', size)
                  .attr('height', size)
                  .attr('fill', group_colors[d.group])
                  .style('opacity', main_css.group.opacity);
              }
            } else {
              group_svg.remove();
            }
          });
        }

        this.buffers_svg.exit().remove();
        this.buffers_svg
          .enter()
          .append('g')
          .attr('class', 'buffer')
          .attr('id', function (d) {
            return `id_${d.id}`;
          })
          .attr('g_type', 'main')
          .attr('x', function (d) {
            return d.inverted_coord.x;
          })
          .attr('y', function (d) {
            return d.inverted_coord.y;
          })
          .attr('transform', function (d) {
            return `translate(${current_zoom.apply([
              d.inverted_coord.x,
              d.inverted_coord.y,
            ])})`;
          })
          .each((d) => {
            // let d3_this = d3.select(this);
            let d3_this = d3.select(`#id_${d.id}.buffer`);
            this.append_dom_subpart(
              object_type,
              d3_this,
              d,
              main_css.buffer,
              zoom_level,
              group_type,
              group_colors
            );
            if (zoom_level >= this.option.selective_lvl_display.buffer_det) {
              this.append_dom_subpart(
                'BUFFER_DETAIL',
                d3_this,
                d,
                main_css.buffer,
                zoom_level,
                group_type,
                group_colors
              );
            }
          });

        // Add detail ===============================================//
        if (zoom_level < this.option.selective_lvl_display.buffer_det) {
          this.buffers_svg
            .selectAll('.label, .port_foup, .port_foup_label')
            .remove();
        }
      }
      // d3 select svg elements for manipulation
      this.buffers_svg = this.get_svg_class(object_type).selectAll('g.buffer');
      this.buffers_path = this.buffers_svg.selectAll('.buffer_path');
      // buffers_mask = this.buffers_svg.selectAll('.buffer_mask')
      // @NOTE 선언되지 않은 변수
      // buffers_details = this.buffers_svg.selectAll(
      //   '.label, .port_foup, .port_foup_label'
      // );
      if (group_type === 'LAYOUT') {
        this.buffers_svg
          .selectAll('.buffer_path, .buffer_mask, .group_svg, .hover, .select')
          .each((d) => {
            // d3.select(this).attr(
            d3.select(`#id_${d.id}.buffer`).attr(
              'transform',
              `translate(${d.direction_offset.x * group_offset_multiplier}, ${
                d.direction_offset.y * group_offset_multiplier
              })rotate(${-this.map_rotation})scale(${
                this.location_scale.scale
              })`
            );
          });
      }
    } else if (object_type === 'MTL') {
      // event_mask = '.mtl_mask'

      if (show_overlap) {
        // Add single object
        if (overlap_objects_list.length > 0) {
          overlap_element = overlap_element
            .append('g')
            .attr('class', `mtl_${overlap_class_string}`)
            .attr('id', `id_${data.id}`)
            .attr('x', data.inverted_coord.x)
            .attr('y', data.inverted_coord.y)
            .attr('transform', `translate(0, 0)`);

          //Add to DOM
          this.append_dom_subpart(
            object_type,
            overlap_element,
            data,
            dom_css,
            zoom_level,
            group_type,
            group_colors
          );
          overlap_element
            .select('.mtl_path')
            .attr('d', dom_css.icon_level3)
            .attr('level', 'level3');
          overlap_element
            .select('.mtl_mask')
            .attr('d', dom_css.icon_level3)
            .attr('level', 'level3');
          this.append_dom_subpart(
            'MTL_DETAIL',
            overlap_element,
            data,
            dom_css,
            zoom_level,
            group_type,
            group_colors
          );
        }
      } else {
        // load bulk objetcs
        this.mtls_svg = this.get_svg_class(object_type)
          .selectAll('.mtl')
          .data(data, function (d) {
            return d.id;
          });

        // Update existing elements if any
        this.mtls_svg
          .selectAll('.mtl_path, .mtl_mask')
          .attr('d', main_css.mtl[`icon_level${zoom_level}`])
          .attr('level', `level${zoom_level}`);

        this.mtls_svg.attr('transform', (d) => {
          return `translate(${current_zoom.apply([
            d.inverted_coord.x,
            d.inverted_coord.y,
          ])})rotate(${-this.map_rotation})`;
        });

        if (zoom_level >= this.option.selective_lvl_display.mtl_det) {
          this.mtls_svg.each((d) => {
            // let d3_this = d3.select(this);
            let d3_this = d3.select(`#id_${d.id}.mtl`);
            let label = d3_this.select('.label');
            if (label.node()) {
              // exists already
              label.text(function () {
                return d.logical_id ? d.logical_id : d.id;
              });
            } else {
              d3_this
                .append('text')
                .attr('class', 'label')
                .attr('font-size', `${dom_css.font_size}px`)
                .attr('x', dom_css.text_offset)
                .attr('y', dom_css.width / 2)
                .attr('text-anchor', 'start')
                .text(function () {
                  return d.logical_id ? d.logical_id : d.id;
                });
            }
          });
        }

        // if (this.show_groups) {
        if (this.preferences.toggles.groups) {
          this.mtls_svg.each((d) => {
            // let d3_this = d3.select(this);
            let d3_this = d3.select(`#id_${d.id}.mtl`);
            let group_svg = d3_this.select('.group_svg');
            if (d.group) {
              let size = main_css.group.track_group_size[zoom_level];
              if (group_svg.nodes().length === 0) {
                d3_this
                  .append('rect')
                  .attr('class', 'group_svg')
                  .attr('zoom_level', `level_${zoom_level}`)
                  .attr('x', -size / 2)
                  .attr('y', -size / 2)
                  .attr('rx', size / 4)
                  .attr('ry', size / 4)
                  .attr('width', size)
                  .attr('height', size)
                  .attr('fill', group_colors[d.group])
                  .style('opacity', main_css.group.opacity)
                  .lower();
              } else if (
                group_svg.nodes().length > 0 &&
                (group_svg.attr('zoom_level') !== `level_${zoom_level}` ||
                  group_svg.attr('fill') != group_colors[d.group])
              ) {
                group_svg
                  .attr('zoom_level', `level_${zoom_level}`)
                  .attr('x', -size / 2)
                  .attr('y', -size / 2)
                  .attr('rx', size / 4)
                  .attr('ry', size / 4)
                  .attr('width', size)
                  .attr('height', size)
                  .attr('fill', group_colors[d.group])
                  .style('opacity', main_css.group.opacity);
              }
            } else {
              group_svg.remove();
            }
          });
        }

        this.mtls_svg.exit().remove();
        this.mtls_svg
          .enter()
          .append('g')
          .attr('class', 'mtl')
          .attr('id', function (d) {
            return `id_${d.id}`;
          })
          .attr('g_type', 'main')
          .attr('x', function (d) {
            return d.inverted_coord.x;
          })
          .attr('y', function (d) {
            return d.inverted_coord.y;
          })
          .attr('transform', (d) => {
            return `translate(${current_zoom.apply([
              d.inverted_coord.x,
              d.inverted_coord.y,
            ])})rotate(${-this.map_rotation})`;
          })
          .each((d) => {
            // let d3_this = d3.select(this);
            let d3_this = d3.select(`#id_${d.id}.mtl`);
            this.append_dom_subpart(
              object_type,
              d3_this,
              d,
              main_css.mtl,
              zoom_level,
              group_type,
              group_colors
            );
            if (zoom_level >= this.option.selective_lvl_display.mtl_det) {
              this.append_dom_subpart(
                'MTL_DETAIL',
                d3_this,
                d,
                main_css.mtl,
                zoom_level,
                group_type,
                group_colors
              );
            }
          });

        // Add detail ===============================================//
        if (zoom_level < this.option.selective_lvl_display.mtl_det) {
          this.mtls_svg
            .selectAll('.label, .port_foup, .port_foup_label')
            .remove();
        }
      }
      // d3 select svg elements for manipulation
      this.mtls_svg = this.get_svg_class(object_type).selectAll('g.mtl');
      this.mtls_path = this.mtls_svg.selectAll('.mtl_path');
      // mtls_mask = this.mtls_svg.selectAll('.mtl_mask')
      // @NOTE 선언되지 않은 변수
      // mtls_details = this.mtls_svg.selectAll('.mtl text.label');

      if (group_type === 'LAYOUT') {
        this.mtls_svg
          .selectAll('.mtl_path, .mtl_mask, .group_svg, .hover, .select')
          .attr(
            'transform',
            `rotate(${-this.map_rotation})scale(${this.location_scale.scale})`
          );
      }
    } else if (object_type === 'CLUSTER') {
      this.clusters_svg = this.get_svg_class(object_type)
        .selectAll('.cluster')
        .data(data, function (d) {
          return d.id;
        })
        .each((d) => {
          // let d3_this = d3.select(this);
          let d3_this = d3.select(`#id_${d.id}.cluster`);

          // Update path and color of the visible path element
          d3_this
            .selectAll('.cluster_path')
            .attr('d', d.path)
            .attr('fill', ColorPalette.get_color(d.color))
            .attr('stroke', ColorPalette.get_color(d.color));

          // Update the path of the cluster mask element
          d3_this.selectAll('.cluster_mask').attr('d', d.path);
        });

      this.clusters_svg.exit().remove();
      this.clusters_svg
        .enter()
        .append('g')
        .attr('class', 'cluster')
        .attr('id', function (d) {
          return `id_${d.id}`;
        })
        .attr('g_type', 'main')
        .attr('from_x', function (d) {
          return d.inverted_coord_from.x;
        })
        .attr('from_y', function (d) {
          return d.inverted_coord_from.y;
        })
        .attr('to_x', function (d) {
          return d.inverted_coord_to.x;
        })
        .attr('to_y', function (d) {
          return d.inverted_coord_to.y;
        })
        .each((d) => {
          this.append_dom_subpart(
            object_type,
            d3.select(`#id_${d.id}.cluster`),
            d,
            main_css.cluster,
            zoom_level,
            group_type,
            null
          );
        })
        .attr('transform', this.transform(current_zoom));

      // cluster_path = this.clusters_svg.selectAll('.cluster_path')
      this.clusters_svg = this.get_svg_class('CLUSTER').selectAll('g.cluster');
    } else if (object_type === 'SELECT') {
      this.selection_svg = this.get_svg_class('SELECT')
        .append('rect')
        .attr('class', 'selection_area')
        .attr('x', data.x * current_zoom.k + current_zoom.x)
        .attr('y', data.y * current_zoom.k + current_zoom.y)
        .attr('width', 0)
        .attr('height', 0)
        .attr('fab_x', data.x)
        .attr('fab_y', data.y);
    } else if (object_type === 'SEGMENT_DRAW') {
      this.segment_draw_svg = this.get_svg_class('SEGMENT_DRAW')
        .append('line')
        .attr('class', 'segment_draw_line')
        .attr('x1', data.x * current_zoom.k)
        .attr('y1', data.y * current_zoom.k)
        .attr('x2', data.x * current_zoom.k)
        .attr('y2', data.y * current_zoom.k)
        .attr('x', data.x)
        .attr('y', data.y);

      this.segment_draw_svg.style('display', '');
    }
  }
  append_dom_subpart(
    object_type: string,
    dom_object_group: any,
    layout_object: any,
    dom_css: any,
    zoom_level: any,
    group_type: string,
    group_colors: any
  ) {
    let event_mask,
      overlap_adjustment =
        group_type === 'OVERLAP' ||
        group_type === 'OVERLAP_MODULE' ||
        group_type === 'UNASSIGNED_MODULE'
          ? true
          : false,
      offset_multiplier = (1 / 3) * zoom_level;

    if (object_type === 'POINT') {
      dom_object_group
        .append('circle')
        .attr('class', 'point_circle')
        .attr('fill', main_css.point.color)
        .attr('r', main_css.point.radius)
        .attr('cx', 0)
        .attr('cy', 0);

      if (overlap_adjustment) {
        dom_object_group
          .append('rect')
          .attr('class', 'point_mask')
          .attr('fill', 'transparent')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', 20)
          .attr('height', 20);
      } else {
        dom_object_group
          .append('circle')
          .attr('class', 'point_mask')
          .attr('fill', 'transparent')
          .attr('r', main_css.general.mask_weight / 2)
          .attr('cx', 0)
          .attr('cy', 0);
      }

      event_mask = '.point_mask';
    } else if (object_type === 'POINT_LABEL') {
      // Point label
      dom_object_group
        .append('text')
        .attr('class', 'label')
        .attr('id', function () {
          let id = layout_object.logical_id
            ? layout_object.logical_id
            : layout_object.id;
          return `id_${id}`;
        })
        .attr('font-size', `${dom_css.label_font_size}px`)
        .attr('x', function () {
          if (overlap_adjustment) {
            return dom_css.label_offset * 2;
          } else {
            return dom_css.label_offset;
          }
        })
        .attr('y', function () {
          if (overlap_adjustment) {
            return dom_css.label_font_size / 2;
          } else {
            return dom_css.label_font_size / 2;
          }
        })
        .text(function () {
          let id = layout_object.logical_id
            ? layout_object.logical_id
            : layout_object.id;
          if (overlap_adjustment) {
            return `Point ${id}`;
          } else {
            return `${id}`;
          }
        });
    } else if (object_type === 'SEGMENT') {
      // Segment
      // Segment Path Element
      dom_object_group
        .append('path')
        // .attr('class', layout_object.disabled_by !== null ? 'segment_path disabled' : (layout_object.is_validate ? 'segment_path' : 'segment_path non_validate'))
        .attr('class', function (layout_object) {
          if (!layout_object.disable_state) {
            if (!layout_object.is_validate) {
              return 'segment_path non_validate';
            } else {
              return 'segment_path';
            }
          } else {
            return `segment_path disabled`;
          }
        })
        .attr('d', function (layout_object) {
          return layout_object.path;
        })
        .attr('stroke-width', `${dom_css.line_weight}px`);

      // Mask Element
      dom_object_group
        .append('path')
        .attr('class', 'segment_mask')
        .attr('d', function (layout_object) {
          return layout_object.path;
        })
        .attr('fill', 'none')
        .attr('stroke', 'transparent')
        .attr('stroke-width', main_css.general.selection_weight);

      event_mask = '.segment_mask';
    } else if (object_type === 'SEGMENT_DIRECTION') {
      // Segment
      if (
        this.layout_data.segments.length > 0 &&
        main_css.segment.direction_path === undefined
      ) {
        main_css.segment.direction_path = this.layout_data.segments[0].get_arrow_path(
          main_css.segment.direction_width,
          main_css.segment.direction_length
        );
      }
      if (layout_object.dir_angle != undefined) {
        dom_object_group
          .append('path')
          .attr('class', 'dir_triangle')
          .attr('id', `dir_triangle_${layout_object.id}`)
          .attr('d', main_css.segment.direction_path)
          .attr('transform', function () {
            return `rotate(${Math.trunc(
              CommonUtil.degrees(layout_object.dir_angle)
            )},0,0)`;
          })
          .lower();
      }
    } else if (object_type === 'STATION') {
      // Only populate if unpopulated
      if (dom_object_group.select('path').node() === null) {
        // Group svg
        if (group_colors) {
          if (layout_object.group) {
            let group_svg = dom_object_group.select('.group_svg');
            let size = main_css.group.track_group_size[zoom_level];
            if (group_svg.nodes().length === 0) {
              dom_object_group
                .append('rect')
                .attr('class', 'group_svg')
                .attr('zoom_level', `level_${zoom_level}`)
                .attr('x', -size / 2)
                .attr('y', -size / 2)
                .attr('rx', size / 4)
                .attr('ry', size / 4)
                .attr('width', size)
                .attr('height', size)
                .attr('fill', group_colors[layout_object.group])
                .style('opacity', main_css.group.opacity)
                .lower();
            }
            if (!overlap_adjustment) {
              dom_object_group
                .select('.group_svg')
                .attr(
                  'transform',
                  `translate(${
                    layout_object.direction_offset.x * offset_multiplier
                  }, ${
                    layout_object.direction_offset.y * offset_multiplier
                  })rotate(${-this.map_rotation})`
                );
            }
          }
        }

        // Main svg elements
        if (zoom_level === 1) {
          dom_object_group
            .append('rect')
            .attr('class', 'station_path')
            .attr('level', `level${zoom_level}`)
            .attr('transform', `rotate(${-this.map_rotation})`);

          dom_object_group
            .append('rect')
            .attr('class', 'station_mask')
            .attr('level', `level${zoom_level}`)
            .attr('transform', `rotate(${-this.map_rotation})`);
        } else {
          // Add mask
          if (overlap_adjustment) {
            // Only if this object is being created in the overlap module or floating module
            dom_object_group
              .append('path')
              .attr('class', 'station_path')
              .attr('level', `level${zoom_level}`)
              .attr('d', main_css.station[`icon_level${zoom_level}`]);

            dom_object_group
              .append('rect')
              .attr('class', 'station_mask')
              .attr('fill', 'transparent')
              .attr('x', 0)
              .attr('y', 0)
              .attr('width', 20)
              .attr('height', 20);
          } else {
            dom_object_group
              .append('path')
              .attr('class', 'station_path')
              .attr('level', `level${zoom_level}`)
              .attr('d', main_css.station[`icon_level${zoom_level}`])
              .attr(
                'transform',
                `translate(${
                  layout_object.direction_offset.x * offset_multiplier
                }, ${
                  layout_object.direction_offset.y * offset_multiplier
                })rotate(${-this.map_rotation})`
              );

            dom_object_group
              .append('path')
              .attr('class', 'station_mask')
              .attr('level', `level${zoom_level}`)
              .attr('d', main_css.station[`icon_level${zoom_level}`])
              .attr(
                'transform',
                `translate(${
                  layout_object.direction_offset.x * offset_multiplier
                }, ${
                  layout_object.direction_offset.y * offset_multiplier
                })rotate(${-this.map_rotation})`
              );
          }
        }

        event_mask = '.station_mask';
      }
    } else if (object_type === 'STATION_DETAIL') {
      if (dom_object_group.select('text').node() === null) {
        //Label
        let label_svg = dom_object_group
          .append('text')
          .attr('class', 'label')
          .attr('font-size', `${dom_css.font_size}px`)
          .attr('x', function () {
            if (overlap_adjustment) {
              return dom_css.text_offset * 2;
            } else {
              return dom_css.text_offset;
            }
          })
          .attr('y', function () {
            if (overlap_adjustment) {
              return dom_css.font_size / 2;
            } else {
              return dom_css.width / 2;
            }
          })
          .text(function () {
            let id = layout_object.logical_id
              ? layout_object.logical_id
              : layout_object.id;
            if (overlap_adjustment) {
              return `Station ${id}`;
            } else {
              return id;
            }
          })
          .attr('text-anchor', 'start');
        if (!overlap_adjustment) {
          label_svg.attr(
            'transform',
            `translate(${
              layout_object.direction_offset.x * offset_multiplier
            }, ${
              layout_object.direction_offset.y * offset_multiplier
            })rotate(${-this.map_rotation})`
          );
        }
      }
    } else if (object_type === 'BUFFER') {
      if (dom_object_group.select('path').node() === null) {
        // Group svg
        if (group_colors) {
          if (layout_object.group) {
            let group_svg = dom_object_group.select('.group_svg');
            let size = main_css.group.track_group_size[zoom_level];
            if (group_svg.nodes().length === 0) {
              dom_object_group
                .append('rect')
                .attr('class', 'group_svg')
                .attr('zoom_level', `level_${zoom_level}`)
                .attr('x', -size / 2)
                .attr('y', -size / 2)
                .attr('rx', size / 4)
                .attr('ry', size / 4)
                .attr('width', size)
                .attr('height', size)
                .attr('fill', group_colors[layout_object.group])
                .style('opacity', main_css.group.opacity)
                .lower();
            }
            if (!overlap_adjustment) {
              dom_object_group
                .select('.group_svg')
                .attr(
                  'transform',
                  `translate(${
                    layout_object.direction_offset.x * offset_multiplier
                  }, ${
                    layout_object.direction_offset.y * offset_multiplier
                  })rotate(${-this.map_rotation})`
                );
            }
          }
        }

        // Main element
        if (zoom_level === 1) {
          dom_object_group
            .append('circle')
            .attr('class', 'buffer_path')
            .attr('level', `level${zoom_level}`)
            .attr('transform', `rotate(${-this.map_rotation})`);

          dom_object_group
            .append('circle')
            .attr('class', 'buffer_mask')
            .attr('level', `level${zoom_level}`)
            .attr('transform', `rotate(${-this.map_rotation})`);
        } else {
          if (overlap_adjustment) {
            // only when going into overlap or floating module at level 3
            dom_object_group
              .append('path')
              .attr('class', 'buffer_path')
              .attr('level', `level${zoom_level}`)
              .attr('d', main_css.buffer[`icon_level${zoom_level}`]);

            dom_object_group
              .append('rect')
              .attr('class', 'buffer_mask')
              .attr('fill', 'transparent')
              .attr('x', 0)
              .attr('y', 0)
              .attr('width', 20)
              .attr('height', 20);
          } else {
            dom_object_group
              .append('path')
              .attr('class', 'buffer_path')
              .attr('level', `level${zoom_level}`)
              .attr('d', main_css.buffer[`icon_level${zoom_level}`])
              .attr(
                'transform',
                `translate(${
                  layout_object.direction_offset.x * offset_multiplier
                }, ${
                  layout_object.direction_offset.y * offset_multiplier
                })rotate(${-this.map_rotation})`
              );
            dom_object_group
              .append('path')
              .attr('class', 'buffer_mask')
              .attr('level', `level${zoom_level}`)
              .attr('d', main_css.buffer[`icon_level${zoom_level}`])
              .attr(
                'transform',
                `translate(${
                  layout_object.direction_offset.x * offset_multiplier
                }, ${
                  layout_object.direction_offset.y * offset_multiplier
                })rotate(${-this.map_rotation})`
              );
          }
        }

        event_mask = '.buffer_mask';
      }
    } else if (object_type === 'BUFFER_DETAIL') {
      if (dom_object_group.select('text').node() === null) {
        // Label
        let label_svg = dom_object_group
          .append('text')
          .attr('class', 'label')
          .attr('font-size', `${dom_css.font_size}px`)
          .attr('x', function () {
            if (overlap_adjustment) {
              return dom_css.text_offset * 2;
            } else {
              return dom_css.text_offset;
            }
          })
          .attr('y', function () {
            if (overlap_adjustment) {
              return 0;
            } else {
              return dom_css.width / 2;
            }
          })
          .text(function () {
            let id = layout_object.logical_id
              ? layout_object.logical_id
              : layout_object.id;
            if (overlap_adjustment) {
              return `Buffer ${id}`;
            } else {
              return id;
            }
          })
          .attr('text-anchor', 'start');

        if (!overlap_adjustment) {
          label_svg.attr(
            'transform',
            `translate(${
              layout_object.direction_offset.x * offset_multiplier
            }, ${
              layout_object.direction_offset.y * offset_multiplier
            })rotate(${-this.map_rotation})`
          );
        }
      }
    } else if (object_type === 'MTL') {
      if (dom_object_group.select('path').node() === null) {
        // Group svg
        if (group_colors) {
          if (layout_object.group) {
            let group_svg = dom_object_group.select('.group_svg');
            let size = main_css.group.track_group_size[zoom_level];
            if (group_svg.nodes().length === 0) {
              dom_object_group
                .append('rect')
                .attr('class', 'group_svg')
                .attr('zoom_level', `level_${zoom_level}`)
                .attr('x', -size / 2)
                .attr('y', -size / 2)
                .attr('rx', size / 4)
                .attr('ry', size / 4)
                .attr('width', size)
                .attr('height', size)
                .attr('fill', group_colors[layout_object.group])
                .style('opacity', main_css.group.opacity)
                .lower();
            }
          }
        }

        // Main Element
        dom_object_group
          .append('path')
          .attr('d', main_css.mtl[`icon_level${zoom_level}`])
          .attr('class', 'mtl_path')
          .attr('level', `level${zoom_level}`);

        if (overlap_adjustment) {
          dom_object_group
            .append('rect')
            .attr('class', 'mtl_mask')
            .attr('fill', 'transparent')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 20)
            .attr('height', 20);
        } else {
          dom_object_group
            .append('path')
            .attr('class', 'mtl_mask')
            .attr('d', main_css.mtl[`icon_level${zoom_level}`])
            .attr('level', `level${zoom_level}`)
            .attr('stroke', 'transparent')
            .attr('stroke-width', main_css.general.mask_weight / 2)
            .attr('fill', 'none');
        }

        event_mask = '.mtl_mask';
      }
    } else if (object_type === 'MTL_DETAIL') {
      if (dom_object_group.select('text').node() === null) {
        //Label
        dom_object_group
          .append('text')
          .attr('class', 'label')
          .attr('font-size', `${dom_css.font_size}px`)
          .attr('x', function () {
            if (overlap_adjustment) {
              return dom_css.text_offset * 2;
            } else {
              return dom_css.text_offset;
            }
          })
          .attr('y', function () {
            if (overlap_adjustment) {
              return 0;
            } else {
              return dom_css.width / 2;
            }
          })
          .attr('text-anchor', 'start')
          .text(function () {
            let id = layout_object.logical_id
              ? layout_object.logical_id
              : layout_object.id;
            if (overlap_adjustment) {
              return `MTL ${id}`;
            } else {
              return id;
            }
          });
      }
    } else if (object_type === 'CLUSTER') {
      // Cluster
      // Cluster Path Element
      dom_object_group
        .append('path')
        .attr('class', 'cluster_path')
        .attr('d', layout_object.path)
        .attr('fill', ColorPalette.get_color(layout_object.color))
        .attr('stroke', ColorPalette.get_color(layout_object.color))
        .attr('stroke-width', `${dom_css.line_weight / 3}px`);

      // Mask Element
      dom_object_group
        .append('path')
        .attr('class', 'cluster_mask')
        .attr('d', layout_object.path)
        .attr('fill', 'transparent')
        .attr('stroke', 'transparent')
        .attr('stroke-width', `${main_css.general.mask_weight * 3}px`);

      event_mask = '.cluster_mask';
    } else if (object_type === 'VEHICLE') {
      // Add group id group
      if (group_colors) {
        if (layout_object.group) {
          let group_svg = dom_object_group.select('.group_svg');
          let group_size = main_css.group.vehicle_group_size;
          if (group_svg.nodes().length === 0) {
            dom_object_group
              .append('rect')
              .attr('class', 'group_svg')
              .attr('x', -group_size * 2)
              .attr('y', -group_size * 2)
              .attr('rx', group_size)
              .attr('ry', group_size)
              .attr('width', group_size * 4)
              .attr('height', group_size * 4)
              .attr('fill', 'none')
              .attr('stroke', group_colors[layout_object.group])
              .attr('stroke-width', '3px')
              .attr('transform', () => {
                if (!overlap_adjustment)
                  return `rotate(${-this.map_rotation})scale(${
                    this.vehicle_scale.scale
                  })`;
                else return '';
              })
              .style('opacity', main_css.group.opacity)
              .lower();
          }
        }
      }

      // Outter stroke for appearance quality
      if (layout_object.type === 'STANDARD') {
        dom_object_group
          .append('circle')
          .attr('class', 'outline')
          .attr('r', dom_css.radius)
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('fill', 'none')
          .attr('stroke', function () {
            let color;
            if (layout_object.mode == 'M') {
              color = dom_css.color_mode_manual_outline;
            } else if (layout_object.mode == 'S') {
              color = dom_css.color_mode_sloppy_manual_outline;
            } else if (layout_object.mode == 'A') {
              color = dom_css.color_mode_auto_outline;
            } else {
              color = dom_css.color_mode_none_outline;
            }

            return color;
          })
          .attr('stroke-width', dom_css.line_weight + 2)
          .attr('transform', () => {
            if (!overlap_adjustment)
              return `scale(${this.vehicle_scale.scale})`;
            else return '';
          });

        // Main Element SVG
        dom_object_group
          .append('circle')
          .attr('class', 'vehicle_circle')
          .attr('r', dom_css.radius)
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('fill', 'none')
          .attr('stroke', function () {
            let color;
            if (layout_object.mode == 'M') {
              color = dom_css.color_mode_manual;
            } else if (layout_object.mode == 'S') {
              color = dom_css.color_mode_sloppy_manual;
            } else if (layout_object.mode == 'A') {
              color = dom_css.color_mode_auto;
            } else {
              color = dom_css.color_mode_none;
            }

            return color;
          })
          .attr('stroke-width', dom_css.line_weight)
          .attr('transform', () => {
            if (!overlap_adjustment)
              return `scale(${this.vehicle_scale.scale})`;
            else return '';
          });

        // Add clean dashed line
      } else if (layout_object.type === 'CLEANING') {
        dom_object_group
          .append('rect')
          .attr('class', 'vehicle_circle_clean')
          .attr('width', dom_css.radius * 2)
          .attr('height', dom_css.radius * 2)
          .attr('x', -dom_css.radius)
          .attr('y', -dom_css.radius)
          .attr('fill', function () {
            return dom_css.color_mode_auto;
          })
          .attr('stroke', function () {
            return dom_css.color_mode_auto_outline;
          })
          .attr('stroke-width', dom_css.clean_line_weight + 2)
          .attr('transform', () => {
            if (!overlap_adjustment)
              return `rotate(${-this.map_rotation + 45})scale(${
                this.vehicle_scale.scale
              })`;
            else return 'rotate(45)';
          });
      }

      if (layout_object.is_stale) {
        dom_object_group
          .append('g')
          .attr('class', 'stale')
          .attr('transform', () => {
            if (!overlap_adjustment)
              return `rotate(${-this.map_rotation})translate(${
                dom_css.radius * 2 * this.vehicle_scale.scale
              },-${dom_css.radius * this.vehicle_scale.scale})scale(${
                this.vehicle_scale.scale
              })`;
            else return `translate(${dom_css.radius * 2},-${dom_css.radius})`;
          });
        let stale_element = dom_object_group.select('g.stale');
        stale_element
          .append('circle')
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', 5.5)
          .attr('fill', 'white');
        stale_element
          .append('path')
          .attr('d', dom_css.stale_path)
          .attr('fill', 'black')
          .attr('transform', 'translate(-6.5,-6.5)scale(0.013)');
      }

      // Unload/load fail
      if (layout_object.cargo_transfer_result) {
        dom_object_group
          .append('g')
          .attr('class', 'fail')
          .attr('transform', () => {
            if (!overlap_adjustment)
              return `scale(${this.vehicle_scale.scale})`;
            else return '';
          })
          .append('path')
          .attr('d', dom_css.fail_path)
          .attr('transform', 'translate(-3.8,-3.8)scale(0.015)');
      }

      // Prevent push
      if (!layout_object.push) {
        let push_svg = dom_object_group
          .append('g')
          .attr('class', 'push')
          .attr('transform', () => {
            if (!overlap_adjustment)
              return `rotate(${-this.map_rotation})translate(${
                ((dom_css.radius * 4) / 3) * this.vehicle_scale.scale
              },${dom_css.radius * this.vehicle_scale.scale})scale(${
                this.vehicle_scale.scale
              })`;
            else
              return `translate(${(dom_css.radius * 4) / 3},${dom_css.radius})`;
          });
        push_svg
          .append('path')
          .attr('d', dom_css.prevent_push_path)
          .attr('fill', dom_css.prevent_inner_color)
          .attr('transform', 'translate(2,-3.5)scale(0.015)');
        push_svg
          .append('path')
          .attr('d', dom_css.prevent_path)
          .attr('fill', dom_css.prevent_outer_color)
          .attr('transform', 'rotate(90)translate(-6.5,-12.5)scale(0.015)');
      }

      // Prevent call
      if (layout_object.call.length === 0) {
        let push_svg = dom_object_group.select('.push');
        let x_offset = (dom_css.radius * 4) / 3;
        if (push_svg.nodes().length > 0) {
          x_offset = dom_css.radius * 3;
        }
        let call_svg = dom_object_group
          .append('g')
          .attr('class', 'call')
          .attr('transform', () => {
            if (!overlap_adjustment)
              return `rotate(${-this.map_rotation})translate(${
                x_offset * this.vehicle_scale.scale
              },${dom_css.radius * this.vehicle_scale.scale})scale(${
                this.vehicle_scale.scale
              })`;
            else return `translate(${x_offset},${dom_css.radius})`;
          });
        call_svg
          .append('path')
          .attr('d', dom_css.prevent_call_path)
          .attr('fill', dom_css.prevent_inner_color)
          .attr('transform', 'rotate(-90)translate(-4.5,1.5)scale(0.015)');
        call_svg
          .append('path')
          .attr('d', dom_css.prevent_path)
          .attr('fill', dom_css.prevent_outer_color)
          .attr('transform', 'rotate(90)translate(-6.5,-12.5)scale(0.015)');
      }

      dom_object_group
        .append('text')
        .attr('class', 'label')
        .attr('id', function () {
          return `id_${layout_object.id}`;
        })
        .attr('font-size', `${dom_css.font_size}px`)
        .attr('display', () => {
          if (this.vehicle_scale.scale >= 0.6) {
            return 'block';
          }
          return 'none';
        })
        .attr('x', () => {
          let x = (-dom_css.text_offset * 3) / 4;
          if (overlap_adjustment) {
            return dom_css.text_offset * 2;
          } else {
            if (this.vehicle_scale.scale >= 0.6) {
              x *= this.vehicle_scale.scale;
            }
          }

          return x;
        })
        .attr('y', () => {
          let y = -dom_css.radius / 2;
          if (overlap_adjustment) {
            return -dom_css.radius / 3;
          } else {
            if (this.vehicle_scale.scale >= 0.6) {
              y *= this.vehicle_scale.scale;
            }
          }

          return y;
        })
        .html(function () {
          let id = layout_object.logical_id
            ? layout_object.logical_id
            : layout_object.id;
          if (overlap_adjustment) {
            return `Vehicle ${id}`;
          } else {
            return id;
          }
        })
        .attr('text-anchor', function () {
          if (overlap_adjustment) {
            return 'start';
          } else {
            return 'end';
          }
        })
        .attr('transform', () => {
          if (!overlap_adjustment) return `rotate(${-this.map_rotation})`;
          else return '';
        });

      if (layout_object.hotlot) {
        dom_object_group
          .append('rect')
          .attr('class', 'hotlot')
          .attr('display', () => {
            if (this.vehicle_scale.scale >= 0.6 || overlap_adjustment) {
              return 'block';
            } else {
              return 'none';
            }
          })
          .attr('fill', function () {
            return dom_css.color_hotlot;
          })
          .attr('x', () => {
            return (
              -((dom_css.text_offset * 3) / 4) *
                (overlap_adjustment ? this.vehicle_scale.scale : 1) -
              layout_object.order_id.toString().length * 6
            );
            // return -(layout_object.order_id.toString().length * 6 + parseInt(dom_css.text_offset) - 5)
          })
          .attr('y', () => {
            return (
              (dom_css.radius * 2 - dom_css.radius / 2) *
                (overlap_adjustment ? this.vehicle_scale.scale : 1) -
              10
            );
          })
          .attr('width', () => {
            return `${layout_object.order_id.toString().length * 6}px`;
          })
          .attr('height', 13)
          .attr('rx', 5)
          .attr('ry', 5)
          .attr('transform', () => {
            if (!overlap_adjustment) return `rotate(${-this.map_rotation})`;
            else return '';
          })
          .lower();
      }

      dom_object_group
        .append('text')
        .attr('class', 'label_order')
        .attr('display', () => {
          if (this.vehicle_scale.scale >= 0.6 || overlap_adjustment) {
            return 'block';
          } else {
            return 'none';
          }
        })
        .attr('font-size', `${dom_css.font_size}px`)
        .attr(
          'fill',
          layout_object.hotlot
            ? dom_css.label_hotlot_color
            : dom_css.label_color
        )
        .attr('x', () => {
          let x = (-dom_css.text_offset * 3) / 4;
          if (overlap_adjustment) {
            x = dom_css.text_offset * 2;
          } else {
            if (this.vehicle_scale.scale >= 0.6) {
              x *= this.vehicle_scale.scale;
            }
          }
          return x;
        })
        .attr('y', () => {
          let y = dom_css.radius * 2 - dom_css.radius / 2;
          if (overlap_adjustment) {
            y = dom_css.radius * 2 - dom_css.radius / 2;
          } else {
            if (this.vehicle_scale.scale >= 0.6) {
              y *= this.vehicle_scale.scale;
            }
          }
          return y;
        })
        .html(function () {
          if (overlap_adjustment) {
            if (layout_object.order_id) {
              return `Order: ${layout_object.order_id}`;
            } else {
              return 'Order: None';
            }
          } else {
            if (layout_object.order_id) {
              return `${layout_object.order_id}`;
            } else {
              return '';
            }
          }
        })
        .attr('text-anchor', function () {
          if (overlap_adjustment) {
            return 'start';
          } else {
            return 'end';
          }
        })
        .attr('transform', () => {
          if (!overlap_adjustment) return `rotate(${-this.map_rotation})`;
          else return '';
        });

      if (
        layout_object.cargo_state === 'F' ||
        layout_object.cargo_state === 'U' ||
        layout_object.cargo_state === 'L'
      ) {
        dom_object_group
          .append('circle')
          .attr('class', function () {
            if (layout_object.cargo_state === 'F') {
              return 'foup loaded';
            } else if (layout_object.cargo_state === 'L') {
              return 'foup loading';
            } else {
              return 'foup unloading';
            }
          })
          .attr('transform', () => {
            if (!overlap_adjustment)
              return `scale(${this.vehicle_scale.scale})`;
            else return '';
          })
          .lower();
      } else {
        dom_object_group.select('.foup').remove();
      }

      if (layout_object.is_blocked === true) {
        dom_object_group
          .append('circle')
          .attr('class', 'corner')
          .attr('r', dom_css.blocked_radius)
          .attr('cx', -(2 + dom_css.radius + dom_css.blocked_radius / 2))
          .attr('cy', -(2 + dom_css.radius + dom_css.blocked_radius / 2))
          .attr('fill', dom_css.color_blocked)
          .attr('transform', () => {
            if (!overlap_adjustment)
              return `rotate(${-this.map_rotation})scale(${
                this.vehicle_scale.scale
              })`;
            else return '';
          });
      } else {
        dom_object_group.select('.corner').remove();
      }

      if (layout_object.error_list != 0) {
        dom_object_group
          .append('path')
          .attr('class', 'error')
          .attr('d', dom_css.icon_error)
          .attr('fill', function () {
            return dom_css.color_mode_error;
          })
          .attr('stroke', function () {
            return dom_css.color_mode_error_outline;
          })
          .attr('stroke-width', `${dom_css.line_weight / 3}px`)
          .attr('transform', () => {
            if (!overlap_adjustment)
              return `rotate(${-this.map_rotation})scale(${
                this.vehicle_scale.scale
              })`;
            else return '';
          });
      } else {
        dom_object_group.select('.error').remove();
      }

      if (overlap_adjustment) {
        dom_object_group
          .append('rect')
          .attr('class', 'vehicle_mask')
          .attr('fill', 'transparent')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', 20)
          .attr('height', 20);
      } else {
        dom_object_group
          .append('circle')
          .attr('class', 'vehicle_mask')
          .attr('r', dom_css.radius)
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('fill', 'none')
          .attr('stroke', 'transparent')
          .attr('stroke-width', dom_css.mask_weight)
          .attr('transform', `scale(${this.vehicle_scale.scale})`);
      }

      event_mask = '.vehicle_mask';

      let selected_vehicle = this.get_selected_objects('VEHICLE')[0];
      let is_show_vehicle_line =
        (selected_vehicle && selected_vehicle.id === layout_object.id) ||
        this.get_show_vehicle_lines()
          ? true
          : false;
      if (!overlap_adjustment && is_show_vehicle_line) {
        // overlap display enabled

        //Next line
        dom_object_group
          .append('line')
          .attr('class', 'next')
          .attr('stroke', function () {
            return dom_css.next_color;
          })
          .attr('stroke-width', dom_css.next_weight)
          .attr('next_point', function () {
            if (!layout_object.cur_point || !layout_object.next_point) {
              return null;
            } else {
              return layout_object.next_point.point;
            }
          })
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', function () {
            if (!layout_object.cur_point || !layout_object.next_point) {
              // If undefined, set the end point equal to start point for 0 length
              return 0;
            } else {
              return (
                layout_object.next_point.inverted_coord.x -
                layout_object.cur_point.inverted_coord.x
              );
            }
          })
          .attr('y2', function () {
            if (!layout_object.cur_point || !layout_object.next_point) {
              // If undefined, set the end point equal to start point for 0 length
              return 0;
            } else {
              return (
                layout_object.next_point.inverted_coord.y -
                layout_object.cur_point.inverted_coord.y
              );
            }
          })
          .attr('transform', `scale(${this.getZoom(MapTypes.MAIN).k})`)
          .lower();

        //Order line
        dom_object_group
          .append('line')
          .attr('class', 'command')
          .attr('stroke', function () {
            if (layout_object.cargo_state === 'E') {
              return dom_css.order_pickup_color;
            } else {
              return dom_css.order_dropoff_color;
            }
          })
          .attr('stroke-width', dom_css.order_weight)
          .attr('command_point', function () {
            if (!layout_object.cur_point || !layout_object.command_point) {
              return null;
            } else {
              return layout_object.command_point.point;
            }
          })
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', function () {
            if (!layout_object.cur_point || !layout_object.command_point) {
              // If undefined, set the end point equal to start point for 0 length
              return 0;
            } else {
              return (
                layout_object.command_point.inverted_coord.x -
                layout_object.cur_point.inverted_coord.x
              );
            }
          })
          .attr('y2', function () {
            if (!layout_object.cur_point || !layout_object.command_point) {
              // If undefined, set the end point equal to start point for 0 length
              return 0;
            } else {
              return (
                layout_object.command_point.inverted_coord.y -
                layout_object.cur_point.inverted_coord.y
              );
            }
          })
          .attr('transform', `scale(${this.getZoom(MapTypes.MAIN).k})`)
          .lower();
      }
    }

    // Attach event handler
    if (event_mask !== undefined) {
      this.attach_event_handler(
        object_type,
        dom_object_group.select(event_mask),
        layout_object,
        dom_css,
        group_type
      );
    }
  }
  attach_event_handler(
    object_type: string,
    dom_object: any,
    layout_object: any,
    option: any,
    group_type: string
  ) {
    dom_object.on('click', () => {
      if (
        this.tool_type !== 'SELECT' ||
        (this.tool_type === 'SELECT' && !this.drag_coord.start)
      ) {
        this.layout_object_click(d3.event, {
          type: object_type,
          id: layout_object.id,
          group_type: group_type,
        });
      }
    });

    dom_object.on('contextmenu', () => {
      // d3.event.preventDefault();   // @TODO 임시로 context menu 허용
      this.layout_object_click(d3.event, {
        type: object_type,
        id: layout_object.id,
        group_type: group_type,
      });

      return false;
    });

    dom_object.on('mouseenter', () => {
      // Mouse is over the element
      // Set hovering object
      this.currently_hovering_object = layout_object;

      // console.info('## mouseenter event >>', {
      //   dom_object,
      //   layout_object,
      //   object_type,
      //   event: d3.event,
      // });

      if (this.overlap_state(d3.event.target)) {
        this.check_overlap_and_display(
          object_type,
          layout_object.id,
          this.overlap_display_objects,
          'OVERLAP'
        );
      }

      this.highlight(
        object_type,
        layout_object.id,
        option,
        group_type,
        'HOVER'
      );
      if (this.mode != 'EDITOR') {
        this.show_hover_tag(object_type, layout_object.id, null, null);
      }
    });
    dom_object.on('mouseout', () => {
      // Mouse is leaving the element
      // console.info('## mouseout event >>', {
      //   layout_object,
      //   object_type,
      //   objects: this.overlap_display_objects,
      //   event: d3.event,
      // });

      if (this.overlap_display_objects.length < 2) {
        // If there are no overlapping elements on mouse out
        this.overlap_display_objects = [];
      }

      this.hide_hover_tag();

      // unhilight objects
      if (this.selected_objects.length === 0) {
        // if there is no selected object then unhilight all
        this.unhighlight(null, null, 'LAYOUT');
      } else {
        let existing_object = this.currently_hovering_object;

        if (existing_object) {
          this.unhighlight(object_type, layout_object.id, group_type, 'HOVER');
        }
      }

      // Set hovering object to nothing
      this.currently_hovering_object = {};
    });

    if (this.mode === 'EDITOR') {
      dom_object.call(this.drag);
    }
  }
  overlap_state(node: any) {
    if (
      // @TODO overlap display 설정을 button element 상태로 판단하는것을 추후에 수정
      // this.$track_container.find('#btn_overlap_display').hasClass('active') &&
      this.preferences.toggles.overlaps &&
      this.overlap_display_objects.length === 0 &&
      !node.parentNode.classList.contains('panel_overlap')
    ) {
      return true;
    } else {
      return false;
    }
  }
  layout_object_click(
    click_event: any,
    object_data: { type: string; id: any; group_type: string }
  ) {
    // Set current mouse event
    let position = { x: click_event.x, y: click_event.y };

    switch (click_event.which) {
      case 3: // Right mouse click
        this.right_click(object_data.type, object_data.id, position);
        break;
      case 2: // Middle mouse click
      // logger.log('middle mouse button clicked!');
      default:
        // Left mouse click
        this.left_click(
          object_data.type,
          object_data.id,
          object_data.group_type
        );
        break;
    }
  }
  left_click(object_type: string, object_id: any, group_type: string) {
    this.dom_clicked(object_type, object_id, group_type);
  }
  dom_clicked(object_type: string, object_id: any, group_type: string) {
    // log_event.log(`mode=${mode} type=${tool_type} modifier=${modifier_key}`);

    if (this.tool_type === 'SELECT') {
      if (this.modifier_key === this.KEY_EXTSEL) {
        this.drag_coord.start = 'SHIFT_CLICK';
      }
    } else {
      // Exit function if clicked on an already selected object
      if (
        this.selected_objects[0] &&
        this.selected_objects[0].id === object_id &&
        this.selected_objects[0].constructor.name.toUpperCase() === object_type
      ) {
        return;
      }

      // Get clicked object
      let layout_object = this.find_layout_object(object_type, object_id);

      // Check current edit type
      if (this.tool_type === 'SEGMENT') {
        // Save point as base point
        if (object_type === 'POINT') {
          this.selected_objects.push(layout_object);
        }
      } else {
        let need_popup = false;

        this.init_selection(true);

        // add current object to selected object
        if (!this.is_sticky_mode) {
          this.selected_objects.push(layout_object);
        }

        // Check mode
        if (this.mode === 'VIEWER' || this.mode === 'PLAYBACK') {
          // view this.mode
          // @TODO check popup
          // if (typeof popup !== 'undefined' && popup.side_panel) {
          //   need_popup = true;
          // }
        } else if (this.mode === 'EDITOR') {
          // edit this.mode
          // Check edit object type
          if (
            this.tool_type === 'POINTER' ||
            this.tool_type === null ||
            this.tool_type === 'SELECT'
          ) {
            need_popup = true;
          } else if (this.tool_type === 'DELETE') {
            // non delete type
            // Delete object
            this.delete_layout_object(layout_object, true);
          } else if (this.tool_type !== 'MOVE') {
            // create object
            //Ready for create object
            let created_object = this.create_object(
              object_type,
              layout_object.id
            );

            if (created_object) {
              this.selected_objects = [];
              // replace selected object to created
              this.selected_objects.push(created_object);
              object_type = created_object.constructor.name.toUpperCase();
              layout_object = created_object;
              need_popup = true;
            }
          } else if (this.tool_type === 'MOVE') {
            need_popup = true;
          }

          // Check stick this.mode
          if (!this.is_sticky_mode) {
            // switch button status to cursor this.mode
            this.change_default_button(false);
            need_popup = true;
          }
        }

        if (object_type === 'VEHICLE') {
          if (!this.get_show_vehicle_lines()) {
            this.get_svg_class('VEHICLE').selectAll('.next, .command').remove();
          }
          this.render_vehicle_line(
            this.get_dom('VEHICLE', object_id, 'LAYOUT'),
            this.find_layout_object('VEHICLE', object_id),
            true
          );
        }

        // Display popup
        // @TODO pupup 관련
        // if (need_popup && popup.side_panel) {
        //   if (this.selected_objects.length > 1) {
        //     // Multiple object are selected
        //     object_type = 'SELECT';
        //     layout_object = null;
        //   }
        //   this.display_side_panel_popup(object_type, layout_object);
        // }

        // highlight object
        if (layout_object !== null && layout_object !== undefined) {
          this.highlight_objects(
            this.selected_objects,
            group_type,
            'SELECT',
            'SMOOTH'
          );
        }
      }
    }
  }
  change_default_button(is_init_selection: boolean) {
    // Change editing button to default(pointer) mode

    // Check sticky mode
    if (!this.is_sticky_mode) {
      this.toggle_object_buttons('btn_pointer', is_init_selection, false);
      this.set_tool_type('POINTER');
    }
  }
  set_tool_type(object_type: string) {
    if (object_type !== 'SELECT' && object_type !== 'MOVE') {
      this.remove_selection_box();
      this.remove_selection_tool();
    }

    // In case segment was being drawn and user decided to choose a different tool
    if (this.tool_type === 'SEGMENT') {
      if (this.$track_container.find('.segment_draw_line').length > 0) {
        this.$track_container.find('.segment_draw_line').remove();
      }
      this.drag_coord = {};
    }

    this.tool_type = object_type;
  }
  remove_selection_tool() {
    if (this.selection_svg) {
      this.selection_svg.remove();
      this.selection_svg = undefined;
    }
  }
  remove_selection_box() {
    if (this.selection_box_svg) {
      this.selection_box_svg.remove();
      this.selection_box_svg = null;
    }
  }
  toggle_object_buttons(
    target: string,
    is_init_selection: boolean,
    is_sticky: boolean
  ) {
    // these are the sibling buttons whose toggle state is coupled to the
    // other siblings.  if one sibling is toggled on, then the other
    // siblings must be toggled off.  there can be only one :)
    let button_list = [
      'btn_pointer',
      'btn_point',
      'btn_segment',
      'btn_station',
      'btn_buffer',
      'btn_mtl',
      'btn_split',
      'btn_format',
      'btn_select',
      'btn_copy',
      'btn_paste',
      'btn_move',
      'btn_delete',
      'btn_undo',
    ];

    //Deselect multiselect
    if (is_init_selection) {
      this.init_selection(true);
    }

    if (is_sticky) {
      this.$track_container.find(`#${target}`).addClass('active');
      this.$track_container.find(`#${target}`).addClass('sticky');
    } else {
      // Toggle clicked button
      if (target !== null) {
        this.$track_container.find(`#${target}`).addClass('active');
      }
      this.$track_container.find(`#${target}`).removeClass('sticky');

      // Activate target and deactivate other buttons
      if (this.$track_container.find(`#${target}`).hasClass('active')) {
        let buttons = this.$track_container.find(`#${target}`).siblings();
        buttons.each((index, element) => {
          if (
            element.tagName.toUpperCase() === 'BUTTON' &&
            button_list.indexOf(element.id) > -1
          ) {
            element.classList.remove('active');
          }
        });
      }
    }

    // Remove siblings sticky
    this.$track_container.find(`#${target}`).siblings().removeClass('sticky');

    // Set sticky mode for layout controller
    this.set_sticky_mode(is_sticky);
  }
  set_sticky_mode(is_sticky: boolean) {
    this.is_sticky_mode = is_sticky;
  }
  create_object(object_type: string, object_id: any) {
    let created_object: any;

    // Check selected object is point
    if (object_type === 'POINT') {
      if (this.tool_type === 'STATION') {
        // base point duplication check before create
        if (
          !LayoutUtil.check_duplicated_object(
            this.layout_data.stations,
            this.layout_data.buffers,
            this.layout_data.mtls,
            this.tool_type,
            'U',
            object_id
          )
        ) {
          //Create station
          const station = new Station(
            {
              id: LayoutUtil.create_new_id(this.layout_data.stations),
              physical_id: null,
              logical_id: null,
              point_id: object_id,
              direction: null,
              carrier_type: null,
              group: null,
            },
            true,
            'N',
            this.find_point_coords(object_id)
          );
          station.set_direction_attr(this.get_layout_objects('SEGMENT'));
          created_object = station;

          this.add_layout_object(created_object, null, true);

          // is_created = true
        }
      } else if (this.tool_type === 'BUFFER') {
        // base point duplication check before create
        if (
          !LayoutUtil.check_duplicated_object(
            this.layout_data.stations,
            this.layout_data.buffers,
            this.layout_data.mtls,
            this.tool_type,
            'U',
            object_id
          )
        ) {
          const buffer = new Buffer(
            {
              id: LayoutUtil.create_new_id(this.layout_data.buffers),
              physical_id: null,
              logical_id: null,
              point_id: object_id,
              direction: null,
              group: null,
            },
            true,
            'N',
            this.find_point_coords(object_id)
          );
          buffer.set_direction_attr(this.get_layout_objects('SEGMENT'));
          created_object = buffer;

          this.add_layout_object(created_object, null, true);

          // is_created = true
        }
      } else if (this.tool_type === 'MTL') {
        // base point duplication check before create
        if (
          !LayoutUtil.check_duplicated_object(
            this.layout_data.stations,
            this.layout_data.buffers,
            this.layout_data.mtls,
            this.tool_type,
            null,
            object_id
          )
        ) {
          const mtl = new MTL(
            {
              id: LayoutUtil.create_new_id(this.layout_data.mtls),
              physical_id: null,
              logical_id: null,
              point_id: object_id,
              in_use: null,
              position: null,
              mode: null,
              error_list: null,
              group: null,
            },
            true,
            'N',
            this.find_point_coords(object_id)
          );
          created_object = mtl;

          this.add_layout_object(created_object, null, true);

          // is_created = true;
        }
      } else if (this.tool_type === 'SEGMENT') {
      }
    } else if (object_type === 'SEGMENT') {
      if (this.tool_type === 'SPLIT') {
        let target_segment = this.find_layout_object(object_type, object_id);

        // Display split popup
        this.prepare_split(target_segment);
      }
    }

    return created_object;
  }
  prepare_split(target_segment: any) {
    // Check line type
    if (
      target_segment.type === 'D' &&
      (target_segment.direction === undefined ||
        target_segment.direction === null ||
        target_segment.direction.length === 1)
    ) {
      let distance = LayoutUtil.calculate_distance(
        target_segment.point_from.coord,
        target_segment.point_to.coord
      );
      let min_interval = this.minimum_segment_length;

      // Check minimum distance
      if (distance > min_interval) {
        // FIXME: why is this 'option' set here?
        let option = {
          distance,
          min_interval,
        };

        // Display split dialog
        // @TODO SplitSegmentDialog (track-editor.js)
        // SplitSegmentDialog.set_segment(target_segment);
        // SplitSegmentDialog.show(this_instance);
      } else {
        // @TODO alert & i18n
        // Util.oms_alert(
        //   $.i18n(
        //     'Length of the segment ($1 mm) is shorter than split interval ($2 mm)',
        //     distance,
        //     min_interval
        //   )
        // );
        alert('alert 구현');
      }
    } else {
      alert('alert 구현');
      // @TODO alert , i18n
      // Util.oms_alert($.i18n('Only straight segments can be split'));
    }
  }
  add_layout_object(new_objects: any, offset: any, is_apply_history: boolean) {
    // Convert object to array
    if (!Array.isArray(new_objects)) {
      new_objects = [new_objects];
    }

    // Save original data to history stack
    if (is_apply_history) {
      this.manage_history('PUSH', 'ADD', new_objects);
    }

    let added_object_type: any = {};
    added_object_type.point = false;
    added_object_type.segment = false;
    added_object_type.station = false;
    added_object_type.buffer = false;
    added_object_type.mtl = false;
    added_object_type.cluster = false;
    added_object_type.group = false;

    // Add new objects
    for (let i = 0; i < new_objects.length; i++) {
      let object = new_objects[i];
      let object_type = object.constructor.name.toUpperCase();

      // Apply offset if needed
      if (offset !== null && offset !== undefined) {
        object.apply_offset(
          {
            x: offset.x,
            y: offset.y,
          },
          0,
          this.geometry.invert_factor_y
        );
      }

      if (object_type === 'POINT') {
        if (this.layout_data.points === undefined) {
          this.layout_data.points = [];
        }
        this.layout_data.points.push(object); // Push data to our array
        this.update_related_location_objects(object);
        added_object_type.point = true;
      } else if (object_type === 'SEGMENT') {
        if (this.layout_data.segments === undefined) {
          this.layout_data.segments = [];
        }
        this.layout_data.segments.push(object);
        this.update_related_location_objects(object);
        added_object_type.segment = true;
      } else if (object_type === 'STATION') {
        if (this.layout_data.stations === undefined) {
          this.layout_data.stations = [];
        }
        this.layout_data.stations.push(object);
        added_object_type.station = true;
      } else if (object_type === 'BUFFER') {
        if (this.layout_data.buffers === undefined) {
          this.layout_data.buffers = [];
        }
        this.layout_data.buffers.push(object);
        added_object_type.buffer = true;
      } else if (object_type === 'MTL') {
        if (this.layout_data.mtls === undefined) {
          this.layout_data.mtls = [];
        }

        // Add mtl
        this.layout_data.mtls.push(object);

        added_object_type.mtl = true;
      } else if (object_type === 'CLUSTER') {
        if (this.layout_data.clusters === undefined) {
          this.layout_data.clusters = [];
        }

        // Add mtl
        this.layout_data.clusters.push(object);

        added_object_type.cluster = true;
      } else if (object_type === 'GROUP') {
        if (!this.layout_data.groups) {
          this.layout_data.groups = [];
        }

        // Add mtl
        this.layout_data.groups.push(object);

        // Update the group ids of all of the object with the new group definition
        this.update_related_grouped_objects(object, null, null, null);

        added_object_type.group = true;
      }
    }

    let update_category = [];

    for (let type in added_object_type) {
      if (added_object_type[type]) {
        update_category.push(type.toUpperCase());
      }
    }

    if (update_category.length > 0)
      this.update_layout_object_dom_elements(update_category);

    if (this.mode === 'EDITOR') {
      // Adjust fab size if fab size changed
      this.adjust_fab_size(
        LayoutUtil.find_max_and_min_of_objects(
          this.layout_data.points.concat(this.layout_data.segments as any[]),
          'INVERTED'
        )
      );
    }
  }
  find_point_coords(point_id: any) {
    return this.dataSvc.find_point_coords(point_id);
    // @moved to data service
    // if (point_id == null || point_id == undefined) {
    //   return null;
    // }

    // let coord = {};
    // let inverted_coord = {};
    // let is_match = false;

    // for (let i = 0; i < this.layout_data.points.length; i++) {
    //   let point = this.layout_data.points[i];
    //   if (point.id === point_id) {
    //     coord = point.coord;
    //     inverted_coord = point.inverted_coord;
    //     is_match = true;
    //     break;
    //   }
    // }

    // if (is_match) {
    //   return { coord, inverted_coord };
    // }
    // return null;
  }
  init_selection(is_clear_sel_objects: boolean) {
    this.drag_coord = {};

    if (this.selection_svg !== undefined) {
      this.remove_selection_tool();
    }

    if (this.segment_draw_svg !== undefined) {
      this.segment_draw_svg.remove();
      this.segment_draw_svg = undefined;
    }

    if (is_clear_sel_objects) {
      // Close detail panel if not editing clusters
      // @TODO popup 관련
      // if (
      //   typeof popup !== 'undefined' &&
      //   popup.side_panel &&
      //   this.mode !== 'MINIMAL'
      // ) {
      //   display_side_panel_popup(null, null);
      // }
      this.unhighlight(null, null, null, null, 'INSTANT');
      this.set_selected_objects(null, false, true);
    }

    if (!this.get_show_vehicle_lines() && this.mode != 'EDITOR') {
      this.get_svg_class('VEHICLE').selectAll('.next, .command').remove();
    }
  }
  set_selected_objects(
    objects: any,
    is_shift_mode: boolean,
    is_reset: boolean
  ) {
    //Set the currently selected element
    /*
        NEW OBJECT -> ADD
        REDUNDANT(ALREADY SELECTED) OBJECT -> REMOVE
        */

    if (objects != null && objects != undefined) {
      if (!Array.isArray(objects)) {
        objects = [objects];
      }

      if (is_reset) {
        // reset means set the selected array to the passed argument or empty it depending on condition
        this.selected_objects = objects;
      } else {
        if (is_shift_mode) {
          // Check redundant
          for (let i = 0; i < objects.length; i++) {
            let object = objects[i];
            let exist_index = -1;

            //Check if already exists
            for (let j = 0; j < this.selected_objects.length; j++) {
              let selected_object = this.selected_objects[j];

              if (
                object.constructor === selected_object.constructor &&
                object.id === selected_object.id
              ) {
                exist_index = j;
                break;
              }
            }

            if (exist_index === -1) {
              // Not exists
              this.selected_objects.push(object);
            } else {
              this.selected_objects.splice(exist_index, 1);
            }
          }
        } else {
          this.selected_objects = this.selected_objects.concat(objects);
        }
      }
    } else {
      this.selected_objects = [];
    }

    if (this.tool_type === 'SELECT') {
      this.display_selection_box(this.get_selected_objects());
    }
  }
  display_selection_box(selected_objects: any[]) {
    if (this.selection_box_svg) {
      let bounding_box = LayoutUtil.find_max_and_min_of_objects(
        selected_objects,
        'INVERTED'
      );
      if (
        bounding_box.max.x != undefined &&
        bounding_box.max.y != undefined &&
        bounding_box.min.x != undefined &&
        bounding_box.min.y != undefined
      ) {
        this.selection_box_svg.initial_bounding_box = bounding_box;
        this.update_selection_box(bounding_box);
      } else {
        this.remove_selection_box();
      }
    } else {
      this.create_selection_box(selected_objects);
    }
  }
  create_selection_box(selected_objects: any[]) {
    let bounding_box = LayoutUtil.find_max_and_min_of_objects(
      selected_objects,
      'INVERTED'
    );
    let parameters = this.get_box_coordinates(
      bounding_box.min,
      bounding_box.max
    );
    let selected_group = this.get_svg_class('SELECTED');
    let current_zoom = this.getZoom(MapTypes.MAIN);
    if (!this.selection_box_svg) {
      this.selection_box_svg = selected_group
        .append('rect')
        .attr('id', 'selection-box')
        .attr('class', 'selected_perimeter')
        .attr('x', parameters.x)
        .attr('y', parameters.y)
        .attr('width', parameters.width)
        .attr('height', parameters.height)
        .attr(
          'transform',
          `translate(${current_zoom.x}, ${current_zoom.y})scale(${current_zoom.k})`
        );

      // Set bounding data to svg
      this.selection_box_svg.initial_bounding_box = bounding_box;
    }
  }
  delete_layout_object(delete_objects: any, is_apply_history: boolean) {
    let zoom_level = this.calculate_zoom_level();
    let cluster_update_list = [];

    // Convert object to array
    if (!Array.isArray(delete_objects)) {
      delete_objects = [delete_objects];
    }

    if (delete_objects.length > 0) {
      let deleted_points = [];
      let deleted_segments = [];
      let deleted_connected_objects = [];
      // delete from memory model
      for (let i = 0; i < delete_objects.length; i++) {
        let delete_object = delete_objects[i];
        let object_type = delete_object.constructor.name.toUpperCase();
        let target_objects;
        let delete_idx;

        target_objects = this.get_layout_objects(object_type);

        // Find delete index
        delete_idx = target_objects.findIndex(
          (original_object) => original_object.id == delete_object.id
        );

        if (delete_idx > -1) {
          // Delete from object
          let original_object = target_objects.splice(delete_idx, 1)[0];

          if (object_type == 'POINT') {
            // store deleted point to delete connected object
            deleted_points.push(delete_object);
          } else if (object_type == 'SEGMENT') {
            deleted_segments.push(delete_object);
          }

          this.update_related_location_objects(delete_object);
          if (delete_object.constructor.name.toUpperCase() === 'GROUP') {
            this.update_related_grouped_objects(
              delete_object,
              original_object,
              null,
              null
            );
          }
        }
      }

      // delete connected object
      for (let i = 0; i < deleted_points.length; i++) {
        let point = deleted_points[i];

        // Delete segement
        let connected_segments = LayoutUtil.find_connected_segment(
          point,
          this.layout_data.segments,
          null
        );
        connected_segments.forEach((d) => {
          let index = this.layout_data.segments.findIndex(
            (original_object) => original_object.id == d.id
          );
          if (index > -1) {
            let segment = this.layout_data.segments.splice(index, 1)[0];
            deleted_segments.push(segment);
            deleted_connected_objects.push(segment);
          }
        });

        // Delete station
        let connected_stations = LayoutUtil.find_connected_station(
          point,
          this.layout_data.stations
        );
        connected_stations.forEach((d) => {
          let index = this.layout_data.stations.findIndex(
            (original_object) => original_object.id == d.id
          );
          if (index > -1) {
            let station = this.layout_data.stations.splice(index, 1)[0];
            deleted_connected_objects.push(station);
          }
        });

        // Delete buffer
        let connected_buffers = LayoutUtil.find_connected_buffer(
          point,
          this.layout_data.buffers
        );
        connected_buffers.forEach((d) => {
          let index = this.layout_data.buffers.findIndex(
            (original_object) => original_object.id == d.id
          );
          if (index > -1) {
            let buffer = this.layout_data.buffers.splice(index, 1)[0];
            deleted_connected_objects.push(buffer);
          }
        });

        // Delete mtl
        let connected_mtls = LayoutUtil.find_connected_mtl(
          point,
          this.layout_data.mtls
        );
        connected_mtls.forEach((d) => {
          let index = this.layout_data.mtls.findIndex(
            (original_object) => original_object.id == d.id
          );
          if (index > -1) {
            let mtl = this.layout_data.mtls.splice(index, 1)[0];
            deleted_connected_objects.push(mtl);
          }
        });

        // Delete cluster
        let connected_clusters = LayoutUtil.find_connected_cluster(
          point,
          this.layout_data.clusters
        );
        if (connected_clusters) {
          connected_clusters.forEach((cluster) => {
            let index = 0;
            cluster.point_id_list.forEach((point_id) => {
              if (point_id === point.id) {
                cluster.point_id_list.splice(index, 1);
                cluster_update_list.push({
                  id: cluster.id,
                  status: 'UPDATE',
                  object: cluster,
                });
              }
              index++;
            });
          });
        }
      }

      // reset segment candidate
      if (this.tool_type != 'SPLIT') {
        for (let i = 0; i < deleted_segments.length; i++) {
          let segment = deleted_segments[i];
          LayoutUtil.reset_connected_candidates(
            segment,
            this.layout_data.segments
          );

          // Delete cluster
          let connected_clusters = LayoutUtil.find_connected_cluster_using_segment(
            segment,
            this.layout_data.clusters
          );
          connected_clusters.forEach((cluster) => {
            cluster_update_list.push({
              id: cluster.id,
              status: 'UPDATE',
              object: cluster,
            });
          });
        }
      }

      // delete from dom
      if (this.points_svg && this.points_svg.nodes().length > 0) {
        this.update_dom(
          'POINT',
          this.layout_data.points,
          main_css.point,
          zoom_level,
          'LAYOUT',
          false
        );
      }
      if (this.segments_svg && this.segments_svg.nodes().length > 0) {
        this.update_segment_svg(
          this.layout_data.segments,
          main_css.segment,
          true
        );
        this.update_dom(
          'SEGMENT_DIRECTION',
          this.layout_data.segments,
          main_css.segment,
          zoom_level,
          'LAYOUT',
          false
        );
      }
      if (this.stations_svg && this.stations_svg.nodes().length > 0) {
        this.update_dom(
          'STATION',
          this.layout_data.stations,
          main_css.station,
          zoom_level,
          'LAYOUT',
          false
        );
      }
      if (this.buffers_svg && this.buffers_svg.nodes().length > 0) {
        this.update_dom(
          'BUFFER',
          this.layout_data.buffers,
          main_css.buffer,
          zoom_level,
          'LAYOUT',
          false
        );
      }
      if (this.mtls_svg && this.mtls_svg.nodes().length > 0) {
        this.update_dom(
          'MTL',
          this.layout_data.mtls,
          main_css.mtl,
          zoom_level,
          'LAYOUT',
          false
        );
      }
      if (this.clusters_svg && this.clusters_svg.nodes().length > 0) {
        this.update_dom(
          'CLUSTER',
          this.layout_data.clusters,
          main_css.cluster,
          zoom_level,
          'LAYOUT',
          false
        );
      }

      if (
        this.mode !== 'MINIMAL' &&
        this.mode !== 'EDITOR' &&
        this.vehicles &&
        this.vehicles.length > 0
      ) {
        this.update_vehicle_dom(
          this.vehicles,
          main_css.vehicle,
          zoom_level,
          'LAYOUT',
          false
        );
      }

      if (cluster_update_list.length > 0) {
        this.update_clusters(cluster_update_list, false, false);
      }

      if (this.mode === 'EDITOR') {
        // Adjust fab size if fab size changed
        this.adjust_fab_size(
          LayoutUtil.find_max_and_min_of_objects(
            this.layout_data.points.concat(this.layout_data.segments as any[]),
            'INVERTED'
          )
        );
      }

      if (is_apply_history) {
        // Save original data to history stack
        this.manage_history(
          'PUSH',
          'DELETE',
          delete_objects.concat(deleted_connected_objects)
        );
      }

      // Popup handling
      // @TODO popup 관련
      // if (popup.side_panel) {
      //   hide_hover_tag();

      //   this.$track_container.find('#side_panel').remove();

      //   // Display empty popup
      //   popup.side_panel = create_new_popup(
      //     track_container_id,
      //     null,
      //     null,
      //     null,
      //     null,
      //     mode == 'VIEWER' ? true : false
      //   );
      // }
    }
  }
  update_clusters(
    update_list: any[],
    is_apply_history: boolean,
    is_apply_revert: boolean
  ) {
    let update_objects = [];
    let delete_objects = [];
    let add_objects = [];
    // Find updated mtl
    for (let i = 0; i < update_list.length; i++) {
      if (update_list[i].status === 'UPDATE') {
        let update_obj = update_list[i].object;

        // Update mtl
        if (update_obj !== null) {
          // Update object

          let cluster_segments = LayoutUtil.find_all_contigous_segments_from_points(
            update_obj.point_id_list,
            this.layout_data.segments
          );
          update_obj.set_path(cluster_segments, main_css.cluster.border_offset);
          update_objects.push(update_obj);
        }
      } else if (update_list[i].status === 'DELETE') {
        let update_id = update_list[i].id;

        // Update mtl
        if (update_id !== null) {
          let cluster = this.find_layout_object('CLUSTER', update_id);
          // Update object
          delete_objects.push(cluster);
        }
      } else if (update_list[i].status === 'ADD') {
        let update_obj = update_list[i].object;

        // Update mtl
        if (update_obj !== null) {
          // Update object
          add_objects.push(update_obj);
        }
      }
    }
    if (update_objects.length > 0) {
      this.update_layout_object(
        update_objects,
        is_apply_history,
        is_apply_revert
      );
    } else if (delete_objects.length > 0) {
      this.delete_layout_object(delete_objects, false);
    } else if (add_objects.length > 0) {
      this.add_layout_object(add_objects, null, false);
    }
  }
  right_click(
    object_type: string,
    object_id: any,
    position: { x: any; y: any }
  ) {
    if (this.mode == 'VIEWER')
      this.open_context_menu(object_type, object_id, position);
  }
  open_context_menu(
    object_type: string,
    object_id: any,
    position: { x: any; y: any }
  ) {
    let need_context_menu = false;
    let menu_type;

    // Get clicked object
    let layout_object = this.find_layout_object(object_type, object_id);

    if (object_type === 'SEGMENT') {
      menu_type = 'SEGMENT_DISABLE';
      need_context_menu = true;
    }

    if (need_context_menu) {
      if (this.is_permitted.manage_orders) {
        // @TODO ContextMenu, User
        // ContextMenu.show(
        //   menu_type,
        //   layout_object,
        //   {
        //     left: position.x,
        //     top: position.y,
        //   },
        //   (segment_disable_value) => {
        //     User.get_user((current_user) => {
        //       let action =
        //         segment_disable_value === 'enable'
        //           ? 'enable-segment'
        //           : 'disable-segment';
        //       let source = current_user.email
        //         ? `uid-${current_user.email}`
        //         : 'uid-null';
        //       this.disable_segment(layout_object.id, action, source, null);
        //     });
        //   }
        // );
      }
    }
  }
  disable_segment(
    segment_id: any,
    action: string,
    source: string,
    reason: any
  ) {
    let segment_obj = this.find_layout_object('SEGMENT', segment_id);

    // @TODO Send message (message.js)
    // Message.send_track_command(
    //   {
    //     segment_id: segment_obj.id,
    //     action: action,
    //     source,
    //     reason,
    //   },
    //   (error, result) => {
    //     if (popup.side_panel) {
    //       if (!error) {
    //         popup.side_panel.html_element
    //           .find('#popup_message_label')
    //           .text('Track command sent');
    //       } else {
    //         popup.side_panel.html_element
    //           .find('#popup_message_label')
    //           .text(`Command failed: ${error}`);
    //       }
    //     }
    //   }
    // );
  }
  get_show_vehicle_lines(): boolean {
    // return this.show_vehicle_lines;
    return this.preferences.toggles.vehicleLines;
  }
  set_show_vehicle_lines(state, is_save_state) {
    this.preferences.toggles.vehicleLines = state;

    if (is_save_state) {
      this.save_state(
        'show_vehicle_lines',
        this.preferences.toggles.vehicleLines
      );
    }
  }

  display_group(is_display, is_save_state) {
    this.set_show_groups(is_display, is_save_state);

    const {
      groups: showGroups,
      stations: showStations,
      buffers: showBuffers,
      mtls: showMtls,
      vehicles: showVehicles,
    } = this.preferences.toggles;

    if (showGroups) {
      if (showStations)
        this.update_dom(
          'STATION',
          this.layout_data.stations,
          main_css.station,
          null,
          'LAYOUT',
          true
        );

      if (showBuffers)
        this.update_dom(
          'BUFFER',
          this.layout_data.buffers,
          main_css.buffer,
          null,
          'LAYOUT',
          true
        );

      if (showMtls)
        this.update_dom(
          'MTL',
          this.layout_data.mtls,
          main_css.mtl,
          null,
          'LAYOUT',
          true
        );

      if (showVehicles)
        this.update_vehicle_dom(
          this.vehicles,
          main_css.vehicle,
          null,
          'LAYOUT',
          false
        );

      this.$track_container.find('#btn_show_location_group').addClass('active');
    } else {
      this.$track_container.find('.group_svg').remove();
      this.$track_container
        .find('#btn_show_location_group')
        .removeClass('active');
    }
  }
  set_show_groups(state: boolean, is_save_state: any) {
    this.preferences.toggles.groups = state;
    if (is_save_state) {
      this.save_state('show_groups', state);
    }
  }

  get_expected_path_segments(): any {
    let expected_path_segment_objects = [];
    for (let expected_path of this.expected_paths) {
      expected_path_segment_objects = expected_path_segment_objects.concat(
        expected_path.path_segments
      );
    }

    return expected_path_segment_objects;
  }

  update_expected_path_dom(path: string) {
    if (this.preferences.toggles.expectedPaths && path) {
      if (this.$track_container.find('#expected_path').length === 0) {
        this.expected_path_svg = this.get_dom('SEGMENT', null, 'LAYOUT')
          .append('path')
          .attr('id', 'expected_path')
          .attr('class', 'expected_path')
          .attr('d', path)
          .attr(
            'stroke',
            path
              ? main_css.general.expected_path_color
              : main_css.general.ghost_path_color
          )
          .attr('stroke-width', `${main_css.general.expected_path_weight}px`)
          .lower();
      } else {
        this.expected_path_svg.attr('d', path);
      }
    } else {
      if (this.expected_path_svg) {
        this.expected_path_svg.remove();
        this.expected_path_svg = null;
      }
    }
  }

  get_selected_objects(object_type?: string) {
    if (object_type) {
      let result = [];
      for (let i = 0; i < this.selected_objects.length; i++) {
        let object = this.selected_objects[i];
        if (object.constructor.name.toUpperCase() === object_type) {
          result.push(object);
        }
      }
      return result;
    }
    return this.selected_objects;
  }
  check_data_difference(data: any[], svg_node_list: any) {
    let is_different = false;
    if (data.length === svg_node_list.length) {
      for (let i = 0; i < data.length; i++) {
        if (`id_${data[i].id}` !== svg_node_list[i].id) {
          is_different = true;
          break;
        }
      }
    } else {
      is_different = true;
    }
    return is_different;
  }
  append_showing_objects(type: string, view_box: any): any[] {
    let display_objects = [];

    let rotated_view_box;
    if (this.map_rotation > 0) {
      rotated_view_box = this.rotated_viewbox;
    }

    for (
      let i = 0;
      i < this.layout_data[`${type.toLowerCase()}s`].length;
      i++
    ) {
      let object = this.layout_data[`${type.toLowerCase()}s`][i],
        pos = [];
      if (!object) continue;
      if (type === 'SEGMENT') {
        pos = [
          [
            object.point_from.inverted_coord.x,
            object.point_from.inverted_coord.y,
          ],
          [object.point_to.inverted_coord.x, object.point_to.inverted_coord.y],
        ];
      } else {
        pos = [[object.inverted_coord.x, object.inverted_coord.y]];
      }

      let is_in_area;
      if (rotated_view_box) {
        is_in_area = this.is_in_polygon(
          [pos[0][0], pos[0][1]],
          rotated_view_box
        );

        if (!is_in_area && pos[1]) {
          is_in_area = this.is_in_polygon(
            [pos[1][0], pos[1][1]],
            rotated_view_box
          );
        }
      } else {
        if (
          pos[0][0] > view_box.x_from &&
          pos[0][0] < view_box.x_to &&
          pos[0][1] > view_box.y_from &&
          pos[0][1] < view_box.y_to
        ) {
          is_in_area = true;
        }
        if (!is_in_area && pos[1]) {
          if (
            pos[1][0] > view_box.x_from &&
            pos[1][0] < view_box.x_to &&
            pos[1][1] > view_box.y_from &&
            pos[1][1] < view_box.y_to
          ) {
            is_in_area = true;
          }
        }
      }
      if (is_in_area) {
        display_objects.push(object);
      }
    }
    return display_objects;
  }
  is_in_polygon(point: any[], vs: any): any {
    let x = point[0],
      y = point[1];

    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      let xi = vs[i][0],
        yi = vs[i][1];
      let xj = vs[j][0],
        yj = vs[j][1];

      let intersect =
        yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  }
  calculate_zoom_level() {
    let distance =
      this.geometry.screen_size.height /
      this.getZoom(MapTypes.MAIN).k /
      this.num_ticks;
    let zoom_level;

    if (this.mode === 'EDITOR') {
      if (distance <= 10000) {
        if (distance <= 3000) {
          if (distance <= 1000) {
            zoom_level = 3;
          } else {
            zoom_level = 2;
          }
        } else {
          zoom_level = 1;
        }
      } else {
        zoom_level = 0;
      }
    } else {
      if (distance <= 10000) {
        if (distance <= 800) {
          if (distance <= main_css.grid.render_distance) {
            zoom_level = 3;
          } else {
            zoom_level = 2;
          }
        } else {
          zoom_level = 1;
        }
      } else {
        zoom_level = 0;
      }
    }
    return zoom_level;
  }
  get_viewbox() {
    return this.viewbox;
  }
  calculate_n_set_viewbox(current_transform: IZoom) {
    let x = current_transform.x,
      y = current_transform.y,
      k = current_transform.k;

    let temp_viewbox: any = {};

    temp_viewbox.x_from = -x / k;
    temp_viewbox.x_to =
      temp_viewbox.x_from + this.geometry.screen_size.width / k;
    temp_viewbox.y_from = -y / k;
    temp_viewbox.y_to =
      temp_viewbox.y_from + this.geometry.screen_size.height / k;

    if (this.map_rotation > 0) {
      this.calculate_rotated_viewbox(temp_viewbox);
    }

    this.set_viewbox(temp_viewbox);
  }
  set_viewbox(box: any) {
    // viewbox = {x_from, x_to, y_from, y_to} only max/min corners matter
    this.viewbox = box;
  }
  calculate_rotated_viewbox(temp_viewbox: any) {
    let poly_arr = [
      [temp_viewbox.x_from, temp_viewbox.y_from],
      [temp_viewbox.x_to, temp_viewbox.y_from],
      [temp_viewbox.x_to, temp_viewbox.y_to],
      [temp_viewbox.x_from, temp_viewbox.y_to],
    ];

    let view_box_array = [];

    const { x, y, k } = this.getZoom(MapTypes.MAIN);

    let center = {
      x: -x / k + this.geometry.screen_size.width / 2 / k,
      y: -y / k + this.geometry.screen_size.height / 2 / k,
    };

    if (this.map_rotation > 0) {
      for (let i = 0; i < poly_arr.length; i++) {
        view_box_array.push(
          this.rotate(
            center.x,
            center.y,
            poly_arr[i][0],
            poly_arr[i][1],
            this.map_rotation
          )
        );
      }
    }

    this.set_rotated_viewbox(view_box_array);
  }
  set_rotated_viewbox(rotated_box: any[]) {
    // rotated_viewbox = [coord1, coord2, coord3, coord4]
    // It's designed this way because when applying adaptive rendering
    // to a tilted screen, all four corners needs to be account for
    this.rotated_viewbox = rotated_box;
  }
  set_minimap_position() {
    if (!this.geometry || !this.geometry.screen_size) return;
    let toolbar = this.$track_container.find('#toolbar');
    let available = this.geometry.screen_size.height - toolbar.outerHeight();
    let mmc = this.$track_container.find(`#${this.minimap_parent_id}`);
    let margin = 3; // FIXME: get this from css
    let bottom = margin;
    var tabs = $('#tabs');
    if (tabs && tabs.is(':visible') && !isNaN(tabs.outerHeight())) {
      bottom += tabs.outerHeight();
      available -= tabs.outerHeight();
    }
    mmc.css('bottom', bottom + 'px');
    let needed = mmc.outerHeight() + 2 * margin;
    let mm_offset = margin;
    if (needed > available)
      mm_offset += toolbar.outerWidth() + toolbar.offset().left;
    mmc.css('left', mm_offset + 'px');
  }
  update_minimap_with_rotated_dimensions(rotate_value: number) {
    let dimensions: any = {};
    let width = this.geometry.minimap_size.width;
    let height = this.geometry.minimap_size.height;
    let left_top_corner = this.rotate(
      0,
      0,
      -width / 2,
      height / 2,
      rotate_value
    );
    let right_top_corner = this.rotate(
      0,
      0,
      width / 2,
      height / 2,
      rotate_value
    );

    if (
      (0 <= rotate_value && rotate_value <= 90) ||
      (180 <= rotate_value && rotate_value <= 270)
    ) {
      dimensions.width = Math.abs(right_top_corner[0]) * 2;
      dimensions.height = Math.abs(left_top_corner[1]) * 2;
    } else {
      dimensions.width = Math.abs(left_top_corner[0]) * 2;
      dimensions.height = Math.abs(right_top_corner[1]) * 2;
    }

    // Set the rotated size of the minimap
    this.geometry.minimap_size.rotated_width = dimensions.width;
    this.geometry.minimap_size.rotated_height = dimensions.height;

    let diff_x = (dimensions.width - width) / 2;
    let diff_y = (dimensions.height - height) / 2;

    this.$track_container
      .find(`#${this.minimap_parent_id}`)
      .css('height', this.geometry.minimap_size.rotated_height - diff_y)
      .css('width', this.geometry.minimap_size.rotated_width - diff_x)
      .css(
        'padding',
        `${main_css.general.minimap_padding + diff_y}px ${
          main_css.general.minimap_padding
        }px ${main_css.general.minimap_padding}px ${
          main_css.general.minimap_padding + diff_x
        }px`
      );
  }
  rotate(cx: number, cy: number, x: number, y: number, angle: number) {
    var radians = (Math.PI / 180) * angle,
      cos = Math.cos(radians),
      sin = Math.sin(radians),
      nx = cos * (x - cx) + sin * (y - cy) + cx,
      ny = cos * (y - cy) - sin * (x - cx) + cy;
    return [nx, ny];
  }
  set_map_rotate(rotate_value: number, is_save_state: boolean) {
    this.map_rotation = Math.trunc(rotate_value);
    if (is_save_state) {
      this.save_state('map_rotation', this.map_rotation);
    }
  }
  save_state(name: string, value: any) {
    // @TODO save state
    // if (state_prefix) {
    //   this.set_state(`${state_prefix}.${name}`, value);
    // }
  }
  zoom_to(destination_pt: number[], zoom_type: string, zoom_k: number) {
    // Calculate the proper transform value for given destination_pt

    let translate, current_zoom;

    if (zoom_type === 'track') {
      // If function is called for tracking vehicle
      this.start_tracking();
      current_zoom = zoom_k ? zoom_k : this.zoom_step.two;
    } else {
      // If function is called for specific point zoom
      if (zoom_type !== 'RESIZE') {
        this.stop_tracking();
      }
      current_zoom = zoom_k ? zoom_k : this.zoom_step.three;
    }
    // Scale factored translation value for destination coord
    translate = [
      this.geometry.screen_size.width / 2 - current_zoom * destination_pt[0],
      this.geometry.screen_size.height / 2 - current_zoom * destination_pt[1],
    ];

    this.set_transform(
      translate[0],
      translate[1],
      current_zoom,
      this.vehicle_tracking.status,
      zoom_type === 'RESIZE' ? 'INSTANT' : 'SMOOTH'
    );
  }
  stop_tracking() {
    this.vehicle_tracking.status = false;
    this.vehicle_tracking.id = 0;
    this.$track_container.find('#btn_tracking').removeClass('active');
  }
  start_tracking() {
    this.$track_container.find('#btn_tracking').addClass('active');
    this.vehicle_tracking.status = true;
  }

  private mini_zoomed(event: d3.BaseEvent, mini_zoomed?: any) {
    // @NOTE 아래 mini_zoomed 메소드의 기본 동작을 여기서 정의해서 사용
    // if (d3.event.type !== 'zoom' || !d3.event.transform) return;

    const transform: d3.ZoomTransform = d3.event.transform;

    this.mini_zoomed_handler(transform);
  }
  // @NOTE event 에는 두개 param만 전달되는데 원본 소스에는 인자가 3개
  // mini_zoomed(event: d3.BaseEvent, mini_zoomed: any): any {
  mini_zoomed_handler(transform: IZoom): any {
    if (!transform) return;
    let { x, y, k } = transform;
    if (
      this.geometry.track_size.width > 0 &&
      this.geometry.track_size.width > 0
    ) {
      try {
        let view: any = {};
        view = {
          w: this.geometry.track_size.width,
          h: this.geometry.track_size.height,
        };
        let ratio_w = view.w / this.geometry.minimap_size.width,
          ratio_h = view.h / this.geometry.minimap_size.height;
        //If zoom called from main map
        if (x !== undefined && y !== undefined && k !== undefined) {
          //Translation Algorithm
          let full_x = x / k,
            full_y = y / k,
            mini_x = -(full_x / ratio_w),
            mini_y = -(full_y / ratio_h);
          //Zoom Scale Algorithm
          let frame = {
            width: 0,
            height: 0,
          };
          let side = view.w > view.h ? 'width' : 'height';
          let other_side = view.w > view.h ? 'height' : 'width';
          frame[side] = Math.abs(
            this.geometry.minimap_size[side] *
              (this.geometry.screen_size[side] /
                k /
                this.geometry.track_size[side])
          );
          frame[other_side] = Math.abs(
            frame[side] *
              (this.geometry.screen_size[other_side] /
                this.geometry.screen_size[side])
          );
          // Move position indicator box
          this.transform_rect(mini_x, mini_y, frame.width, frame.height);
        } else {
          //If called from minimap
          let main_map = this.getZoom(MapTypes.MAIN);
          k = main_map.k;
          let cur_rect = {
            w: +this.minimap_rect.attr('width'),
            h: +this.minimap_rect.attr('height'),
          };
          // Check if the mouse is still within the minimap container
          let mouse_pos;
          if (
            d3.event.sourceEvent &&
            (d3.event.sourceEvent.target.id === this.minimap_rect_id ||
              d3.event.sourceEvent.target.id === this.minimap_svg_id ||
              d3.event.sourceEvent.target.id === 'minimap_path')
          ) {
            // click and drag event
            mouse_pos = {
              x: d3.event.sourceEvent.layerX || d3.event.sourceEvent.offsetX,
              y: d3.event.sourceEvent.layerY || d3.event.sourceEvent.offsetY,
            };
          } else if (
            d3.event &&
            (d3.event.target.id === this.minimap_svg_id ||
              d3.event.target.id === 'minimap_path')
          ) {
            // single click on spot event
            mouse_pos = {
              x: d3.event.layerX,
              y: d3.event.layerY,
            };
          } else {
            // dragged outside the minimap svg boundaries event
            // Exit the function
            mouse_pos = null;
          }
          // Only transform/zoom if the mouse events occured inside the container
          if (mouse_pos) {
            if (this.map_rotation > 0) {
              let rotated_trans = this.rotate(
                this.geometry.minimap_size.width / 2,
                this.geometry.minimap_size.height / 2,
                mouse_pos.x,
                mouse_pos.y,
                this.map_rotation
              );
              mouse_pos.x = rotated_trans[0];
              mouse_pos.y = rotated_trans[1];
            }
            let offset = {
              x: this.minimap_path_svg.nodes()[0].transform.baseVal[0].matrix.e,
              y: this.minimap_path_svg.nodes()[0].transform.baseVal[0].matrix.f,
            };
            let new_rect_pos = {
              x: mouse_pos.x - cur_rect.w / 2 - offset.x,
              y: mouse_pos.y - cur_rect.h / 2 - offset.y,
            };
            let trans = {
              x: null,
              y: null,
            };
            if (new_rect_pos.x) {
              let full_x = new_rect_pos.x * ratio_w;
              trans.x = -(full_x * k);
            }
            if (new_rect_pos.y) {
              let full_y = new_rect_pos.y * ratio_h;
              trans.y = -(full_y * k);
            }
            // Apply transform
            this.set_transform(trans.x, trans.y, null, true, 'INSTANT');
          }
        }
      } catch (error) {
        // logger.log(error);
        console.warn(error);
      }
    }
  }
  transform_rect(x: number, y: number, w: number, h: number) {
    x = isNaN(x) || x === Infinity ? 0 : x;
    y = isNaN(y) || y === Infinity ? 0 : y;

    this.minimap_rect.attr('x', x).attr('y', y);
    this.minimap_rect.attr('width', w).attr('height', h);

    if (this.map_rotation >= 0) {
      let mini_trans = {
        center_x:
          parseFloat(this.minimap_rect.attr('x')) +
          parseFloat(this.minimap_rect.attr('width')) / 2,
        center_y:
          parseFloat(this.minimap_rect.attr('y')) +
          parseFloat(this.minimap_rect.attr('height')) / 2,
        trans_x: this.minimap_rect.nodes()[0].transform.baseVal[0].matrix.e,
        trans_y: this.minimap_rect.nodes()[0].transform.baseVal[0].matrix.f,
      };
      // rotate minimap indicator
      this.minimap_rect.attr(
        'transform',
        `translate(${mini_trans.trans_x},${mini_trans.trans_y})rotate(${-this
          .map_rotation},${mini_trans.center_x},${mini_trans.center_y})`
      );
    }
  }
  update_minimap_with_new_dimensions(track_size: IMapSize) {
    let ratio_w;
    let ratio_h;
    let scale;
    let dimensions: any = {};
    let translate_x = 0,
      translate_y = 0;

    // Set translate for offset from fab_size to fitting layout into minimap with origin at (0,0) and offset applied to keep in sync with layout
    translate_x = -track_size.min_x;
    translate_y = -track_size.min_y;

    // Find scale
    ratio_w = this.minimap_size_limit / track_size.width;
    ratio_h = this.minimap_size_limit / track_size.height;

    scale = ratio_w < ratio_h ? ratio_w : ratio_h;

    // Apply scale
    translate_x *= scale;
    translate_y *= scale;

    // Scale the size of the minimap container
    if (scale === ratio_w) {
      dimensions.width = this.minimap_size_limit;
      dimensions.height = track_size.height * scale;
    } else {
      dimensions.width = track_size.width * scale;
      dimensions.height = this.minimap_size_limit;
    }

    let mini_map_container = this.$track_container.find(
      `#${this.minimap_parent_id}`
    );

    if (mini_map_container && this.minimap_svg) {
      mini_map_container
        .css('width', dimensions.width)
        .css('height', dimensions.height);
      this.minimap_svg
        .attr('width', dimensions.width)
        .attr('height', dimensions.height);
      this.minimap_path_svg.attr(
        'transform',
        `translate(${translate_x},${translate_y})scale(${scale})`
      );
      this.minimap_rect.attr(
        'transform',
        `translate(${translate_x},${translate_y})`
      );
    }
  }
  calc_original_coord_from_inverted(
    inverted_coord: any,
    invert_factor_y: number
  ): any {
    let coord: any = {};
    coord.x = inverted_coord.x;
    coord.y = invert_factor_y - inverted_coord.y;

    return coord;
  }
  init_minimap_event_listeners() {
    // Add event listener for click to zoom to area
    this.minimap_svg.on('click', this.mini_zoomed.bind(this));

    // Remove double click zoom in function on minimap
    this.$track_container.find(`#${this.minimap_svg_id}`)[0].addEventListener(
      'dblclick',
      function (event) {
        event.stopPropagation();
      },
      true
    );
  }
  adjust_floaters() {
    this.set_toolbar_geometry();
    this.set_minimap_position();
  }
  set_toolbar_geometry() {
    // @TODO set_toolbar_geometry 로직 확인 / 변경
    // if (!this.geometry || !this.geometry.screen_size) return;
    // let toolbar = this.$track_container.find('#toolbar');
    // toolbar.css('width', '30px');
    // let needed = toolbar.outerHeight();
    // let available = this.geometry.screen_size.height;
    // let tabs = $('#tabs');
    // if (tabs && tabs.is(':visible') && !isNaN(tabs.outerHeight()))
    //   available -= tabs.outerHeight();
    // let toolbar_width = 30;
    // if (needed > available) toolbar_width = 60;
    // toolbar.css('width', toolbar_width + 'px');
  }
  init_resize_event() {
    this.remove_resize_event();
    // @NOTE check - parent 없음
    // if (track_container_parent_id === DEFAULT_TRACK_CONTAINER_PARENT_ID) {
    window.addEventListener('resize', this.resize_event_handler, false);
    // }
  }
  remove_resize_event() {
    window.removeEventListener('resize', this.resize_event_handler, false);
  }
  resize_event_handler() {
    clearTimeout(this.resize_time_out_id);
    this.resize_time_out_id = setTimeout(this.resize_layout, 100);
  }
  resize_layout(): any {
    // if (this.$track_container.find(`#${track_id}`).length > 0) {
    try {
      // Resize Layout SVG
      this.svg_resize();
    } catch (error) {
      console.warn(error);
    } finally {
      return;
    }
    // }
  }
  set_transform(
    x: any,
    y: any,
    k: any,
    is_tracking: boolean,
    transition_type: string
  ) {
    x = x ? parseFloat(x) : undefined;
    y = y ? parseFloat(y) : undefined;
    k = k ? parseFloat(k) : undefined;
    let current_zoom = this.getZoom(MapTypes.MAIN);

    // if not tracking zoom, turn off tracking
    if (this.vehicle_tracking.status === true && !is_tracking) {
      this.stop_tracking();
    }

    let transform = Object.assign(
      Object.create(Object.getPrototypeOf(d3.zoomIdentity)),
      d3.zoomIdentity
    );

    if (x === null || x === undefined) {
      transform.x = current_zoom.x;
    } else {
      transform.x = x;
    }

    if (y === null || y === undefined) {
      transform.y = current_zoom.y;
    } else {
      transform.y = y;
    }

    if (k === null || k === undefined) {
      transform.k = current_zoom.k;
    } else {
      transform.k = k;
    }
    if (transition_type === 'SMOOTH') {
      this.svg
        .transition()
        .duration(1000)
        .call(this.d3_main.transform, transform);
    } else if (transition_type === 'INSTANT') {
      this.svg.call(this.d3_main.transform, transform);
    }
  }
  update_segment_svg(
    data: Segment[],
    dom_css: any,
    excluded_segments,
    is_path_change?: boolean
  ) {
    let segment_path_data = this.get_segment_complete_paths(
      data,
      excluded_segments
    );

    // Update segments ============================= //
    this.segments_svg = this.get_svg_class('SEGMENT').select('.segment');
    if (this.segments_svg.nodes().length === 0) {
      this.segments_svg = this.get_svg_class('SEGMENT')
        .append('g')
        .attr('class', 'segment')
        .attr('g_type', 'main');
    }

    // Main segment path ============================= //
    let path = this.segments_svg.select('.segment_path');
    if (path.nodes().length === 0) {
      path = this.segments_svg.append('path').attr('class', 'segment_path');
    }
    path
      .attr('d', segment_path_data.path)
      .attr('stroke-width', `${dom_css.line_weight}px`);

    let mask = this.segments_svg.select('.segment_mask');
    if (mask.nodes().length === 0) {
      mask = this.segments_svg
        .append('path')
        .attr('class', 'segment_mask')
        .attr('fill', 'none')
        .attr('stroke', 'transparent')
        .attr('stroke-width', main_css.general.selection_weight);

      this.attach_segment_event_handler(mask);
    }
    mask
      .attr('d', segment_path_data.path)
      .attr('fill', 'none')
      .attr('stroke', 'transparent')
      .attr('stroke-width', main_css.general.selection_weight);

    // Disabled path ============================= //
    let disbled_path = this.segments_svg.select('.segment_path.disabled');
    if (disbled_path.nodes().length === 0) {
      disbled_path = this.segments_svg
        .append('path')
        .attr('class', 'segment_path disabled');
    }
    disbled_path
      .attr('d', segment_path_data.disabled_path)
      .attr('stroke-width', `${dom_css.line_weight}px`);

    // Invalid path ============================= //
    let invalid_path = this.segments_svg.select('.segment_path.non_validate');
    if (invalid_path.nodes().length === 0) {
      invalid_path = this.segments_svg
        .append('path')
        .attr('class', 'segment_path non_validate');
    }
    invalid_path
      .attr('d', segment_path_data.invalid_path)
      .attr('stroke-width', `${dom_css.line_weight}px`);

    // this.segments_svg = this.get_svg_class('SEGMENT').selectAll('g.segment')

    // Update minimap path
    if (this.minimap_path_svg && is_path_change) {
      this.update_minimap(
        this.get_combined_path(this.get_layout_objects('SEGMENT'))
      );
    }
  }
  update_minimap(path: string) {
    if (this.minimap_path_svg) {
      // Get new minimap path
      // convert_minimap_object()

      // Set new path
      this.minimap_path_svg.attr('d', path);
    }
  }
  attach_segment_event_handler(d3_mask_element_selection: any) {
    let mouse_move_counter = 0;
    const that = this;
    d3_mask_element_selection.on('click', function () {
      if (
        that.tool_type !== 'SELECT' ||
        (that.tool_type === 'SELECT' && !that.drag_coord.start)
      ) {
        let event_coord = {
          x: d3.mouse(this)[0],
          y: d3.mouse(this)[1],
        };
        let segment = that.find_segment_at_coord(event_coord);
        if (segment) {
          that.layout_object_click(d3.event, {
            type: 'SEGMENT',
            id: segment.id,
            group_type: 'LAYOUT',
          });
        }
      }
    });
    d3_mask_element_selection.on('contextmenu', function () {
      d3.event.preventDefault();
      let event_coord = {
        x: d3.mouse(this)[0],
        y: d3.mouse(this)[1],
      };
      let segment = that.find_segment_at_coord(event_coord);
      if (segment) {
        that.layout_object_click(d3.event, {
          type: 'SEGMENT',
          id: segment.id,
          group_type: 'LAYOUT',
        });
      }
      return false;
    });
    d3_mask_element_selection.on('mouseenter, mousemove', function () {
      // Mouse is over the element
      if (d3.event.type === 'mousemove') {
        mouse_move_counter++;
      } else {
        mouse_move_counter = 0;
      }
      if (mouse_move_counter % 5 === 0) {
        let event_coord = {
          x: d3.mouse(this)[0],
          y: d3.mouse(this)[1],
        };
        let segment = that.find_segment_at_coord(event_coord);
        if (segment) {
          // Set hovering object
          that.currently_hovering_object = segment;
          that.highlight_segment(segment, main_css.general, 'HOVER', 'INSTANT');
          if (that.mode != 'EDITOR') {
            that.show_hover_tag('SEGMENT', segment.id, null, null);
          }
        }
      }
    });
    d3_mask_element_selection.on('mouseout', () => {
      // Mouse is leaving the element
      this.hide_hover_tag();
      // unhilight objects
      if (this.selected_objects.length === 0) {
        // if there is no selected object then unhilight all
        this.unhighlight(null, null, 'LAYOUT', null, 'INSTANT');
      } else {
        let existing_object = this.currently_hovering_object;
        if (existing_object) {
          this.unhighlight('SEGMENT', null, 'LAYOUT', 'HOVER', 'INSTANT');
        }
      }
      // Set hovering object to nothing
      this.currently_hovering_object = {};
    });
    if (this.mode === 'EDITOR') {
      d3_mask_element_selection.call(this.drag);
    }
  }
  find_segment_at_coord(coord: { x: number; y: number }) {
    let multiplier = 5;
    let segment = null;
    do {
      let boundary = this.get_segment_candidate_boundary(
        coord,
        this.minimum_segment_length * multiplier
      );
      let candidates = this.find_segment_candidate_using_boundary(
        boundary,
        this.get_layout_objects('SEGMENT')
      );
      segment = this.find_closest_segment_candidate_to_point(candidates, coord);
      multiplier += 5;
    } while (segment === null && multiplier <= 50);

    // If no segment is found using candidate boundary, search all segments
    if (segment === null) {
      segment = this.find_closest_segment_candidate_to_point(
        this.get_layout_objects('SEGMENT'),
        coord
      );
    }

    //        log_performance.log('Find segment time: ' + (performance.now() - t0) + ', Number of iterations: ' + (multiplier/5))
    return segment;
  }
  find_closest_segment_candidate_to_point(
    candidate_segments: any[],
    coord_of_interest: { x: number; y: number }
  ): any {
    let BEZIER_PARSE_ACCURACY = 100;
    let closest_segment = null;
    let shortest_distance_to_segment_from_coord;
    if (candidate_segments.length > 0) {
      closest_segment = candidate_segments[0];
      shortest_distance_to_segment_from_coord = LayoutUtil.calculate_distance(
        candidate_segments[0].point_from.inverted_coord,
        coord_of_interest
      );

      try {
        for (let segment of candidate_segments) {
          let new_shortest_distance_found = false;
          let bezier_path = this.bezier(segment.bezier_points);

          for (let i = 0; i < BEZIER_PARSE_ACCURACY; i++) {
            let current_point = bezier_path(i / BEZIER_PARSE_ACCURACY);
            if (!current_point) continue;
            current_point = {
              x: current_point[0],
              y: current_point[1],
            };
            let current_distance = LayoutUtil.calculate_distance(
              current_point,
              coord_of_interest
            );
            if (current_distance < shortest_distance_to_segment_from_coord) {
              new_shortest_distance_found = true;
              shortest_distance_to_segment_from_coord = current_distance;
            }
          }
          if (new_shortest_distance_found) {
            closest_segment = segment;
          }
        }
      } catch (error) {
        console.warn('find_closest_segment_candidate_to_point failed', error);
      }
    }

    if (
      shortest_distance_to_segment_from_coord <
      +main_css.general.mask_weight / this.getZoom(MapTypes.MAIN).k
    ) {
      return closest_segment;
    } else {
      return null;
    }
  }
  find_segment_candidate_using_boundary(
    boundary: { min: { x: number; y: number }; max: { x: number; y: number } },
    segments: any[]
  ) {
    let candidates = [];
    for (let segment of segments) {
      for (let seg_part of segment.segment_parts) {
        let coord_from = seg_part.coord_from.inverted_coord;
        let coord_to = seg_part.coord_to.inverted_coord;

        if (
          (boundary.min.x < coord_from.x &&
            coord_from.x < boundary.max.x &&
            boundary.min.y < coord_from.y &&
            coord_from.y < boundary.max.y) ||
          (boundary.min.x < coord_to.x &&
            coord_to.x < boundary.max.x &&
            boundary.min.y < coord_to.y &&
            coord_to.y < boundary.max.y)
        ) {
          candidates.push(segment);
          break;
        }
      }
    }
    return candidates;
  }
  get_segment_candidate_boundary(
    center_coord: { x: number; y: number },
    radius: number
  ) {
    return {
      min: {
        x: center_coord.x - radius,
        y: center_coord.y - radius,
      },
      max: {
        x: center_coord.x + radius,
        y: center_coord.y + radius,
      },
    };
  }
  get_segment_complete_paths(segments: Segment[], segment_exclusions: any) {
    let combined_path = '';
    let combined_invalid_path = '';
    let combined_disabled_path = '';

    if (segment_exclusions != null && !Array.isArray(segment_exclusions)) {
      segment_exclusions = [segment_exclusions];
    } else {
      segment_exclusions = [];
    }

    if (segments && segments.length > 0) {
      for (let i = 0; i < segments.length; i++) {
        let is_exclusion = segment_exclusions.findIndex((exclusion) => {
          if (exclusion.constructor.name.toUpperCase() === 'SEGMENT') {
            return exclusion.id === segments[i].id;
          }
        });

        if (is_exclusion === -1) {
          if (combined_path.length > 0) {
            combined_path += ' ';
          }
          combined_path += segments[i].path;

          // If segment is disabled, add to disabled segment path
          if (segments[i].disable_state) {
            combined_disabled_path += segments[i].path;
          }

          if (segments[i].is_validate === false) {
            combined_invalid_path += segments[i].path;
          }
        }
      }
    }

    return {
      path: combined_path,
      invalid_path: combined_invalid_path,
      disabled_path: combined_disabled_path,
    };
  }
  private scale_draw() {
    let offset;
    if (this.mode === ViewModes.editor) {
      offset = 70;
    } else {
      offset = 50;
    }

    this.scale_svg_group = this.get_svg_class('SCALE')
      .append('g')
      .attr('class', 'scale')
      .attr('x', 0)
      .attr('y', 0)
      .attr(
        'transform',
        `translate(${this.geometry.screen_size.width - offset}, ${
          this.geometry.screen_size.height - 10
        })`
      );

    this.scale_svg_group
      .append('line')
      .attr('id', 'length')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('stroke', rgb(0, 0, 0))
      .attr('stroke-width', '2px');
    this.scale_svg_group
      .append('line')
      .attr('id', 'tick1')
      .attr('x', 0)
      .attr('y1', -4)
      .attr('y2', 4)
      .attr('stroke', rgb(0, 0, 0))
      .attr('stroke-width', '2px');
    this.scale_svg_group
      .append('line')
      .attr('id', 'tick2')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', -4)
      .attr('y2', 4)
      .attr('stroke', rgb(0, 0, 0))
      .attr('stroke-width', '2px');
    this.scale_svg_group
      .append('text')
      .attr('id', 'value')
      .attr('x', 10)
      .attr('y', 3.5)
      .attr('fill', rgb(0, 0, 0))
      .attr('font-size', '10px')
      .text('2');

    this.scale_svg = this.scale_svg_group.select('.scale line#length');
    this.scale_tick = this.scale_svg_group.select('.scale line#tick2');
    this.scale_value = this.scale_svg_group.select('.scale text#value');
  }
  private grid_draw() {
    this.get_svg_class('GRID')
      .append('g')
      .attr('class', 'y_axis')
      .call(this.d3_axis_x);

    // grid_group.append('g')
    this.get_svg_class('GRID')
      .append('g')
      .attr('class', 'x_axis')
      .call(this.d3_axis_y);

    this.grid_x = this.geometric_container.select('.x_axis');
    this.grid_y = this.geometric_container.select('.y_axis');
  }
  private get_svg_class(class_type: string) {
    if (class_type === 'POINT') {
      return this.semantic_container.select('.point_group');
    } else if (class_type === 'SEGMENT') {
      return this.geometric_container.select('.segment_group');
    } else if (class_type === 'SEGMENT_DIRECTION') {
      return this.semantic_container.select('.direction_group');
    } else if (class_type === 'STATION') {
      return this.semantic_container.select('.station_group');
    } else if (class_type === 'BUFFER') {
      return this.semantic_container.select('.buffer_group');
    } else if (class_type === 'MTL') {
      return this.semantic_container.select('.mtl_group');
    } else if (class_type === 'VEHICLE') {
      return this.semantic_container.select('.vehicle_group');
    } else if (class_type === 'GRID') {
      return this.geometric_container.select('.grid_group');
    } else if (class_type === 'SELECT') {
      return this.geometric_container.select('.selection_group');
    } else if (class_type === 'SELECTED') {
      return this.geometric_container.select('.selected_group');
    } else if (class_type === 'SEGMENT_DRAW') {
      return this.geometric_container.select('.segment_draw_group');
    } else if (class_type === 'SCALE') {
      return this.semantic_container.select('.scale_group');
    } else if (class_type === 'CLUSTER') {
      return this.geometric_container.select('.cluster_group');
    } else if (class_type === 'OVERLAP_DISPLAY') {
      return this.semantic_container.select('.overlap_group');
    } else if (class_type === 'OVERLAP_MODULE') {
      return this.overlap_module_panel_svg.select(
        '.overlap_module_panel_group'
      );
    } else if (class_type === 'UNASSIGNED_MODULE') {
      return this.unassigned_module_panel_svg.select(
        '.unassigned_module_panel_group'
      );
    }
  }
  private calc_and_set_track_size() {
    let point_n_segs = this.layout_data.points.concat(
      this.layout_data.segments as any
    );
    if (point_n_segs && point_n_segs.length > 0) {
      let track_min_max = LayoutUtil.find_max_and_min_of_objects(
        point_n_segs,
        'INVERTED'
      );
      this.geometry.track_size.min_x = track_min_max.min.x;
      this.geometry.track_size.max_x = track_min_max.max.x;
      this.geometry.track_size.min_y = track_min_max.min.y;
      this.geometry.track_size.max_y = track_min_max.max.y;

      this.geometry.track_size.width =
        track_min_max.max.x - track_min_max.min.x;
      this.geometry.track_size.height =
        track_min_max.max.y - track_min_max.min.y;
    } else {
      this.geometry.track_size = { ...this.geometry.fab_size };
    }
  }
  private initMinimap() {
    let ratio_w = this.minimap_size_limit / this.geometry.fab_size.width;
    let ratio_h = this.minimap_size_limit / this.geometry.fab_size.height;
    let dimensions: any = {};

    let scale = ratio_w < ratio_h ? ratio_w : ratio_h;
    if (scale === ratio_w) {
      dimensions.width = this.minimap_size_limit;
      dimensions.height = this.geometry.fab_size.height * scale;
    } else {
      dimensions.width = this.geometry.fab_size.width * scale;
      dimensions.height = this.minimap_size_limit;
    }

    // init minimap (v3)
    this.minimap_svg = this.d3_track
      .select(`#${this.minimap_svg_id}`)
      .attr('width', '100%')
      .attr('height', '100%');

    const { width, height } = this.minimap_svg.node().getBoundingClientRect();

    // Minimap area
    this.$track_container
      .find(`#${this.minimap_parent_id}`)
      .css('width', dimensions.width)
      .css('height', dimensions.height);

    // Store minimap screen size
    this.geometry.minimap_size = { width, height };

    // Set initial zoom.current_mainand offset
    this.setInitialZoom(MapTypes.MINIMAP);

    // Initiate D3 for minimap
    this.d3_minimap = d3
      .zoom()
      .scaleExtent([this.zoom.min, this.zoom.max])
      .on('zoom', this.mini_zoomed.bind(this));

    // Initialize the SVG element for minimap view-box

    this.minimap_svg.call(this.d3_minimap); // @ minimap d3 관련해서 문제가 있으면 아래와 비교
    // this.minimap_svg = d3_track
    //   .select(`#${minimap_svg_id}`)
    //   .attr('width', this.geometry.minimap_size.width)
    //   .attr('height', this.geometry.minimap_size.height)
    //   .call(this.d3_minimap);

    // Initialize focus of zoom.current_mainarea(blue rect)
    if (this.minimap_rect) {
      this.minimap_rect = this.minimap_svg.select('rect');
    } else {
      this.minimap_rect = this.minimap_svg.append('rect');
    }
    this.minimap_rect
      .attr('id', this.minimap_rect_id)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .attr('x', 0)
      .attr('y', 0)
      .attr('rx', '2px')
      .attr('ry', '2px')
      .attr('width', this.geometry.minimap_size.width)
      .attr('height', this.geometry.minimap_size.height);
  }
  private convertMinimapObjects() {
    // Combine the path of the individual segments to one
    let combined_path = '';
    for (var i = 0; i < this.layout_data.segments.length; i++) {
      if (combined_path.length > 0) {
        combined_path += ' ';
      }
      combined_path += this.layout_data.segments[i].path;
    }

    this.minimap_data.path = combined_path;
  }

  // init svg
  private setGeometry(mapSize: IMapSize, screen_size: any) {
    // @NOTE 원본 소스에서는 parent의 clientHeight, clientWidth 값을 사용함
    // const { width, height } = this.svg.node().getBoundingClientRect();
    const { width, height } = screen_size;

    this.geometry = {
      screen_size: { width, height },
      track_size: { ...mapSize },
      fab_size: { ...mapSize },
      initial_fab_size: { ...mapSize },
      invert_factor_y: Math.max(mapSize.max_y, mapSize.height),
    };

    console.warn('>> setGeometry >>', this.geometry, mapSize);
  }
  /** set_param + set_initial_zoom */
  private setInitialZoom(mapType: MapTypes) {
    // set_param()
    const { width, height } =
      mapType == MapTypes.MINIMAP
        ? this.geometry.minimap_size
        : this.geometry.screen_size;
    const widthRatio = width / this.geometry.fab_size.width;
    const heightRatio = height / this.geometry.fab_size.height;

    const zoomRatio = Math.min(widthRatio, heightRatio);

    // set_initial_zoom()
    let currentZoom = this.getZoom(mapType);
    if (!currentZoom) {
      currentZoom = {
        x: 0,
        y: 0,
        k: 1,
      };
      this.setZoom(mapType, currentZoom);
    } else {
      this.setZoom(mapType, {
        k: zoomRatio,
      });
    }

    if (mapType != MapTypes.MINIMAP) {
      const {
        max_zoom,
        zoom_levels: { lvl1, lvl2, lvl3 },
      } = this.option;
      const { width } = this.geometry.screen_size;
      this.setZoom(MapTypes.MIN_MAX, {
        x: zoomRatio,
        y: max_zoom,
      });

      this.zoom_step = {
        one: width / (lvl1 * this.num_ticks),
        two: width / (lvl2 * this.num_ticks),
        three: width / (lvl3 * this.num_ticks),
      };
      (d3.zoomIdentity as any).k = zoomRatio;
      // k : readonly 회피
    }
  }

  // zoom

  private getZoom(type: MapTypes): any {
    switch (type) {
      case MapTypes.MIN_MAX:
        return {
          min: this.zoom.min,
          max: this.zoom.max,
        };
      case MapTypes.MAIN:
        return this.zoom.main;
      case MapTypes.MINIMAP:
        return this.zoom.minimap;
      default:
        return type;
    }
  }
  private setZoom(mapType: MapTypes, value: IZoom) {
    /****************************************
    // ZOOM Structure
    // zoom.min : minimum zoom value
    // zoom.max : maximum zoom value
    // zoom.main.x
    // zoom.main.y
    // zoom.main.k
    // zoom.minimap.x
    // zoom.minimap.y
    // zoom.minimap.k

    TYPE : MIN_MAX, MAIN, MINIMAP
    *****************************************/
    const { x, y, k } = value;
    if (mapType === MapTypes.MIN_MAX)
      Object.assign(this.zoom, {
        min: x,
        max: y,
      });
    else if (mapType === MapTypes.MAIN) {
      if (!this.zoom.main) {
        this.zoom.main = Object.assign(
          Object.create(Object.getPrototypeOf(d3.zoomIdentity)),
          d3.zoomIdentity
        );
      }
      !_.isNil(x) && (this.zoom.main.x = x);
      !_.isNil(y) && (this.zoom.main.y = y);
      !_.isNil(k) && (this.zoom.main.k = k);
    } else if (mapType === MapTypes.MINIMAP) {
      if (!this.zoom.minimap) {
        this.zoom.minimap = Object.assign(
          Object.create(Object.getPrototypeOf(d3.zoomIdentity)),
          d3.zoomIdentity
        );
      }
      !_.isNil(x) && (this.zoom.minimap.x = x);
      !_.isNil(y) && (this.zoom.minimap.y = y);
      !_.isNil(k) && (this.zoom.minimap.k = k);
    }
  }
}
